import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY_HOURS = '@fitex/recovery_hours_by_group'

/** Muscle groups used in recovery_data.group_name / body map cards. */
export const RECOVERY_MUSCLE_GROUPS = [
	'Грудь',
	'Спина',
	'Плечи',
	'Трапеции',
	'Бицепс',
	'Трицепс',
	'Предплечья',
	'Пресс',
	'Ноги',
	'Ягодицы',
	'Шея',
] as const

export type RecoveryMuscleGroup = (typeof RECOVERY_MUSCLE_GROUPS)[number]

/**
 * Default full-recovery windows (hours) by group.
 * Larger/slow-twitch groups need longer; abs/neck recover faster.
 */
export const DEFAULT_RECOVERY_HOURS_BY_GROUP: Record<RecoveryMuscleGroup, number> =
	{
		Пресс: 36,
		Шея: 36,
		Предплечья: 48,
		Бицепс: 48,
		Трицепс: 48,
		Плечи: 48,
		Трапеции: 48,
		Грудь: 72,
		Спина: 72,
		Ягодицы: 72,
		Ноги: 96,
	}

export const RECOVERY_DURATION_OPTIONS = [24, 36, 48, 72, 96, 120] as const

export type RecoverySettings = {
	hoursByGroup: Record<string, number>
}

export const DEFAULT_RECOVERY_SETTINGS: RecoverySettings = {
	hoursByGroup: { ...DEFAULT_RECOVERY_HOURS_BY_GROUP },
}

function clampHours(n: number, fallback: number) {
	if (!Number.isFinite(n) || n < 12) return fallback
	return Math.min(Math.round(n), 168)
}

function normalizeHoursMap(
	raw: Record<string, unknown> | null | undefined,
): Record<string, number> {
	const next: Record<string, number> = { ...DEFAULT_RECOVERY_HOURS_BY_GROUP }
	if (!raw || typeof raw !== 'object') return next
	for (const group of RECOVERY_MUSCLE_GROUPS) {
		const v = raw[group]
		if (typeof v === 'number') {
			next[group] = clampHours(v, DEFAULT_RECOVERY_HOURS_BY_GROUP[group])
		} else if (typeof v === 'string' && v.trim() !== '') {
			next[group] = clampHours(
				parseInt(v, 10),
				DEFAULT_RECOVERY_HOURS_BY_GROUP[group],
			)
		}
	}
	return next
}

export async function loadRecoverySettings(): Promise<RecoverySettings> {
	try {
		const raw = await AsyncStorage.getItem(KEY_HOURS)
		if (!raw) return { ...DEFAULT_RECOVERY_SETTINGS, hoursByGroup: { ...DEFAULT_RECOVERY_HOURS_BY_GROUP } }
		const parsed = JSON.parse(raw) as Record<string, unknown>
		return { hoursByGroup: normalizeHoursMap(parsed) }
	} catch {
		return {
			...DEFAULT_RECOVERY_SETTINGS,
			hoursByGroup: { ...DEFAULT_RECOVERY_HOURS_BY_GROUP },
		}
	}
}

export async function saveRecoverySettings(
	hoursByGroup: Partial<Record<string, number>>,
): Promise<RecoverySettings> {
	const current = await loadRecoverySettings()
	const merged = normalizeHoursMap({
		...current.hoursByGroup,
		...hoursByGroup,
	})
	await AsyncStorage.setItem(KEY_HOURS, JSON.stringify(merged))
	return { hoursByGroup: merged }
}

export function getRecoveryHoursForGroup(
	groupName: string | null | undefined,
	settings?: RecoverySettings | null,
): number {
	const group = (groupName ?? '').trim()
	const map: Record<string, number> =
		settings?.hoursByGroup ?? { ...DEFAULT_RECOVERY_HOURS_BY_GROUP }
	if (group && typeof map[group] === 'number') {
		return clampHours(map[group], 72)
	}
	const fallback =
		DEFAULT_RECOVERY_HOURS_BY_GROUP[group as RecoveryMuscleGroup]
	return fallback ?? 72
}

/** Hours left until recovery reaches `target` (default 95%). */
export function hoursUntilRecoveryTarget(
	recoveryPct: number,
	recoveryHours: number,
	target = 95,
): number {
	if (recoveryPct >= target) return 0
	const hours = Math.max(12, recoveryHours)
	const needed = (target / 100) * hours
	const elapsed = (recoveryPct / 100) * hours
	return Math.max(0, needed - elapsed)
}

export function formatRecoveryHours(hours: number): string {
	if (hours < 24) return `${hours}h`
	const d = hours / 24
	if (Number.isInteger(d)) return `${d}d`
	return `${hours}h`
}

export function statusFromRecoveryPct(
	recovery: number,
): 'recovered' | 'recovering' | 'needs_rest' {
	if (recovery >= 95) return 'recovered'
	if (recovery >= 50) return 'recovering'
	return 'needs_rest'
}
