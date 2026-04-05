import { useAuth } from '@/app/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { Achievement, computeRating, RatingData, Tier, TIERS, TierName } from '@/services/rating'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	Animated,
	Dimensions,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const COLORS = {
	background: '#121212',
	card: '#1C1C1E',
	cardLight: '#2C2C2E',
	border: '#2C2C2E',
	text: '#FFFFFF',
	textSecondary: '#8E8E93',
	primary: '#34C759',
} as const

// ─── Shimmer ──────────────────────────────────────────────────────────────────

const useShimmer = () => {
	const anim = useRef(new Animated.Value(0)).current
	useEffect(() => {
		const loop = Animated.loop(
			Animated.sequence([
				Animated.timing(anim, { toValue: 1, duration: 750, useNativeDriver: true }),
				Animated.timing(anim, { toValue: 0, duration: 750, useNativeDriver: true }),
			]),
		)
		loop.start()
		return () => loop.stop()
	}, [])
	return anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] })
}

const ShimmerBlock = ({ style }: { style: object }) => {
	const opacity = useShimmer()
	return <Animated.View style={[style, { opacity }]} />
}

// ─── Tier label helper ────────────────────────────────────────────────────────

const useTierLabel = () => {
	const { t } = useLanguage()
	const tierLabel = useCallback(
		(name: TierName): string => {
			const map: Record<TierName, string> = {
				beginner: t('rating', 'tierBeginner'),
				bronze: t('rating', 'tierBronze'),
				silver: t('rating', 'tierSilver'),
				gold: t('rating', 'tierGold'),
				platinum: t('rating', 'tierPlatinum'),
				elite: t('rating', 'tierElite'),
			}
			return map[name]
		},
		[t],
	)
	return tierLabel
}

// ─── Animated progress bar ────────────────────────────────────────────────────

const ProgressBar = ({
	percent,
	color,
	height = 8,
}: {
	percent: number
	color: string
	height?: number
}) => {
	const anim = useRef(new Animated.Value(0)).current
	useEffect(() => {
		Animated.timing(anim, {
			toValue: percent / 100,
			duration: 900,
			useNativeDriver: false,
		}).start()
	}, [percent])

	const width = anim.interpolate({
		inputRange: [0, 1],
		outputRange: ['0%', '100%'],
	})

	return (
		<View
			style={{
				height,
				backgroundColor: COLORS.cardLight,
				borderRadius: height / 2,
				overflow: 'hidden',
			}}
		>
			<Animated.View
				style={{ height, width, backgroundColor: color, borderRadius: height / 2 }}
			/>
		</View>
	)
}

// ─── Level card ───────────────────────────────────────────────────────────────

const LevelCard = ({ data }: { data: RatingData }) => {
	const { t } = useLanguage()
	const tierLabel = useTierLabel()
	const { tier, nextTier, progressPercent, totalScore } = data

	return (
		<View style={[styles.card, { borderColor: `${tier.color}40`, borderWidth: 1.5 }]}>
			<View style={styles.levelCardHeader}>
				<Text style={styles.levelEmoji}>{tier.emoji}</Text>
				<View style={{ flex: 1, marginLeft: 16 }}>
					<Text style={[styles.levelName, { color: tier.color }]}>
						{tierLabel(tier.name).toUpperCase()}
					</Text>
					<Text style={styles.scoreText}>
						{totalScore.toLocaleString()} {t('rating', 'pts')}
					</Text>
				</View>
				<View style={[styles.scoreBadge, { backgroundColor: `${tier.color}20` }]}>
					<Text style={[styles.scoreBadgeText, { color: tier.color }]}>
						{t('rating', 'totalScore')}
					</Text>
				</View>
			</View>

			<View style={{ marginTop: 16 }}>
				<ProgressBar percent={progressPercent} color={tier.color} height={10} />
				<View style={styles.progressLabelRow}>
					<Text style={styles.progressLabel}>{progressPercent}%</Text>
					{nextTier ? (
						<Text style={styles.progressLabel}>
							{t('rating', 'progressTo')} {tierLabel(nextTier.name)}:{' '}
							{(nextTier.minScore - totalScore).toLocaleString()} {t('rating', 'pointsLeft')}
						</Text>
					) : (
						<Text style={[styles.progressLabel, { color: tier.color }]}>
							{t('rating', 'maxLevel')}
						</Text>
					)}
				</View>
			</View>

			{/* Tier ladder */}
			<View style={styles.tierLadder}>
				{TIERS.map((t2, i) => {
					const isActive = t2.name === tier.name
					return (
						<View key={t2.name} style={styles.tierStep}>
							<Text style={{ fontSize: isActive ? 20 : 14, opacity: isActive ? 1 : 0.4 }}>
								{t2.emoji}
							</Text>
							{i < TIERS.length - 1 && (
								<View
									style={[
										styles.tierConnector,
										{ backgroundColor: i < TIERS.findIndex(x => x.name === tier.name) ? tier.color : COLORS.border },
									]}
								/>
							)}
						</View>
					)
				})}
			</View>
		</View>
	)
}

// ─── Score breakdown card ─────────────────────────────────────────────────────

const ScoreBreakdownCard = ({ data }: { data: RatingData }) => {
	const { t } = useLanguage()
	const { scoreBreakdown, tier } = data

	const rows = [
		{ label: t('rating', 'workoutPts'), value: scoreBreakdown.workoutPts, icon: '💪' },
		{ label: t('rating', 'setPts'), value: scoreBreakdown.setPts, icon: '📊' },
		{ label: t('rating', 'volumePts'), value: scoreBreakdown.volumePts, icon: '🏋️' },
		{ label: t('rating', 'streakPts'), value: scoreBreakdown.streakPts, icon: '🔥' },
		{ label: t('rating', 'prPts'), value: scoreBreakdown.prPts, icon: '🏆' },
		{ label: t('rating', 'durationBonus'), value: scoreBreakdown.durationBonus, icon: '⏱️' },
	]

	const maxVal = Math.max(...rows.map(r => r.value), 1)

	return (
		<View style={styles.card}>
			<Text style={styles.sectionTitle}>{t('rating', 'scoreBreakdown')}</Text>
			<View style={{ marginTop: 12, gap: 10 }}>
				{rows.map(row => (
					<View key={row.label} style={styles.breakdownRow}>
						<Text style={styles.breakdownIcon}>{row.icon}</Text>
						<Text style={styles.breakdownLabel}>{row.label}</Text>
						<View style={{ flex: 1, marginHorizontal: 10 }}>
							<ProgressBar percent={(row.value / maxVal) * 100} color={tier.color} height={6} />
						</View>
						<Text style={[styles.breakdownValue, { color: tier.color }]}>
							{row.value}
						</Text>
					</View>
				))}
			</View>
		</View>
	)
}

// ─── Category grid ────────────────────────────────────────────────────────────

interface CategoryCard {
	key: string
	icon: string
	label: string
	value: string
	tier: Tier
}

const CategoryGrid = ({ data }: { data: RatingData }) => {
	const { t } = useLanguage()
	const tierLabel = useTierLabel()
	const { stats, prCount, categoryTiers } = data

	const categories: CategoryCard[] = [
		{
			key: 'volume',
			icon: '🏋️',
			label: t('rating', 'catVolume'),
			value: `${stats.total_volume.toLocaleString()} ${t('rating', 'kg')}`,
			tier: categoryTiers.volume,
		},
		{
			key: 'workouts',
			icon: '💪',
			label: t('rating', 'catWorkouts'),
			value: String(stats.total_workouts),
			tier: categoryTiers.workouts,
		},
		{
			key: 'streak',
			icon: '🔥',
			label: t('rating', 'catStreak'),
			value: `${stats.streak_days} ${t('rating', 'days')}`,
			tier: categoryTiers.streak,
		},
		{
			key: 'sets',
			icon: '📊',
			label: t('rating', 'catSets'),
			value: String(stats.total_sets),
			tier: categoryTiers.sets,
		},
		{
			key: 'avgDuration',
			icon: '⏱️',
			label: t('rating', 'catDuration'),
			value: `${stats.avg_duration} ${t('rating', 'min')}`,
			tier: categoryTiers.avgDuration,
		},
		{
			key: 'records',
			icon: '🏆',
			label: t('rating', 'catRecords'),
			value: String(prCount),
			tier: categoryTiers.records,
		},
	]

	return (
		<View>
			<Text style={[styles.sectionTitle, { paddingHorizontal: 20 }]}>
				{t('rating', 'categories')}
			</Text>
			<View style={styles.categoryGrid}>
				{categories.map(cat => (
					<View
						key={cat.key}
						style={[
							styles.categoryCard,
							{ borderColor: `${cat.tier.color}30`, borderWidth: 1 },
						]}
					>
						<Text style={styles.categoryIcon}>{cat.icon}</Text>
						<Text style={styles.categoryLabel}>{cat.label}</Text>
						<Text style={styles.categoryValue}>{cat.value}</Text>
						<View style={[styles.tierBadge, { backgroundColor: `${cat.tier.color}20` }]}>
							<Text style={[styles.tierBadgeText, { color: cat.tier.color }]}>
								{cat.tier.emoji} {tierLabel(cat.tier.name)}
							</Text>
						</View>
					</View>
				))}
			</View>
		</View>
	)
}

// ─── Achievement badge + detail modal ────────────────────────────────────────

const AchievementBadge = ({
	achievement,
	onPress,
}: {
	achievement: Achievement
	onPress: (a: Achievement) => void
}) => {
	const scale = useRef(new Animated.Value(1)).current

	const handlePress = () => {
		Animated.sequence([
			Animated.timing(scale, { toValue: 0.9, duration: 80, useNativeDriver: true }),
			Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
		]).start(() => onPress(achievement))
	}

	return (
		<TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
			<Animated.View
				style={[
					styles.achievementBadge,
					achievement.earned
						? styles.achievementEarned
						: styles.achievementLocked,
					{ transform: [{ scale }] },
				]}
			>
				<Text style={[styles.achievementEmoji, { opacity: achievement.earned ? 1 : 0.3 }]}>
					{achievement.emoji}
				</Text>
				{achievement.earned && (
					<View style={styles.achievementCheck}>
						<Ionicons name='checkmark' size={8} color='#fff' />
					</View>
				)}
				{!achievement.earned && achievement.progressPercent > 0 && (
					<View style={styles.achievementProgressRing}>
						<Text style={styles.achievementProgressText}>
							{achievement.progressPercent}%
						</Text>
					</View>
				)}
			</Animated.View>
		</TouchableOpacity>
	)
}

// ─── Achievements section ─────────────────────────────────────────────────────

const AchievementsSection = ({ data }: { data: RatingData }) => {
	const { t } = useLanguage()
	const [selected, setSelected] = useState<Achievement | null>(null)
	const { achievements } = data

	const earnedCount = achievements.filter(a => a.earned).length

	const getAchievementInfo = (id: string) => ({
		title: t('rating', `ach_${id}_title` as Parameters<typeof t>[1]),
		desc: t('rating', `ach_${id}_desc` as Parameters<typeof t>[1]),
	})

	return (
		<View>
			<View style={styles.achievementsHeader}>
				<Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>
					{t('rating', 'achievements')}
				</Text>
				<Text style={styles.achievementsCount}>
					{earnedCount}/{achievements.length} {t('rating', 'earned')}
				</Text>
			</View>

			<View style={styles.achievementsGrid}>
				{achievements.map(a => (
					<AchievementBadge key={a.id} achievement={a} onPress={setSelected} />
				))}
			</View>

			{/* Detail modal */}
			<Modal
				visible={!!selected}
				transparent
				animationType='fade'
				onRequestClose={() => setSelected(null)}
			>
				<Pressable style={styles.modalOverlay} onPress={() => setSelected(null)}>
					<Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
						{selected && (() => {
							const info = getAchievementInfo(selected.id)
							return (
								<>
									<Text style={styles.modalEmoji}>{selected.emoji}</Text>
									<Text style={styles.modalTitle}>{info.title}</Text>
									<Text style={styles.modalDesc}>{info.desc}</Text>
									{selected.earned ? (
										<View style={styles.modalEarnedTag}>
											<Ionicons name='checkmark-circle' size={16} color={COLORS.primary} />
											<Text style={[styles.modalEarnedText, { color: COLORS.primary }]}>
												{t('rating', 'earned')}
											</Text>
										</View>
									) : (
										<View style={{ width: '100%', marginTop: 16 }}>
											<Text style={[styles.progressLabel, { marginBottom: 6 }]}>
												{selected.progressPercent}%
											</Text>
											<ProgressBar
												percent={selected.progressPercent}
												color={COLORS.primary}
												height={8}
											/>
										</View>
									)}
									<TouchableOpacity
										style={styles.modalClose}
										onPress={() => setSelected(null)}
									>
										<Text style={styles.modalCloseText}>OK</Text>
									</TouchableOpacity>
								</>
							)
						})()}
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	)
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const RatingSkeleton = () => (
	<View style={{ gap: 16 }}>
		<ShimmerBlock style={{ height: 160, borderRadius: 16, backgroundColor: COLORS.card }} />
		<ShimmerBlock style={{ height: 180, borderRadius: 16, backgroundColor: COLORS.card }} />
		<View style={styles.categoryGrid}>
			{[...Array(6)].map((_, i) => (
				<ShimmerBlock
					key={i}
					style={{ height: 110, borderRadius: 12, backgroundColor: COLORS.card, flex: 1 }}
				/>
			))}
		</View>
	</View>
)

// ─── Main screen ──────────────────────────────────────────────────────────────

// ─── Premium gate ─────────────────────────────────────────────────────────────

const PremiumGate = () => {
	const { t } = useLanguage()
	return (
		<View style={gateStyles.container}>
			<View style={gateStyles.card}>
				<Text style={gateStyles.emoji}>🏆</Text>
				<Text style={gateStyles.title}>{t('rating', 'premiumGateTitle')}</Text>
				<Text style={gateStyles.subtitle}>{t('rating', 'premiumGateSubtitle')}</Text>
				<TouchableOpacity
					style={gateStyles.button}
					onPress={() => router.push('/(tabs)/profile')}
				>
					<Ionicons name='diamond' size={18} color='#000' />
					<Text style={gateStyles.buttonText}>{t('rating', 'premiumGateBtn')}</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => router.back()} style={gateStyles.back}>
					<Text style={gateStyles.backText}>{t('common', 'cancel')}</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}

const gateStyles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', padding: 24 },
	card: {
		backgroundColor: '#1C1C1E',
		borderRadius: 24,
		padding: 32,
		alignItems: 'center',
		borderWidth: 1.5,
		borderColor: 'rgba(255,215,0,0.3)',
	},
	emoji: { fontSize: 56, marginBottom: 16 },
	title: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 10 },
	subtitle: { fontSize: 14, color: '#8E8E93', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		backgroundColor: '#FFD700',
		borderRadius: 14,
		paddingHorizontal: 28,
		paddingVertical: 14,
		marginBottom: 12,
	},
	buttonText: { color: '#000', fontWeight: '800', fontSize: 16 },
	back: { paddingVertical: 8 },
	backText: { color: '#8E8E93', fontSize: 14 },
})

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function RatingScreen() {
	const { t } = useLanguage()
	const { user } = useAuth()
	const [data, setData] = useState<RatingData | null>(null)
	const [loading, setLoading] = useState(true)

	const fadeAnim = useRef(new Animated.Value(0)).current

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const result = await computeRating()
			setData(result)
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 400,
				useNativeDriver: true,
			}).start()
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		load()
	}, [load])

	if (!user?.isPremium) return <PremiumGate />

	return (
		<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
					<Ionicons name='chevron-back' size={26} color={COLORS.text} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{t('rating', 'title')}</Text>
				<View style={{ width: 40 }} />
			</View>

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{loading || !data ? (
					<RatingSkeleton />
				) : (
					<Animated.View style={{ opacity: fadeAnim, gap: 16 }}>
						<LevelCard data={data} />
						<ScoreBreakdownCard data={data} />
						<CategoryGrid data={data} />
						<View style={[styles.card, { paddingTop: 12 }]}>
							<AchievementsSection data={data} />
						</View>
					</Animated.View>
				)}

				<View style={{ height: 40 }} />
			</ScrollView>
		</SafeAreaView>
	)
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_GAP = 10
const CATEGORY_COLS = 3
const CATEGORY_CARD_WIDTH =
	(SCREEN_WIDTH - 40 - CARD_GAP * (CATEGORY_COLS - 1)) / CATEGORY_COLS

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	backBtn: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: COLORS.text,
	},
	scrollContent: {
		paddingHorizontal: 20,
		paddingTop: 4,
	},

	// Card
	card: {
		backgroundColor: COLORS.card,
		borderRadius: 16,
		padding: 16,
	},

	// Level card
	levelCardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	levelEmoji: {
		fontSize: 48,
	},
	levelName: {
		fontSize: 22,
		fontWeight: '800',
		letterSpacing: 1,
	},
	scoreText: {
		fontSize: 14,
		color: COLORS.textSecondary,
		marginTop: 2,
	},
	scoreBadge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 20,
	},
	scoreBadgeText: {
		fontSize: 11,
		fontWeight: '600',
	},
	progressLabelRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 6,
	},
	progressLabel: {
		fontSize: 11,
		color: COLORS.textSecondary,
	},
	tierLadder: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 18,
		justifyContent: 'space-between',
	},
	tierStep: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	tierConnector: {
		flex: 1,
		height: 2,
		marginHorizontal: 2,
	},

	// Score breakdown
	sectionTitle: {
		fontSize: 15,
		fontWeight: '700',
		color: COLORS.text,
	},
	breakdownRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	breakdownIcon: {
		fontSize: 16,
		width: 22,
		textAlign: 'center',
	},
	breakdownLabel: {
		fontSize: 13,
		color: COLORS.textSecondary,
		width: 105,
	},
	breakdownValue: {
		fontSize: 13,
		fontWeight: '700',
		width: 36,
		textAlign: 'right',
	},

	// Category grid
	categoryGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: CARD_GAP,
		paddingHorizontal: 20,
		marginTop: 12,
	},
	categoryCard: {
		width: CATEGORY_CARD_WIDTH,
		backgroundColor: COLORS.card,
		borderRadius: 12,
		padding: 10,
		alignItems: 'center',
		gap: 4,
	},
	categoryIcon: {
		fontSize: 22,
	},
	categoryLabel: {
		fontSize: 11,
		color: COLORS.textSecondary,
		textAlign: 'center',
	},
	categoryValue: {
		fontSize: 13,
		fontWeight: '700',
		color: COLORS.text,
		textAlign: 'center',
	},
	tierBadge: {
		borderRadius: 10,
		paddingHorizontal: 6,
		paddingVertical: 2,
		marginTop: 2,
	},
	tierBadgeText: {
		fontSize: 10,
		fontWeight: '600',
	},

	// Achievements
	achievementsHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 14,
	},
	achievementsCount: {
		fontSize: 12,
		color: COLORS.textSecondary,
	},
	achievementsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
	},
	achievementBadge: {
		width: 56,
		height: 56,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
	},
	achievementEarned: {
		backgroundColor: 'rgba(52,199,89,0.15)',
		borderWidth: 1.5,
		borderColor: 'rgba(52,199,89,0.5)',
	},
	achievementLocked: {
		backgroundColor: COLORS.cardLight,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	achievementEmoji: {
		fontSize: 26,
	},
	achievementCheck: {
		position: 'absolute',
		top: 2,
		right: 2,
		width: 14,
		height: 14,
		borderRadius: 7,
		backgroundColor: COLORS.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	achievementProgressRing: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		backgroundColor: COLORS.card,
		borderRadius: 8,
		paddingHorizontal: 3,
		paddingVertical: 1,
	},
	achievementProgressText: {
		fontSize: 8,
		color: COLORS.textSecondary,
		fontWeight: '600',
	},

	// Modal
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.7)',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 32,
	},
	modalCard: {
		backgroundColor: COLORS.card,
		borderRadius: 20,
		padding: 28,
		alignItems: 'center',
		width: '100%',
		maxWidth: 320,
	},
	modalEmoji: {
		fontSize: 52,
		marginBottom: 12,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: '800',
		color: COLORS.text,
		textAlign: 'center',
	},
	modalDesc: {
		fontSize: 14,
		color: COLORS.textSecondary,
		textAlign: 'center',
		marginTop: 8,
	},
	modalEarnedTag: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginTop: 16,
	},
	modalEarnedText: {
		fontSize: 14,
		fontWeight: '700',
	},
	modalClose: {
		marginTop: 24,
		backgroundColor: COLORS.primary,
		borderRadius: 12,
		paddingHorizontal: 40,
		paddingVertical: 12,
	},
	modalCloseText: {
		color: '#fff',
		fontWeight: '700',
		fontSize: 16,
	},
})
