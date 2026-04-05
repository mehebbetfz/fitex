import { useLanguage } from '@/contexts/language-context'
import {
	getPlans,
	getTrainers,
	Plan,
	TrainerProfile,
} from '@/services/marketplace'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Animated,
	Dimensions,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width: W } = Dimensions.get('window')

const COLORS = {
	background: '#121212',
	card: '#1C1C1E',
	cardLight: '#2C2C2E',
	border: '#2C2C2E',
	text: '#FFFFFF',
	textSecondary: '#8E8E93',
	primary: '#34C759',
	blue: '#5AC8FA',
	orange: '#FF9500',
	purple: '#AF52DE',
} as const

// ─── Tab pill ─────────────────────────────────────────────────────────────────

const TabPill = ({
	active,
	label,
	onPress,
}: {
	active: boolean
	label: string
	onPress: () => void
}) => (
	<TouchableOpacity
		onPress={onPress}
		style={[styles.tabPill, active && styles.tabPillActive]}
		activeOpacity={0.7}
	>
		<Text style={[styles.tabPillText, active && styles.tabPillTextActive]}>
			{label}
		</Text>
	</TouchableOpacity>
)

// ─── Filter chip ─────────────────────────────────────────────────────────────

const FilterChip = ({
	label,
	active,
	onPress,
}: {
	label: string
	active: boolean
	onPress: () => void
}) => (
	<TouchableOpacity
		onPress={onPress}
		style={[styles.filterChip, active && styles.filterChipActive]}
		activeOpacity={0.7}
	>
		<Text
			style={[styles.filterChipText, active && styles.filterChipTextActive]}
		>
			{label}
		</Text>
	</TouchableOpacity>
)

// ─── Avatar (initials fallback) ──────────────────────────────────────────────

const TrainerAvatar = ({
	url,
	name,
	size = 52,
}: {
	url?: string
	name: string
	size?: number
}) => {
	const initials = name
		.split(' ')
		.slice(0, 2)
		.map(w => w[0]?.toUpperCase() ?? '')
		.join('')

	if (url) {
		return (
			<Image
				source={{ uri: url }}
				style={{ width: size, height: size, borderRadius: size / 2 }}
				contentFit='cover'
			/>
		)
	}
	return (
		<View
			style={{
				width: size,
				height: size,
				borderRadius: size / 2,
				backgroundColor: COLORS.primary + '30',
				alignItems: 'center',
				justifyContent: 'center',
				borderWidth: 1.5,
				borderColor: COLORS.primary + '50',
			}}
		>
			<Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: size * 0.35 }}>
				{initials}
			</Text>
		</View>
	)
}

// ─── Star rating ─────────────────────────────────────────────────────────────

const Stars = ({ rating }: { rating: number }) => (
	<View style={{ flexDirection: 'row', gap: 1 }}>
		{[1, 2, 3, 4, 5].map(i => (
			<Ionicons
				key={i}
				name={i <= Math.round(rating) ? 'star' : 'star-outline'}
				size={12}
				color='#FFD700'
			/>
		))}
	</View>
)

// ─── Trainer card ─────────────────────────────────────────────────────────────

const TrainerCard = ({ trainer }: { trainer: TrainerProfile }) => {
	const { t } = useLanguage()
	return (
		<TouchableOpacity
			style={styles.trainerCard}
			activeOpacity={0.85}
			onPress={() => {}}
		>
			<View style={styles.trainerCardTop}>
				<TrainerAvatar url={trainer.avatarUrl} name={trainer.displayName} />
				<View style={{ flex: 1, marginLeft: 12 }}>
					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
						<Text style={styles.trainerName} numberOfLines={1}>
							{trainer.displayName}
						</Text>
						{trainer.isVerified && (
							<Ionicons name='checkmark-circle' size={14} color={COLORS.blue} />
						)}
					</View>
					<View style={styles.trainerMeta}>
						<Stars rating={trainer.rating} />
						<Text style={styles.trainerMetaText}>
							{trainer.reviewsCount}
						</Text>
					</View>
					<Text style={styles.trainerExp} numberOfLines={1}>
						{trainer.yearsExperience} {t('marketplace', 'experience')} ·{' '}
						{trainer.studentsCount} {t('marketplace', 'students')}
					</Text>
				</View>
			</View>

			{trainer.specialties?.length > 0 && (
				<View style={styles.specialtiesRow}>
					{trainer.specialties.slice(0, 3).map(s => (
						<View key={s} style={styles.specialtyChip}>
							<Text style={styles.specialtyChipText}>{s}</Text>
						</View>
					))}
				</View>
			)}

			<TouchableOpacity style={styles.viewBtn} activeOpacity={0.8}>
				<Text style={styles.viewBtnText}>{t('marketplace', 'viewProfile')}</Text>
				<Ionicons name='chevron-forward' size={14} color={COLORS.primary} />
			</TouchableOpacity>
		</TouchableOpacity>
	)
}

// ─── Plan type config ────────────────────────────────────────────────────────

const PLAN_CONFIG = {
	workout: { icon: '🏋️', color: '#34C759' },
	nutrition: { icon: '🥗', color: '#FF9500' },
	combo: { icon: '⚡', color: '#AF52DE' },
} as const

// ─── Plan card ────────────────────────────────────────────────────────────────

const PlanCard = ({ plan }: { plan: Plan }) => {
	const { t } = useLanguage()
	const cfg = PLAN_CONFIG[plan.type as keyof typeof PLAN_CONFIG] ?? PLAN_CONFIG.workout
	const trainer = plan.trainerId as TrainerProfile

	const priceRub = (plan.price / 100).toLocaleString('ru-RU')
	const diffKey = `difficulty_${plan.difficulty}` as const

	return (
		<View style={styles.planCard}>
			<View style={styles.planCardHeader}>
				<View style={[styles.planTypeTag, { backgroundColor: cfg.color + '20' }]}>
					<Text style={styles.planTypeIcon}>{cfg.icon}</Text>
					<Text style={[styles.planTypeLabel, { color: cfg.color }]}>
						{t('marketplace', `type_${plan.type}` as Parameters<typeof t>[1])}
					</Text>
				</View>
				<View style={styles.planDifficulty}>
					<Text style={styles.planDifficultyText}>
						{t('marketplace', diffKey)}
					</Text>
				</View>
			</View>

			<Text style={styles.planTitle} numberOfLines={2}>{plan.title}</Text>
			<Text style={styles.planTrainer} numberOfLines={1}>
				{typeof trainer === 'object' ? trainer.displayName : ''}
			</Text>

			<View style={styles.planMeta}>
				<View style={styles.planMetaItem}>
					<Ionicons name='calendar-outline' size={13} color={COLORS.textSecondary} />
					<Text style={styles.planMetaText}>
						{plan.durationWeeks} {t('marketplace', 'weeks')}
					</Text>
				</View>
				<Stars rating={plan.rating} />
			</View>

			<View style={styles.planFooter}>
				<Text style={styles.planPrice}>{priceRub} ₽</Text>
				<TouchableOpacity style={styles.detailsBtn} activeOpacity={0.8}>
					<Text style={styles.detailsBtnText}>{t('marketplace', 'details')}</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) => (
	<View style={styles.emptyState}>
		<Text style={styles.emptyEmoji}>{emoji}</Text>
		<Text style={styles.emptyTitle}>{title}</Text>
		{subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
	</View>
)

// ─── Main screen ──────────────────────────────────────────────────────────────

type ActiveTab = 'trainers' | 'plans'

const TRAINER_FILTERS = ['filter_all', 'filter_strength', 'filter_cardio', 'filter_nutrition'] as const
const PLAN_TYPE_FILTERS = ['filter_all', 'type_workout', 'type_nutrition', 'type_combo'] as const

export default function MarketplaceScreen() {
	const { t } = useLanguage()
	const [tab, setTab] = useState<ActiveTab>('trainers')
	const [search, setSearch] = useState('')
	const [trainerFilter, setTrainerFilter] = useState('filter_all')
	const [planFilter, setPlanFilter] = useState('filter_all')
	const [trainers, setTrainers] = useState<TrainerProfile[]>([])
	const [plans, setPlans] = useState<Plan[]>([])
	const [loading, setLoading] = useState(false)

	const fadeAnim = useRef(new Animated.Value(0)).current

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const specialty =
				trainerFilter !== 'filter_all'
					? t('marketplace', trainerFilter as Parameters<typeof t>[1])
					: undefined
			const planType =
				planFilter !== 'filter_all' ? planFilter.replace('type_', '') : undefined

			const [ts, ps] = await Promise.all([
				getTrainers({ specialty, search: search || undefined }),
				getPlans({ type: planType, search: search || undefined }),
			])
			setTrainers(ts)
			setPlans(ps)
			Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start()
		} catch {
			// Server likely not reachable during development
		} finally {
			setLoading(false)
		}
	}, [trainerFilter, planFilter, search, t])

	useEffect(() => {
		fadeAnim.setValue(0)
		load()
	}, [load])

	return (
		<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
					<Ionicons name='chevron-back' size={26} color={COLORS.text} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{t('marketplace', 'title')}</Text>
				<View style={{ width: 40 }} />
			</View>

			{/* Search */}
			<View style={styles.searchContainer}>
				<Ionicons name='search' size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
				<TextInput
					style={styles.searchInput}
					placeholder={t('marketplace', 'searchPlaceholder')}
					placeholderTextColor={COLORS.textSecondary}
					value={search}
					onChangeText={setSearch}
					returnKeyType='search'
					onSubmitEditing={load}
				/>
				{search.length > 0 && (
					<TouchableOpacity onPress={() => setSearch('')}>
						<Ionicons name='close-circle' size={18} color={COLORS.textSecondary} />
					</TouchableOpacity>
				)}
			</View>

			{/* Tabs */}
			<View style={styles.tabsRow}>
				<TabPill
					label={t('marketplace', 'trainers')}
					active={tab === 'trainers'}
					onPress={() => setTab('trainers')}
				/>
				<TabPill
					label={t('marketplace', 'plans')}
					active={tab === 'plans'}
					onPress={() => setTab('plans')}
				/>
			</View>

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps='handled'
			>
				{/* Filters */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.filtersScroll}
				>
					{tab === 'trainers'
						? TRAINER_FILTERS.map(f => (
								<FilterChip
									key={f}
									label={t('marketplace', f as Parameters<typeof t>[1])}
									active={trainerFilter === f}
									onPress={() => setTrainerFilter(f)}
								/>
							))
						: PLAN_TYPE_FILTERS.map(f => (
								<FilterChip
									key={f}
									label={t('marketplace', f as Parameters<typeof t>[1])}
									active={planFilter === f}
									onPress={() => setPlanFilter(f)}
								/>
							))}
				</ScrollView>

				{loading ? (
					<ActivityIndicator color={COLORS.primary} style={{ marginTop: 60 }} />
				) : (
					<Animated.View style={{ opacity: fadeAnim }}>
						{tab === 'trainers' ? (
							trainers.length === 0 ? (
								<EmptyState
									emoji='👨‍🏫'
									title={t('marketplace', 'noTrainers')}
									subtitle={t('marketplace', 'becomeTrainer')}
								/>
							) : (
								trainers.map(tr => <TrainerCard key={tr._id} trainer={tr} />)
							)
						) : plans.length === 0 ? (
							<EmptyState emoji='📋' title={t('marketplace', 'noPlans')} />
						) : (
							plans.map(pl => <PlanCard key={pl._id} plan={pl} />)
						)}
					</Animated.View>
				)}

				<View style={{ height: 40 }} />
			</ScrollView>
		</SafeAreaView>
	)
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.background },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
	headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },

	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.card,
		borderRadius: 12,
		marginHorizontal: 20,
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderWidth: 1,
		borderColor: COLORS.border,
		marginBottom: 12,
	},
	searchInput: { flex: 1, color: COLORS.text, fontSize: 15 },

	tabsRow: {
		flexDirection: 'row',
		paddingHorizontal: 20,
		gap: 8,
		marginBottom: 8,
	},
	tabPill: {
		paddingHorizontal: 20,
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: COLORS.card,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	tabPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
	tabPillText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
	tabPillTextActive: { color: '#000' },

	filtersScroll: { paddingHorizontal: 20, gap: 8, paddingBottom: 4 },
	filterChip: {
		paddingHorizontal: 14,
		paddingVertical: 6,
		borderRadius: 16,
		backgroundColor: COLORS.cardLight,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	filterChipActive: { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary },
	filterChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
	filterChipTextActive: { color: COLORS.primary },

	scrollContent: { paddingTop: 12 },

	// Trainer card
	trainerCard: {
		backgroundColor: COLORS.card,
		borderRadius: 16,
		marginHorizontal: 20,
		marginBottom: 12,
		padding: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	trainerCardTop: { flexDirection: 'row', alignItems: 'center' },
	trainerName: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1 },
	trainerMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
	trainerMetaText: { fontSize: 12, color: COLORS.textSecondary },
	trainerExp: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
	specialtiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
	specialtyChip: {
		backgroundColor: COLORS.primary + '15',
		borderRadius: 8,
		paddingHorizontal: 8,
		paddingVertical: 3,
	},
	specialtyChipText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
	viewBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 4,
		marginTop: 14,
		paddingVertical: 10,
		backgroundColor: COLORS.primary + '15',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: COLORS.primary + '30',
	},
	viewBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },

	// Plan card
	planCard: {
		backgroundColor: COLORS.card,
		borderRadius: 16,
		marginHorizontal: 20,
		marginBottom: 12,
		padding: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	planCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
	planTypeTag: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
	planTypeIcon: { fontSize: 14 },
	planTypeLabel: { fontSize: 12, fontWeight: '700' },
	planDifficulty: { backgroundColor: COLORS.cardLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
	planDifficultyText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
	planTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
	planTrainer: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 10 },
	planMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
	planMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	planMetaText: { fontSize: 12, color: COLORS.textSecondary },
	planFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	planPrice: { fontSize: 20, fontWeight: '800', color: COLORS.text },
	detailsBtn: {
		backgroundColor: COLORS.primary,
		borderRadius: 10,
		paddingHorizontal: 18,
		paddingVertical: 8,
	},
	detailsBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },

	// Empty
	emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
	emptyEmoji: { fontSize: 52, marginBottom: 16 },
	emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
	emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
})
