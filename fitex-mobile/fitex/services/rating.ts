import AsyncStorage from '@react-native-async-storage/async-storage'
import * as db from '@/scripts/database'

// ─── Tier definitions ─────────────────────────────────────────────────────────

export type TierName = 'beginner' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'elite'

export interface Tier {
	name: TierName
	emoji: string
	color: string
	minScore: number
	maxScore: number
}

export const TIERS: Tier[] = [
	{ name: 'beginner', emoji: '🌱', color: '#8E8E93', minScore: 0, maxScore: 499 },
	{ name: 'bronze', emoji: '🥉', color: '#CD7F32', minScore: 500, maxScore: 1499 },
	{ name: 'silver', emoji: '🥈', color: '#C0C0C0', minScore: 1500, maxScore: 3999 },
	{ name: 'gold', emoji: '🥇', color: '#FFD700', minScore: 4000, maxScore: 9999 },
	{ name: 'platinum', emoji: '💎', color: '#5AC8FA', minScore: 10000, maxScore: 24999 },
	{ name: 'elite', emoji: '🏆', color: '#FF9500', minScore: 25000, maxScore: Infinity },
]

export const getTierByScore = (score: number): Tier => {
	for (let i = TIERS.length - 1; i >= 0; i--) {
		if (score >= TIERS[i].minScore) return TIERS[i]
	}
	return TIERS[0]
}

const getTierByName = (name: TierName): Tier => TIERS.find(t => t.name === name) ?? TIERS[0]

// ─── Category thresholds ──────────────────────────────────────────────────────

export const CATEGORY_THRESHOLDS: Record<string, number[]> = {
	volume: [1000, 5000, 20000, 100000, 200000],
	workouts: [10, 30, 100, 300, 500],
	streak: [3, 7, 21, 60, 100],
	sets: [100, 500, 2000, 5000, 10000],
	avgDuration: [20, 40, 60, 90, 120],
	records: [3, 10, 25, 50, 100],
}

export const getCategoryTier = (value: number, thresholds: number[]): Tier => {
	const names: TierName[] = ['bronze', 'silver', 'gold', 'platinum', 'elite']
	for (let i = thresholds.length - 1; i >= 0; i--) {
		if (value >= thresholds[i]) return getTierByName(names[i])
	}
	return getTierByName('beginner')
}

// ─── Score calculation ────────────────────────────────────────────────────────

export interface ScoreBreakdown {
	workoutPts: number
	setPts: number
	volumePts: number
	streakPts: number
	prPts: number
	durationBonus: number
	total: number
}

export const calculateScore = (
	stats: db.WorkoutStats,
	prCount: number,
): ScoreBreakdown => {
	const workoutPts = stats.total_workouts * 10
	const setPts = Math.floor(stats.total_sets)
	const volumePts = Math.floor(stats.total_volume / 200)
	const streakPts = stats.streak_days * 15
	const prPts = prCount * 50
	const durationBonus =
		stats.avg_duration > 60
			? 200
			: stats.avg_duration > 45
				? 100
				: stats.avg_duration > 30
					? 50
					: 0

	return {
		workoutPts,
		setPts,
		volumePts,
		streakPts,
		prPts,
		durationBonus,
		total: workoutPts + setPts + volumePts + streakPts + prPts + durationBonus,
	}
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export type AchievementCategory = 'workouts' | 'volume' | 'streak' | 'records' | 'sets'

export interface Achievement {
	id: string
	emoji: string
	earned: boolean
	earnedAt?: string
	progressPercent: number
	category: AchievementCategory
}

interface AchievementDef {
	id: string
	emoji: string
	category: AchievementCategory
	check: (stats: db.WorkoutStats, prCount: number) => boolean
	progress: (stats: db.WorkoutStats, prCount: number) => number
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
	{
		id: 'first_workout',
		emoji: '🎯',
		category: 'workouts',
		check: s => s.total_workouts >= 1,
		progress: s => Math.min(100, s.total_workouts * 100),
	},
	{
		id: 'workouts_5',
		emoji: '💪',
		category: 'workouts',
		check: s => s.total_workouts >= 5,
		progress: s => Math.min(100, (s.total_workouts / 5) * 100),
	},
	{
		id: 'workouts_30',
		emoji: '🏃',
		category: 'workouts',
		check: s => s.total_workouts >= 30,
		progress: s => Math.min(100, (s.total_workouts / 30) * 100),
	},
	{
		id: 'workouts_100',
		emoji: '💯',
		category: 'workouts',
		check: s => s.total_workouts >= 100,
		progress: s => Math.min(100, (s.total_workouts / 100) * 100),
	},
	{
		id: 'workouts_365',
		emoji: '🗓️',
		category: 'workouts',
		check: s => s.total_workouts >= 365,
		progress: s => Math.min(100, (s.total_workouts / 365) * 100),
	},
	{
		id: 'streak_7',
		emoji: '🔥',
		category: 'streak',
		check: s => s.streak_days >= 7,
		progress: s => Math.min(100, (s.streak_days / 7) * 100),
	},
	{
		id: 'streak_30',
		emoji: '⚡',
		category: 'streak',
		check: s => s.streak_days >= 30,
		progress: s => Math.min(100, (s.streak_days / 30) * 100),
	},
	{
		id: 'streak_90',
		emoji: '🌟',
		category: 'streak',
		check: s => s.streak_days >= 90,
		progress: s => Math.min(100, (s.streak_days / 90) * 100),
	},
	{
		id: 'volume_1t',
		emoji: '🏋️',
		category: 'volume',
		check: s => s.total_volume >= 1000,
		progress: s => Math.min(100, (s.total_volume / 1000) * 100),
	},
	{
		id: 'volume_10t',
		emoji: '🦾',
		category: 'volume',
		check: s => s.total_volume >= 10000,
		progress: s => Math.min(100, (s.total_volume / 10000) * 100),
	},
	{
		id: 'volume_100t',
		emoji: '⚙️',
		category: 'volume',
		check: s => s.total_volume >= 100000,
		progress: s => Math.min(100, (s.total_volume / 100000) * 100),
	},
	{
		id: 'sets_100',
		emoji: '📊',
		category: 'sets',
		check: s => s.total_sets >= 100,
		progress: s => Math.min(100, (s.total_sets / 100) * 100),
	},
	{
		id: 'sets_1000',
		emoji: '💥',
		category: 'sets',
		check: s => s.total_sets >= 1000,
		progress: s => Math.min(100, (s.total_sets / 1000) * 100),
	},
	{
		id: 'sets_10000',
		emoji: '🎖️',
		category: 'sets',
		check: s => s.total_sets >= 10000,
		progress: s => Math.min(100, (s.total_sets / 10000) * 100),
	},
	{
		id: 'pr_first',
		emoji: '🏆',
		category: 'records',
		check: (_, pr) => pr >= 1,
		progress: (_, pr) => (pr >= 1 ? 100 : 0),
	},
	{
		id: 'pr_10',
		emoji: '🎯',
		category: 'records',
		check: (_, pr) => pr >= 10,
		progress: (_, pr) => Math.min(100, (pr / 10) * 100),
	},
	{
		id: 'pr_50',
		emoji: '👑',
		category: 'records',
		check: (_, pr) => pr >= 50,
		progress: (_, pr) => Math.min(100, (pr / 50) * 100),
	},
]

const ACHIEVEMENTS_KEY = '@fitex_earned_achievements'

// ─── Main compute function ────────────────────────────────────────────────────

export interface RatingData {
	totalScore: number
	tier: Tier
	nextTier: Tier | null
	progressPercent: number
	scoreBreakdown: ScoreBreakdown
	stats: db.WorkoutStats
	prCount: number
	achievements: Achievement[]
	categoryTiers: Record<string, Tier>
}

export const computeRating = async (): Promise<RatingData> => {
	const [stats, records] = await Promise.all([
		db.getWorkoutStats(),
		db.getPersonalRecords(),
	])
	const prCount = records.length

	const scoreBreakdown = calculateScore(stats, prCount)
	const totalScore = scoreBreakdown.total
	const tier = getTierByScore(totalScore)

	const currentIdx = TIERS.findIndex(t => t.name === tier.name)
	const nextTier = currentIdx < TIERS.length - 1 ? TIERS[currentIdx + 1] : null

	const progressPercent = nextTier
		? Math.min(
				100,
				Math.round(
					((totalScore - tier.minScore) / (nextTier.minScore - tier.minScore)) * 100,
				),
			)
		: 100

	const storedRaw = await AsyncStorage.getItem(ACHIEVEMENTS_KEY)
	const earnedMap: Record<string, string> = storedRaw ? JSON.parse(storedRaw) : {}

	const achievements: Achievement[] = ACHIEVEMENT_DEFS.map(def => {
		const isEarned = def.check(stats, prCount)
		if (isEarned && !earnedMap[def.id]) {
			earnedMap[def.id] = new Date().toISOString()
		}
		return {
			id: def.id,
			emoji: def.emoji,
			earned: !!earnedMap[def.id],
			earnedAt: earnedMap[def.id],
			progressPercent: Math.round(def.progress(stats, prCount)),
			category: def.category,
		}
	})

	await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(earnedMap))

	const categoryTiers: Record<string, Tier> = {
		volume: getCategoryTier(stats.total_volume, CATEGORY_THRESHOLDS.volume),
		workouts: getCategoryTier(stats.total_workouts, CATEGORY_THRESHOLDS.workouts),
		streak: getCategoryTier(stats.streak_days, CATEGORY_THRESHOLDS.streak),
		sets: getCategoryTier(stats.total_sets, CATEGORY_THRESHOLDS.sets),
		avgDuration: getCategoryTier(stats.avg_duration, CATEGORY_THRESHOLDS.avgDuration),
		records: getCategoryTier(prCount, CATEGORY_THRESHOLDS.records),
	}

	return {
		totalScore,
		tier,
		nextTier,
		progressPercent,
		scoreBreakdown,
		stats,
		prCount,
		achievements,
		categoryTiers,
	}
}
