import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY_MEDIA = '@fitex/workout_media_mode'
const KEY_DEFAULT_FOCUS = '@fitex/workout_prefer_focus'

export type WorkoutMediaMode = 'both' | 'video' | 'photos' | 'hidden'

export const WORKOUT_MEDIA_MODES: WorkoutMediaMode[] = [
	'both',
	'video',
	'photos',
	'hidden',
]

export async function loadWorkoutMediaMode(): Promise<WorkoutMediaMode> {
	try {
		const v = await AsyncStorage.getItem(KEY_MEDIA)
		if (v === 'both' || v === 'video' || v === 'photos' || v === 'hidden') {
			return v
		}
	} catch {
		// ignore
	}
	return 'both'
}

export async function saveWorkoutMediaMode(
	mode: WorkoutMediaMode,
): Promise<void> {
	try {
		await AsyncStorage.setItem(KEY_MEDIA, mode)
	} catch {
		// ignore
	}
}

export function nextWorkoutMediaMode(mode: WorkoutMediaMode): WorkoutMediaMode {
	const i = WORKOUT_MEDIA_MODES.indexOf(mode)
	return WORKOUT_MEDIA_MODES[(i + 1) % WORKOUT_MEDIA_MODES.length]
}

export async function loadPreferFocusMode(): Promise<boolean> {
	try {
		const v = await AsyncStorage.getItem(KEY_DEFAULT_FOCUS)
		if (v == null) return true
		return v === 'true'
	} catch {
		return true
	}
}

export async function savePreferFocusMode(prefer: boolean): Promise<void> {
	try {
		await AsyncStorage.setItem(KEY_DEFAULT_FOCUS, prefer ? 'true' : 'false')
	} catch {
		// ignore
	}
}
