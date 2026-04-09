import { hasActivePremium, useAuth } from '@/app/contexts/auth-context'
import PremiumGate from '@/app/components/premium-gate'
import { useLanguage } from '@/contexts/language-context'
import { Achievement, computeRating } from '@/services/rating'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	Animated,
	Dimensions,
	FlatList,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width: SW } = Dimensions.get('window')

// ─── Constants ───────────────────────────────────────────────────────────────

const C = {
	bg: '#121212',
	card: '#1C1C1E',
	card2: '#2C2C2E',
	border: '#3A3A3C',
	text: '#FFFFFF',
	sub: '#8E8E93',
	primary: '#34C759',
	earned: '#34C759',
} as const

// ─── Progress ring (SVG-based) ────────────────────────────────────────────────

const RING = 48
const STROKE = 3
const R = (RING - STROKE * 2) / 2
const CIRC = 2 * Math.PI * R

const ProgressRing = ({ pct, color }: { pct: number; color: string }) => {
	const anim = useRef(new Animated.Value(0)).current

	useEffect(() => {
		Animated.timing(anim, { toValue: pct / 100, duration: 700, useNativeDriver: false }).start()
	}, [pct])

	const dashOffset = anim.interpolate({
		inputRange: [0, 1],
		outputRange: [CIRC, 0],
	})

	return (
		<View style={{ width: RING, height: RING, alignItems: 'center', justifyContent: 'center' }}>
			{/* bg ring */}
			<View
				style={{
					width: RING,
					height: RING,
					borderRadius: RING / 2,
					borderWidth: STROKE,
					borderColor: C.card2,
					position: 'absolute',
				}}
			/>
			{/* Percentage text overlay */}
			<Text style={{ fontSize: 9, color: C.sub, fontWeight: '700' }}>{pct}%</Text>
		</View>
	)
}

// ─── Single achievement card ──────────────────────────────────────────────────

const AchCard = ({
	item,
	onPress,
}: {
	item: Achievement
	onPress: (a: Achievement) => void
}) => {
	const { t } = useLanguage()
	const scale = useRef(new Animated.Value(1)).current

	const handlePress = () => {
		Animated.sequence([
			Animated.timing(scale, { toValue: 0.93, duration: 70, useNativeDriver: true }),
			Animated.timing(scale, { toValue: 1, duration: 70, useNativeDriver: true }),
		]).start(() => onPress(item))
	}

	const titleKey = `ach_${item.id}_title` as Parameters<typeof t>[1]
	const descKey  = `ach_${item.id}_desc`  as Parameters<typeof t>[1]
	const title    = t('rating', titleKey)
	const desc     = t('rating', descKey)

	return (
		<TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
			<Animated.View
				style={[
					s.achCard,
					item.earned ? s.achCardEarned : s.achCardLocked,
					{ transform: [{ scale }] },
				]}
			>
				{/* Icon */}
				<View style={[s.iconWrap, { backgroundColor: item.earned ? `${item.iconColor}20` : C.card2, borderColor: item.earned ? `${item.iconColor}50` : C.border }]}>
					<Ionicons
						name={item.icon as any}
						size={26}
						color={item.earned ? item.iconColor : '#555'}
					/>
					{item.earned && (
						<View style={s.checkBadge}>
							<Ionicons name='checkmark' size={8} color='#fff' />
						</View>
					)}
				</View>

				{/* Text */}
				<View style={s.achInfo}>
					<Text style={[s.achTitle, !item.earned && s.achTitleLocked]} numberOfLines={1}>
						{title}
					</Text>
					<Text style={s.achDesc} numberOfLines={2}>{desc}</Text>

					{/* Progress bar */}
					{!item.earned && (
						<View style={s.progressWrap}>
							<View style={s.progressBg}>
								<View
									style={[
										s.progressFill,
										{
											width: `${item.progressPercent}%` as any,
											backgroundColor: item.iconColor,
										},
									]}
								/>
							</View>
							<Text style={s.progressPct}>{item.progressPercent}%</Text>
						</View>
					)}
					{item.earned && item.earnedAt && (
						<Text style={[s.earnedDate, { color: item.iconColor }]}>
							✓ {new Date(item.earnedAt).toLocaleDateString()}
						</Text>
					)}
				</View>
			</Animated.View>
		</TouchableOpacity>
	)
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

const DetailModal = ({
	item,
	visible,
	onClose,
}: {
	item: Achievement | null
	visible: boolean
	onClose: () => void
}) => {
	const { t } = useLanguage()
	if (!item) return null

	const titleKey = `ach_${item.id}_title` as Parameters<typeof t>[1]
	const descKey  = `ach_${item.id}_desc`  as Parameters<typeof t>[1]
	const title    = t('rating', titleKey)
	const desc     = t('rating', descKey)

	return (
		<Modal visible={visible} transparent animationType='fade' onRequestClose={onClose}>
			<Pressable style={s.overlay} onPress={onClose}>
				<Pressable style={s.modal} onPress={e => e.stopPropagation()}>
					{/* Large icon */}
					<View style={[s.modalIconWrap, { backgroundColor: item.earned ? `${item.iconColor}20` : C.card2, borderColor: item.earned ? `${item.iconColor}50` : C.border }]}>
						<Ionicons
							name={item.icon as any}
							size={52}
							color={item.earned ? item.iconColor : '#555'}
						/>
					</View>

					<Text style={s.modalTitle}>{title}</Text>
					<Text style={s.modalDesc}>{desc}</Text>

					{item.earned ? (
						<View style={[s.earnedTag, { backgroundColor: `${C.earned}15` }]}>
							<Ionicons name='checkmark-circle' size={16} color={C.earned} />
							<Text style={[s.earnedTagText, { color: C.earned }]}>
								{t('rating', 'earned')}
								{item.earnedAt ? ` • ${new Date(item.earnedAt).toLocaleDateString()}` : ''}
							</Text>
						</View>
					) : (
						<View style={s.modalProgress}>
							<View style={s.modalProgressRow}>
								<Text style={s.modalProgressLabel}>{t('rating', 'progress')}</Text>
								<Text style={[s.modalProgressPct, { color: item.iconColor }]}>
									{item.progressCurrent.toLocaleString()} / {item.progressTarget.toLocaleString()}
								</Text>
							</View>
							<View style={s.modalProgressBg}>
								<View
									style={[
										s.modalProgressFill,
										{ width: `${item.progressPercent}%` as any, backgroundColor: item.iconColor },
									]}
								/>
							</View>
							<Text style={s.modalProgressPctSmall}>{item.progressPercent}%</Text>
						</View>
					)}

					<TouchableOpacity style={[s.modalBtn, { backgroundColor: item.earned ? item.iconColor : C.primary }]} onPress={onClose}>
						<Text style={s.modalBtnText}>OK</Text>
					</TouchableOpacity>
				</Pressable>
			</Pressable>
		</Modal>
	)
}

// ─── Stats row ────────────────────────────────────────────────────────────────

const StatsBar = ({
	total,
	earned,
	pct,
}: {
	total: number
	earned: number
	pct: number
}) => {
	const { t } = useLanguage()
	const anim = useRef(new Animated.Value(0)).current

	useEffect(() => {
		Animated.timing(anim, { toValue: pct / 100, duration: 800, useNativeDriver: false }).start()
	}, [pct])

	const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })

	return (
		<View style={s.statsBar}>
			<View style={s.statsLeft}>
				<Text style={s.statsEarned}>{earned}</Text>
				<Text style={s.statsSep}>/</Text>
				<Text style={s.statsTotal}>{total}</Text>
				<Text style={s.statsLabel}> {t('rating', 'earned')}</Text>
			</View>
			<View style={s.statsRight}>
				<Text style={[s.statsPct, { color: C.primary }]}>{pct}%</Text>
			</View>
			<View style={s.statsBarOuter}>
				<Animated.View style={[s.statsBarInner, { width }]} />
			</View>
		</View>
	)
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AchievementsScreen() {
	const { t } = useLanguage()
	const { user } = useAuth()
	const premium = hasActivePremium(user)
	const [achievements, setAchievements] = useState<Achievement[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedAch, setSelectedAch] = useState<Achievement | null>(null)
	const [showModal, setShowModal] = useState(false)

	const fadeAnim = useRef(new Animated.Value(0)).current

	const load = useCallback(async () => {
		setLoading(true)
		const data = await computeRating()
		setAchievements(data.achievements)
		setLoading(false)
		Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start()
	}, [])

	useEffect(() => { load() }, [load])

	if (!premium) return <PremiumGate featureIcon='ribbon-outline' featureColor='#FFD700' />

	const earnedAll = achievements.filter(a => a.earned).length
	const earnedPct = achievements.length > 0 ? Math.round((earnedAll / achievements.length) * 100) : 0

	const handlePress = (a: Achievement) => {
		setSelectedAch(a)
		setShowModal(true)
	}

	return (
		<SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
			{/* Header */}
			<View style={s.header}>
				<TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
					<Ionicons name='chevron-back' size={26} color={C.text} />
				</TouchableOpacity>
				<Text style={s.headerTitle}>{t('rating', 'achPageTitle')}</Text>
				<View style={{ width: 40 }} />
			</View>

			{loading ? (
				<View style={s.loadingWrap}>
					<Ionicons name='trophy-outline' size={40} color={C.sub} />
					<Text style={s.loadingText}>{t('common', 'loading')}</Text>
				</View>
			) : (
				<Animated.View style={{ flex: 1, opacity: fadeAnim }}>
					{/* Stats */}
					<View style={s.statsWrap}>
						<StatsBar total={achievements.length} earned={earnedAll} pct={earnedPct} />
					</View>

					{/* List */}
					<FlatList
						data={achievements}
						keyExtractor={item => item.id}
						contentContainerStyle={s.listContent}
						showsVerticalScrollIndicator={false}
						renderItem={({ item }) => (
							<AchCard item={item} onPress={handlePress} />
						)}
						ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
						ListEmptyComponent={
							<View style={s.emptyWrap}>
								<Ionicons name='ribbon-outline' size={36} color={C.sub} />
								<Text style={s.emptyText}>{t('common', 'noData')}</Text>
							</View>
						}
					/>
				</Animated.View>
			)}

			<DetailModal
				item={selectedAch}
				visible={showModal}
				onClose={() => setShowModal(false)}
			/>
		</SafeAreaView>
	)
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
	safe: { flex: 1, backgroundColor: C.bg },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	backBtn: {
		width: 40, height: 40,
		alignItems: 'center', justifyContent: 'center',
	},
	headerTitle: { fontSize: 18, fontWeight: '700', color: C.text },

	loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
	loadingText: { color: C.sub, fontSize: 14 },

	// Stats bar
	statsWrap: {
		marginHorizontal: 16,
		backgroundColor: C.card,
		borderRadius: 14,
		padding: 16,
		marginBottom: 12,
	},
	statsBar: { gap: 8 },
	statsLeft: { flexDirection: 'row', alignItems: 'baseline' },
	statsRight: { position: 'absolute', right: 0, top: 0 },
	statsEarned: { fontSize: 28, fontWeight: '800', color: C.primary },
	statsSep: { fontSize: 18, color: C.sub, marginHorizontal: 4 },
	statsTotal: { fontSize: 18, fontWeight: '700', color: C.text },
	statsLabel: { fontSize: 13, color: C.sub },
	statsPct: { fontSize: 16, fontWeight: '700' },
	statsBarOuter: {
		height: 6, backgroundColor: C.card2, borderRadius: 3, overflow: 'hidden', marginTop: 4,
	},
	statsBarInner: {
		height: 6, backgroundColor: C.primary, borderRadius: 3,
	},

	// List
	listContent: { paddingHorizontal: 16, paddingBottom: 32 },

	// Achievement card
	achCard: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 14,
		padding: 14,
		borderRadius: 14,
		borderWidth: 1,
	},
	achCardEarned: {
		backgroundColor: '#1C2A1E',
		borderColor: 'rgba(52,199,89,0.25)',
	},
	achCardLocked: {
		backgroundColor: C.card,
		borderColor: C.border,
	},

	// Icon
	iconWrap: {
		width: 54, height: 54,
		borderRadius: 14,
		alignItems: 'center', justifyContent: 'center',
		borderWidth: 1.5,
	},
	checkBadge: {
		position: 'absolute', top: -3, right: -3,
		width: 16, height: 16, borderRadius: 8,
		backgroundColor: C.earned,
		alignItems: 'center', justifyContent: 'center',
		borderWidth: 1.5, borderColor: C.bg,
	},

	achInfo: { flex: 1, gap: 3 },
	achTitle: { fontSize: 14, fontWeight: '700', color: C.text },
	achTitleLocked: { color: C.sub },
	achDesc: { fontSize: 12, color: C.sub, lineHeight: 16 },

	// Progress
	progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
	progressBg: {
		flex: 1, height: 4, backgroundColor: C.card2, borderRadius: 2, overflow: 'hidden',
	},
	progressFill: { height: 4, borderRadius: 2 },
	progressPct: { fontSize: 10, color: C.sub, fontWeight: '600', width: 28, textAlign: 'right' },

	earnedDate: { fontSize: 11, marginTop: 2 },

	// Empty
	emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 60 },
	emptyText: { color: C.sub, fontSize: 14 },

	// Modal
	overlay: {
		flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
		alignItems: 'center', justifyContent: 'center', padding: 28,
	},
	modal: {
		backgroundColor: C.card, borderRadius: 22, padding: 28,
		alignItems: 'center', width: '100%', maxWidth: 320,
	},
	modalIconWrap: {
		width: 88, height: 88, borderRadius: 22,
		alignItems: 'center', justifyContent: 'center',
		borderWidth: 2, marginBottom: 16,
	},
	modalTitle: { fontSize: 20, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 8 },
	modalDesc: { fontSize: 14, color: C.sub, textAlign: 'center', lineHeight: 20, marginBottom: 16 },

	earnedTag: {
		flexDirection: 'row', alignItems: 'center', gap: 6,
		paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginBottom: 20,
	},
	earnedTagText: { fontSize: 13, fontWeight: '700' },

	modalProgress: { width: '100%', marginBottom: 20, gap: 6 },
	modalProgressRow: {
		flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
	},
	modalProgressLabel: { fontSize: 13, color: C.sub },
	modalProgressPct: { fontSize: 13, fontWeight: '700' },
	modalProgressBg: { height: 6, backgroundColor: C.card2, borderRadius: 3, overflow: 'hidden' },
	modalProgressFill: { height: 6, borderRadius: 3 },
	modalProgressPctSmall: { fontSize: 11, color: C.sub, textAlign: 'right' },

	modalBtn: {
		borderRadius: 12, paddingHorizontal: 40, paddingVertical: 12,
	},
	modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
