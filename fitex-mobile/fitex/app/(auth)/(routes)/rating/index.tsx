import { hasActivePremium, useAuth } from '@/app/contexts/auth-context'
import SharedPremiumGate from '@/app/components/premium-gate'
import { useLanguage } from '@/contexts/language-context'
import { getMilestoneAchievementCopy } from '@/services/achievement-milestones-extra'
import { Achievement, computeRating, LEVELS, RatingData, Tier, TIERS, TierName } from '@/services/rating'
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

const C = {
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
				bronze:   t('rating', 'tierBronze'),
				silver:   t('rating', 'tierSilver'),
				gold:     t('rating', 'tierGold'),
				platinum: t('rating', 'tierPlatinum'),
				elite:    t('rating', 'tierElite'),
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

	const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })

	return (
		<View style={{ height, backgroundColor: C.cardLight, borderRadius: height / 2, overflow: 'hidden' }}>
			<Animated.View style={{ height, width, backgroundColor: color, borderRadius: height / 2 }} />
		</View>
	)
}

// ─── Tier icon (SVG-based via Ionicons) ───────────────────────────────────────

const TIER_ICONS: Record<TierName, { name: string; color: string }> = {
	beginner: { name: 'trophy',    color: '#8E8E93' },
	bronze:   { name: 'trophy',   color: '#CD7F32' },
	silver:   { name: 'trophy',   color: '#C0C0C0' },
	gold:     { name: 'trophy',  color: '#FFD700' },
	platinum: { name: 'trophy', color: '#5AC8FA' },
	elite:    { name: 'trophy',          color: '#FF9500' },
}

// ─── Level card ───────────────────────────────────────────────────────────────

// Dots showing levels within the current tier
const TierLevelDots = ({ tierName, currentLevel }: { tierName: TierName; currentLevel: number }) => {
	const tierLevels = LEVELS.filter(l => l.tierName === tierName)
	const tier = TIERS.find(t => t.name === tierName)!
	return (
		<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginTop: 10 }}>
			{tierLevels.map(lv => {
				const done    = lv.level < currentLevel
				const active  = lv.level === currentLevel
				return (
					<View
						key={lv.level}
						style={{
							width: active ? 24 : 8, height: 8,
							borderRadius: 4,
							backgroundColor: done || active
								? tier.color
								: '#2C2C2E',
							opacity: active ? 1 : done ? 0.7 : 0.3,
						}}
					/>
				)
			})}
		</View>
	)
}

const LevelCard = ({ data }: { data: RatingData }) => {
	const { t } = useLanguage()
	const tierLabel = useTierLabel()
	const { tier, nextTier, totalScore, currentLevel, nextLevel, levelProgressPercent } = data
	const icon = TIER_ICONS[tier.name]

	return (
		<View style={[styles.card, { borderColor: `${tier.color}40`, borderWidth: 1.5 }]}>
			{/* Top row: icon + level number + score badge */}
			<View style={styles.levelCardHeader}>
				<View style={[styles.tierIconWrap, { backgroundColor: `${tier.color}15`, borderColor: `${tier.color}40` }]}>
					<Ionicons name={icon.name as any} size={32} color={icon.color} />
				</View>
				<View style={{ flex: 1, marginLeft: 14 }}>
					{/* Big level number */}
					<View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
						<Text style={[styles.levelNum, { color: tier.color }]}>
							{t('rating', 'levelLabel')} {currentLevel.level}
						</Text>
						<Text style={styles.levelTotal}>/50</Text>
					</View>
					<Text style={[styles.tierName, { color: tier.color }]}>
						{tierLabel(tier.name)}
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

			{/* Level progress bar */}
			<View style={{ marginTop: 14 }}>
				<ProgressBar percent={levelProgressPercent} color={tier.color} height={10} />
				<View style={styles.progressLabelRow}>
					<Text style={styles.progressLabel}>{levelProgressPercent}%</Text>
					{nextLevel ? (
						<Text style={styles.progressLabel}>
							→ {t('rating', 'levelLabel')} {nextLevel.level}:{' '}
							{(nextLevel.minScore - totalScore).toLocaleString()} {t('rating', 'pointsLeft')}
						</Text>
					) : (
						<Text style={[styles.progressLabel, { color: tier.color }]}>
							{t('rating', 'maxLevel')}
						</Text>
					)}
				</View>
			</View>

			{/* Tier-level dots */}
			<TierLevelDots tierName={tier.name} currentLevel={currentLevel.level} />

			{/* Tier ladder */}
			<View style={styles.tierLadder}>
				{TIERS.map((t2, i) => {
					const isActive  = t2.name === tier.name
					const isPassed  = i < TIERS.findIndex(x => x.name === tier.name)
					const ic = TIER_ICONS[t2.name]
					return (
						<View key={t2.name} style={styles.tierStep}>
							<View style={[
								styles.tierStepIcon,
								isActive && { borderColor: ic.color, backgroundColor: `${ic.color}15` },
								isPassed && { borderColor: ic.color + '70', backgroundColor: `${ic.color}08` },
							]}>
								<Ionicons
									name={ic.name as any}
									size={isActive ? 18 : 13}
									color={isActive ? ic.color : isPassed ? ic.color + 'AA' : '#444'}
								/>
							</View>
							{i < TIERS.length - 1 && (
								<View
									style={[
										styles.tierConnector,
										{ backgroundColor: isPassed ? tier.color : C.border },
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

const BREAKDOWN_ICONS: { icon: string; color: string }[] = [
	{ icon: 'barbell-outline',     color: '#34C759' },
	{ icon: 'layers-outline',      color: '#5AC8FA' },
	{ icon: 'trending-up-outline', color: '#FF9F0A' },
	{ icon: 'flame-outline',       color: '#FF6B35' },
	{ icon: 'trophy-outline',      color: '#FFD700' },
	{ icon: 'timer-outline',       color: '#AF52DE' },
]

const ScoreBreakdownCard = ({ data }: { data: RatingData }) => {
	const { t } = useLanguage()
	const { scoreBreakdown, tier } = data

	const rows = [
		{ label: t('rating', 'workoutPts'), value: scoreBreakdown.workoutPts, ...BREAKDOWN_ICONS[0] },
		{ label: t('rating', 'setPts'),     value: scoreBreakdown.setPts,     ...BREAKDOWN_ICONS[1] },
		{ label: t('rating', 'volumePts'),  value: scoreBreakdown.volumePts,  ...BREAKDOWN_ICONS[2] },
		{ label: t('rating', 'streakPts'),  value: scoreBreakdown.streakPts,  ...BREAKDOWN_ICONS[3] },
		{ label: t('rating', 'prPts'),      value: scoreBreakdown.prPts,      ...BREAKDOWN_ICONS[4] },
		{ label: t('rating', 'durationBonus'), value: scoreBreakdown.durationBonus, ...BREAKDOWN_ICONS[5] },
	]

	const maxVal = Math.max(...rows.map(r => r.value), 1)

	return (
		<View style={styles.card}>
			<Text style={styles.sectionTitle}>{t('rating', 'scoreBreakdown')}</Text>
			<View style={{ marginTop: 12, gap: 10 }}>
				{rows.map(row => (
					<View key={row.label} style={styles.breakdownRow}>
						<View style={[styles.breakdownIconWrap, { backgroundColor: `${row.color}15` }]}>
							<Ionicons name={row.icon as any} size={15} color={row.color} />
						</View>
						<Text style={styles.breakdownLabel}>{row.label}</Text>
						<View style={{ flex: 1, marginHorizontal: 10 }}>
							<ProgressBar percent={(row.value / maxVal) * 100} color={row.color} height={6} />
						</View>
						<Text style={[styles.breakdownValue, { color: row.color }]}>
							{row.value}
						</Text>
					</View>
				))}
			</View>
		</View>
	)
}

// ─── Category grid ────────────────────────────────────────────────────────────

const CAT_ICONS: Record<string, { icon: string; color: string }> = {
	volume:      { icon: 'barbell-outline',     color: '#FF9F0A' },
	workouts:    { icon: 'fitness-outline',     color: '#34C759' },
	streak:      { icon: 'flame-outline',       color: '#FF6B35' },
	sets:        { icon: 'layers-outline',      color: '#5AC8FA' },
	avgDuration: { icon: 'timer-outline',       color: '#AF52DE' },
	records:     { icon: 'trophy-outline',      color: '#FFD700' },
}

const CategoryGrid = ({ data }: { data: RatingData }) => {
	const { t } = useLanguage()
	const tierLabel = useTierLabel()
	const { stats, prCount, categoryTiers } = data

	const categories = [
		{ key: 'volume',      label: t('rating', 'catVolume'),   value: `${stats.total_volume.toLocaleString()} ${t('rating', 'kg')}` },
		{ key: 'workouts',    label: t('rating', 'catWorkouts'), value: String(stats.total_workouts) },
		{ key: 'streak',      label: t('rating', 'catStreak'),   value: `${stats.streak_days} ${t('rating', 'days')}` },
		{ key: 'sets',        label: t('rating', 'catSets'),     value: String(stats.total_sets) },
		{ key: 'avgDuration', label: t('rating', 'catDuration'), value: `${stats.avg_duration} ${t('rating', 'min')}` },
		{ key: 'records',     label: t('rating', 'catRecords'),  value: String(prCount) },
	]

	return (
		<View>
			<Text style={[styles.sectionTitle, { paddingHorizontal: 20 }]}>
				{t('rating', 'categories')}
			</Text>
			<View style={styles.categoryGrid}>
				{categories.map(cat => {
					const tier = categoryTiers[cat.key]
					const ic = CAT_ICONS[cat.key]
					return (
						<View
							key={cat.key}
							style={[
								styles.categoryCard,
								{ borderColor: `${tier.color}30`, borderWidth: 1 },
							]}
						>
							<View style={[styles.catIconWrap, { backgroundColor: `${ic.color}15` }]}>
								<Ionicons name={ic.icon as any} size={20} color={ic.color} />
							</View>
							<Text style={styles.categoryLabel}>{cat.label}</Text>
							<Text style={styles.categoryValue}>{cat.value}</Text>
							<View style={[styles.tierBadge, { backgroundColor: `${tier.color}20` }]}>
								<Ionicons name={TIER_ICONS[tier.name].name as any} size={10} color={tier.color} />
								<Text style={[styles.tierBadgeText, { color: tier.color }]}>
									{' '}{tierLabel(tier.name)}
								</Text>
							</View>
						</View>
					)
				})}
			</View>
		</View>
	)
}

// ─── Achievement badge ────────────────────────────────────────────────────────

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
					achievement.earned ? styles.achievementEarned : styles.achievementLocked,
					achievement.earned && { borderColor: `${achievement.iconColor}50`, backgroundColor: `${achievement.iconColor}12` },
					{ transform: [{ scale }] },
				]}
			>
				<Ionicons
					name={achievement.icon as any}
					size={Math.round(ACH_BADGE_SIZE * 0.44)}
					color={achievement.earned ? achievement.iconColor : '#444'}
				/>
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
	const { t, language } = useLanguage()
	const [selected, setSelected] = useState<Achievement | null>(null)
	const { achievements } = data

	const earnedCount = achievements.filter(a => a.earned).length

	// Sort: earned first, then by progress % descending, show top 20
	const preview = [...achievements]
		.sort((a, b) => {
			if (a.earned !== b.earned) return a.earned ? -1 : 1
			return b.progressPercent - a.progressPercent
		})
		.slice(0, 20)

	const getAchievementInfo = (id: string) => {
		const m = getMilestoneAchievementCopy(id, language ?? 'ru')
		if (m) return m
		return {
			title: t('rating', `ach_${id}_title` as Parameters<typeof t>[1]),
			desc:  t('rating', `ach_${id}_desc`  as Parameters<typeof t>[1]),
		}
	}

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

			<View style={styles.achievementsGrid5}>
				{preview.map(a => (
					<AchievementBadge key={a.id} achievement={a} onPress={setSelected} />
				))}
			</View>

			{/* View All button */}
			<TouchableOpacity
				style={styles.viewAllBtn}
				onPress={() => router.push('/(auth)/(routes)/achievements')}
				activeOpacity={0.7}
			>
				<Ionicons name='ribbon-outline' size={16} color={C.primary} />
				<Text style={styles.viewAllText}>{t('rating', 'viewAll')}</Text>
				<Ionicons name='chevron-forward' size={14} color={C.primary} />
			</TouchableOpacity>

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
									<View style={[styles.modalIconWrap, { backgroundColor: selected.earned ? `${selected.iconColor}15` : C.cardLight, borderColor: selected.earned ? `${selected.iconColor}40` : C.border }]}>
										<Ionicons
											name={selected.icon as any}
											size={44}
											color={selected.earned ? selected.iconColor : '#555'}
										/>
									</View>
									<Text style={styles.modalTitle}>{info.title}</Text>
									<Text style={styles.modalDesc}>{info.desc}</Text>
									{selected.earned ? (
										<View style={styles.modalEarnedTag}>
											<Ionicons name='checkmark-circle' size={16} color={C.primary} />
											<Text style={[styles.modalEarnedText, { color: C.primary }]}>
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
												color={selected.iconColor}
												height={8}
											/>
										</View>
									)}
									<TouchableOpacity
										style={[styles.modalClose, { backgroundColor: selected.earned ? selected.iconColor : C.primary }]}
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
		<ShimmerBlock style={{ height: 160, borderRadius: 16, backgroundColor: C.card }} />
		<ShimmerBlock style={{ height: 180, borderRadius: 16, backgroundColor: C.card }} />
		<View style={styles.categoryGrid}>
			{[...Array(6)].map((_, i) => (
				<ShimmerBlock key={i} style={{ height: 110, borderRadius: 12, backgroundColor: C.card, flex: 1 }} />
			))}
		</View>
	</View>
)

// ─── Premium gate ─────────────────────────────────────────────────────────────
// ─── Main screen ──────────────────────────────────────────────────────────────

export default function RatingScreen() {
	const { t } = useLanguage()
	const { user } = useAuth()
	const premium = hasActivePremium(user)
	const [data, setData] = useState<RatingData | null>(null)
	const [loading, setLoading] = useState(true)

	const fadeAnim = useRef(new Animated.Value(0)).current

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const result = await computeRating()
			setData(result)
			Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start()
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => { load() }, [load])

	if (!premium) return <SharedPremiumGate featureIcon='ribbon-outline' featureColor='#FFD700' />

	return (
		<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
					<Ionicons name='chevron-back' size={26} color={C.text} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{t('rating', 'title')}</Text>
				<TouchableOpacity
					style={styles.achBtn}
					onPress={() => router.push('/(auth)/(routes)/achievements')}
				>
					<Ionicons name='ribbon-outline' size={22} color={C.primary} />
				</TouchableOpacity>
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
const CATEGORY_CARD_WIDTH = (SCREEN_WIDTH - 40 - CARD_GAP * (CATEGORY_COLS - 1)) / CATEGORY_COLS

const ACH_COLS = 5
const ACH_GAP  = 8
// card horizontal padding = 16, scroll horizontal padding = 20
const ACH_BADGE_SIZE = Math.floor((SCREEN_WIDTH - 40 - 32 - ACH_GAP * (ACH_COLS - 1)) / ACH_COLS)

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: C.background },
	header: {
		flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
		paddingHorizontal: 16, paddingVertical: 12,
	},
	backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
	achBtn:  { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
	headerTitle: { fontSize: 18, fontWeight: '700', color: C.text },
	scrollContent: { paddingHorizontal: 20, paddingTop: 4 },

	card: { backgroundColor: C.card, borderRadius: 16, padding: 16 },

	// Level card
	levelCardHeader: { flexDirection: 'row', alignItems: 'center' },
	tierIconWrap: {
		width: 60, height: 60, borderRadius: 16,
		alignItems: 'center', justifyContent: 'center',
		borderWidth: 1.5,
	},
	levelNum:  { fontSize: 26, fontWeight: '900', letterSpacing: 0.5 },
	levelTotal: { fontSize: 14, color: C.textSecondary, fontWeight: '600' },
	tierName:  { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginTop: 1 },
	levelName: { fontSize: 22, fontWeight: '800', letterSpacing: 1 },
	scoreText: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
	scoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
	scoreBadgeText: { fontSize: 11, fontWeight: '600' },
	progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
	progressLabel: { fontSize: 11, color: C.textSecondary },

	// Tier ladder
	tierLadder: {
		flexDirection: 'row', alignItems: 'center', marginTop: 18, justifyContent: 'space-between',
	},
	tierStep: { flexDirection: 'row', alignItems: 'center', flex: 1 },
	tierStepIcon: {
		width: 30, height: 30, borderRadius: 9,
		alignItems: 'center', justifyContent: 'center',
		borderWidth: 1.5, borderColor: '#333',
	},
	tierConnector: { flex: 1, height: 2, marginHorizontal: 2 },

	// Score breakdown
	sectionTitle: { fontSize: 15, fontWeight: '700', color: C.text },
	breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	breakdownIconWrap: {
		width: 28, height: 28, borderRadius: 8,
		alignItems: 'center', justifyContent: 'center',
	},
	breakdownLabel: { fontSize: 13, color: C.textSecondary, width: 105 },
	breakdownValue: { fontSize: 13, fontWeight: '700', width: 36, textAlign: 'right' },

	// Category grid
	categoryGrid: {
		flexDirection: 'row', flexWrap: 'wrap', gap: CARD_GAP,
		paddingHorizontal: 0, marginTop: 12,
	},
	categoryCard: {
		width: CATEGORY_CARD_WIDTH, backgroundColor: C.card, borderRadius: 12,
		padding: 10, alignItems: 'center', gap: 4,
	},
	catIconWrap: {
		width: 36, height: 36, borderRadius: 10,
		alignItems: 'center', justifyContent: 'center', marginBottom: 2,
	},
	categoryLabel: { fontSize: 11, color: C.textSecondary, textAlign: 'center' },
	categoryValue: { fontSize: 13, fontWeight: '700', color: C.text, textAlign: 'center' },
	tierBadge: { flexDirection: 'row', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2, alignItems: 'center' },
	tierBadgeText: { fontSize: 10, fontWeight: '600' },

	// Achievements
	achievementsHeader: {
		flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
	},
	achievementsCount: { fontSize: 12, color: C.textSecondary },
	achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
	achievementsGrid5: {
		flexDirection: 'row', flexWrap: 'wrap', gap: 8,
		justifyContent: 'flex-start',
	},
	achievementBadge: {
		width: ACH_BADGE_SIZE, height: ACH_BADGE_SIZE, borderRadius: 14,
		alignItems: 'center', justifyContent: 'center', position: 'relative',
	},
	achievementEarned: {
		backgroundColor: 'rgba(52,199,89,0.15)',
		borderWidth: 1.5, borderColor: 'rgba(52,199,89,0.4)',
	},
	achievementLocked: {
		backgroundColor: C.cardLight, borderWidth: 1, borderColor: C.border,
	},
	achievementCheck: {
		position: 'absolute', top: 2, right: 2,
		width: 14, height: 14, borderRadius: 7,
		backgroundColor: C.primary,
		alignItems: 'center', justifyContent: 'center',
	},
	achievementProgressRing: {
		position: 'absolute', bottom: 0, right: 0,
		backgroundColor: C.card, borderRadius: 8,
		paddingHorizontal: 3, paddingVertical: 1,
	},
	achievementProgressText: { fontSize: 8, color: C.textSecondary, fontWeight: '600' },

	// View All
	viewAllBtn: {
		flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
		gap: 6, marginTop: 16, paddingVertical: 12,
		backgroundColor: `${C.primary}12`, borderRadius: 12,
		borderWidth: 1, borderColor: `${C.primary}30`,
	},
	viewAllText: { fontSize: 14, fontWeight: '700', color: C.primary },

	// Modal
	modalOverlay: {
		flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
		alignItems: 'center', justifyContent: 'center', padding: 32,
	},
	modalCard: {
		backgroundColor: C.card, borderRadius: 20, padding: 28,
		alignItems: 'center', width: '100%', maxWidth: 320,
	},
	modalIconWrap: {
		width: 80, height: 80, borderRadius: 20,
		alignItems: 'center', justifyContent: 'center',
		borderWidth: 1.5, marginBottom: 14,
	},
	modalTitle: { fontSize: 20, fontWeight: '800', color: C.text, textAlign: 'center' },
	modalDesc: { fontSize: 14, color: C.textSecondary, textAlign: 'center', marginTop: 8 },
	modalEarnedTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
	modalEarnedText: { fontSize: 14, fontWeight: '700' },
	modalClose: {
		marginTop: 24, borderRadius: 12,
		paddingHorizontal: 40, paddingVertical: 12,
	},
	modalCloseText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})
