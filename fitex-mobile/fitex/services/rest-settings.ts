import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY_ENABLED = '@fitex/rest_enabled_default'
const KEY_BETWEEN_SETS = '@fitex/rest_between_sets_sec'
const KEY_BETWEEN_EXERCISES = '@fitex/rest_between_exercises_sec'

export const REST_DURATION_OPTIONS = [
	30, 45, 60, 90, 120, 150, 180, 240, 300,
] as const

export type RestSettings = {
	/** Prefill "rest on" when starting a workout */
	enabledByDefault: boolean
	betweenSetsSec: number
	betweenExercisesSec: number
}

export const DEFAULT_REST_SETTINGS: RestSettings = {
	enabledByDefault: true,
	betweenSetsSec: 90,
	betweenExercisesSec: 180,
}

function clampDuration(n: number, fallback: number) {
	if (!Number.isFinite(n) || n < 15) return fallback
	return Math.min(Math.round(n), 600)
}

export async function loadRestSettings(): Promise<RestSettings> {
	try {
		const [enabled, sets, exercises] = await Promise.all([
			AsyncStorage.getItem(KEY_ENABLED),
			AsyncStorage.getItem(KEY_BETWEEN_SETS),
			AsyncStorage.getItem(KEY_BETWEEN_EXERCISES),
		])
		return {
			enabledByDefault:
				enabled == null
					? DEFAULT_REST_SETTINGS.enabledByDefault
					: enabled === 'true',
			betweenSetsSec: clampDuration(
				parseInt(sets ?? '', 10),
				DEFAULT_REST_SETTINGS.betweenSetsSec,
			),
			betweenExercisesSec: clampDuration(
				parseInt(exercises ?? '', 10),
				DEFAULT_REST_SETTINGS.betweenExercisesSec,
			),
		}
	} catch {
		return { ...DEFAULT_REST_SETTINGS }
	}
}

export async function saveRestSettings(
	next: Partial<RestSettings>,
): Promise<RestSettings> {
	const current = await loadRestSettings()
	const merged: RestSettings = {
		enabledByDefault: next.enabledByDefault ?? current.enabledByDefault,
		betweenSetsSec: clampDuration(
			next.betweenSetsSec ?? current.betweenSetsSec,
			current.betweenSetsSec,
		),
		betweenExercisesSec: clampDuration(
			next.betweenExercisesSec ?? current.betweenExercisesSec,
			current.betweenExercisesSec,
		),
	}
	await Promise.all([
		AsyncStorage.setItem(KEY_ENABLED, merged.enabledByDefault ? 'true' : 'false'),
		AsyncStorage.setItem(KEY_BETWEEN_SETS, String(merged.betweenSetsSec)),
		AsyncStorage.setItem(
			KEY_BETWEEN_EXERCISES,
			String(merged.betweenExercisesSec),
		),
	])
	return merged
}

export function formatRestSeconds(sec: number): string {
	const m = Math.floor(sec / 60)
	const s = sec % 60
	if (m <= 0) return `${s}s`
	if (s === 0) return `${m}m`
	return `${m}:${s.toString().padStart(2, '0')}`
}
