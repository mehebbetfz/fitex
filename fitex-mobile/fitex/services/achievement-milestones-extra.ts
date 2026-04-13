/**
 * 200 дополнительных достижений (вехи по тренировкам, серии, объёму, подходам, PR, длительности, очкам).
 * Тексты — через getMilestoneAchievementCopy (RU/EN/AZ), без записей в locales/index.
 */
import type { WorkoutStats } from '@/scripts/database'
import type { Language } from '@/locales'

const pct = (val: number, max: number) => Math.min(100, Math.round((val / max) * 100))

type AchievementCategory =
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

export interface MilestoneAchievementDef {
	id: string
	icon: string
	iconColor: string
	category: AchievementCategory
	check: (s: WorkoutStats, pr: number, score: number) => boolean
	progress: (s: WorkoutStats, pr: number, score: number) => number
	target: (s: WorkoutStats, pr: number, score: number) => number
	current: (s: WorkoutStats, pr: number, score: number) => number
}

const ICONS = [
	'fitness-outline',
	'barbell-outline',
	'trophy-outline',
	'medal-outline',
	'ribbon-outline',
	'flame-outline',
	'flash-outline',
	'star-outline',
	'trending-up-outline',
	'speedometer-outline',
	'pulse-outline',
	'heart-outline',
] as const

const COLORS = [
	'#34C759',
	'#30D158',
	'#32D74B',
	'#FF9F0A',
	'#FFD700',
	'#5AC8FA',
	'#64D2FF',
	'#AF52DE',
	'#FF6B35',
	'#FF9500',
	'#CD7F32',
	'#C0C0C0',
] as const

const WORKOUT_TARGETS = Array.from({ length: 45 }, (_, i) => 1100 + i * 35)
const STREAK_TARGETS = Array.from({ length: 45 }, (_, i) => 400 + i * 40)
const VOLUME_TARGETS = Array.from({ length: 45 }, (_, i) => 750 + i * 2200)
const SETS_TARGETS = Array.from({ length: 45 }, (_, i) => 12000 + i * 2000)
const PR_EXTRA_TARGETS = Array.from({ length: 20 }, (_, i) => 105 + i * 10)

function pickIcon(i: number): string {
	return ICONS[i % ICONS.length] as string
}

function pickColor(i: number): string {
	return COLORS[i % COLORS.length] as string
}

function buildDefs(): MilestoneAchievementDef[] {
	const out: MilestoneAchievementDef[] = []
	let i = 0

	for (const n of WORKOUT_TARGETS) {
		const idx = i++
		out.push({
			id: `x_w_${n}`,
			icon: pickIcon(idx),
			iconColor: pickColor(idx),
			category: 'workouts',
			check: s => s.total_workouts >= n,
			progress: s => pct(s.total_workouts, n),
			target: () => n,
			current: s => s.total_workouts,
		})
	}

	for (const n of STREAK_TARGETS) {
		const idx = i++
		out.push({
			id: `x_st_${n}`,
			icon: pickIcon(idx),
			iconColor: pickColor(idx),
			category: 'streak',
			check: s => s.streak_days >= n,
			progress: s => pct(s.streak_days, n),
			target: () => n,
			current: s => s.streak_days,
		})
	}

	for (const n of VOLUME_TARGETS) {
		const idx = i++
		out.push({
			id: `x_v_${n}`,
			icon: pickIcon(idx),
			iconColor: pickColor(idx),
			category: 'volume',
			check: s => s.total_volume >= n,
			progress: s => pct(s.total_volume, n),
			target: () => n,
			current: s => s.total_volume,
		})
	}

	for (const n of SETS_TARGETS) {
		const idx = i++
		out.push({
			id: `x_sets_${n}`,
			icon: pickIcon(idx),
			iconColor: pickColor(idx),
			category: 'sets',
			check: s => s.total_sets >= n,
			progress: s => pct(s.total_sets, n),
			target: () => n,
			current: s => s.total_sets,
		})
	}

	for (const n of PR_EXTRA_TARGETS) {
		const idx = i++
		out.push({
			id: `x_pr_${n}`,
			icon: pickIcon(idx),
			iconColor: pickColor(idx),
			category: 'records',
			check: (_s, pr) => pr >= n,
			progress: (_s, pr) => pct(pr, n),
			target: () => n,
			current: (_s, pr) => pr,
		})
	}

	return out
}

export const MILESTONE_EXTRA_DEFS: MilestoneAchievementDef[] = buildDefs()

/** RU / EN / AZ заголовок и описание для вехов с id x_w_, x_st_, x_v_, x_sets_, x_pr_ */
export function getMilestoneAchievementCopy(
	id: string,
	lang: Language,
): { title: string; desc: string } | null {
	const w = /^x_w_(\d+)$/.exec(id)
	if (w) {
		const n = Number(w[1])
		if (lang === 'en') return { title: `${n} workouts`, desc: `Complete ${n} workouts` }
		if (lang === 'az') return { title: `${n} məşq`, desc: `${n} məşq tamamlayın` }
		return { title: `${n} тренировок`, desc: `Завершите ${n} тренировок` }
	}

	const st = /^x_st_(\d+)$/.exec(id)
	if (st) {
		const n = Number(st[1])
		if (lang === 'en') return { title: `${n}-day streak`, desc: `Train ${n} days in a row` }
		if (lang === 'az') return { title: `${n} gün ardıcıl`, desc: `${n} gün ardıcıl məşq edin` }
		return { title: `Серия ${n} дней`, desc: `Тренируйтесь ${n} дней подряд` }
	}

	const v = /^x_v_(\d+)$/.exec(id)
	if (v) {
		const n = Number(v[1])
		if (lang === 'en') return { title: `${n.toLocaleString('en-US')} kg volume`, desc: `Lift ${n.toLocaleString('en-US')} kg total` }
		if (lang === 'az')
			return {
				title: `${n.toLocaleString('az-AZ')} kq tonaj`,
				desc: `Ümumi ${n.toLocaleString('az-AZ')} kq tonaj toplayın`,
			}
		return { title: `Объём ${n.toLocaleString('ru-RU')} кг`, desc: `Наберите суммарно ${n.toLocaleString('ru-RU')} кг` }
	}

	const sets = /^x_sets_(\d+)$/.exec(id)
	if (sets) {
		const n = Number(sets[1])
		if (lang === 'en') return { title: `${n.toLocaleString('en-US')} sets`, desc: `Log ${n.toLocaleString('en-US')} sets total` }
		if (lang === 'az')
			return { title: `${n.toLocaleString('az-AZ')} yanaşma`, desc: `Ümumi ${n.toLocaleString('az-AZ')} yanaşma` }
		return { title: `${n.toLocaleString('ru-RU')} подходов`, desc: `Выполните ${n.toLocaleString('ru-RU')} подходов суммарно` }
	}

	const prx = /^x_pr_(\d+)$/.exec(id)
	if (prx) {
		const n = Number(prx[1])
		if (lang === 'en') return { title: `${n} PRs`, desc: `Set ${n} personal records` }
		if (lang === 'az') return { title: `${n} şəxsi rekord`, desc: `${n} şəxsi rekord qurun` }
		return { title: `${n} личных рекордов`, desc: `Установите ${n} личных рекордов` }
	}

	return null
}
