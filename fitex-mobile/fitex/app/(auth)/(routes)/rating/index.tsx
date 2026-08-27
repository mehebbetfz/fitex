import { hasActivePremium, useAuth } from '@/app/contexts/auth-context'
import SharedPremiumGate from '@/app/components/premium-gate'
import SheetModalHeader from '@/components/ui/sheet-modal-header'
import type { AppColors } from '@/constants/app-theme'
import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import { getMilestoneAchievementCopy } from '@/services/achievement-milestones-extra'
import { Achievement, computeRating, LEVELS, RatingData, TIERS, TierName } from '@/services/rating'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	Animated,
	Dimensions,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const ACH_COLS = 5
const ACH_GAP = 8
/** Inside profile-style card: marginH 10 + padding 16*2 */
const ACH_BADGE_SIZE = Math.floor(
	(SCREEN_WIDTH - 20 - 32 - ACH_GAP * (ACH_COLS - 1)) / ACH_COLS,
)

// ─── Shimmer / FadeIn (как на профиле) ───────────────────────────────────────

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
	}, [anim])
	return anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] })
}

const ShimmerBlock = ({ style }: { style: object }) => {
	const opacity = useShimmer()
	return <Animated.View style={[style, { opacity }]} />
}

const FadeIn = ({ show, children }: { show: boolean; children: React.ReactNode }) => {
	const anim = useRef(new Animated.Value(0)).current
	useEffect(() => {
		if (show) {
			Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }).start()
		}
	}, [show, anim])
	return <Animated.View style={{ opacity: anim }}>{children}</Animated.View>
}

const useTierLabel = () => {
	const { t } = useLanguage()
	return useCallback(
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
}

const ProgressBar = ({
	percent,
	color,
	height = 8,
}: {
	percent: number
	color: string
	height?: number
}) => {
	const { colors: C } = useAppTheme()
	const anim = useRef(new Animated.Value(0)).current
	useEffect(() => {
		Animated.timing(anim, {
			toValue: percent / 100,
			duration: 900,
			useNativeDriver: false,
		}).start()
	}, [anim, percent])

	const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })

	return (
		<View
			style={{
				height,
				backgroundColor: C.cardLight,
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

const TIER_ICONS: Record<TierName, { name: string; color: string }> = {
	beginner: { name: 'trophy', color: '#8E8E93' },
	bronze: { name: 'trophy', color: '#CD7F32' },
	silver: { name: 'trophy', color: '#C0C0C0' },
	gold: { name: 'trophy', color: '#FFD700' },
	platinum: { name: 'trophy', color: '#5AC8FA' },
	elite: { name: 'trophy', color: '#FF9500' },
}

const TierLevelDots = ({
	tierName,
	currentLevel,
}: {
	tierName: TierName
	currentLevel: number
}) => {
	const { colors: C } = useAppTheme()
	const tierLevels = LEVELS.filter(l => l.tierName === tierName)
	const tier = TIERS.find(t => t.name === tierName)!
	return (
		<View
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				gap: 4,
				flexWrap: 'wrap',
				marginTop: 12,
			}}
		>
			{tierLevels.map(lv => {
				const done = lv.level < currentLevel
				const active = lv.level === currentLevel
				return (
					<View
						key={lv.level}
						style={{
							width: active ? 24 : 8,
							height: 8,
							borderRadius: 4,
							backgroundColor: done || active ? tier.color : C.cardLight,
							opacity: active ? 1 : done ? 0.7 : 0.3,
						}}
					/>
				)
			})}
		</View>
	)
}

/** Главный блок уровня — как userCard / premiumStatusBlock на профиле */
const LevelCard = ({ data }: { data: RatingData }) => {
	const { t } = useLanguage()
	const { colors: C } = useAppTheme()
	const styles = useMemo(() => makeStyles(C), [C])
	const tierLabel = useTierLabel()
	const { tier, totalScore, currentLevel, nextLevel, levelProgressPercent } = data
	const icon = TIER_ICONS[tier.name]

	return (
		<View style={[styles.heroCard, { borderColor: `${tier.color}44` }]}>
			<View style={styles.levelCardHeader}>
				<View
					style={[
						styles.tierIconWrap,
						{ backgroundColor: `${tier.color}18`, borderColor: `${tier.color}40` },
					]}
				>
					<Ionicons name={icon.name as any} size={32} color={icon.color} />
				</View>
				<View style={{ flex: 1, marginLeft: 16 }}>
					<Text style={[styles.levelNum, { color: tier.color }]}>
						{t('rating', 'levelLabel')} {currentLevel.level}
						<Text style={styles.levelTotal}> /50</Text>
					</Text>
					<Text style={[styles.tierName, { color: tier.color }]}>
						{tierLabel(tier.name)}
					</Text>
					<Text style={styles.scoreText}>
						{totalScore.toLocaleString()} {t('rating', 'pts')} · {t('rating', 'totalScore')}
					</Text>
				</View>
			</View>

			<View style={{ marginTop: 16 }}>
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

			<TierLevelDots tierName={tier.name} currentLevel={currentLevel.level} />

			<View style={styles.tierLadder}>
				{TIERS.map((t2, i) => {
					const isActive = t2.name === tier.name
					const isPassed = i < TIERS.findIndex(x => x.name === tier.name)
					const ic = TIER_ICONS[t2.name]
					return (
						<View key={t2.name} style={styles.tierStep}>
							<View
								style={[
									styles.tierStepIcon,
									isActive && {
										borderColor: ic.color,
										backgroundColor: `${ic.color}15`,
									},
									isPassed && {
										borderColor: ic.color + '70',
										backgroundColor: `${ic.color}08`,
									},
								]}
							>
								<Ionicons
									name={ic.name as any}
									size={isActive ? 18 : 13}
									color={
										isActive ? ic.color : isPassed ? ic.color + 'AA' : C.textTertiary
									}
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

const BREAKDOWN_ICONS: { icon: string; color: string }[] = [
	{ icon: 'barbell-outline', color: '#34C759' },
	{ icon: 'layers-outline', color: '#5AC8FA' },
	{ icon: 'trending-up-outline', color: '#FF9F0A' },
	{ icon: 'flame-outline', color: '#FF6B35' },
	{ icon: 'trophy-outline', color: '#FFD700' },
	{ icon: 'timer-outline', color: '#AF52DE' },
]

/** Разбивка очков — как settingsItem на профиле */
const ScoreBreakdownSection = ({ data }: { data: RatingData }) => {
	const { t } = useLanguage()
	const { colors: C } = useAppTheme()
	const styles = useMemo(() => makeStyles(C), [C])
	const { scoreBreakdown } = data

	const rows = [
		{ label: t('rating', 'workoutPts'), value: scoreBreakdown.workoutPts, ...BREAKDOWN_ICONS[0] },
		{ label: t('rating', 'setPts'), value: scoreBreakdown.setPts, ...BREAKDOWN_ICONS[1] },
		{ label: t('rating', 'volumePts'), value: scoreBreakdown.volumePts, ...BREAKDOWN_ICONS[2] },
		{ label: t('rating', 'streakPts'), value: scoreBreakdown.streakPts, ...BREAKDOWN_ICONS[3] },
		{ label: t('rating', 'prPts'), value: scoreBreakdown.prPts, ...BREAKDOWN_ICONS[4] },
		{ label: t('rating', 'durationBonus'), value: scoreBreakdown.durationBonus, ...BREAKDOWN_ICONS[5] },
	]

	return (
		<View style={styles.section}>
			<Text style={styles.sectionTitle}>{t('rating', 'scoreBreakdown')}</Text>
			{rows.map(row => (
				<View key={row.label} style={styles.settingsItem}>
					<View style={[styles.settingsIcon, { backgroundColor: `${row.color}20` }]}>
						<Ionicons name={row.icon as any} size={22} color={row.color} />
					</View>
					<View style={styles.settingsContent}>
						<Text style={styles.settingsTitle}>{row.label}</Text>
						<View style={{ marginTop: 8 }}>
							<ProgressBar
								percent={
									Math.max(...rows.map(r => r.value), 1) > 0
										? (row.value / Math.max(...rows.map(r => r.value), 1)) * 100
										: 0
								}
								color={row.color}
								height={6}
							/>
						</View>
					</View>
					<Text style={[styles.rowValue, { color: row.color }]}>{row.value}</Text>
				</View>
			))}
		</View>
	)
}

const CAT_ICONS: Record<string, { icon: string; color: string }> = {
	volume: { icon: 'barbell-outline', color: '#FF9F0A' },
	workouts: { icon: 'fitness-outline', color: '#34C759' },
	streak: { icon: 'flame-outline', color: '#FF6B35' },
	sets: { icon: 'layers-outline', color: '#5AC8FA' },
	avgDuration: { icon: 'timer-outline', color: '#AF52DE' },
	records: { icon: 'trophy-outline', color: '#FFD700' },
}

/** Категории — секция + строки как на профиле (stats / settings) */
const CategorySection = ({ data }: { data: RatingData }) => {
	const { t } = useLanguage()
	const { colors: C } = useAppTheme()
	const styles = useMemo(() => makeStyles(C), [C])
	const tierLabel = useTierLabel()
	const { stats, prCount, categoryTiers } = data

	const categories = [
		{
			key: 'volume',
			label: t('rating', 'catVolume'),
			value: `${stats.total_volume.toLocaleString()} ${t('rating', 'kg')}`,
		},
		{
			key: 'workouts',
			label: t('rating', 'catWorkouts'),
			value: String(stats.total_workouts),
		},
		{
			key: 'streak',
			label: t('rating', 'catStreak'),
			value: `${stats.streak_days} ${t('rating', 'days')}`,
		},
		{ key: 'sets', label: t('rating', 'catSets'), value: String(stats.total_sets) },
		{
			key: 'avgDuration',
			label: t('rating', 'catDuration'),
			value: `${stats.avg_duration} ${t('rating', 'min')}`,
		},
		{ key: 'records', label: t('rating', 'catRecords'), value: String(prCount) },
	]

	return (
		<View style={styles.section}>
			<Text style={styles.sectionTitle}>{t('rating', 'categories')}</Text>
			{categories.map(cat => {
				const tier = categoryTiers[cat.key]
				const ic = CAT_ICONS[cat.key]
				return (
					<View key={cat.key} style={styles.settingsItem}>
						<View style={[styles.settingsIcon, { backgroundColor: `${ic.color}20` }]}>
							<Ionicons name={ic.icon as any} size={22} color={ic.color} />
						</View>
						<View style={styles.settingsContent}>
							<Text style={styles.settingsTitle}>{cat.label}</Text>
							<Text style={styles.settingsSubtitle}>
								{tierLabel(tier.name)}
							</Text>
						</View>
						<Text style={styles.rowValue}>{cat.value}</Text>
					</View>
				)
			})}
		</View>
	)
}

const AchievementBadge = ({
	achievement,
	onPress,
}: {
	achievement: Achievement
	onPress: (a: Achievement) => void
}) => {
	const { colors: C } = useAppTheme()
	const styles = useMemo(() => makeStyles(C), [C])
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
					achievement.earned && {
						borderColor: `${achievement.iconColor}50`,
						backgroundColor: `${achievement.iconColor}12`,
					},
					{ transform: [{ scale }] },
				]}
			>
				<Ionicons
					name={achievement.icon as any}
					size={Math.round(ACH_BADGE_SIZE * 0.44)}
					color={achievement.earned ? achievement.iconColor : C.textTertiary}
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

const AchievementsSection = ({ data }: { data: RatingData }) => {
	const { t, language } = useLanguage()
	const { colors: C } = useAppTheme()
	const styles = useMemo(() => makeStyles(C), [C])
	const [selected, setSelected] = useState<Achievement | null>(null)
	const { achievements } = data
	const earnedCount = achievements.filter(a => a.earned).length

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
			desc: t('rating', `ach_${id}_desc` as Parameters<typeof t>[1]),
		}
	}

	return (
		<View style={styles.section}>
			<View style={styles.sectionHead}>
				<Text style={[styles.sectionTitle, { marginLeft: 0, marginBottom: 0 }]}>
					{t('rating', 'achievements')}
				</Text>
				<Text style={styles.achievementsCount}>
					{earnedCount}/{achievements.length} {t('rating', 'earned')}
				</Text>
			</View>

			<View style={styles.blockCard}>
				<View style={styles.achievementsGrid5}>
					{preview.map(a => (
						<AchievementBadge key={a.id} achievement={a} onPress={setSelected} />
					))}
				</View>
			</View>

			<TouchableOpacity
				style={styles.settingsItem}
				onPress={() => router.push('/(auth)/(routes)/achievements')}
				activeOpacity={0.7}
			>
				<View style={[styles.settingsIcon, { backgroundColor: `${C.primary}20` }]}>
					<Ionicons name='ribbon-outline' size={22} color={C.primary} />
				</View>
				<View style={styles.settingsContent}>
					<Text style={styles.settingsTitle}>{t('rating', 'viewAll')}</Text>
					<Text style={styles.settingsSubtitle}>
						{earnedCount}/{achievements.length} {t('rating', 'earned')}
					</Text>
				</View>
				<Ionicons name='chevron-forward' size={20} color={C.textSecondary} />
			</TouchableOpacity>

			<Modal
				visible={!!selected}
				transparent
				animationType='slide'
				onRequestClose={() => setSelected(null)}
			>
				<View style={styles.sheetBackdrop}>
					<TouchableOpacity
						style={StyleSheet.absoluteFill}
						activeOpacity={1}
						onPress={() => setSelected(null)}
					/>
					<View style={styles.sheet}>
						{selected &&
							(() => {
								const info = getAchievementInfo(selected.id)
								return (
									<>
										<SheetModalHeader
											title={info.title}
											onClose={() => setSelected(null)}
										/>
										<View
											style={[
												styles.modalIconWrap,
												{
													backgroundColor: selected.earned
														? `${selected.iconColor}15`
														: C.cardLight,
													borderColor: selected.earned
														? `${selected.iconColor}40`
														: C.border,
												},
											]}
										>
											<Ionicons
												name={selected.icon as any}
												size={44}
												color={
													selected.earned ? selected.iconColor : C.textTertiary
												}
											/>
										</View>
										<Text style={styles.modalDesc}>{info.desc}</Text>
										{selected.earned ? (
											<View style={styles.modalEarnedTag}>
												<Ionicons
													name='checkmark-circle'
													size={16}
													color={C.primary}
												/>
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
									</>
								)
							})()}
					</View>
				</View>
			</Modal>
		</View>
	)
}

const RatingSkeleton = () => {
	const { colors: C } = useAppTheme()
	const styles = useMemo(() => makeStyles(C), [C])
	return (
		<View>
			<View style={[styles.heroCard, { borderColor: C.border }]}>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<ShimmerBlock
						style={{
							width: 70,
							height: 70,
							borderRadius: 35,
							backgroundColor: C.cardLight,
							marginRight: 16,
						}}
					/>
					<View style={{ flex: 1, gap: 10 }}>
						<ShimmerBlock
							style={{
								height: 20,
								width: 120,
								borderRadius: 6,
								backgroundColor: C.cardLight,
							}}
						/>
						<ShimmerBlock
							style={{
								height: 14,
								width: 160,
								borderRadius: 4,
								backgroundColor: C.cardLight,
							}}
						/>
					</View>
				</View>
				<ShimmerBlock
					style={{
						height: 10,
						width: '100%',
						borderRadius: 5,
						backgroundColor: C.cardLight,
						marginTop: 16,
					}}
				/>
			</View>
			<View style={styles.section}>
				<ShimmerBlock
					style={{
						height: 18,
						width: 140,
						borderRadius: 5,
						backgroundColor: C.cardLight,
						marginBottom: 12,
						marginLeft: 8,
					}}
				/>
				{[0, 1, 2].map(i => (
					<View key={i} style={[styles.settingsItem, { marginBottom: 8 }]}>
						<ShimmerBlock
							style={{
								width: 44,
								height: 44,
								borderRadius: 22,
								backgroundColor: C.cardLight,
								marginRight: 12,
							}}
						/>
						<View style={{ flex: 1, gap: 8 }}>
							<ShimmerBlock
								style={{
									height: 14,
									width: 140,
									borderRadius: 4,
									backgroundColor: C.cardLight,
								}}
							/>
							<ShimmerBlock
								style={{
									height: 11,
									width: 90,
									borderRadius: 4,
									backgroundColor: C.cardLight,
								}}
							/>
						</View>
					</View>
				))}
			</View>
		</View>
	)
}

export default function RatingScreen() {
	const { t } = useLanguage()
	const { colors: C } = useAppTheme()
	const styles = useMemo(() => makeStyles(C), [C])
	const { user } = useAuth()
	const premium = hasActivePremium(user)
	const [data, setData] = useState<RatingData | null>(null)
	const [loading, setLoading] = useState(true)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const result = await computeRating()
			setData(result)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		load()
	}, [load])

	if (!premium) return <SharedPremiumGate featureIcon='ribbon-outline' featureColor='#FFD700' />

	return (
		<SafeAreaView style={styles.container} edges={['top']}>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				{/* Header — как на профиле: крупный title + subtitle + back */}
				<View style={styles.header}>
					<View style={styles.headerLeft}>
						<TouchableOpacity
							onPress={() => router.back()}
							style={styles.backBtn}
							hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
						>
							<Ionicons name='chevron-back' size={26} color={C.text} />
						</TouchableOpacity>
						<View style={{ flex: 1, paddingRight: 8 }}>
							<Text style={styles.title}>{t('rating', 'title')}</Text>
							<Text style={styles.subtitle}>{t('rating', 'ratingSubtitle')}</Text>
						</View>
					</View>
					<TouchableOpacity
						style={styles.headerPill}
						onPress={() => router.push('/(auth)/(routes)/achievements')}
						activeOpacity={0.7}
					>
						<Ionicons name='ribbon-outline' size={16} color={C.primary} />
					</TouchableOpacity>
				</View>

				{loading || !data ? (
					<RatingSkeleton />
				) : (
					<FadeIn show={!loading && !!data}>
						<LevelCard data={data} />
						<CategorySection data={data} />
						<ScoreBreakdownSection data={data} />
						<AchievementsSection data={data} />
					</FadeIn>
				)}
			</ScrollView>
		</SafeAreaView>
	)
}

function makeStyles(C: AppColors) {
	return StyleSheet.create({
		container: { flex: 1, backgroundColor: C.background },
		scrollContent: { paddingBottom: 40 },
		header: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingHorizontal: 10,
			paddingTop: 12,
			paddingBottom: 16,
		},
		headerLeft: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'flex-start',
			gap: 2,
		},
		backBtn: {
			width: 36,
			height: 36,
			alignItems: 'center',
			justifyContent: 'center',
			marginTop: 2,
			marginLeft: -6,
		},
		title: { fontSize: 28, fontWeight: 'bold', color: C.text },
		subtitle: { fontSize: 15, color: C.textSecondary, marginTop: 4 },
		headerPill: {
			width: 40,
			height: 40,
			borderRadius: 20,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: `${C.primary}15`,
			borderWidth: 1,
			borderColor: `${C.primary}25`,
		},

		heroCard: {
			backgroundColor: C.card,
			borderRadius: 20,
			padding: 20,
			marginHorizontal: 10,
			marginBottom: 16,
			borderWidth: 1,
			borderColor: C.border,
		},
		levelCardHeader: { flexDirection: 'row', alignItems: 'center' },
		tierIconWrap: {
			width: 70,
			height: 70,
			borderRadius: 35,
			alignItems: 'center',
			justifyContent: 'center',
			borderWidth: 1.5,
		},
		levelNum: { fontSize: 22, fontWeight: '700', letterSpacing: 0.2 },
		levelTotal: { fontSize: 15, color: C.textSecondary, fontWeight: '600' },
		tierName: { fontSize: 15, fontWeight: '600', marginTop: 2 },
		scoreText: { fontSize: 13, color: C.textSecondary, marginTop: 4 },
		progressLabelRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			marginTop: 8,
		},
		progressLabel: { fontSize: 12, color: C.textSecondary },

		tierLadder: {
			flexDirection: 'row',
			alignItems: 'center',
			marginTop: 18,
			justifyContent: 'space-between',
		},
		tierStep: { flexDirection: 'row', alignItems: 'center', flex: 1 },
		tierStepIcon: {
			width: 30,
			height: 30,
			borderRadius: 15,
			alignItems: 'center',
			justifyContent: 'center',
			borderWidth: 1.5,
			borderColor: C.border,
		},
		tierConnector: { flex: 1, height: 2, marginHorizontal: 2 },

		section: { marginTop: 10 },
		sectionHead: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			marginBottom: 12,
			paddingHorizontal: 8,
		},
		sectionTitle: {
			fontSize: 18,
			fontWeight: '600',
			color: C.text,
			marginBottom: 12,
			marginLeft: 8,
		},

		settingsItem: {
			flexDirection: 'row',
			backgroundColor: C.card,
			borderRadius: 16,
			padding: 16,
			marginBottom: 8,
			marginHorizontal: 10,
			alignItems: 'center',
			borderWidth: 1,
			borderColor: C.border,
		},
		settingsIcon: {
			width: 44,
			height: 44,
			borderRadius: 22,
			justifyContent: 'center',
			alignItems: 'center',
			marginRight: 12,
		},
		settingsContent: { flex: 1 },
		settingsTitle: { fontSize: 16, fontWeight: '500', color: C.text },
		settingsSubtitle: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
		rowValue: { fontSize: 15, fontWeight: '700', color: C.text, marginLeft: 8 },

		blockCard: {
			backgroundColor: C.card,
			borderRadius: 20,
			padding: 16,
			marginHorizontal: 10,
			marginBottom: 8,
			borderWidth: 1,
			borderColor: C.border,
		},
		achievementsCount: { fontSize: 13, color: C.textSecondary, fontWeight: '500' },
		achievementsGrid5: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			gap: ACH_GAP,
			justifyContent: 'flex-start',
		},
		achievementBadge: {
			width: ACH_BADGE_SIZE,
			height: ACH_BADGE_SIZE,
			borderRadius: 14,
			alignItems: 'center',
			justifyContent: 'center',
			position: 'relative',
		},
		achievementEarned: {
			backgroundColor: `${C.primary}26`,
			borderWidth: 1.5,
			borderColor: `${C.primary}66`,
		},
		achievementLocked: {
			backgroundColor: C.cardLight,
			borderWidth: 1,
			borderColor: C.border,
		},
		achievementCheck: {
			position: 'absolute',
			top: 2,
			right: 2,
			width: 14,
			height: 14,
			borderRadius: 7,
			backgroundColor: C.primary,
			alignItems: 'center',
			justifyContent: 'center',
		},
		achievementProgressRing: {
			position: 'absolute',
			bottom: 0,
			right: 0,
			backgroundColor: C.card,
			borderRadius: 8,
			paddingHorizontal: 3,
			paddingVertical: 1,
		},
		achievementProgressText: {
			fontSize: 8,
			color: C.textSecondary,
			fontWeight: '600',
		},

		sheetBackdrop: {
			flex: 1,
			backgroundColor: C.overlay,
			justifyContent: 'flex-end',
		},
		sheet: {
			backgroundColor: C.modalSurface,
			borderTopLeftRadius: 20,
			borderTopRightRadius: 20,
			padding: 22,
			paddingBottom: 36,
			alignItems: 'center',
		},
		sheetHandle: {
			alignSelf: 'center',
			width: 36,
			height: 4,
			borderRadius: 2,
			backgroundColor: C.border,
			marginBottom: 14,
		},
		modalIconWrap: {
			width: 80,
			height: 80,
			borderRadius: 20,
			alignItems: 'center',
			justifyContent: 'center',
			borderWidth: 1.5,
			marginBottom: 14,
		},
		modalTitle: {
			fontSize: 20,
			fontWeight: '700',
			color: C.text,
			textAlign: 'center',
		},
		modalDesc: {
			fontSize: 14,
			color: C.textSecondary,
			textAlign: 'center',
			marginTop: 8,
		},
		modalEarnedTag: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			marginTop: 16,
		},
		modalEarnedText: { fontSize: 14, fontWeight: '700' },
	})
}
