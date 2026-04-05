// scripts/database.ts
import { ALL_MUSCLES } from '@/constants/muscles'
import * as SQLite from 'expo-sqlite'

export interface ActiveWorkout {
	id?: number
	name: string
	date: string
	start_time: string
	time: string
	end_time?: string
	duration: number // в секундах
	status: 'active' | 'paused' | 'completed'
	muscle_groups: string
	exercises_count: number
	sets_count: number
	volume: number
	notes?: string
	rating?: number
}

export interface ActiveExercise {
	id?: number
	workout_id: number
	name: string
	muscle_group: string
	order_index: number
	collapsed: boolean
	created_at?: string
}

export interface ActiveSet {
	id?: number
	exercise_id: number
	set_number: number
	weight: number
	reps: number
	completed: boolean
	created_at?: string
}

// Типы данных
export interface Workout {
	id?: number
	date: string
	time: string
	duration: number // в минутах
	type: string
	muscle_groups: string
	exercises_count: number
	sets_count: number
	volume: number
	notes?: string
	synced?: number
	rating?: number
	created_at?: string
}

export interface Exercise {
	id?: number
	workout_id: number
	name: string
	muscle_group: string
	volume: number
	one_rep_max?: number
	notes?: string
	order_index: number
}

export interface ExerciseSet {
	id?: number
	exercise_id: number
	set_number: number
	weight: number
	reps: number
	completed: boolean
}

export interface BodyMeasurement {
	id?: number
	name: string
	value: number
	unit: string
	date: string
	trend: 'up' | 'down' | 'stable'
	goal?: number
	synced?: number
	created_at?: string
}

export interface PersonalRecord {
	id?: number
	exercise: string
	weight: string
	date: string
	trend: 'up' | 'down' | 'stable'
	category: 'strength' | 'cardio' | 'endurance'
	notes?: string
	previous_record?: string
	improvement?: string
	synced?: number
	created_at?: string
}

interface MuscleFatigue {
	muscleId: string
	fatigueAmount: number  // 0-100, насколько увеличится усталость
}

// Базовая усталость для разных типов мышц
const BASE_FATIGUE = {
	primary: 25,      // основные мышцы получают 25% усталости за подход
	secondary: 15,    // второстепенные - 15%
	stabilizer: 10,   // стабилизаторы - 10%
}

export interface RecoveryData {
	id?: number
	muscle_id: string
	muscle_name: string
	group_name: string
	status: 'recovered' | 'recovering' | 'needs_rest'
	recovery: number
	fatigue: number
	last_trained: string
	updated_at?: string
}
export interface UserStats {
	id?: number
	date: string
	total_workouts: number
	total_sets: number
	streak_days: number
	created_at?: string
}

// Открытие базы данных
export const openDatabase = () => {
	const db = SQLite.openDatabaseSync('fitex.db')
	return db
}

// Пометить записи как синхронизированные
export const markAsSynced = async (
	tableName: string,
	ids: number[]
): Promise<void> => {
	if (ids.length === 0) return
	const db = openDatabase()
	const placeholders = ids.map(() => '?').join(',')
	await db.runAsync(
		`UPDATE ${tableName} SET synced = 1 WHERE id IN (${placeholders})`,
		ids
	)
}

export const calculateExerciseFatigue = (
	exercise: {
		primaryFrontMuscles?: string[]
		secondaryFrontMuscles?: string[]
		primaryBackMuscles?: string[]
		secondaryBackMuscles?: string[]
	},
	sets: number,  // количество подходов
	intensity: number = 1,  // интенсивность (0.5-1.5) на основе веса
): MuscleFatigue[] => {
	const fatigueMap = new Map<string, number>()

	// Функция для добавления усталости мышце
	const addFatigue = (muscleId: string, baseAmount: number) => {
		const current = fatigueMap.get(muscleId) || 0
		// Усталость пропорциональна количеству подходов и интенсивности
		const totalFatigue = current + (baseAmount * sets * intensity)
		fatigueMap.set(muscleId, Math.min(totalFatigue, 100)) // максимум 100%
	}

	// Основные мышцы (перед)
	exercise.primaryFrontMuscles?.forEach(muscleId => {
		addFatigue(muscleId, BASE_FATIGUE.primary)
	})

	// Основные мышцы (спина)
	exercise.primaryBackMuscles?.forEach(muscleId => {
		addFatigue(muscleId, BASE_FATIGUE.primary)
	})

	// Второстепенные мышцы (перед)
	exercise.secondaryFrontMuscles?.forEach(muscleId => {
		addFatigue(muscleId, BASE_FATIGUE.secondary)
	})

	// Второстепенные мышцы (спина)
	exercise.secondaryBackMuscles?.forEach(muscleId => {
		addFatigue(muscleId, BASE_FATIGUE.secondary)
	})

	return Array.from(fatigueMap.entries()).map(([muscleId, fatigueAmount]) => ({
		muscleId,
		fatigueAmount,
	}))
}



// Инициализация базы данных
export const initDatabase = async () => {
	const db = openDatabase()

	try {
		await db.execAsync(`CREATE TABLE IF NOT EXISTS workouts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			date TEXT NOT NULL,
			time TEXT,
			duration INTEGER NOT NULL,
			type TEXT NOT NULL,
			muscle_groups TEXT NOT NULL,
			exercises_count INTEGER NOT NULL,
			sets_count INTEGER NOT NULL,
			volume REAL NOT NULL,
			notes TEXT,
			rating INTEGER,
			synced INTEGER DEFAULT 0,
  		deleted_at TEXT DEFAULT NULL, 
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`)

		await db.execAsync(`CREATE TABLE IF NOT EXISTS exercises (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			workout_id INTEGER NOT NULL,
			name TEXT NOT NULL,
			muscle_group TEXT NOT NULL,
			volume REAL NOT NULL,
			one_rep_max REAL,
			notes TEXT,
			order_index INTEGER NOT NULL,
			FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
		)`)

		await db.execAsync(`CREATE TABLE IF NOT EXISTS exercise_sets (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			exercise_id INTEGER NOT NULL,
			set_number INTEGER NOT NULL,
			weight REAL NOT NULL,
			reps INTEGER NOT NULL,
			completed BOOLEAN DEFAULT 1,
			FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
		)`)

		await db.execAsync(`CREATE TABLE IF NOT EXISTS body_measurements (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			value REAL NOT NULL,
			unit TEXT NOT NULL,
			date TEXT NOT NULL,
			trend TEXT NOT NULL,
			goal REAL,
			synced INTEGER DEFAULT 0,
			  deleted_at TEXT DEFAULT NULL, 
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`)

		await db.execAsync(`CREATE TABLE IF NOT EXISTS personal_records (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			exercise TEXT NOT NULL,
			weight TEXT NOT NULL,
			date TEXT NOT NULL,
			trend TEXT NOT NULL,
			category TEXT NOT NULL,
			notes TEXT,
			previous_record TEXT,
			improvement TEXT,
			synced INTEGER DEFAULT 0,
			  deleted_at TEXT DEFAULT NULL, 
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`)


		await db.execAsync(`CREATE TABLE IF NOT EXISTS recovery_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    muscle_id TEXT NOT NULL UNIQUE,  -- уникальный ID мышцы
    muscle_name TEXT NOT NULL,        -- отображаемое имя
    group_name TEXT NOT NULL,         -- группа для группировки
    status TEXT NOT NULL DEFAULT 'not_trained',
    recovery INTEGER NOT NULL,
    fatigue REAL DEFAULT 0,           -- текущая усталость (0-100)
    last_trained TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

		await db.execAsync(`CREATE TABLE IF NOT EXISTS user_stats (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			date TEXT NOT NULL,
			total_workouts INTEGER DEFAULT 0,
			total_sets INTEGER DEFAULT 0,
			streak_days INTEGER DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`)

		await db.execAsync(`CREATE TABLE IF NOT EXISTS settings (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL
		)`)

		await db.execAsync(`CREATE TABLE IF NOT EXISTS user_profile (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			first_name TEXT NOT NULL,
			last_name TEXT NOT NULL,
			email TEXT NOT NULL,
			avatar_url TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`)

		console.log('Database initialized successfully')
		return true
	} catch (error) {
		console.error('Error initializing database:', error)
		throw error
	}
}

// Функция мягкого удаления вместо DELETE
export const softDeleteWorkout = async (id: number): Promise<boolean> => {
	const db = openDatabase()
	await db.runAsync(
		`UPDATE workouts SET deleted_at = ?, synced = 0 WHERE id = ?`,
		[new Date().toISOString(), id]
	)
	return true
}

export const softDeleteBodyMeasurement = async (id: number): Promise<boolean> => {
	const db = openDatabase()
	await db.runAsync(
		`UPDATE body_measurements SET deleted_at = ?, synced = 0 WHERE id = ?`,
		[new Date().toISOString(), id]
	)
	return true
}

export const softDeletePersonalRecord = async (id: number): Promise<boolean> => {
	const db = openDatabase()
	await db.runAsync(
		`UPDATE personal_records SET deleted_at = ?, synced = 0 WHERE id = ?`,
		[new Date().toISOString(), id]
	)
	return true
}

export const getMeasurementById = async (
	id: number,
): Promise<BodyMeasurement | null> => {
	const db = openDatabase()

	try {
		const results = await db.getAllAsync(
			'SELECT * FROM body_measurements WHERE id = ?',
			id,
		)
		if (results.length > 0) {
			const row = results[0] as any
			return {
				...row,
				trend: row.trend as 'up' | 'down' | 'stable',
			} as BodyMeasurement
		} else {
			return null
		}
	} catch (error) {
		console.error('Error getting measurement by id:', error)
		throw error
	}
}

export const updateBodyMeasurement = async (
	id: number,
	updates: Partial<Omit<BodyMeasurement, 'id' | 'created_at'>>,
): Promise<boolean> => {
	const db = openDatabase()

	try {
		const measurement = await getMeasurementById(id)
		if (!measurement) return false

		const updatedMeasurement = { ...measurement, ...updates }

		await db.runAsync(
			`UPDATE body_measurements 
       SET name = ?, value = ?, unit = ?, date = ?, trend = ?, goal = ?
       WHERE id = ?`,
			[
				updatedMeasurement.name,
				updatedMeasurement.value,
				updatedMeasurement.unit,
				updatedMeasurement.date,
				updatedMeasurement.trend,
				updatedMeasurement.goal || null,
				id,
			],
		)

		return true
	} catch (error) {
		console.error('Error updating body measurement:', error)
		throw error
	}
}

export const deleteBodyMeasurement = async (id: number): Promise<boolean> => {
	const db = openDatabase()

	try {
		await db.runAsync('DELETE FROM body_measurements WHERE id = ?', id)
		return true
	} catch (error) {
		console.error('Error deleting body measurement:', error)
		throw error
	}
}

export const getExerciseHistory = async (
	exerciseName: string,
	limit: number = 5,
): Promise<Array<{
	date: string
	time: string
	sets: ExerciseSet[]
	totalVolume: number
	oneRepMax: number
}>> => {
	const db = openDatabase()

	try {
		const results = await db.getAllAsync(`
      SELECT 
        w.date,
        w.time,
        e.id as exercise_id,
        e.one_rep_max
      FROM exercises e
      JOIN workouts w ON e.workout_id = w.id
      WHERE e.name = ?
      ORDER BY w.date DESC, w.time DESC
      LIMIT ?
    `, [exerciseName, limit])

		const history = await Promise.all(
			results.map(async (row: any) => {
				const sets = await getSetsByExerciseId(row.exercise_id)
				const totalVolume = sets.reduce((sum, set) => sum + (set.weight * set.reps), 0)

				return {
					date: row.date,
					time: row.time,
					sets,
					totalVolume,
					oneRepMax: row.one_rep_max || 0,
				}
			})
		)

		return history
	} catch (error) {
		console.error('Error getting exercise history:', error)
		return []
	}
}

// Получение максимальных показателей для упражнения
export const getExercisePersonalRecords = async (
	exerciseName: string,
): Promise<{
	maxWeight: number
	maxVolume: number
	maxOneRepMax: number
	bestSet: { weight: number; reps: number; date: string }
	lastWorkout: { date: string; totalVolume: number; sets: ExerciseSet[] }
}> => {
	const db = openDatabase()

	try {
		// Получаем все упражнения с этим названием
		const exercises: any = await db.getAllAsync(`
      SELECT e.id, e.one_rep_max, w.date
      FROM exercises e
      JOIN workouts w ON e.workout_id = w.id
      WHERE e.name = ?
      ORDER BY w.date DESC
    `, [exerciseName])

		if (exercises.length === 0) {
			return {
				maxWeight: 0,
				maxVolume: 0,
				maxOneRepMax: 0,
				bestSet: { weight: 0, reps: 0, date: '' },
				lastWorkout: { date: '', totalVolume: 0, sets: [] },
			}
		}

		let maxWeight = 0
		let maxVolume = 0
		let maxOneRepMax = 0
		let bestSet = { weight: 0, reps: 0, date: '' }

		// Для каждого упражнения получаем подходы и находим максимумы
		for (const ex of exercises) {
			const sets = await getSetsByExerciseId(ex.id)

			// Максимальный объем для этого упражнения
			const volume = sets.reduce((sum, set) => sum + (set.weight * set.reps), 0)
			maxVolume = Math.max(maxVolume, volume)

			// Максимальный вес в одном повторении
			maxOneRepMax = Math.max(maxOneRepMax, ex.one_rep_max || 0)

			// Лучший подход (вес * повторения)
			for (const set of sets) {
				const setValue = set.weight * set.reps
				const bestSetValue = bestSet.weight * bestSet.reps

				if (setValue > bestSetValue) {
					bestSet = {
						weight: set.weight,
						reps: set.reps,
						date: ex.date,
					}
				}

				// Максимальный вес
				if (set.weight > maxWeight) {
					maxWeight = set.weight
				}
			}
		}

		// Получаем данные последней тренировки
		const lastExercise = exercises[0]
		const lastSets = await getSetsByExerciseId(lastExercise.id)
		const lastVolume = lastSets.reduce((sum, set) => sum + (set.weight * set.reps), 0)

		return {
			maxWeight,
			maxVolume,
			maxOneRepMax,
			bestSet,
			lastWorkout: {
				date: lastExercise.date,
				totalVolume: lastVolume,
				sets: lastSets,
			},
		}
	} catch (error) {
		console.error('Error getting exercise personal records:', error)
		return {
			maxWeight: 0,
			maxVolume: 0,
			maxOneRepMax: 0,
			bestSet: { weight: 0, reps: 0, date: '' },
			lastWorkout: { date: '', totalVolume: 0, sets: [] },
		}
	}
}

// Расчет 1ПМ (одно повторный максимум) по формуле Бжицкого
export const calculateOneRepMax = (weight: number, reps: number): number => {
	if (reps <= 1) return weight

	// Формула Бжицкого (Epley): 1ПМ = вес * (1 + 0.0333 * повторения)
	return weight * (1 + reps / 30)
}

// ========== РАБОТА С РЕКОРДАМИ ==========

export const deleteRecord = async (id: number): Promise<boolean> => {
	const db = openDatabase()

	try {
		await db.runAsync('DELETE FROM records WHERE id = ?', id)
		return true
	} catch (error) {
		console.error('Error deleting record:', error)
		throw error
	}
}

export const getRecordById = async (
	id: number,
): Promise<PersonalRecord | null> => {
	const db = openDatabase()

	try {
		const results = await db.getAllAsync(
			'SELECT * FROM personal_records WHERE id = ?',
			id,
		)
		if (results.length > 0) {
			const row = results[0] as any
			return {
				...row,
				trend: row.trend as 'up' | 'down' | 'stable',
				category: row.category as 'strength' | 'cardio' | 'endurance',
			} as PersonalRecord
		} else {
			return null
		}
	} catch (error) {
		console.error('Error getting record by id:', error)
		throw error
	}
}

export const updatePersonalRecord = async (
	id: number,
	updates: Partial<Omit<PersonalRecord, 'id' | 'created_at'>>,
): Promise<boolean> => {
	const db = openDatabase()

	try {
		const record = await getRecordById(id)
		if (!record) return false

		const updatedRecord = { ...record, ...updates }

		await db.runAsync(
			`UPDATE personal_records 
       SET exercise = ?, weight = ?, date = ?, trend = ?, category = ?, 
           notes = ?, previous_record = ?, improvement = ?
       WHERE id = ?`,
			[
				updatedRecord.exercise,
				updatedRecord.weight,
				updatedRecord.date,
				updatedRecord.trend,
				updatedRecord.category,
				updatedRecord.notes || null,
				updatedRecord.previous_record || null,
				updatedRecord.improvement || null,
				id,
			],
		)

		return true
	} catch (error) {
		console.error('Error updating personal record:', error)
		throw error
	}
}

export const deletePersonalRecord = async (id: number): Promise<boolean> => {
	const db = openDatabase()

	try {
		await db.runAsync('DELETE FROM personal_records WHERE id = ?', id)
		return true
	} catch (error) {
		console.error('Error deleting personal record:', error)
		throw error
	}
}

// ========== РАБОТА С ТРЕНИРОВКАМИ ==========

export const addWorkout = async (
	workout: Omit<Workout, 'id'>,
): Promise<number> => {
	const db = openDatabase()

	try {
		const result = await db.runAsync(
			`INSERT INTO workouts 
       (date, time, duration, type, muscle_groups, exercises_count, sets_count, volume, notes, rating, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
			[
				workout.date,
				workout.time,
				workout.duration,
				workout.type,
				workout.muscle_groups,
				workout.exercises_count,
				workout.sets_count,
				workout.volume,
				workout.notes || null,
				workout.rating || null,
			],
		)
		return result.lastInsertRowId as number
	} catch (error) {
		console.error('Error adding workout:', error)
		throw error
	}
}

// Создание новой активной тренировки
export const createActiveWorkout = async (name: string): Promise<number> => {
	const db = openDatabase()

	try {
		const currentDate = getCurrentDate()
		const currentTime = getCurrentTime()

		const result = await db.runAsync(
			`INSERT INTO active_workouts 
       (name, date, start_time, duration, status, muscle_groups, exercises_count, sets_count, volume, notes, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[name, currentDate, currentTime, 0, 'active', '', 0, 0, 0, null, null],
		)
		return result.lastInsertRowId as number
	} catch (error) {
		console.error('Error creating active workout:', error)
		throw error
	}
}

// Получение активной тренировки
export const getActiveWorkout = async (
	id: number,
): Promise<ActiveWorkout | null> => {
	const db = openDatabase()

	try {
		const results = await db.getAllAsync(
			'SELECT * FROM active_workouts WHERE id = ?',
			id,
		)
		if (results.length > 0) {
			return results[0] as ActiveWorkout
		} else {
			return null
		}
	} catch (error) {
		console.error('Error getting active workout:', error)
		throw error
	}
}

// Обновление активной тренировки
export const updateActiveWorkout = async (
	id: number,
	updates: Partial<ActiveWorkout>,
): Promise<boolean> => {
	const db = openDatabase()

	try {
		const workout = await getActiveWorkout(id)
		if (!workout) return false

		const updatedWorkout = { ...workout, ...updates }

		await db.runAsync(
			`UPDATE active_workouts 
       SET name = ?, date = ?, start_time = ?, end_time = ?, duration = ?, 
           status = ?, muscle_groups = ?, exercises_count = ?, sets_count = ?, 
           volume = ?, notes = ?, rating = ?
       WHERE id = ?`,
			[
				updatedWorkout.name,
				updatedWorkout.date,
				updatedWorkout.start_time,
				updatedWorkout.end_time || null,
				updatedWorkout.duration,
				updatedWorkout.status,
				updatedWorkout.muscle_groups,
				updatedWorkout.exercises_count,
				updatedWorkout.sets_count,
				updatedWorkout.volume,
				updatedWorkout.notes || null,
				updatedWorkout.rating || null,
				id,
			],
		)

		return true
	} catch (error) {
		console.error('Error updating active workout:', error)
		throw error
	}
}

// Добавление упражнения в активную тренировку
export const addActiveExercise = async (
	workoutId: number,
	exercise: Omit<ActiveExercise, 'id' | 'workout_id' | 'created_at'>,
): Promise<number> => {
	const db = openDatabase()

	try {
		// Получаем текущее максимальное значение order_index
		const existingExercises: any = await db.getAllAsync(
			'SELECT order_index FROM active_exercises WHERE workout_id = ? ORDER BY order_index DESC',
			workoutId,
		)

		const maxOrderIndex =
			existingExercises.length > 0 ? existingExercises[0].order_index : 0

		const result = await db.runAsync(
			`INSERT INTO active_exercises (workout_id, name, muscle_group, order_index, collapsed)
       VALUES (?, ?, ?, ?, ?)`,
			[
				workoutId,
				exercise.name,
				exercise.muscle_group,
				maxOrderIndex + 1,
				exercise.collapsed ? 1 : 0,
			],
		)

		return result.lastInsertRowId as number
	} catch (error) {
		console.error('Error adding active exercise:', error)
		throw error
	}
}

// Добавление подхода в активное упражнение
export const addActiveSet = async (
	exerciseId: number,
	set: Omit<ActiveSet, 'id' | 'exercise_id' | 'created_at'>,
): Promise<number> => {
	try {
		const db = openDatabase()

		// Добавьте проверку
		if (!db) {
			throw new Error('Database is not initialized')
		}

		console.log('Database opened successfully')
		console.log('Inserting set for exercise:', exerciseId, set)
		const result = await db.runAsync(
			`INSERT INTO active_sets (exercise_id, set_number, weight, reps, completed)
       VALUES (?, ?, ?, ?, ?)`,
			[exerciseId, set.set_number, set.weight, set.reps, set.completed ? 1 : 0],
		)

		console.log(result)

		return result.lastInsertRowId as number
	} catch (error) {
		console.error('Error adding active set:', error)
		throw error
	}
}

// В вашем файле database.ts добавьте:
export const updateActiveExerciseCollapsed = async (
	exerciseId: number,
	collapsed: boolean,
): Promise<boolean> => {
	const db = openDatabase()

	try {
		await db.runAsync('UPDATE exercises SET collapsed = ? WHERE id = ?', [
			collapsed ? 1 : 0,
			exerciseId,
		])
		return true
	} catch (error) {
		console.error('Error updating exercise collapsed state:', error)
		throw error
	}
}

// Получение упражнений активной тренировки
export const getActiveExercisesFromDb = async (
	workoutId: number,
): Promise<ActiveExercise[]> => {
	const db = openDatabase()

	try {
		const results = await db.getAllAsync(
			'SELECT * FROM active_exercises WHERE workout_id = ? ORDER BY order_index',
			workoutId,
		)

		return results.map((ex: any) => ({
			...ex,
			collapsed: ex.collapsed === 1,
		})) as ActiveExercise[]
	} catch (error) {
		console.error('Error getting active exercises:', error)
		throw error
	}
}

// Получение подходов активного упражнения
export const getActiveSetsFromDb = async (
	exerciseId: number,
): Promise<ActiveSet[]> => {
	const db = openDatabase()

	try {
		const results = await db.getAllAsync(
			'SELECT * FROM active_sets WHERE exercise_id = ? ORDER BY set_number',
			exerciseId,
		)

		return results.map((set: any) => ({
			...set,
			completed: set.completed === 1,
		})) as ActiveSet[]
	} catch (error) {
		console.error('Error getting active sets:', error)
		throw error
	}
}

// Обновление активного подхода
export const updateActiveSet = async (
	setId: number,
	updates: Partial<Omit<ActiveSet, 'id' | 'exercise_id'>>,
): Promise<boolean> => {
	const db = openDatabase()

	try {
		console.log(setId, updates)
		const completed =
			updates.completed !== undefined ? (updates.completed ? 1 : 0) : undefined

		let query = 'UPDATE active_sets SET '
		const params: any[] = []
		const updatesArray = []

		if (updates.set_number !== undefined) {
			updatesArray.push('set_number = ?')
			params.push(updates.set_number)
		}
		if (updates.weight !== undefined) {
			updatesArray.push('weight = ?')
			params.push(updates.weight)
		}
		if (updates.reps !== undefined) {
			updatesArray.push('reps = ?')
			params.push(updates.reps)
		}
		if (completed !== undefined) {
			updatesArray.push('completed = ?')
			params.push(completed)
		}

		if (updatesArray.length === 0) return true

		query += updatesArray.join(', ') + ' WHERE id = ?'
		params.push(setId)

		await db.runAsync(query, ...params)
		return true
	} catch (error) {
		console.error('Error updating active set:', error)
		throw error
	}
}

// Удаление активного подхода
export const deleteActiveSet = async (setId: number): Promise<boolean> => {
	const db = openDatabase()

	try {
		await db.runAsync('DELETE FROM active_sets WHERE id = ?', setId)
		return true
	} catch (error) {
		console.error('Error deleting active set:', error)
		throw error
	}
}

// Удаление активного упражнения (каскадно удаляет подходы)
export const deleteActiveExercise = async (
	exerciseId: number,
): Promise<boolean> => {
	const db = openDatabase()

	try {
		await db.runAsync('DELETE FROM active_exercises WHERE id = ?', exerciseId)
		return true
	} catch (error) {
		console.error('Error deleting active exercise:', error)
		throw error
	}
}

export const createCompletedWorkout = async (workoutData: {
	name: string
	duration: number
	notes: string
	exercises: Array<{
		name: string
		muscle_group: string
		order_index: number
		sets: Array<{
			set_number: number
			weight: number
			reps: number
			completed: boolean
		}>
	}>
}): Promise<number> => {
	const db = openDatabase()

	// Вывод полного объекта тренировки в консоль
	console.log('═'.repeat(60))
	console.log('СОЗДАНИЕ ЗАВЕРШЁННОЙ ТРЕНИРОВКИ')
	console.log('Полный объект workoutData:')
	console.log(JSON.stringify(workoutData, null, 2))
	console.log('═'.repeat(60))

	try {
		let workoutId: number

		await db.withTransactionAsync(async () => {
			// Рассчитываем общую статистику
			let totalSets = 0
			let totalVolume = 0
			const muscleGroupsSet = new Set<string>()

			for (const exercise of workoutData.exercises) {
				muscleGroupsSet.add(exercise.muscle_group)

				for (const set of exercise.sets) {
					totalSets++
					if (set.completed) {
						totalVolume += set.weight * set.reps
					}
				}
			}

			const muscleGroups = Array.from(muscleGroupsSet).join(',')

			// Создаем тренировку в основной таблице
			const workoutResult = await db.runAsync(
				`INSERT INTO workouts 
         (date, time, duration, type, muscle_groups, exercises_count, sets_count, volume, notes, rating, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
				[
					getCurrentDate(),
					getCurrentTime(),
					Math.floor(workoutData.duration / 60),
					workoutData.name,
					muscleGroups,
					workoutData.exercises.length,
					totalSets,
					totalVolume,
					workoutData.notes || null,
					null,
				],
			)

			workoutId = workoutResult.lastInsertRowId as number

			console.log(`Тренировка создана с id: ${workoutId}`)

			// Добавляем упражнения и подходы
			for (const exercise of workoutData.exercises) {
				let exerciseVolume = 0
				for (const set of exercise.sets) {
					if (set.completed) {
						exerciseVolume += set.weight * set.reps
					}
				}

				const exerciseResult = await db.runAsync(
					`INSERT INTO exercises (workout_id, name, muscle_group, volume, one_rep_max, notes, order_index)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
					[
						workoutId,
						exercise.name,
						exercise.muscle_group,
						exerciseVolume,
						0,
						'',
						exercise.order_index,
					],
				)

				const exerciseId = exerciseResult.lastInsertRowId as number

				console.log(
					`  Добавлено упражнение: ${exercise.name} (id: ${exerciseId})`,
				)

				for (const set of exercise.sets) {
					await db.runAsync(
						`INSERT INTO exercise_sets (exercise_id, set_number, weight, reps, completed)
             VALUES (?, ?, ?, ?, ?)`,
						[
							exerciseId,
							set.set_number,
							set.weight,
							set.reps,
							set.completed ? 1 : 0,
						],
					)
				}

				console.log(`    → ${exercise.sets.length} подходов`)
			}
		})

		console.log('Успешно завершено ✓')
		console.log('═'.repeat(60))

		await checkAndSavePersonalRecords(workoutData.exercises)

		return workoutId
	} catch (error) {
		console.error('Ошибка при создании завершённой тренировки:')
		console.error(error)
		console.log('═'.repeat(60))
		throw error
	}
}

export const getLatestBodyMeasurements = async (): Promise<
	BodyMeasurement[]
> => {
	const db = openDatabase()

	try {
		const results = await db.getAllAsync(`
      SELECT b1.* 
      FROM body_measurements b1
      INNER JOIN (
        SELECT name, MAX(date) as max_date
        FROM body_measurements
        GROUP BY name
      ) b2 ON b1.name = b2.name AND b1.date = b2.max_date
      ORDER BY b1.name
    `)

		return results.map((row: any) => ({
			...row,
			trend: row.trend as 'up' | 'down' | 'stable',
		})) as BodyMeasurement[]
	} catch (error) {
		console.error('Error getting latest body measurements:', error)
		throw error
	}
}

// filter.synced = false → WHERE synced = 0, иначе без фильтра
export const getBodyMeasurements = async (filter?: { synced?: boolean }): Promise<BodyMeasurement[]> => {
	const db = openDatabase()

	try {
		let query = 'SELECT * FROM body_measurements'
		const params: any[] = []

		if (filter?.synced === false) {
			query += ' WHERE synced = 0'
		} else if (filter?.synced === true) {
			query += ' WHERE synced = 1'
		}

		query += ' ORDER BY date DESC, name'

		const results = await db.getAllAsync(query, ...params)

		return results.map((row: any) => ({
			...row,
			trend: row.trend as 'up' | 'down' | 'stable',
		})) as BodyMeasurement[]
	} catch (error) {
		console.error('Error getting body measurements:', error)
		throw error
	}
}

export const getBodyMeasurementHistory = async (
	name?: string,
): Promise<any[]> => {
	const db = openDatabase()

	try {
		if (name) {
			const results = await db.getAllAsync(
				'SELECT * FROM body_measurements WHERE name = ? ORDER BY date DESC',
				name,
			)

			return results.map((row: any) => ({
				...row,
				trend: row.trend as 'up' | 'down' | 'stable',
			}))
		} else {
			// Группируем по дате
			const results = await db.getAllAsync(`
        SELECT date, 
               GROUP_CONCAT(name || ': ' || value || unit) as measurements
        FROM body_measurements
        GROUP BY date
        ORDER BY date DESC
      `)

			// Преобразуем в формат для отображения
			return results.map((row: any) => ({
				date: row.date,
				measurements: row.measurements.split(',').map((m: string) => {
					const parts = m.split(':')
					const name = parts[0].trim()
					const value = parts.slice(1).join(':').trim()
					return { name, value }
				}),
			}))
		}
	} catch (error) {
		console.error('Error getting body measurement history:', error)
		throw error
	}
}

export const getPersonalRecords = async (
	categoryOrFilter?: string | { synced?: boolean },
): Promise<PersonalRecord[]> => {
	const db = openDatabase()

	try {
		let query = 'SELECT * FROM personal_records'
		const params: any[] = []

		if (typeof categoryOrFilter === 'string') {
			query += ' WHERE category = ?'
			params.push(categoryOrFilter)
		} else if (typeof categoryOrFilter === 'object') {
			if (categoryOrFilter.synced === false) {
				query += ' WHERE synced = 0'
			} else if (categoryOrFilter.synced === true) {
				query += ' WHERE synced = 1'
			}
		}

		query += ' ORDER BY date DESC'

		const results = await db.getAllAsync(query, ...params)

		return results.map((row: any) => ({
			...row,
			trend: row.trend as 'up' | 'down' | 'stable',
			category: row.category as 'strength' | 'cardio' | 'endurance',
		})) as PersonalRecord[]
	} catch (error) {
		console.error('Error getting personal records:', error)
		throw error
	}
}

export const getWorkoutStats = async (): Promise<WorkoutStats> => {
	const db = openDatabase()

	try {
		const statsResult: any[] = await db.getAllAsync(`
      SELECT 
        COUNT(*) as total_workouts,
        COALESCE(SUM(sets_count), 0) as total_sets,
        COALESCE(SUM(volume), 0) as total_volume,
        COALESCE(AVG(duration), 0) as avg_duration
      FROM workouts
    `)

		const stats = statsResult[0] || {
			total_workouts: 0,
			total_sets: 0,
			total_volume: 0,
			avg_duration: 0,
		}

		// Простая реализация расчета серии тренировок
		const streakResult: any[] = await db.getAllAsync(
			'SELECT date FROM workouts ORDER BY date DESC LIMIT 7',
		)

		let streakDays = 0
		const today = new Date()
		today.setHours(0, 0, 0, 0)

		for (let i = 0; i < streakResult.length; i++) {
			const workoutDate = new Date(streakResult[i].date)
			workoutDate.setHours(0, 0, 0, 0)

			const diffDays = Math.floor(
				(today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24),
			)

			if (diffDays === i) {
				streakDays++
			} else {
				break
			}
		}

		return {
			total_workouts: stats.total_workouts || 0,
			total_sets: stats.total_sets || 0,
			total_volume: stats.total_volume || 0,
			avg_duration: Math.round(stats.avg_duration) || 0,
			streak_days: streakDays,
		}
	} catch (error) {
		console.error('Error getting workout stats:', error)
		return {
			total_workouts: 0,
			total_sets: 0,
			total_volume: 0,
			avg_duration: 0,
			streak_days: 0,
		}
	}
}

// Добавляем функцию для форматирования даты
export const formatDate = (dateString: string): string => {
	try {
		const date = new Date(dateString)
		const today = new Date()
		const yesterday = new Date(today)
		yesterday.setDate(yesterday.getDate() - 1)

		if (date.toDateString() === today.toDateString()) {
			return 'Сегодня'
		} else if (date.toDateString() === yesterday.toDateString()) {
			return 'Вчера'
		} else {
			const day = date.getDate().toString().padStart(2, '0')
			const month = (date.getMonth() + 1).toString().padStart(2, '0')
			const year = date.getFullYear()
			return `${day}.${month}.${year}`
		}
	} catch (error) {
		return dateString
	}
}

// Обновленная функция completeActiveWorkout для обратной совместимости
export const completeActiveWorkout = async (
	workoutIdOrData:
		| number
		| {
			name: string
			duration: number
			notes: string
			exercises: Array<{
				name: string
				muscle_group: string
				order_index: number
				sets: Array<{
					set_number: number
					weight: number
					reps: number
					completed: boolean
				}>
			}>
		},
): Promise<number> => {
	// Если передано число (ID активной тренировки), используем старый подход
	if (typeof workoutIdOrData === 'number') {
		const db = openDatabase()

		try {
			// Получаем активную тренировку
			const workout = await getActiveWorkout(workoutIdOrData)
			if (!workout) throw new Error('Workout not found')

			// Получаем упражнения и подходы
			const exercises = await getActiveExercisesFromDb(workoutIdOrData)

			// Рассчитываем итоговую статистику
			let totalVolume = 0
			let totalSets = 0
			const muscleGroupsSet = new Set<string>()

			for (const exercise of exercises) {
				if (!exercise.id) continue // Пропускаем если нет id

				muscleGroupsSet.add(exercise.muscle_group)
				const sets = await getActiveSetsFromDb(exercise.id)

				for (const set of sets) {
					totalVolume += set.weight * set.reps
				}
				totalSets += sets.length
			}

			const muscleGroups = Array.from(muscleGroupsSet).join(',')

			// Обновляем активную тренировку
			await updateActiveWorkout(workoutIdOrData, {
				end_time: getCurrentTime(),
				status: 'completed',
				muscle_groups: muscleGroups,
				exercises_count: exercises.length,
				sets_count: totalSets,
				volume: totalVolume,
			})

			// Получаем обновленную тренировку
			const completedWorkout = await getActiveWorkout(workoutIdOrData)
			if (!completedWorkout)
				throw new Error('Workout not found after completion')

			// Создаем запись в основной таблице
			const workoutRecordId = await addWorkout({
				date: completedWorkout.date,
				time: completedWorkout.time,
				duration: Math.floor(completedWorkout.duration / 60), // конвертируем секунды в минуты
				type: completedWorkout.name,
				muscle_groups: completedWorkout.muscle_groups,
				exercises_count: completedWorkout.exercises_count,
				sets_count: completedWorkout.sets_count,
				volume: completedWorkout.volume,
				notes: completedWorkout.notes,
				rating: completedWorkout.rating,
			})

			// Переносим упражнения и подходы
			for (const exercise of exercises) {
				if (!exercise.id) continue

				const sets = await getActiveSetsFromDb(exercise.id)
				const exerciseVolume = sets.reduce(
					(sum, set) => sum + set.weight * set.reps,
					0,
				)

				// Добавляем упражнение
				const exerciseResult = await db.runAsync(
					`INSERT INTO exercises (workout_id, name, muscle_group, volume, one_rep_max, notes, order_index)
					 VALUES (?, ?, ?, ?, ?, ?, ?)`,
					[
						workoutRecordId,
						exercise.name,
						exercise.muscle_group,
						exerciseVolume,
						0,
						'',
						exercise.order_index,
					],
				)
				const savedExerciseId = exerciseResult.lastInsertRowId as number

				// Добавляем подходы
				for (const set of sets) {
					await db.runAsync(
						`INSERT INTO exercise_sets (exercise_id, set_number, weight, reps, completed)
						 VALUES (?, ?, ?, ?, ?)`,
						[
							savedExerciseId,
							set.set_number,
							set.weight,
							set.reps,
							set.completed ? 1 : 0,
						],
					)
				}
			}

			// Удаляем активную тренировку и связанные данные (каскадно)
			await db.runAsync(
				'DELETE FROM active_workouts WHERE id = ?',
				workoutIdOrData,
			)

			return workoutRecordId
		} catch (error) {
			console.error('Error completing workout:', error)
			throw error
		}
	} else {
		// Если переданы данные тренировки, используем новую функцию
		return await createCompletedWorkout(workoutIdOrData)
	}
}

// Получение всех активных тренировок
export const getActiveWorkouts = async (): Promise<ActiveWorkout[]> => {
	const db = openDatabase()

	try {
		const results = await db.getAllAsync(
			'SELECT * FROM active_workouts WHERE status = "active" ORDER BY created_at DESC',
		)
		return results as ActiveWorkout[]
	} catch (error) {
		console.error('Error getting active workouts:', error)
		throw error
	}
}

// Инициализация таблиц для активных тренировок
export const initActiveWorkoutTables = async () => {
	const db = openDatabase()

	try {
		await db.execAsync(`
      CREATE TABLE IF NOT EXISTS active_workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        duration INTEGER DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        muscle_groups TEXT DEFAULT '',
        exercises_count INTEGER DEFAULT 0,
        sets_count INTEGER DEFAULT 0,
        volume REAL DEFAULT 0,
        notes TEXT,
        rating INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS active_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        muscle_group TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        collapsed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workout_id) REFERENCES active_workouts (id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS active_sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_id INTEGER NOT NULL,
        set_number INTEGER NOT NULL,
        weight REAL NOT NULL,
        reps INTEGER NOT NULL,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exercise_id) REFERENCES active_exercises (id) ON DELETE CASCADE
      );
    `)

		console.log('Active workout tables initialized')
	} catch (error) {
		console.error('Error initializing active workout tables:', error)
		throw error
	}
}

// limit, muscleGroup, filter для synced
export const getWorkouts = async (
	limit?: number,
	muscleGroup?: string,
	filter?: { synced?: boolean },
): Promise<Workout[]> => {
	const db = openDatabase()

	try {
		const conditions: string[] = []
		const params: any[] = []

		conditions.push('deleted_at IS NULL')

		if (muscleGroup && muscleGroup !== 'all') {
			conditions.push('muscle_groups LIKE ?')
			params.push(`%${muscleGroup}%`)
		}

		if (filter?.synced === false) {
			conditions.push('synced = 0')
		} else if (filter?.synced === true) {
			conditions.push('synced = 1')
		}

		let query = 'SELECT * FROM workouts'
		if (conditions.length > 0) {
			query += ' WHERE ' + conditions.join(' AND ')
		}
		query += ' ORDER BY date DESC, time DESC'

		if (limit) {
			query += ` LIMIT ${limit}`
		}

		const results = await db.getAllAsync(query, ...params)
		return results as Workout[]
	} catch (error) {
		console.error('Error getting workouts:', error)
		throw error
	}
}

export const getWorkoutById = async (id: number): Promise<Workout | null> => {
	const db = openDatabase()

	try {
		const results = await db.getAllAsync(
			'SELECT * FROM workouts WHERE id = ?',
			id,
		)
		if (results.length > 0) {
			return results[0] as Workout
		} else {
			return null
		}
	} catch (error) {
		console.error('Error getting workout by id:', error)
		throw error
	}
}

export const deleteWorkout = async (id: number): Promise<boolean> => {
	const db = openDatabase()

	try {
		const result = await db.runAsync('DELETE FROM workouts WHERE id = ?', id)
		return result.changes > 0
	} catch (error) {
		console.error('Error deleting workout:', error)
		throw error
	}
}

// ========== РАБОТА С УПРАЖНЕНИЯМИ И ПОДХОДАМИ ==========

export const addExerciseWithSets = async (
	workoutId: number,
	exercise: Omit<Exercise, 'id' | 'workout_id'>,
	sets: Omit<ExerciseSet, 'id' | 'exercise_id'>[],
): Promise<number> => {
	const db = openDatabase()

	try {
		let exerciseId: number

		// Используем транзакцию для атомарности
		await db.withTransactionAsync(async () => {
			// Вставляем упражнение
			const exerciseResult = await db.runAsync(
				`INSERT INTO exercises (workout_id, name, muscle_group, volume, one_rep_max, notes, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
				[
					workoutId,
					exercise.name,
					exercise.muscle_group,
					exercise.volume,
					exercise.one_rep_max || null,
					exercise.notes || null,
					exercise.order_index,
				],
			)
			exerciseId = exerciseResult.lastInsertRowId as number

			// Вставляем подходы
			for (const set of sets) {
				await db.runAsync(
					`INSERT INTO exercise_sets (exercise_id, set_number, weight, reps, completed)
           VALUES (?, ?, ?, ?, ?)`,
					[
						exerciseId,
						set.set_number,
						set.weight,
						set.reps,
						set.completed ? 1 : 0,
					],
				)
			}
		})

		return exerciseId
	} catch (error) {
		console.error('Error adding exercise with sets:', error)
		throw error
	}
}

export const getExercisesByWorkoutId = async (
	workoutId: number,
): Promise<Exercise[]> => {
	const db = openDatabase()

	try {
		const results = await db.getAllAsync(
			'SELECT * FROM exercises WHERE workout_id = ? ORDER BY order_index',
			workoutId,
		)
		return results as Exercise[]
	} catch (error) {
		console.error('Error getting exercises by workout id:', error)
		throw error
	}
}

export const getSetsByExerciseId = async (
	exerciseId: number,
): Promise<ExerciseSet[]> => {
	const db = openDatabase()

	try {
		const results = await db.getAllAsync(
			'SELECT * FROM exercise_sets WHERE exercise_id = ? ORDER BY set_number',
			exerciseId,
		)
		const sets = results.map((set: any) => ({
			...set,
			completed: set.completed === 1,
		}))
		return sets as ExerciseSet[]
	} catch (error) {
		console.error('Error getting sets by exercise id:', error)
		throw error
	}
}

export const getFullWorkoutDetails = async (
	workoutId: number,
): Promise<{
	workout: Workout
	exercises: Array<Exercise & { sets: ExerciseSet[] }>
}> => {
	const db = openDatabase()

	try {
		// Получаем тренировку
		const workoutResults = await db.getAllAsync(
			'SELECT * FROM workouts WHERE id = ?',
			workoutId,
		)
		if (workoutResults.length === 0) {
			throw new Error('Workout not found')
		}

		const workout = workoutResults[0] as Workout

		// Получаем упражнения
		const exercises = await getExercisesByWorkoutId(workoutId)

		// Для каждого упражнения получаем подходы
		const exercisesWithSets = await Promise.all(
			exercises.map(async exercise => {
				const sets = await getSetsByExerciseId(exercise.id!)
				return {
					...exercise,
					sets,
				}
			}),
		)

		return {
			workout,
			exercises: exercisesWithSets,
		}
	} catch (error) {
		console.error('Error getting full workout details:', error)
		throw error
	}
}

// ========== РАБОТА С ЗАМЕРАМИ ТЕЛА ==========

export const addBodyMeasurement = async (
	measurement: Omit<BodyMeasurement, 'id'>,
): Promise<number> => {
	const db = openDatabase()

	try {
		const result = await db.runAsync(
			`INSERT INTO body_measurements (name, value, unit, date, trend, goal, synced)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
			[
				measurement.name,
				measurement.value,
				measurement.unit,
				measurement.date,
				measurement.trend,
				measurement.goal || null,
			],
		)
		return result.lastInsertRowId as number
	} catch (error) {
		console.error('Error adding body measurement:', error)
		throw error
	}
}
// ========== РАБОТА С РЕКОРДАМИ ==========

export const addPersonalRecord = async (
	record: Omit<PersonalRecord, 'id'>,
): Promise<number> => {
	const db = openDatabase()

	try {
		const result = await db.runAsync(
			`INSERT INTO personal_records (exercise, weight, date, trend, category, notes, previous_record, improvement, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
			[
				record.exercise,
				record.weight,
				record.date,
				record.trend,
				record.category,
				record.notes || null,
				record.previous_record || null,
				record.improvement || null,
			],
		)
		return result.lastInsertRowId as number
	} catch (error) {
		console.error('Error adding personal record:', error)
		throw error
	}
}

// ========== РАБОТА С ДАННЫМИ ВОССТАНОВЛЕНИЯ ==========

export const updateRecoveryData = async (
	recoveryData: Omit<RecoveryData, 'id'>[],
): Promise<void> => {
	const db = openDatabase()

	try {
		await db.withTransactionAsync(async () => {
			// Удаляем старые данные
			await db.runAsync('DELETE FROM recovery_data')

			// Вставляем новые данные
			for (const data of recoveryData) {
				await db.runAsync(
					`INSERT INTO recovery_data (muscle_name, status, recovery, last_trained)
           VALUES (?, ?, ?, ?)`,
					[data.muscle_name, data.status, data.recovery, data.last_trained],
				)
			}
		})
	} catch (error) {
		console.error('Error updating recovery data:', error)
		throw error
	}
}

export const getRecoveryData = async (): Promise<RecoveryData[]> => {
	const db = openDatabase()

	try {
		const results = await db.getAllAsync(
			'SELECT * FROM recovery_data ORDER BY muscle_name',
		)

		return results as RecoveryData[]
	} catch (error) {
		console.error('Error getting recovery data:', error)
		throw error
	}
}

export const updateMuscleRecovery = async (
	muscleName: string,
	status: 'recovered' | 'recovering' | 'needs_rest',
	recovery: number,
	lastTrained: string,
): Promise<void> => {
	const db = openDatabase()

	try {
		await db.runAsync(
			`INSERT OR REPLACE INTO recovery_data (muscle_name, status, recovery, last_trained)
       VALUES (?, ?, ?, ?)`,
			[muscleName, status, recovery, lastTrained],
		)
	} catch (error) {
		console.error('Error updating muscle recovery:', error)
		throw error
	}
}

// ========== РАБОТА СО СТАТИСТИКОЙ ==========

export const updateUserStats = async (
	stats: Omit<UserStats, 'id'>,
): Promise<number> => {
	const db = openDatabase()

	try {
		// Проверяем, есть ли запись за сегодня
		const existing = await db.getAllAsync(
			'SELECT id FROM user_stats WHERE date = ?',
			stats.date,
		)

		if (existing.length > 0) {
			// Обновляем существующую запись
			const result = await db.runAsync(
				`UPDATE user_stats 
         SET total_workouts = ?, total_sets = ?, streak_days = ?
         WHERE date = ?`,
				[stats.total_workouts, stats.total_sets, stats.streak_days, stats.date],
			)
			return existing[0].id
		} else {
			// Создаем новую запись
			const result = await db.runAsync(
				`INSERT INTO user_stats (date, total_workouts, total_sets, streak_days)
         VALUES (?, ?, ?, ?)`,
				[stats.date, stats.total_workouts, stats.total_sets, stats.streak_days],
			)
			return result.lastInsertRowId as number
		}
	} catch (error) {
		console.error('Error updating user stats:', error)
		throw error
	}
}

export const getTodayStats = async (): Promise<UserStats | null> => {
	const db = openDatabase()
	const today = new Date().toISOString().split('T')[0]

	try {
		const results = await db.getAllAsync(
			'SELECT * FROM user_stats WHERE date = ?',
			today,
		)
		if (results.length > 0) {
			return results[0] as UserStats
		} else {
			return null
		}
	} catch (error) {
		console.error('Error getting today stats:', error)
		throw error
	}
}

// ========== РАБОТА С НАСТРОЙКАМИ ==========

export const saveSetting = async (
	key: string,
	value: string,
): Promise<void> => {
	const db = openDatabase()

	try {
		await db.runAsync(
			`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
			[key, value],
		)
	} catch (error) {
		console.error('Error saving setting:', error)
		throw error
	}
}

export const getSetting = async (key: string): Promise<string | null> => {
	const db = openDatabase()

	try {
		const results = await db.getAllAsync(
			'SELECT value FROM settings WHERE key = ?',
			key,
		)
		if (results.length > 0) {
			return results[0].value as string
		} else {
			return null
		}
	} catch (error) {
		console.error('Error getting setting:', error)
		throw error
	}
}

export const getAllSettings = async (): Promise<Record<string, string>> => {
	const db = openDatabase()

	try {
		const results = await db.getAllAsync('SELECT key, value FROM settings')
		const settings: Record<string, string> = {}

		results.forEach((row: any) => {
			settings[row.key] = row.value
		})

		return settings
	} catch (error) {
		console.error('Error getting all settings:', error)
		throw error
	}
}

// ========== РАБОТА С ПРОФИЛЕМ ПОЛЬЗОВАТЕЛЯ ==========

export interface UserProfile {
	id?: number
	first_name: string
	last_name: string
	email: string
	avatar_url?: string
	created_at?: string
}

export const saveUserProfile = async (
	profile: Omit<UserProfile, 'id'>,
): Promise<number> => {
	const db = openDatabase()

	try {
		// Удаляем старый профиль (у нас будет только один профиль)
		await db.runAsync('DELETE FROM user_profile')

		// Вставляем новый профиль
		const result = await db.runAsync(
			`INSERT INTO user_profile (first_name, last_name, email, avatar_url)
       VALUES (?, ?, ?, ?)`,
			[
				profile.first_name,
				profile.last_name,
				profile.email,
				profile.avatar_url || null,
			],
		)
		return result.lastInsertRowId as number
	} catch (error) {
		console.error('Error saving user profile:', error)
		throw error
	}
}

export const getUserProfile = async (): Promise<UserProfile> => {
	const db = openDatabase()

	try {
		const results = await db.getAllAsync('SELECT * FROM user_profile LIMIT 1')
		if (results.length > 0) {
			return results[0] as UserProfile
		} else {
			// Возвращаем профиль по умолчанию
			return {
				first_name: 'Алексей',
				last_name: 'Иванов',
				email: 'alexey@example.com',
				avatar_url:
					'https://ui-avatars.com/api/?name=Алексей+Иванов&background=4CAF50&color=fff',
			}
		}
	} catch (error) {
		console.error('Error getting user profile:', error)
		throw error
	}
}

// ========== ЭКСПОРТ/ИМПОРТ ДАННЫХ ==========

export const exportDatabase = async (): Promise<string> => {
	const db = openDatabase()

	try {
		const data: any = {}

		// Собираем все данные из таблиц
		const tables = [
			'workouts',
			'exercises',
			'exercise_sets',
			'body_measurements',
			'personal_records',
			'recovery_data',
			'user_stats',
			'settings',
			'user_profile',
		]

		for (const table of tables) {
			const results = await db.getAllAsync(`SELECT * FROM ${table}`)
			data[table] = results
		}

		return JSON.stringify(data, null, 2)
	} catch (error) {
		console.error('Error exporting database:', error)
		throw error
	}
}

export const importDatabase = async (jsonData: string): Promise<void> => {
	const data = JSON.parse(jsonData)
	const db = openDatabase()

	try {
		await db.withTransactionAsync(async () => {
			// Удаляем все существующие данные
			await db.runAsync('DELETE FROM workouts')
			await db.runAsync('DELETE FROM exercises')
			await db.runAsync('DELETE FROM exercise_sets')
			await db.runAsync('DELETE FROM body_measurements')
			await db.runAsync('DELETE FROM personal_records')
			await db.runAsync('DELETE FROM recovery_data')
			await db.runAsync('DELETE FROM user_stats')
			await db.runAsync('DELETE FROM settings')
			await db.runAsync('DELETE FROM user_profile')

			// Восстанавливаем данные для каждой таблицы
			const insertData = async (table: string, records: any[]) => {
				if (!records || records.length === 0) return

				for (const record of records) {
					// Создаем динамический запрос INSERT
					const keys = Object.keys(record).filter(key => key !== 'id')
					const placeholders = keys.map(() => '?').join(', ')
					const values = keys.map(key => record[key])

					const query = `INSERT INTO ${table} (${keys.join(
						', ',
					)}) VALUES (${placeholders})`
					await db.runAsync(query, ...values)
				}
			}

			for (const [table, records] of Object.entries(data)) {
				await insertData(table, records as any[])
			}
		})
	} catch (error) {
		console.error('Error importing database:', error)
		throw error
	}
}

// ========== СБРОС БАЗЫ ДАННЫХ ==========

export const resetDatabase = async (): Promise<void> => {
	const db = openDatabase()

	try {
		await db.withTransactionAsync(async () => {
			await db.runAsync('DROP TABLE IF EXISTS workouts')
			await db.runAsync('DROP TABLE IF EXISTS exercises')
			await db.runAsync('DROP TABLE IF EXISTS exercise_sets')
			await db.runAsync('DROP TABLE IF EXISTS body_measurements')
			await db.runAsync('DROP TABLE IF EXISTS personal_records')
			await db.runAsync('DROP TABLE IF EXISTS recovery_data')
			await db.runAsync('DROP TABLE IF EXISTS user_stats')
			await db.runAsync('DROP TABLE IF EXISTS settings')
			await db.runAsync('DROP TABLE IF EXISTS user_profile')
		})

		// Пересоздаем таблицы
		await initDatabase()
	} catch (error) {
		console.error('Error resetting database:', error)
		throw error
	}
}

// ========== УТИЛИТЫ ==========

export const getCurrentDate = (): string => {
	return new Date().toISOString().split('T')[0]
}

export const getCurrentTime = (): string => {
	return new Date().toLocaleTimeString('ru-RU', {
		hour: '2-digit',
		minute: '2-digit',
	})
}

// Добавьте этот интерфейс в раздел типов данных
export interface WorkoutStats {
	total_workouts: number
	total_sets: number
	total_volume: number
	streak_days: number
	avg_duration: number
}

// ─────────────────────────────────────────────
// ДОБАВИТЬ В: scripts/database.ts
// ─────────────────────────────────────────────

// ========== INTERFACES ==========

export interface WorkoutTemplate {
	id?: number
	name: string
	description?: string
	estimated_duration?: number // минуты
	muscle_groups: string
	exercises_count: number
	created_at?: string
	updated_at?: string
}

export interface TemplateExercise {
	id?: number
	template_id: number
	name: string
	muscle_group: string
	order_index: number
	default_sets: number
	default_reps: number
	default_weight: number
}

// ========== INIT ==========

export const initTemplatesTables = async () => {
	const db = openDatabase()
	try {
		await db.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        estimated_duration INTEGER DEFAULT 60,
        muscle_groups TEXT DEFAULT '',
        exercises_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS template_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        muscle_group TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        default_sets INTEGER DEFAULT 3,
        default_reps INTEGER DEFAULT 10,
        default_weight REAL DEFAULT 0,
        FOREIGN KEY (template_id) REFERENCES workout_templates (id) ON DELETE CASCADE
      );
    `)
	} catch (error) {
		console.error('Error initializing templates tables:', error)
		throw error
	}
}

// ========== TEMPLATE CRUD ==========

export const createTemplate = async (
	template: Omit<WorkoutTemplate, 'id' | 'created_at' | 'updated_at'>,
	exercises: Omit<TemplateExercise, 'id' | 'template_id'>[],
): Promise<number> => {
	const db = openDatabase()
	let templateId = 0

	await db.withTransactionAsync(async () => {
		const muscleGroups = [...new Set(exercises.map(e => e.muscle_group))].join(',')
		const res = await db.runAsync(
			`INSERT INTO workout_templates (name, description, estimated_duration, muscle_groups, exercises_count)
       VALUES (?, ?, ?, ?, ?)`,
			[template.name, template.description ?? null, template.estimated_duration ?? 60, muscleGroups, exercises.length],
		)
		templateId = res.lastInsertRowId as number

		for (const ex of exercises) {
			await db.runAsync(
				`INSERT INTO template_exercises (template_id, name, muscle_group, order_index, default_sets, default_reps, default_weight)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
				[templateId, ex.name, ex.muscle_group, ex.order_index, ex.default_sets, ex.default_reps, ex.default_weight],
			)
		}
	})

	return templateId
}

export const getTemplates = async (): Promise<WorkoutTemplate[]> => {
	const db = openDatabase()
	const results = await db.getAllAsync('SELECT * FROM workout_templates ORDER BY updated_at DESC')
	return results as WorkoutTemplate[]
}

export const getTemplateById = async (
	id: number,
): Promise<{ template: WorkoutTemplate; exercises: TemplateExercise[] } | null> => {
	const db = openDatabase()
	const rows = await db.getAllAsync('SELECT * FROM workout_templates WHERE id = ?', id)
	if (!rows.length) return null
	const exercises = await db.getAllAsync(
		'SELECT * FROM template_exercises WHERE template_id = ? ORDER BY order_index',
		id,
	)
	return { template: rows[0] as WorkoutTemplate, exercises: exercises as TemplateExercise[] }
}

export const updateTemplate = async (
	id: number,
	template: Partial<WorkoutTemplate>,
	exercises?: Omit<TemplateExercise, 'id' | 'template_id'>[],
): Promise<boolean> => {
	const db = openDatabase()
	await db.withTransactionAsync(async () => {
		const muscleGroups = exercises
			? [...new Set(exercises.map(e => e.muscle_group))].join(',')
			: template.muscle_groups ?? null

		await db.runAsync(
			`UPDATE workout_templates
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           estimated_duration = COALESCE(?, estimated_duration),
           muscle_groups = COALESCE(?, muscle_groups),
           exercises_count = COALESCE(?, exercises_count),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
			[template.name ?? null, template.description ?? null, template.estimated_duration ?? null, muscleGroups, exercises ? exercises.length : null, id],
		)

		if (exercises) {
			await db.runAsync('DELETE FROM template_exercises WHERE template_id = ?', id)
			for (const ex of exercises) {
				await db.runAsync(
					`INSERT INTO template_exercises (template_id, name, muscle_group, order_index, default_sets, default_reps, default_weight)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
					[id, ex.name, ex.muscle_group, ex.order_index, ex.default_sets, ex.default_reps, ex.default_weight],
				)
			}
		}
	})
	return true
}

export const deleteTemplate = async (id: number): Promise<boolean> => {
	const db = openDatabase()
	await db.runAsync('DELETE FROM workout_templates WHERE id = ?', id)
	return true
}

// ========== RECOVERY LOGIC ==========

/**
 * Вычисляет статус восстановления мышцы по дате последней тренировки.
 * Полное восстановление = 72 часа.
 */
// В database.ts
/**
 * Вычисляет статус восстановления мышцы по усталости и времени
 */
export const calculateMuscleRecovery = (
	fatigue: number,
	lastTrainedDate: string | null,
): { status: 'recovered' | 'recovering' | 'needs_rest'; recovery: number } => {
	// Если мышца никогда не тренировалась или тренировалась очень давно
	if (!lastTrainedDate) return { status: 'recovered', recovery: 100 }

	const hoursElapsed = (Date.now() - new Date(lastTrainedDate).getTime()) / 3_600_000

	// Если тренировка была только что (меньше часа назад) и есть усталость
	if (hoursElapsed < 1 && fatigue > 0) {
		return { status: 'needs_rest', recovery: 0 }
	}

	// Восстановление идет со скоростью ~1.4% в час (100% за 72 часа)
	const recoveryFromTime = Math.min(100, (hoursElapsed / 72) * 100)

	// Итоговое восстановление = восстановление по времени - оставшаяся усталость
	const totalRecovery = Math.max(0, Math.min(100, recoveryFromTime - fatigue))

	const status: 'recovered' | 'recovering' | 'needs_rest' =
		totalRecovery >= 95 ? 'recovered' :
			totalRecovery >= 50 ? 'recovering' : 'needs_rest'

	return { status, recovery: Math.round(totalRecovery) }
}

/**
 * Пересчитывает recovery для всех мышц по last_trained и fatigue
 */
export const recalculateAllRecovery = async (): Promise<void> => {
	const db = openDatabase()
	const all = await db.getAllAsync('SELECT * FROM recovery_data') as Array<{
		id: number
		muscle_id: string
		fatigue: number
		last_trained: string
	}>

	for (const m of all) {
		const { status, recovery } = calculateMuscleRecovery(m.fatigue, m.last_trained)
		await db.runAsync(
			'UPDATE recovery_data SET status = ?, recovery = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
			[status, recovery, m.id]
		)
	}
}

// В database.ts - функция для инициализации всех мышц
export const initializeAllMuscles = async (): Promise<void> => {
	const db = openDatabase()
	// Устанавливаем last_trained на 7 дней назад, чтобы мышцы были восстановлены
	const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

	for (const [muscleId, info] of Object.entries(ALL_MUSCLES)) {
		const existing = await db.getAllAsync(
			'SELECT id FROM recovery_data WHERE muscle_id = ?',
			muscleId
		)

		if (existing.length === 0) {
			await db.runAsync(
				`INSERT INTO recovery_data 
         (muscle_id, muscle_name, group_name, status, recovery, fatigue, last_trained)
         VALUES (?, ?, ?, 'recovered', 100, 0, ?)`,
				[muscleId, info.name, info.group, sevenDaysAgo]
			)
		}
	}

	await recalculateAllRecovery()
}

/**
 * Сбрасывает восстановление мышц до 0% после завершения тренировки.
 * Вызывается внутри completeActiveWorkout / createCompletedWorkout.
 */
export const updateRecoveryAfterWorkout = async (
	exercises: Array<{
		name: string
		sets: Array<{ weight: number; reps: number; completed: boolean }>
		primaryFrontMuscles?: string[]
		secondaryFrontMuscles?: string[]
		primaryBackMuscles?: string[]
		secondaryBackMuscles?: string[]
	}>
): Promise<void> => {

	const db = openDatabase()
	const now = new Date().toISOString()

	// Собираем усталость от всех упражнений
	const allFatigue = new Map<string, number>()

	for (const exercise of exercises) {

		// Считаем только выполненные подходы
		const completedSets = exercise.sets.filter(s => s).length
		if (completedSets === 0) continue

		// Рассчитываем интенсивность на основе среднего веса
		const avgWeight = exercise.sets.reduce((sum, s) => sum + s.weight, 0) / exercise.sets.length
		const intensity = Math.min(1.5, Math.max(0.5, avgWeight / 100)) // примерная нормализация

		const fatigue = calculateExerciseFatigue(
			{
				primaryFrontMuscles: exercise.primaryFrontMuscles,
				secondaryFrontMuscles: exercise.secondaryFrontMuscles,
				primaryBackMuscles: exercise.primaryBackMuscles,
				secondaryBackMuscles: exercise.secondaryBackMuscles,
			},
			completedSets,
			intensity,
		)

		fatigue.forEach(f => {
			const current = allFatigue.get(f.muscleId) || 0
			allFatigue.set(f.muscleId, Math.min(current + f.fatigueAmount, 100))
		})
	}

	// Обновляем recovery_data для каждой мышцы
	await db.withTransactionAsync(async () => {
		for (const [muscleId, fatigue] of allFatigue) {
			const muscleInfo = ALL_MUSCLES[muscleId]
			if (!muscleInfo) continue

			// Проверяем, есть ли запись для этой мышцы
			const existing = await db.getAllAsync(
				'SELECT id, fatigue FROM recovery_data WHERE muscle_id = ?',
				muscleId
			)

			if (existing.length > 0) {
				// Обновляем существующую запись
				const currentFatigue = (existing[0] as any).fatigue || 0
				const newFatigue = Math.min(currentFatigue + fatigue, 100)

				await db.runAsync(
					`UPDATE recovery_data 
           SET fatigue = ?, 
               status = 'needs_rest',
               recovery = 0,
               last_trained = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE muscle_id = ?`,
					[newFatigue, now, muscleId]
				)
			} else {
				// Создаем новую запись
				await db.runAsync(
					`INSERT INTO recovery_data 
           (muscle_id, muscle_name, group_name, status, recovery, fatigue, last_trained)
           VALUES (?, ?, ?, 'needs_rest', 0, ?, ?)`,
					[muscleId, muscleInfo.name, muscleInfo.group, fatigue, now]
				)
			}
		}
	})
}

export const checkAndSavePersonalRecords = async (
	exercises: Array<{
		name: string
		muscle_group: string
		sets: Array<{ weight: number; reps: number; completed: boolean }>
	}>,
): Promise<Array<{ exercise: string; weight: string; improvement: string }>> => {
	const newRecords: Array<{ exercise: string; weight: string; improvement: string }> = []

	// Загружаем все существующие рекорды один раз
	const existingRecords = await getPersonalRecords()

	for (const exercise of exercises) {
		const completedSets = exercise.sets.filter(s => s.completed && s.weight > 0)
		if (completedSets.length === 0) continue

		// Максимальный вес в этой тренировке
		const maxWeight = Math.max(...completedSets.map(s => s.weight))

		// Предыдущий рекорд по этому упражнению (по максимальному весу)
		const prevRecord = existingRecords
			.filter(r => r.exercise.toLowerCase() === exercise.name.toLowerCase())
			.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight))[0]

		const prevWeight = prevRecord ? parseFloat(prevRecord.weight) : 0

		// Сохраняем только если превысили предыдущий рекорд
		if (maxWeight > prevWeight) {
			const improvement =
				prevWeight > 0
					? `+${(maxWeight - prevWeight).toFixed(1)} кг`
					: 'Первый рекорд'

			await addPersonalRecord({
				exercise: exercise.name,
				weight: `${maxWeight} кг`,
				date: getCurrentDate(),
				trend: 'up',
				category: 'strength',
				notes: undefined,
				previous_record: prevWeight > 0 ? `${prevWeight} кг` : undefined,
				improvement,
			})

			newRecords.push({
				exercise: exercise.name,
				weight: `${maxWeight} кг`,
				improvement,
			})
		}
	}

	return newRecords
}