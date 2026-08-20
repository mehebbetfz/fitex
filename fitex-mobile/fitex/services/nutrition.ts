import { api } from '@/services/api'
import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'

export type NutritionTargets = {
	calories: number
	proteinG: number
	carbsG: number
	fatG: number
	bmr: number
	tdee: number
	complete: boolean
}

export type FoodEntry = {
	id: string
	date: string
	name: string
	photoUrl: string | null
	calories: number
	proteinG: number
	carbsG: number
	fatG: number
	vitamins: Record<string, number>
	source: string
	createdAt?: string
}

export type NutritionDay = {
	date: string
	targets: NutritionTargets
	totals: {
		calories: number
		proteinG: number
		carbsG: number
		fatG: number
	}
	entries: FoodEntry[]
}

function apiBase() {
	return (
		process.env.EXPO_PUBLIC_API_URL ||
		(Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ||
		'https://fitex.4talk.club'
	).replace(/\/$/, '')
}

export function localTodayKey() {
	return new Date().toLocaleDateString('en-CA')
}

export async function fetchNutritionDay(date?: string): Promise<NutritionDay> {
	const d = date || localTodayKey()
	const { data } = await api.get<NutritionDay>('/nutrition/day', {
		params: { date: d },
	})
	return data
}

export async function analyzeMealPhoto(
	jpegUri: string,
	date?: string,
	note?: string,
): Promise<{ entry: FoodEntry; analysis: { confidence: number } }> {
	const token = await SecureStore.getItemAsync('access_token')
	const form = new FormData()
	form.append('file', {
		uri: jpegUri,
		name: 'meal.jpg',
		type: 'image/jpeg',
	} as never)
	form.append('date', date || localTodayKey())
	if (note?.trim()) form.append('note', note.trim())

	const controller = new AbortController()
	const timer = setTimeout(() => controller.abort(), 90_000)

	try {
		const res = await fetch(`${apiBase()}/nutrition/analyze`, {
			method: 'POST',
			headers: token ? { Authorization: `Bearer ${token}` } : {},
			body: form,
			signal: controller.signal,
		})
		if (!res.ok) {
			let msg = res.statusText
			try {
				const j = (await res.json()) as { message?: string | string[] }
				const m = j.message
				msg = Array.isArray(m) ? m.join(', ') : m || msg
			} catch {
				/* ignore */
			}
			throw new Error(msg)
		}
		return (await res.json()) as {
			entry: FoodEntry
			analysis: { confidence: number }
		}
	} finally {
		clearTimeout(timer)
	}
}

export async function updateFoodEntry(
	id: string,
	patch: Partial<
		Pick<FoodEntry, 'name' | 'calories' | 'proteinG' | 'carbsG' | 'fatG'>
	>,
): Promise<FoodEntry> {
	const { data } = await api.patch<FoodEntry>(`/nutrition/entries/${id}`, patch)
	return data
}

export async function deleteFoodEntry(id: string): Promise<void> {
	await api.delete(`/nutrition/entries/${id}`)
}
