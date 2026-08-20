/**
 * GitHub-style activity heatmap from workout sets_count.
 * Calendar uses local dates (not UTC toISOString day keys).
 */

import type { Workout } from '@/scripts/database'

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4

export interface HeatmapCell {
	date: string // YYYY-MM-DD
	sets: number
	level: HeatmapLevel
	/** true for padding days before the range start */
	empty?: boolean
}

/** One week column: Sun..Sat (index 0 = Sunday) to match GitHub */
export type HeatmapWeek = HeatmapCell[]

export const HEATMAP_LEVEL_COLORS: Record<HeatmapLevel, string> = {
	0: '#21262D',
	1: '#0E4429',
	2: '#006D32',
	3: '#26A641',
	4: '#39D353',
}

export function localDateKey(d: Date): string {
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}-${m}-${day}`
}

export function workoutLocalDateKey(workoutDate: string): string {
	const raw = (workoutDate || '').trim()
	if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10)
	const d = new Date(raw)
	if (!Number.isFinite(d.getTime())) return ''
	return localDateKey(d)
}

function startOfLocalDay(d: Date): Date {
	const x = new Date(d)
	x.setHours(0, 0, 0, 0)
	return x
}

function addLocalDays(d: Date, days: number): Date {
	const x = new Date(d)
	x.setDate(x.getDate() + days)
	return x
}

/** Thresholds: 1–8 / 9–16 / 17–24 / 25+ */
export function setsToLevel(sets: number): HeatmapLevel {
	if (sets <= 0) return 0
	if (sets <= 8) return 1
	if (sets <= 16) return 2
	if (sets <= 24) return 3
	return 4
}

export function aggregateSetsByDay(
	workouts: Pick<Workout, 'date' | 'sets_count'>[],
): Map<string, number> {
	const map = new Map<string, number>()
	for (const w of workouts) {
		const key = workoutLocalDateKey(w.date)
		if (!key) continue
		const sets =
			typeof w.sets_count === 'number'
				? w.sets_count
				: parseInt(String(w.sets_count), 10) || 0
		map.set(key, (map.get(key) || 0) + sets)
	}
	return map
}

/**
 * Build ~53 week columns ending at `endDate` (default today).
 * Each column has 7 cells Sunday→Saturday.
 */
export function buildHeatmapGrid(
	setsByDay: Map<string, number>,
	endDate: Date = new Date(),
	weekCount = 53,
): HeatmapWeek[] {
	const end = startOfLocalDay(endDate)
	// Align end column to contain `end` — find Sunday of that week
	const endDow = end.getDay() // 0 Sun … 6 Sat
	const weekEndSaturday = addLocalDays(end, 6 - endDow)
	const weekStartSunday = addLocalDays(weekEndSaturday, -6)

	// First Sunday of the leftmost week
	const rangeStart = addLocalDays(weekStartSunday, -(weekCount - 1) * 7)

	const weeks: HeatmapWeek[] = []
	for (let w = 0; w < weekCount; w++) {
		const week: HeatmapCell[] = []
		for (let d = 0; d < 7; d++) {
			const day = addLocalDays(rangeStart, w * 7 + d)
			const key = localDateKey(day)
			if (day.getTime() > end.getTime()) {
				week.push({ date: key, sets: 0, level: 0, empty: true })
				continue
			}
			const sets = setsByDay.get(key) || 0
			week.push({ date: key, sets, level: setsToLevel(sets) })
		}
		weeks.push(week)
	}
	return weeks
}

/** Month label positions: index of week column where month label should appear */
export function buildMonthLabels(
	weeks: HeatmapWeek[],
	locale: string,
): { weekIndex: number; label: string }[] {
	const labels: { weekIndex: number; label: string }[] = []
	let lastMonth = -1
	weeks.forEach((week, weekIndex) => {
		// Prefer mid-week day that isn't empty padding
		const cell =
			week.find(c => !c.empty && new Date(c.date + 'T12:00:00').getDate() <= 7) ||
			week.find(c => !c.empty) ||
			week[0]
		if (!cell || cell.empty) return
		const d = new Date(cell.date + 'T12:00:00')
		const month = d.getMonth()
		if (month !== lastMonth) {
			lastMonth = month
			labels.push({
				weekIndex,
				label: new Intl.DateTimeFormat(locale, { month: 'short' }).format(d),
			})
		}
	})
	return labels
}
