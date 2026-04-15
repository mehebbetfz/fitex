import AsyncStorage from '@react-native-async-storage/async-storage'
import * as db from '@/scripts/database'
import { MILESTONE_EXTRA_DEFS } from '@/services/achievement-milestones-extra'

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
	{ name: 'beginner',  emoji: '🏆', color: '#8E8E93', minScore: 0,     maxScore: 499 },
	{ name: 'bronze',    emoji: '🏆', color: '#CD7F32', minScore: 500,   maxScore: 1499 },
	{ name: 'silver',    emoji: '🏆', color: '#C0C0C0', minScore: 1500,  maxScore: 3999 },
	{ name: 'gold',      emoji: '🏆', color: '#FFD700', minScore: 4000,  maxScore: 9999 },
	{ name: 'platinum',  emoji: '🏆', color: '#5AC8FA', minScore: 10000, maxScore: 24999 },
	{ name: 'elite',     emoji: '🏆', color: '#FF9500', minScore: 25000, maxScore: Infinity },
]

export const getTierByScore = (score: number): Tier => {
	for (let i = TIERS.length - 1; i >= 0; i--) {
		if (score >= TIERS[i].minScore) return TIERS[i]
	}
	return TIERS[0]
}

const getTierByName = (name: TierName): Tier => TIERS.find(t => t.name === name) ?? TIERS[0]

// ─── 50-level system ──────────────────────────────────────────────────────────

export interface Level {
	level: number       // 1–50
	tierName: TierName
	minScore: number
}

// 10 + 10 + 10 + 10 + 7 + 3 = 50 levels
export const LEVELS: Level[] = [
	// Beginner L1-L10  (0–499, step 50)
	{ level:  1, tierName: 'beginner', minScore:     0 },
	{ level:  2, tierName: 'beginner', minScore:    50 },
	{ level:  3, tierName: 'beginner', minScore:   100 },
	{ level:  4, tierName: 'beginner', minScore:   150 },
	{ level:  5, tierName: 'beginner', minScore:   200 },
	{ level:  6, tierName: 'beginner', minScore:   250 },
	{ level:  7, tierName: 'beginner', minScore:   300 },
	{ level:  8, tierName: 'beginner', minScore:   350 },
	{ level:  9, tierName: 'beginner', minScore:   400 },
	{ level: 10, tierName: 'beginner', minScore:   450 },
	// Bronze  L11-L20 (500–1499, step 100)
	{ level: 11, tierName: 'bronze',   minScore:   500 },
	{ level: 12, tierName: 'bronze',   minScore:   600 },
	{ level: 13, tierName: 'bronze',   minScore:   700 },
	{ level: 14, tierName: 'bronze',   minScore:   800 },
	{ level: 15, tierName: 'bronze',   minScore:   900 },
	{ level: 16, tierName: 'bronze',   minScore:  1000 },
	{ level: 17, tierName: 'bronze',   minScore:  1100 },
	{ level: 18, tierName: 'bronze',   minScore:  1200 },
	{ level: 19, tierName: 'bronze',   minScore:  1300 },
	{ level: 20, tierName: 'bronze',   minScore:  1400 },
	// Silver  L21-L30 (1500–3999, step 250)
	{ level: 21, tierName: 'silver',   minScore:  1500 },
	{ level: 22, tierName: 'silver',   minScore:  1750 },
	{ level: 23, tierName: 'silver',   minScore:  2000 },
	{ level: 24, tierName: 'silver',   minScore:  2250 },
	{ level: 25, tierName: 'silver',   minScore:  2500 },
	{ level: 26, tierName: 'silver',   minScore:  2750 },
	{ level: 27, tierName: 'silver',   minScore:  3000 },
	{ level: 28, tierName: 'silver',   minScore:  3250 },
	{ level: 29, tierName: 'silver',   minScore:  3500 },
	{ level: 30, tierName: 'silver',   minScore:  3750 },
	// Gold    L31-L40 (4000–9999, step 600)
	{ level: 31, tierName: 'gold',     minScore:  4000 },
	{ level: 32, tierName: 'gold',     minScore:  4600 },
	{ level: 33, tierName: 'gold',     minScore:  5200 },
	{ level: 34, tierName: 'gold',     minScore:  5800 },
	{ level: 35, tierName: 'gold',     minScore:  6400 },
	{ level: 36, tierName: 'gold',     minScore:  7000 },
	{ level: 37, tierName: 'gold',     minScore:  7600 },
	{ level: 38, tierName: 'gold',     minScore:  8200 },
	{ level: 39, tierName: 'gold',     minScore:  8800 },
	{ level: 40, tierName: 'gold',     minScore:  9400 },
	// Platinum L41-L47 (10000–24999, step ≈2143)
	{ level: 41, tierName: 'platinum', minScore: 10000 },
	{ level: 42, tierName: 'platinum', minScore: 12143 },
	{ level: 43, tierName: 'platinum', minScore: 14286 },
	{ level: 44, tierName: 'platinum', minScore: 16429 },
	{ level: 45, tierName: 'platinum', minScore: 18571 },
	{ level: 46, tierName: 'platinum', minScore: 20714 },
	{ level: 47, tierName: 'platinum', minScore: 22857 },
	// Elite   L48-L50 (25000+)
	{ level: 48, tierName: 'elite',    minScore: 25000 },
	{ level: 49, tierName: 'elite',    minScore: 30000 },
	{ level: 50, tierName: 'elite',    minScore: 37500 },
]

export const getLevelByScore = (score: number): Level => {
	for (let i = LEVELS.length - 1; i >= 0; i--) {
		if (score >= LEVELS[i].minScore) return LEVELS[i]
	}
	return LEVELS[0]
}

export const getNextLevel = (currentLevel: Level): Level | null =>
	currentLevel.level < 50 ? LEVELS[currentLevel.level] : null // LEVELS is 0-indexed, level 1 → index 0

// ─── Category thresholds ──────────────────────────────────────────────────────

export const CATEGORY_THRESHOLDS: Record<string, number[]> = {
	volume:      [1000, 5000, 20000, 100000, 200000],
	workouts:    [10, 30, 100, 300, 500],
	streak:      [3, 7, 21, 60, 100],
	sets:        [100, 500, 2000, 5000, 10000],
	avgDuration: [20, 40, 60, 90, 120],
	records:     [3, 10, 25, 50, 100],
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
	const workoutPts   = stats.total_workouts * 10
	const setPts       = Math.floor(stats.total_sets)
	const volumePts    = Math.floor(stats.total_volume / 200)
	const streakPts    = stats.streak_days * 15
	const prPts        = prCount * 50
	const durationBonus =
		stats.avg_duration > 60 ? 200
		: stats.avg_duration > 45 ? 100
		: stats.avg_duration > 30 ? 50
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

export type AchievementCategory =
	| 'workouts'
	| 'volume'
	| 'streak'
	| 'records'
	| 'sets'
	| 'duration'
	| 'time'
	| 'score'
	| 'tier'
	| 'intensity'
	| 'special'

export interface Achievement {
	id: string
	icon: string          // Ionicons name
	iconColor: string
	earned: boolean
	earnedAt?: string
	progressPercent: number
	progressCurrent: number
	progressTarget: number
	category: AchievementCategory
}

interface AchievementDef {
	id: string
	icon: string
	iconColor: string
	category: AchievementCategory
	check:    (s: db.WorkoutStats, pr: number, score: number) => boolean
	progress: (s: db.WorkoutStats, pr: number, score: number) => number
	target:   (s: db.WorkoutStats, pr: number, score: number) => number
	current:  (s: db.WorkoutStats, pr: number, score: number) => number
}

const pct = (val: number, max: number) => Math.min(100, Math.round((val / max) * 100))

const ACHIEVEMENT_DEFS: AchievementDef[] = [
	// ── WORKOUTS ──────────────────────────────────────────────────────────────
	{
		id: 'workouts_1',   icon: 'flag-outline',       iconColor: '#34C759', category: 'workouts',
		check: s => s.total_workouts >= 1,
		progress: s => pct(s.total_workouts, 1),
		target: () => 1, current: s => s.total_workouts,
	},
	{
		id: 'workouts_5',   icon: 'barbell-outline',    iconColor: '#34C759', category: 'workouts',
		check: s => s.total_workouts >= 5,
		progress: s => pct(s.total_workouts, 5),
		target: () => 5, current: s => s.total_workouts,
	},
	{
		id: 'workouts_10',  icon: 'fitness-outline',    iconColor: '#34C759', category: 'workouts',
		check: s => s.total_workouts >= 10,
		progress: s => pct(s.total_workouts, 10),
		target: () => 10, current: s => s.total_workouts,
	},
	{
		id: 'workouts_25',  icon: 'bicycle-outline',    iconColor: '#30D158', category: 'workouts',
		check: s => s.total_workouts >= 25,
		progress: s => pct(s.total_workouts, 25),
		target: () => 25, current: s => s.total_workouts,
	},
	{
		id: 'workouts_50',  icon: 'walk-outline',       iconColor: '#30D158', category: 'workouts',
		check: s => s.total_workouts >= 50,
		progress: s => pct(s.total_workouts, 50),
		target: () => 50, current: s => s.total_workouts,
	},
	{
		id: 'workouts_75',  icon: 'body-outline',       iconColor: '#30D158', category: 'workouts',
		check: s => s.total_workouts >= 75,
		progress: s => pct(s.total_workouts, 75),
		target: () => 75, current: s => s.total_workouts,
	},
	{
		id: 'workouts_100', icon: 'medal-outline',      iconColor: '#FFD700', category: 'workouts',
		check: s => s.total_workouts >= 100,
		progress: s => pct(s.total_workouts, 100),
		target: () => 100, current: s => s.total_workouts,
	},
	{
		id: 'workouts_200', icon: 'shield-outline',     iconColor: '#FFD700', category: 'workouts',
		check: s => s.total_workouts >= 200,
		progress: s => pct(s.total_workouts, 200),
		target: () => 200, current: s => s.total_workouts,
	},
	{
		id: 'workouts_300', icon: 'shield-checkmark-outline', iconColor: '#FFD700', category: 'workouts',
		check: s => s.total_workouts >= 300,
		progress: s => pct(s.total_workouts, 300),
		target: () => 300, current: s => s.total_workouts,
	},
	{
		id: 'workouts_365', icon: 'calendar-outline',   iconColor: '#5AC8FA', category: 'workouts',
		check: s => s.total_workouts >= 365,
		progress: s => pct(s.total_workouts, 365),
		target: () => 365, current: s => s.total_workouts,
	},
	{
		id: 'workouts_500', icon: 'rocket-outline',     iconColor: '#5AC8FA', category: 'workouts',
		check: s => s.total_workouts >= 500,
		progress: s => pct(s.total_workouts, 500),
		target: () => 500, current: s => s.total_workouts,
	},
	{
		id: 'workouts_750', icon: 'diamond-outline',    iconColor: '#FF9500', category: 'workouts',
		check: s => s.total_workouts >= 750,
		progress: s => pct(s.total_workouts, 750),
		target: () => 750, current: s => s.total_workouts,
	},
	{
		id: 'workouts_1000', icon: 'trophy-outline',    iconColor: '#FF9500', category: 'workouts',
		check: s => s.total_workouts >= 1000,
		progress: s => pct(s.total_workouts, 1000),
		target: () => 1000, current: s => s.total_workouts,
	},

	// ── STREAK ────────────────────────────────────────────────────────────────
	{
		id: 'streak_3',   icon: 'flame-outline',        iconColor: '#FF6B35', category: 'streak',
		check: s => s.streak_days >= 3,
		progress: s => pct(s.streak_days, 3),
		target: () => 3, current: s => s.streak_days,
	},
	{
		id: 'streak_7',   icon: 'bonfire-outline',      iconColor: '#FF6B35', category: 'streak',
		check: s => s.streak_days >= 7,
		progress: s => pct(s.streak_days, 7),
		target: () => 7, current: s => s.streak_days,
	},
	{
		id: 'streak_14',  icon: 'sunny-outline',        iconColor: '#FF9F0A', category: 'streak',
		check: s => s.streak_days >= 14,
		progress: s => pct(s.streak_days, 14),
		target: () => 14, current: s => s.streak_days,
	},
	{
		id: 'streak_21',  icon: 'partly-sunny-outline', iconColor: '#FF9F0A', category: 'streak',
		check: s => s.streak_days >= 21,
		progress: s => pct(s.streak_days, 21),
		target: () => 21, current: s => s.streak_days,
	},
	{
		id: 'streak_30',  icon: 'thunderstorm-outline', iconColor: '#FFD700', category: 'streak',
		check: s => s.streak_days >= 30,
		progress: s => pct(s.streak_days, 30),
		target: () => 30, current: s => s.streak_days,
	},
	{
		id: 'streak_45',  icon: 'flash-outline',        iconColor: '#FFD700', category: 'streak',
		check: s => s.streak_days >= 45,
		progress: s => pct(s.streak_days, 45),
		target: () => 45, current: s => s.streak_days,
	},
	{
		id: 'streak_60',  icon: 'snow-outline',         iconColor: '#5AC8FA', category: 'streak',
		check: s => s.streak_days >= 60,
		progress: s => pct(s.streak_days, 60),
		target: () => 60, current: s => s.streak_days,
	},
	{
		id: 'streak_90',  icon: 'planet-outline',       iconColor: '#5AC8FA', category: 'streak',
		check: s => s.streak_days >= 90,
		progress: s => pct(s.streak_days, 90),
		target: () => 90, current: s => s.streak_days,
	},
	{
		id: 'streak_180', icon: 'infinite-outline',     iconColor: '#FF9500', category: 'streak',
		check: s => s.streak_days >= 180,
		progress: s => pct(s.streak_days, 180),
		target: () => 180, current: s => s.streak_days,
	},
	{
		id: 'streak_365', icon: 'star-outline',         iconColor: '#FF9500', category: 'streak',
		check: s => s.streak_days >= 365,
		progress: s => pct(s.streak_days, 365),
		target: () => 365, current: s => s.streak_days,
	},

	// ── VOLUME ────────────────────────────────────────────────────────────────
	{
		id: 'volume_500',  icon: 'cube-outline',        iconColor: '#8E8E93', category: 'volume',
		check: s => s.total_volume >= 500,
		progress: s => pct(s.total_volume, 500),
		target: () => 500, current: s => s.total_volume,
	},
	{
		id: 'volume_1k',   icon: 'barbell-outline',     iconColor: '#CD7F32', category: 'volume',
		check: s => s.total_volume >= 1000,
		progress: s => pct(s.total_volume, 1000),
		target: () => 1000, current: s => s.total_volume,
	},
	{
		id: 'volume_2500', icon: 'barbell-outline',     iconColor: '#C0C0C0', category: 'volume',
		check: s => s.total_volume >= 2500,
		progress: s => pct(s.total_volume, 2500),
		target: () => 2500, current: s => s.total_volume,
	},
	{
		id: 'volume_5k',   icon: 'fitness-outline',     iconColor: '#C0C0C0', category: 'volume',
		check: s => s.total_volume >= 5000,
		progress: s => pct(s.total_volume, 5000),
		target: () => 5000, current: s => s.total_volume,
	},
	{
		id: 'volume_10k',  icon: 'trending-up-outline', iconColor: '#FFD700', category: 'volume',
		check: s => s.total_volume >= 10000,
		progress: s => pct(s.total_volume, 10000),
		target: () => 10000, current: s => s.total_volume,
	},
	{
		id: 'volume_25k',  icon: 'trending-up-outline', iconColor: '#FFD700', category: 'volume',
		check: s => s.total_volume >= 25000,
		progress: s => pct(s.total_volume, 25000),
		target: () => 25000, current: s => s.total_volume,
	},
	{
		id: 'volume_50k',  icon: 'nuclear-outline',     iconColor: '#5AC8FA', category: 'volume',
		check: s => s.total_volume >= 50000,
		progress: s => pct(s.total_volume, 50000),
		target: () => 50000, current: s => s.total_volume,
	},
	{
		id: 'volume_100k', icon: 'planet-outline',      iconColor: '#5AC8FA', category: 'volume',
		check: s => s.total_volume >= 100000,
		progress: s => pct(s.total_volume, 100000),
		target: () => 100000, current: s => s.total_volume,
	},
	{
		id: 'volume_250k', icon: 'rocket-outline',      iconColor: '#FF9500', category: 'volume',
		check: s => s.total_volume >= 250000,
		progress: s => pct(s.total_volume, 250000),
		target: () => 250000, current: s => s.total_volume,
	},
	{
		id: 'volume_500k', icon: 'diamond-outline',     iconColor: '#FF9500', category: 'volume',
		check: s => s.total_volume >= 500000,
		progress: s => pct(s.total_volume, 500000),
		target: () => 500000, current: s => s.total_volume,
	},

	// ── SETS ──────────────────────────────────────────────────────────────────
	{
		id: 'sets_25',    icon: 'grid-outline',         iconColor: '#8E8E93', category: 'sets',
		check: s => s.total_sets >= 25,
		progress: s => pct(s.total_sets, 25),
		target: () => 25, current: s => s.total_sets,
	},
	{
		id: 'sets_50',    icon: 'grid-outline',         iconColor: '#CD7F32', category: 'sets',
		check: s => s.total_sets >= 50,
		progress: s => pct(s.total_sets, 50),
		target: () => 50, current: s => s.total_sets,
	},
	{
		id: 'sets_100',   icon: 'apps-outline',         iconColor: '#CD7F32', category: 'sets',
		check: s => s.total_sets >= 100,
		progress: s => pct(s.total_sets, 100),
		target: () => 100, current: s => s.total_sets,
	},
	{
		id: 'sets_250',   icon: 'apps-outline',         iconColor: '#C0C0C0', category: 'sets',
		check: s => s.total_sets >= 250,
		progress: s => pct(s.total_sets, 250),
		target: () => 250, current: s => s.total_sets,
	},
	{
		id: 'sets_500',   icon: 'layers-outline',       iconColor: '#C0C0C0', category: 'sets',
		check: s => s.total_sets >= 500,
		progress: s => pct(s.total_sets, 500),
		target: () => 500, current: s => s.total_sets,
	},
	{
		id: 'sets_1000',  icon: 'layers-outline',       iconColor: '#FFD700', category: 'sets',
		check: s => s.total_sets >= 1000,
		progress: s => pct(s.total_sets, 1000),
		target: () => 1000, current: s => s.total_sets,
	},
	{
		id: 'sets_2500',  icon: 'server-outline',       iconColor: '#FFD700', category: 'sets',
		check: s => s.total_sets >= 2500,
		progress: s => pct(s.total_sets, 2500),
		target: () => 2500, current: s => s.total_sets,
	},
	{
		id: 'sets_5000',  icon: 'server-outline',       iconColor: '#5AC8FA', category: 'sets',
		check: s => s.total_sets >= 5000,
		progress: s => pct(s.total_sets, 5000),
		target: () => 5000, current: s => s.total_sets,
	},
	{
		id: 'sets_10000', icon: 'infinite-outline',     iconColor: '#5AC8FA', category: 'sets',
		check: s => s.total_sets >= 10000,
		progress: s => pct(s.total_sets, 10000),
		target: () => 10000, current: s => s.total_sets,
	},

	// ── PERSONAL RECORDS ──────────────────────────────────────────────────────
	{
		id: 'pr_1',   icon: 'trophy-outline',           iconColor: '#CD7F32', category: 'records',
		check: (_, pr) => pr >= 1,
		progress: (_, pr) => pct(pr, 1),
		target: () => 1, current: (_, pr) => pr,
	},
	{
		id: 'pr_5',   icon: 'trophy-outline',           iconColor: '#C0C0C0', category: 'records',
		check: (_, pr) => pr >= 5,
		progress: (_, pr) => pct(pr, 5),
		target: () => 5, current: (_, pr) => pr,
	},
	{
		id: 'pr_10',  icon: 'medal-outline',            iconColor: '#C0C0C0', category: 'records',
		check: (_, pr) => pr >= 10,
		progress: (_, pr) => pct(pr, 10),
		target: () => 10, current: (_, pr) => pr,
	},
	{
		id: 'pr_20',  icon: 'medal-outline',            iconColor: '#FFD700', category: 'records',
		check: (_, pr) => pr >= 20,
		progress: (_, pr) => pct(pr, 20),
		target: () => 20, current: (_, pr) => pr,
	},
	{
		id: 'pr_30',  icon: 'ribbon-outline',           iconColor: '#FFD700', category: 'records',
		check: (_, pr) => pr >= 30,
		progress: (_, pr) => pct(pr, 30),
		target: () => 30, current: (_, pr) => pr,
	},
	{
		id: 'pr_50',  icon: 'ribbon-outline',           iconColor: '#5AC8FA', category: 'records',
		check: (_, pr) => pr >= 50,
		progress: (_, pr) => pct(pr, 50),
		target: () => 50, current: (_, pr) => pr,
	},
	{
		id: 'pr_75',  icon: 'star-outline',             iconColor: '#5AC8FA', category: 'records',
		check: (_, pr) => pr >= 75,
		progress: (_, pr) => pct(pr, 75),
		target: () => 75, current: (_, pr) => pr,
	},
	{
		id: 'pr_100', icon: 'star',                     iconColor: '#FF9500', category: 'records',
		check: (_, pr) => pr >= 100,
		progress: (_, pr) => pct(pr, 100),
		target: () => 100, current: (_, pr) => pr,
	},

	// ── AVG DURATION ──────────────────────────────────────────────────────────
	{
		id: 'duration_20',  icon: 'time-outline',       iconColor: '#8E8E93', category: 'duration',
		check: s => s.total_workouts >= 5 && s.avg_duration >= 20,
		progress: s => pct(s.avg_duration, 20),
		target: () => 20, current: s => s.avg_duration,
	},
	{
		id: 'duration_30',  icon: 'timer-outline',      iconColor: '#CD7F32', category: 'duration',
		check: s => s.total_workouts >= 5 && s.avg_duration >= 30,
		progress: s => pct(s.avg_duration, 30),
		target: () => 30, current: s => s.avg_duration,
	},
	{
		id: 'duration_45',  icon: 'timer-outline',      iconColor: '#C0C0C0', category: 'duration',
		check: s => s.total_workouts >= 5 && s.avg_duration >= 45,
		progress: s => pct(s.avg_duration, 45),
		target: () => 45, current: s => s.avg_duration,
	},
	{
		id: 'duration_60',  icon: 'hourglass-outline',  iconColor: '#FFD700', category: 'duration',
		check: s => s.total_workouts >= 5 && s.avg_duration >= 60,
		progress: s => pct(s.avg_duration, 60),
		target: () => 60, current: s => s.avg_duration,
	},
	{
		id: 'duration_75',  icon: 'hourglass-outline',  iconColor: '#5AC8FA', category: 'duration',
		check: s => s.total_workouts >= 5 && s.avg_duration >= 75,
		progress: s => pct(s.avg_duration, 75),
		target: () => 75, current: s => s.avg_duration,
	},
	{
		id: 'duration_90',  icon: 'alarm-outline',      iconColor: '#5AC8FA', category: 'duration',
		check: s => s.total_workouts >= 5 && s.avg_duration >= 90,
		progress: s => pct(s.avg_duration, 90),
		target: () => 90, current: s => s.avg_duration,
	},
	{
		id: 'duration_120', icon: 'alarm-outline',      iconColor: '#FF9500', category: 'duration',
		check: s => s.total_workouts >= 5 && s.avg_duration >= 120,
		progress: s => pct(s.avg_duration, 120),
		target: () => 120, current: s => s.avg_duration,
	},

	// ── TOTAL TIME (hours) ────────────────────────────────────────────────────
	{
		id: 'time_5h',   icon: 'watch-outline',         iconColor: '#8E8E93', category: 'time',
		check: s => (s.avg_duration * s.total_workouts) >= 300,
		progress: s => pct(s.avg_duration * s.total_workouts, 300),
		target: () => 300, current: s => Math.round(s.avg_duration * s.total_workouts),
	},
	{
		id: 'time_10h',  icon: 'watch-outline',         iconColor: '#CD7F32', category: 'time',
		check: s => (s.avg_duration * s.total_workouts) >= 600,
		progress: s => pct(s.avg_duration * s.total_workouts, 600),
		target: () => 600, current: s => Math.round(s.avg_duration * s.total_workouts),
	},
	{
		id: 'time_25h',  icon: 'time-outline',          iconColor: '#C0C0C0', category: 'time',
		check: s => (s.avg_duration * s.total_workouts) >= 1500,
		progress: s => pct(s.avg_duration * s.total_workouts, 1500),
		target: () => 1500, current: s => Math.round(s.avg_duration * s.total_workouts),
	},
	{
		id: 'time_50h',  icon: 'time-outline',          iconColor: '#FFD700', category: 'time',
		check: s => (s.avg_duration * s.total_workouts) >= 3000,
		progress: s => pct(s.avg_duration * s.total_workouts, 3000),
		target: () => 3000, current: s => Math.round(s.avg_duration * s.total_workouts),
	},
	{
		id: 'time_100h', icon: 'hourglass',             iconColor: '#FFD700', category: 'time',
		check: s => (s.avg_duration * s.total_workouts) >= 6000,
		progress: s => pct(s.avg_duration * s.total_workouts, 6000),
		target: () => 6000, current: s => Math.round(s.avg_duration * s.total_workouts),
	},
	{
		id: 'time_200h', icon: 'hourglass',             iconColor: '#5AC8FA', category: 'time',
		check: s => (s.avg_duration * s.total_workouts) >= 12000,
		progress: s => pct(s.avg_duration * s.total_workouts, 12000),
		target: () => 12000, current: s => Math.round(s.avg_duration * s.total_workouts),
	},
	{
		id: 'time_500h', icon: 'infinite-outline',      iconColor: '#FF9500', category: 'time',
		check: s => (s.avg_duration * s.total_workouts) >= 30000,
		progress: s => pct(s.avg_duration * s.total_workouts, 30000),
		target: () => 30000, current: s => Math.round(s.avg_duration * s.total_workouts),
	},

	// ── SCORE ─────────────────────────────────────────────────────────────────
	{
		id: 'score_100',  icon: 'stats-chart-outline',  iconColor: '#8E8E93', category: 'score',
		check: (_, __, sc) => sc >= 100,
		progress: (_, __, sc) => pct(sc, 100),
		target: () => 100, current: (_, __, sc) => sc,
	},
	{
		id: 'score_500',  icon: 'stats-chart-outline',  iconColor: '#CD7F32', category: 'score',
		check: (_, __, sc) => sc >= 500,
		progress: (_, __, sc) => pct(sc, 500),
		target: () => 500, current: (_, __, sc) => sc,
	},
	{
		id: 'score_1k',   icon: 'bar-chart-outline',    iconColor: '#C0C0C0', category: 'score',
		check: (_, __, sc) => sc >= 1000,
		progress: (_, __, sc) => pct(sc, 1000),
		target: () => 1000, current: (_, __, sc) => sc,
	},
	{
		id: 'score_2500', icon: 'bar-chart-outline',    iconColor: '#FFD700', category: 'score',
		check: (_, __, sc) => sc >= 2500,
		progress: (_, __, sc) => pct(sc, 2500),
		target: () => 2500, current: (_, __, sc) => sc,
	},
	{
		id: 'score_5k',   icon: 'podium-outline',       iconColor: '#FFD700', category: 'score',
		check: (_, __, sc) => sc >= 5000,
		progress: (_, __, sc) => pct(sc, 5000),
		target: () => 5000, current: (_, __, sc) => sc,
	},
	{
		id: 'score_10k',  icon: 'podium-outline',       iconColor: '#5AC8FA', category: 'score',
		check: (_, __, sc) => sc >= 10000,
		progress: (_, __, sc) => pct(sc, 10000),
		target: () => 10000, current: (_, __, sc) => sc,
	},
	{
		id: 'score_25k',  icon: 'podium',               iconColor: '#5AC8FA', category: 'score',
		check: (_, __, sc) => sc >= 25000,
		progress: (_, __, sc) => pct(sc, 25000),
		target: () => 25000, current: (_, __, sc) => sc,
	},
	{
		id: 'score_50k',  icon: 'podium',               iconColor: '#FF9500', category: 'score',
		check: (_, __, sc) => sc >= 50000,
		progress: (_, __, sc) => pct(sc, 50000),
		target: () => 50000, current: (_, __, sc) => sc,
	},

	// ── TIER ──────────────────────────────────────────────────────────────────
	{
		id: 'tier_bronze',   icon: 'medal-outline',     iconColor: '#CD7F32', category: 'tier',
		check: (_, __, sc) => sc >= 500,
		progress: (_, __, sc) => pct(sc, 500),
		target: () => 500, current: (_, __, sc) => sc,
	},
	{
		id: 'tier_silver',   icon: 'medal-outline',     iconColor: '#C0C0C0', category: 'tier',
		check: (_, __, sc) => sc >= 1500,
		progress: (_, __, sc) => pct(sc, 1500),
		target: () => 1500, current: (_, __, sc) => sc,
	},
	{
		id: 'tier_gold',     icon: 'ribbon-outline',    iconColor: '#FFD700', category: 'tier',
		check: (_, __, sc) => sc >= 4000,
		progress: (_, __, sc) => pct(sc, 4000),
		target: () => 4000, current: (_, __, sc) => sc,
	},
	{
		id: 'tier_platinum', icon: 'diamond-outline',   iconColor: '#5AC8FA', category: 'tier',
		check: (_, __, sc) => sc >= 10000,
		progress: (_, __, sc) => pct(sc, 10000),
		target: () => 10000, current: (_, __, sc) => sc,
	},
	{
		id: 'tier_elite',    icon: 'trophy',            iconColor: '#FF9500', category: 'tier',
		check: (_, __, sc) => sc >= 25000,
		progress: (_, __, sc) => pct(sc, 25000),
		target: () => 25000, current: (_, __, sc) => sc,
	},

	// ── INTENSITY (avg per workout) ───────────────────────────────────────────
	{
		id: 'avg_vol_500',  icon: 'speedometer-outline', iconColor: '#CD7F32', category: 'intensity',
		check: s => s.total_workouts >= 5 && (s.total_volume / s.total_workouts) >= 500,
		progress: s => pct(s.total_workouts >= 5 ? s.total_volume / s.total_workouts : 0, 500),
		target: () => 500, current: s => s.total_workouts > 0 ? Math.round(s.total_volume / s.total_workouts) : 0,
	},
	{
		id: 'avg_vol_1k',   icon: 'speedometer-outline', iconColor: '#C0C0C0', category: 'intensity',
		check: s => s.total_workouts >= 5 && (s.total_volume / s.total_workouts) >= 1000,
		progress: s => pct(s.total_workouts >= 5 ? s.total_volume / s.total_workouts : 0, 1000),
		target: () => 1000, current: s => s.total_workouts > 0 ? Math.round(s.total_volume / s.total_workouts) : 0,
	},
	{
		id: 'avg_vol_2k',   icon: 'speedometer',        iconColor: '#FFD700', category: 'intensity',
		check: s => s.total_workouts >= 5 && (s.total_volume / s.total_workouts) >= 2000,
		progress: s => pct(s.total_workouts >= 5 ? s.total_volume / s.total_workouts : 0, 2000),
		target: () => 2000, current: s => s.total_workouts > 0 ? Math.round(s.total_volume / s.total_workouts) : 0,
	},
	{
		id: 'avg_sets_8',   icon: 'list-outline',       iconColor: '#34C759', category: 'intensity',
		check: s => s.total_workouts >= 5 && (s.total_sets / s.total_workouts) >= 8,
		progress: s => pct(s.total_workouts >= 5 ? s.total_sets / s.total_workouts : 0, 8),
		target: () => 8, current: s => s.total_workouts > 0 ? Math.round(s.total_sets / s.total_workouts) : 0,
	},
	{
		id: 'avg_sets_15',  icon: 'list-outline',       iconColor: '#30D158', category: 'intensity',
		check: s => s.total_workouts >= 5 && (s.total_sets / s.total_workouts) >= 15,
		progress: s => pct(s.total_workouts >= 5 ? s.total_sets / s.total_workouts : 0, 15),
		target: () => 15, current: s => s.total_workouts > 0 ? Math.round(s.total_sets / s.total_workouts) : 0,
	},
	{
		id: 'avg_sets_25',  icon: 'list',               iconColor: '#5AC8FA', category: 'intensity',
		check: s => s.total_workouts >= 5 && (s.total_sets / s.total_workouts) >= 25,
		progress: s => pct(s.total_workouts >= 5 ? s.total_sets / s.total_workouts : 0, 25),
		target: () => 25, current: s => s.total_workouts > 0 ? Math.round(s.total_sets / s.total_workouts) : 0,
	},

	// ── SPECIAL / COMBO ───────────────────────────────────────────────────────
	{
		id: 'devoted',      icon: 'heart-outline',      iconColor: '#FF2D55', category: 'special',
		check: s => s.total_workouts >= 50 && s.streak_days >= 30,
		progress: s => Math.round((pct(s.total_workouts, 50) + pct(s.streak_days, 30)) / 2),
		target: () => 100, current: s => Math.round((pct(s.total_workouts, 50) + pct(s.streak_days, 30)) / 2),
	},
	{
		id: 'iron_man',     icon: 'shield-half-outline', iconColor: '#5AC8FA', category: 'special',
		check: s => s.total_workouts >= 200 && s.avg_duration >= 60,
		progress: s => Math.round((pct(s.total_workouts, 200) + pct(s.avg_duration, 60)) / 2),
		target: () => 100, current: s => Math.round((pct(s.total_workouts, 200) + pct(s.avg_duration, 60)) / 2),
	},
	{
		id: 'powerhouse',   icon: 'nuclear-outline',    iconColor: '#FF9500', category: 'special',
		check: s => s.total_volume >= 50000 && s.total_sets >= 2500,
		progress: s => Math.round((pct(s.total_volume, 50000) + pct(s.total_sets, 2500)) / 2),
		target: () => 100, current: s => Math.round((pct(s.total_volume, 50000) + pct(s.total_sets, 2500)) / 2),
	},
	{
		id: 'champion',     icon: 'trophy-outline',     iconColor: '#FFD700', category: 'special',
		check: (s, pr, sc) => sc >= 10000 && pr >= 25,
		progress: (s, pr, sc) => Math.round((pct(sc, 10000) + pct(pr, 25)) / 2),
		target: () => 100, current: (s, pr, sc) => Math.round((pct(sc, 10000) + pct(pr, 25)) / 2),
	},
	{
		id: 'legend',       icon: 'infinite-outline',   iconColor: '#FF9500', category: 'special',
		check: s => s.streak_days >= 180 && s.total_workouts >= 365,
		progress: s => Math.round((pct(s.streak_days, 180) + pct(s.total_workouts, 365)) / 2),
		target: () => 100, current: s => Math.round((pct(s.streak_days, 180) + pct(s.total_workouts, 365)) / 2),
	},
	{
		id: 'all_rounder',  icon: 'planet-outline',     iconColor: '#AF52DE', category: 'special',
		check: s => s.total_workouts >= 100 && s.total_volume >= 10000 && s.total_sets >= 1000 && s.streak_days >= 30,
		progress: s => Math.round((pct(s.total_workouts, 100) + pct(s.total_volume, 10000) + pct(s.total_sets, 1000) + pct(s.streak_days, 30)) / 4),
		target: () => 100, current: s => Math.round((pct(s.total_workouts, 100) + pct(s.total_volume, 10000) + pct(s.total_sets, 1000) + pct(s.streak_days, 30)) / 4),
	},
	{
		id: 'pr_hunter',    icon: 'search-outline',     iconColor: '#FF6B35', category: 'special',
		check: (s, pr) => pr >= 25 && s.total_workouts >= 50,
		progress: (s, pr) => Math.round((pct(pr, 25) + pct(s.total_workouts, 50)) / 2),
		target: () => 100, current: (s, pr) => Math.round((pct(pr, 25) + pct(s.total_workouts, 50)) / 2),
	},
	{
		id: 'consistent',   icon: 'checkmark-done-outline', iconColor: '#34C759', category: 'special',
		check: s => s.total_workouts >= 100 && s.avg_duration >= 45,
		progress: s => Math.round((pct(s.total_workouts, 100) + pct(s.avg_duration, 45)) / 2),
		target: () => 100, current: s => Math.round((pct(s.total_workouts, 100) + pct(s.avg_duration, 45)) / 2),
	},
	{
		id: 'volume_king',  icon: 'barbell-outline',    iconColor: '#FFD700', category: 'special',
		check: s => s.total_volume >= 100000 && s.total_workouts >= 200,
		progress: s => Math.round((pct(s.total_volume, 100000) + pct(s.total_workouts, 200)) / 2),
		target: () => 100, current: s => Math.round((pct(s.total_volume, 100000) + pct(s.total_workouts, 200)) / 2),
	},
	{
		id: 'marathon_man',  icon: 'stopwatch-outline', iconColor: '#5AC8FA', category: 'special',
		check: s => s.total_workouts >= 50 && (s.avg_duration * s.total_workouts) >= 3000,
		progress: s => Math.round((pct(s.total_workouts, 50) + pct(s.avg_duration * s.total_workouts, 3000)) / 2),
		target: () => 100, current: s => Math.round((pct(s.total_workouts, 50) + pct(s.avg_duration * s.total_workouts, 3000)) / 2),
	},
	...(MILESTONE_EXTRA_DEFS as unknown as AchievementDef[]),
]

export { ACHIEVEMENT_DEFS }

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
	// Level system
	currentLevel: Level
	nextLevel: Level | null
	levelProgressPercent: number
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
		const isEarned = def.check(stats, prCount, totalScore)
		if (isEarned && !earnedMap[def.id]) {
			earnedMap[def.id] = new Date().toISOString()
		}
		return {
			id:              def.id,
			icon:            def.icon,
			iconColor:       def.iconColor,
			earned:          !!earnedMap[def.id],
			earnedAt:        earnedMap[def.id],
			progressPercent: Math.round(def.progress(stats, prCount, totalScore)),
			progressCurrent: def.current(stats, prCount, totalScore),
			progressTarget:  def.target(stats, prCount, totalScore),
			category:        def.category,
		}
	})

	await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(earnedMap))

	const categoryTiers: Record<string, Tier> = {
		volume:      getCategoryTier(stats.total_volume, CATEGORY_THRESHOLDS.volume),
		workouts:    getCategoryTier(stats.total_workouts, CATEGORY_THRESHOLDS.workouts),
		streak:      getCategoryTier(stats.streak_days, CATEGORY_THRESHOLDS.streak),
		sets:        getCategoryTier(stats.total_sets, CATEGORY_THRESHOLDS.sets),
		avgDuration: getCategoryTier(stats.avg_duration, CATEGORY_THRESHOLDS.avgDuration),
		records:     getCategoryTier(prCount, CATEGORY_THRESHOLDS.records),
	}

	const currentLevel = getLevelByScore(totalScore)
	const nextLevel = getNextLevel(currentLevel)
	const levelDenSync = nextLevel ? nextLevel.minScore - currentLevel.minScore : 0
	const levelProgressPercent =
		nextLevel && levelDenSync > 0
			? Math.min(
					100,
					Math.round(((totalScore - currentLevel.minScore) / levelDenSync) * 100),
				)
			: 100

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
		currentLevel,
		nextLevel,
		levelProgressPercent,
	}
}

/** Рейтинг по агрегатам (сервер / публичный профиль): без AsyncStorage, earned = выполнено условие */
export const buildRatingSnapshotFromStats = (
	stats: db.WorkoutStats,
	prCount: number,
): RatingData => {
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

	const achievements: Achievement[] = ACHIEVEMENT_DEFS.map(def => {
		const isEarned = def.check(stats, prCount, totalScore)
		return {
			id: def.id,
			icon: def.icon,
			iconColor: def.iconColor,
			earned: isEarned,
			earnedAt: undefined,
			progressPercent: Math.round(def.progress(stats, prCount, totalScore)),
			progressCurrent: def.current(stats, prCount, totalScore),
			progressTarget: def.target(stats, prCount, totalScore),
			category: def.category,
		}
	})

	const categoryTiers: Record<string, Tier> = {
		volume: getCategoryTier(stats.total_volume, CATEGORY_THRESHOLDS.volume),
		workouts: getCategoryTier(stats.total_workouts, CATEGORY_THRESHOLDS.workouts),
		streak: getCategoryTier(stats.streak_days, CATEGORY_THRESHOLDS.streak),
		sets: getCategoryTier(stats.total_sets, CATEGORY_THRESHOLDS.sets),
		avgDuration: getCategoryTier(stats.avg_duration, CATEGORY_THRESHOLDS.avgDuration),
		records: getCategoryTier(prCount, CATEGORY_THRESHOLDS.records),
	}

	const currentLevel = getLevelByScore(totalScore)
	const nextLevel = getNextLevel(currentLevel)
	const levelDen = nextLevel ? nextLevel.minScore - currentLevel.minScore : 0
	const levelProgressPercent =
		nextLevel && levelDen > 0
			? Math.min(
					100,
					Math.round(((totalScore - currentLevel.minScore) / levelDen) * 100),
				)
			: 100

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
		currentLevel,
		nextLevel,
		levelProgressPercent,
	}
}
