/** Утилиты рейтинга: общие для sync и leaderboard (без Nest-инъекций). */

export function workoutMonthKey(dateStr?: string): string {
	if (!dateStr) return ''
	const day = dateStr.includes('T') ? dateStr.split('T')[0]! : dateStr
	return day.slice(0, 7)
}

export function utcYearMonth(d = new Date()): string {
	return d.toISOString().slice(0, 7)
}

export function computeStreak(dates: string[]): number {
	if (!dates.length) return 0
	const sorted = [...new Set(dates.map(d => d.split('T')[0]!))].sort().reverse()
	let streak = 0
	let prev = new Date()
	prev.setHours(0, 0, 0, 0)
	for (const ds of sorted) {
		const d = new Date(ds)
		d.setHours(0, 0, 0, 0)
		const diff = Math.round((prev.getTime() - d.getTime()) / 86400000)
		if (diff <= 1) {
			streak++
			prev = d
		} else break
	}
	return streak
}

export function computeStatsFromWorkoutsAndRecords(workouts: any[], records: any[]) {
	const totalWorkouts = workouts.length
	const totalVolume = workouts.reduce((s, w) => s + (w.volume ?? 0), 0)
	const totalSets = workouts.reduce((s, w) => s + (w.sets_count ?? 0), 0)
	const avgDuration = totalWorkouts > 0
		? workouts.reduce((s, w) => s + (w.duration ?? 0), 0) / totalWorkouts
		: 0
	const streakDays = computeStreak(workouts.map(w => w.date))
	const prCount = records.length

	const workoutPts = totalWorkouts * 10
	const setPts = totalSets
	const volumePts = Math.floor(totalVolume / 200)
	const streakPts = streakDays * 15
	const prPts = prCount * 50
	const durationBonus = avgDuration > 60 ? 200 : avgDuration > 45 ? 100 : avgDuration > 30 ? 50 : 0
	const totalScore = workoutPts + setPts + volumePts + streakPts + prPts + durationBonus

	return {
		totalScore,
		totalWorkouts,
		totalVolume,
		totalSets,
		streakDays,
		prCount,
	}
}
