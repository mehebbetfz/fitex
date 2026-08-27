import AsyncStorage from '@react-native-async-storage/async-storage'

export const WORKOUT_START_TIME_KEY = '@workout_start_time'
export const WORKOUT_ACTIVE_KEY = '@workout_active'
export const WORKOUT_DRAFT_KEY = '@workout_draft'

export type WorkoutDraftSet = {
	id?: number
	setNumber: number
	weight: number
	reps: number
	completed: boolean
}

export type WorkoutDraftExercise = {
	id?: number
	name: string
	muscleGroup: string
	sets: WorkoutDraftSet[]
	collapsed: boolean
	order_index: number
}

export type WorkoutDraft = {
	workoutName: string
	notes: string
	exercises: WorkoutDraftExercise[]
	startTime: number
	updatedAt: number
}

export async function hasActiveWorkoutDraft(): Promise<boolean> {
	try {
		const [active, draftRaw] = await Promise.all([
			AsyncStorage.getItem(WORKOUT_ACTIVE_KEY),
			AsyncStorage.getItem(WORKOUT_DRAFT_KEY),
		])
		if (active === 'true') return true
		if (!draftRaw) return false
		const draft = JSON.parse(draftRaw) as WorkoutDraft
		return Array.isArray(draft.exercises) && draft.exercises.length > 0
	} catch {
		return false
	}
}

export async function loadWorkoutDraft(): Promise<WorkoutDraft | null> {
	try {
		const raw = await AsyncStorage.getItem(WORKOUT_DRAFT_KEY)
		if (!raw) return null
		const draft = JSON.parse(raw) as WorkoutDraft
		if (!Array.isArray(draft.exercises)) return null
		return draft
	} catch {
		return null
	}
}

export async function saveWorkoutDraft(input: {
	workoutName: string
	notes: string
	exercises: WorkoutDraftExercise[]
	startTime?: number
}): Promise<void> {
	try {
		const existingStart = await AsyncStorage.getItem(WORKOUT_START_TIME_KEY)
		const startTime =
			input.startTime ??
			(existingStart ? parseInt(existingStart, 10) : Date.now())

		const draft: WorkoutDraft = {
			workoutName: input.workoutName,
			notes: input.notes,
			exercises: input.exercises,
			startTime: Number.isFinite(startTime) ? startTime : Date.now(),
			updatedAt: Date.now(),
		}

		await Promise.all([
			AsyncStorage.setItem(WORKOUT_DRAFT_KEY, JSON.stringify(draft)),
			AsyncStorage.setItem(WORKOUT_START_TIME_KEY, String(draft.startTime)),
			AsyncStorage.setItem(WORKOUT_ACTIVE_KEY, 'true'),
		])
	} catch (error) {
		console.error('Error saving workout draft:', error)
	}
}

export async function clearWorkoutDraft(): Promise<void> {
	try {
		await Promise.all([
			AsyncStorage.removeItem(WORKOUT_DRAFT_KEY),
			AsyncStorage.removeItem(WORKOUT_START_TIME_KEY),
			AsyncStorage.removeItem(WORKOUT_ACTIVE_KEY),
			AsyncStorage.removeItem('@last_workout_data'),
		])
	} catch (error) {
		console.error('Error clearing workout draft:', error)
	}
}
