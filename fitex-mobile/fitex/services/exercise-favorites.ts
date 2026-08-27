import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = '@fitex/exercise_favorites'

export async function loadExerciseFavorites(): Promise<string[]> {
	try {
		const raw = await AsyncStorage.getItem(KEY)
		if (!raw) return []
		const parsed = JSON.parse(raw)
		return Array.isArray(parsed)
			? parsed.filter((id): id is string => typeof id === 'string')
			: []
	} catch {
		return []
	}
}

export async function saveExerciseFavorites(ids: string[]): Promise<void> {
	try {
		await AsyncStorage.setItem(KEY, JSON.stringify([...new Set(ids)]))
	} catch {
		// ignore
	}
}
