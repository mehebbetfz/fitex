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
	custom?: boolean
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

export type PhotoQuota = {
	limit: number
	used: number
	remaining: number
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
	photoQuota?: PhotoQuota
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

function shiftLocalDateKey(dateKey: string, deltaDays: number): string {
	const d = new Date(`${dateKey}T12:00:00`)
	d.setDate(d.getDate() + deltaDays)
	return d.toLocaleDateString('en-CA')
}

/** Fallback when GET /nutrition/history is missing (older server) — walk recent days. */
async function fetchFoodHistoryFromDays(opts?: {
	limit?: number
	before?: string
}): Promise<{ entries: FoodEntry[]; nextCursor: string | null }> {
	const limit = Math.min(50, Math.max(1, opts?.limit ?? 30))
	const beforeMs = opts?.before ? new Date(opts.before).getTime() : NaN
	const hasBefore = Number.isFinite(beforeMs)

	let dayKey = localTodayKey()
	if (hasBefore) {
		dayKey = new Date(beforeMs).toLocaleDateString('en-CA')
	}

	const collected: FoodEntry[] = []
	const maxDays = 90

	for (let i = 0; i < maxDays && collected.length < limit; i++) {
		try {
			const day = await fetchNutritionDay(dayKey)
			const dayEntries = [...(day.entries ?? [])].sort((a, b) => {
				const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
				const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
				return tb - ta
			})
			for (const e of dayEntries) {
				if (hasBefore && e.createdAt) {
					const t = new Date(e.createdAt).getTime()
					if (!(t < beforeMs)) continue
				} else if (hasBefore && !e.createdAt) {
					continue
				}
				collected.push(e)
				if (collected.length >= limit) break
			}
		} catch {
			/* skip missing day */
		}
		dayKey = shiftLocalDateKey(dayKey, -1)
	}

	const last = collected[collected.length - 1]
	const nextCursor =
		collected.length >= limit && last?.createdAt
			? String(last.createdAt)
			: null

	return { entries: collected, nextCursor }
}

export async function fetchFoodHistory(opts?: {
	limit?: number
	before?: string
}): Promise<{ entries: FoodEntry[]; nextCursor: string | null }> {
	try {
		const res = await api.get<{
			entries?: FoodEntry[]
			nextCursor?: string | null
			statusCode?: number
		}>('/nutrition/history', {
			params: {
				limit: opts?.limit ?? 30,
				...(opts?.before ? { before: opts.before } : {}),
			},
			validateStatus: () => true,
		})
		if (res.status === 200 && Array.isArray(res.data?.entries)) {
			return {
				entries: res.data.entries,
				nextCursor: res.data.nextCursor ?? null,
			}
		}
		// Older servers without /nutrition/history (404) — walk /nutrition/day
		return fetchFoodHistoryFromDays(opts)
	} catch {
		return fetchFoodHistoryFromDays(opts)
	}
}

export async function analyzeMealPhoto(
	jpegUri: string,
	opts?: { date?: string; note?: string; language?: string },
): Promise<{
	entry: FoodEntry
	analysis: { confidence: number }
	photoQuota?: PhotoQuota
}> {
	const token = await SecureStore.getItemAsync('access_token')
	const form = new FormData()
	form.append('file', {
		uri: jpegUri,
		name: 'meal.jpg',
		type: 'image/jpeg',
	} as never)
	form.append('date', opts?.date || localTodayKey())
	if (opts?.note?.trim()) form.append('note', opts.note.trim())
	if (opts?.language) form.append('language', opts.language)

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
			photoQuota?: PhotoQuota
		}
	} catch (e) {
		if (e instanceof Error && e.name === 'AbortError') {
			throw new Error('Analysis timed out — try again')
		}
		throw e
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

export async function updateNutritionTargets(patch: {
	calories?: number
	proteinG?: number
	carbsG?: number
	fatG?: number
	reset?: boolean
}): Promise<NutritionTargets> {
	const { data } = await api.patch<NutritionTargets>('/nutrition/targets', patch)
	return data
}
