// contexts/DatabaseContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage'
import { muscle_groups } from '@/constants/muscle-groups'
import {
	addActiveExercise,
	addActiveSet,
	addBodyMeasurement,
	addPersonalRecord,
	addWorkout,
	BodyMeasurement,
	completeActiveWorkout,
	createActiveWorkout,
	createTemplate,
	deleteActiveExercise,
	deleteActiveSet,
	deleteTemplate,
	getActiveExercisesFromDb,
	getActiveSetsFromDb,
	getActiveWorkouts,
	getBodyMeasurements,
	getExerciseHistory,
	getExercisePersonalRecords,
	getFullWorkoutDetails, // Добавляем импорт
	getLatestBodyMeasurements,
	getPersonalRecords,
	getRecoveryData,
	getTemplateById,
	getTemplates,
	getUserProfile,
	getWorkouts,
	getWorkoutStats,
	initActiveWorkoutTables,
	initDatabase,
	initializeAllMuscles,
	initTemplatesTables,
	markAsSynced,
	openDatabase,
	PersonalRecord,
	recalculateAllRecovery,
	RecoveryData,
	softDeleteWorkout,
	TemplateExercise,
	updateActiveExerciseCollapsed,
	updateActiveSet,
	updateActiveWorkout,
	updateRecoveryAfterWorkout,
	updateTemplate,
	UserProfile, // Добавляем импорт
	Workout,
	WorkoutStats,
	WorkoutTemplate,
} from '@/scripts/database'
import { api } from '@/services/api'
import * as Network from 'expo-network'
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react'
import { Alert } from 'react-native'
import { hasActivePremium, useAuth } from './auth-context'

interface DatabaseContextType {
	isInitialized: boolean
	workouts: Workout[]
	stats: WorkoutStats | null
	personalRecords: PersonalRecord[]
	bodyMeasurements: BodyMeasurement[]
	recoveryData: RecoveryData[]
	userProfile: UserProfile | null
	activeWorkouts: any[]
	isLoading: boolean
	templates: WorkoutTemplate[] // ← добавить

	syncWithServer: (isPremium: boolean) => Promise<void>

	// Методы для работы с тренировками
	refreshWorkouts: (filter?: string) => Promise<void>
	createNewWorkout: (name: string) => Promise<number>
	completeWorkout: (workoutData: CompleteWorkoutData) => Promise<number>
	getWorkoutDetails: (id: number) => Promise<any>
	deleteWorkout: (id: number) => Promise<boolean>

	// Методы для активных тренировок
	refreshActiveWorkouts: () => Promise<void>
	addExerciseToWorkout: (workoutId: number, exercise: any) => Promise<number>
	addSetToExercise: (exerciseId: number, set: any) => Promise<number>
	updateSet: (setId: number, updates: any) => Promise<boolean>
	deleteSet: (setId: number) => Promise<boolean>
	deleteExercise: (exerciseId: number) => Promise<boolean>
	updateWorkout: (workoutId: number, updates: any) => Promise<boolean>
	getWorkoutExercises: (workoutId: number) => Promise<any[]>
	getExerciseSets: (exerciseId: number) => Promise<any[]>

	performInitialSync: (isPremium: boolean) => Promise<void>
	syncUnsyncedData: (isPremium: boolean) => Promise<void>
	/** Скачать данные с сервера и смёржить в SQLite без спиннера и алертов (для экранов статистики). */
	pullServerDataSilent: (isPremium: boolean) => Promise<void>

	// Шаблоны
	refreshTemplates: () => Promise<void>
	createWorkoutTemplate: (
		template: Omit<WorkoutTemplate, 'id' | 'created_at' | 'updated_at'>,
		exercises: Omit<TemplateExercise, 'id' | 'template_id'>[],
	) => Promise<number>
	getWorkoutTemplate: (id: number) => Promise<{
		template: WorkoutTemplate
		exercises: TemplateExercise[]
	} | null>
	editWorkoutTemplate: (
		id: number,
		template: Partial<WorkoutTemplate>,
		exercises?: Omit<TemplateExercise, 'id' | 'template_id'>[],
	) => Promise<boolean>
	removeTemplate: (id: number) => Promise<boolean>
	refreshRecoveryWithRecalc: () => Promise<void>

	// Методы для статистики
	refreshStats: () => Promise<void>
	refreshPersonalRecords: () => Promise<void>
	refreshBodyMeasurements: () => Promise<void>
	refreshRecoveryData: () => Promise<void>
	refreshUserProfile: () => Promise<void>

	getActiveWorkout: (id: number) => Promise<any>
	getActiveExercises: (workoutId: number) => Promise<any[]>
	getActiveSets: (exerciseId: number) => Promise<any[]>

	fetchExerciseHistory: (exerciseName: string, limit?: number) => Promise<any[]>
	getExerciseRecords: (exerciseName: string) => Promise<any>
	calculateOneRepMax: (weight: number, reps: number) => number

	updateExerciseCollapsed: (
		exerciseId: number,
		collapsed: boolean,
	) => Promise<boolean>
}

interface ExerciseSetData {
	set_number: number
	weight: number
	reps: number
	completed: boolean
}

interface ExerciseData {
	name: string
	muscle_group: string
	order_index: number
	sets: ExerciseSetData[]
}

interface CompleteWorkoutData {
	name: string
	duration: number
	notes: string
	exercises: ExerciseData[]
}

export const SYNC_META_KEY = '@fitex_sync_meta'

export interface SyncHistoryEntry {
	at: string
	result: 'success' | 'error'
	workouts: number
	measurements: number
	records: number
}

export interface SyncMeta {
	lastSyncAt: string | null
	lastSyncResult: 'success' | 'error' | 'never'
	workoutsSynced: number
	measurementsSynced: number
	recordsSynced: number
	history: SyncHistoryEntry[]
}

export const saveSyncMeta = async (
	result: 'success' | 'error',
	counts: { workouts: number; measurements: number; records: number },
) => {
	try {
		const raw = await AsyncStorage.getItem(SYNC_META_KEY)
		const prev: SyncMeta = raw
			? JSON.parse(raw)
			: { lastSyncAt: null, lastSyncResult: 'never', workoutsSynced: 0, measurementsSynced: 0, recordsSynced: 0, history: [] }

		const entry: SyncHistoryEntry = {
			at: new Date().toISOString(),
			result,
			workouts: counts.workouts,
			measurements: counts.measurements,
			records: counts.records,
		}

		const meta: SyncMeta = {
			lastSyncAt: entry.at,
			lastSyncResult: result,
			workoutsSynced: counts.workouts,
			measurementsSynced: counts.measurements,
			recordsSynced: counts.records,
			history: [entry, ...(prev.history ?? [])].slice(0, 10),
		}
		await AsyncStorage.setItem(SYNC_META_KEY, JSON.stringify(meta))
	} catch {}
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(
	undefined,
)

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [templates, setTemplates] = useState<WorkoutTemplate[]>([])

	const [isInitialized, setIsInitialized] = useState(false)
	const [workouts, setWorkouts] = useState<Workout[]>([])
	const [stats, setStats] = useState<WorkoutStats | null>(null)
	const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([])
	const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>(
		[],
	)
	const [recoveryData, setRecoveryData] = useState<RecoveryData[]>([])
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
	const [activeWorkouts, setActiveWorkouts] = useState<any[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [currentFilter, setCurrentFilter] = useState<string>('all')

	// Инициализация базы данных
	const initializeDatabase = useCallback(async () => {
		if (isInitialized) return // ✅ не инициализировать повторно

		try {
			setIsLoading(true)
			await initDatabase()
			await initActiveWorkoutTables()
			await initTemplatesTables()
			await initializeAllMuscles()
			setIsInitialized(true)
		} catch (error) {
			console.error('Error initializing database:', error)
		} finally {
			setIsLoading(false)
		}
	}, [isInitialized])

	// Обновляем функцию refreshStats в контексте:
	const refreshStats = useCallback(async () => {
		try {
			const statsData = await getWorkoutStats()
			setStats(statsData)
		} catch (error) {
			console.error('Error refreshing stats:', error)
			throw error
		}
	}, [])

	// Обновляем функцию refreshBodyMeasurements:
	const refreshBodyMeasurements = useCallback(async () => {
		try {
			const data = await getLatestBodyMeasurements()
			setBodyMeasurements(data)
		} catch (error) {
			console.error('Error refreshing body measurements:', error)
			throw error
		}
	}, [])

	// Обновление всех данных
	const refreshAllData = useCallback(async () => {
		try {
			await Promise.all([
				refreshStats(),
				refreshPersonalRecords(),
				refreshBodyMeasurements(),
				refreshRecoveryData(),
				refreshUserProfile(),
				refreshActiveWorkouts(),
			])
		} catch (error) {
			console.error('Error refreshing all data:', error)
		}
	}, [])

	// В теле DatabaseProvider добавьте:
	const fetchExerciseHistory = useCallback(
		async (exerciseName: string, limit: number = 5) => {
			try {
				return await getExerciseHistory(exerciseName, limit)
			} catch (error) {
				console.error('Error fetching exercise history:', error)
				throw error
			}
		},
		[],
	)

	const { user } = useAuth()

	// Добавить в DatabaseProvider после useAuth():
	const hasSyncedOnStartup = useRef(false)

	// Отправка несинхронизированных данных — вызывается при старте
	const syncUnsyncedData = useCallback(async (isPremium: boolean) => {
		if (!isPremium) return

		const networkState = await Network.getNetworkStateAsync()
		if (!networkState.isConnected || !networkState.isInternetReachable) return

		try {
			const unsyncedWorkouts = await getWorkouts(undefined, undefined, {
				synced: false,
			})
			const unsyncedMeasurements = await getBodyMeasurements({ synced: false })
			const unsyncedRecords = await getPersonalRecords({ synced: false })

			const hasUnsynced =
				unsyncedWorkouts.length > 0 ||
				unsyncedMeasurements.length > 0 ||
				unsyncedRecords.length > 0

			if (!hasUnsynced) return

			setIsLoading(true)

			await api.post('/sync/upload', {
				workouts: unsyncedWorkouts,
				bodyMeasurements: unsyncedMeasurements,
				personalRecords: unsyncedRecords,
			})

			await markAsSynced(
				'workouts',
				unsyncedWorkouts
					.map(w => w.id)
					.filter((id): id is number => id !== undefined),
			)
			await markAsSynced(
				'body_measurements',
				unsyncedMeasurements
					.map(m => m.id)
					.filter((id): id is number => id !== undefined),
			)
			await markAsSynced(
				'personal_records',
				unsyncedRecords
					.map(r => r.id)
					.filter((id): id is number => id !== undefined),
			)

			console.log('Auto-sync completed')
		} catch (error) {
			console.error('Auto-sync error:', error)
		} finally {
			setIsLoading(false)
		}
	}, [])

	// DatabaseContext.tsx

	const mergeServerData = useCallback(
		async (serverData: {
			workouts?: any[]
			bodyMeasurements?: any[]
			personalRecords?: any[]
		}) => {
			const db = openDatabase()

			await db.withTransactionAsync(async () => {
				// ===== ТРЕНИРОВКИ =====
				for (const serverWorkout of serverData.workouts ?? []) {
					const localId = serverWorkout.localId

					if (serverWorkout.isDeleted) {
						await db.runAsync('DELETE FROM workouts WHERE id = ?', localId)
						continue
					}

					const local = await db.getFirstAsync<{ id: number; synced: number }>(
						'SELECT id, synced FROM workouts WHERE id = ?',
						localId,
					)

					if (!local) {
						// Записи нет локально — вставляем с сервера
						await db.runAsync(
							`
          INSERT INTO workouts
            (id, date, time, duration, type, muscle_groups, exercises_count, sets_count, volume, notes, rating, synced)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `,
							[
								localId,
								serverWorkout.date,
								serverWorkout.time,
								serverWorkout.duration,
								serverWorkout.type,
								serverWorkout.muscleGroups ?? serverWorkout.muscle_groups,
								serverWorkout.exercisesCount ?? serverWorkout.exercises_count,
								serverWorkout.setsCount ?? serverWorkout.sets_count,
								serverWorkout.volume,
								serverWorkout.notes ?? null,
								serverWorkout.rating ?? null,
							],
						)
					} else if (local.synced === 1) {
						// Локальная версия уже синхронизирована — обновляем данными с сервера
						await db.runAsync(
							`
          UPDATE workouts SET
            date = ?, time = ?, duration = ?, type = ?,
            muscle_groups = ?, exercises_count = ?, sets_count = ?,
            volume = ?, notes = ?, rating = ?, synced = 1
          WHERE id = ?
        `,
							[
								serverWorkout.date,
								serverWorkout.time,
								serverWorkout.duration,
								serverWorkout.type,
								serverWorkout.muscleGroups ?? serverWorkout.muscle_groups,
								serverWorkout.exercisesCount ?? serverWorkout.exercises_count,
								serverWorkout.setsCount ?? serverWorkout.sets_count,
								serverWorkout.volume,
								serverWorkout.notes ?? null,
								serverWorkout.rating ?? null,
								localId,
							],
						)
					}
					// synced === 0 — локальные изменения не трогаем, они уйдут в upload
				}

				// ===== ЗАМЕРЫ ТЕЛА =====
				for (const serverMeasurement of serverData.bodyMeasurements ?? []) {
					const localId = serverMeasurement.localId

					if (serverMeasurement.isDeleted) {
						await db.runAsync(
							'DELETE FROM body_measurements WHERE id = ?',
							localId,
						)
						continue
					}

					const local = await db.getFirstAsync<{ id: number; synced: number }>(
						'SELECT id, synced FROM body_measurements WHERE id = ?',
						localId,
					)

					if (!local) {
						await db.runAsync(
							`
          INSERT INTO body_measurements (id, name, value, unit, date, trend, goal, synced)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `,
							[
								localId,
								serverMeasurement.name,
								serverMeasurement.value,
								serverMeasurement.unit,
								serverMeasurement.date,
								serverMeasurement.trend,
								serverMeasurement.goal ?? null,
							],
						)
					} else if (local.synced === 1) {
						await db.runAsync(
							`
          UPDATE body_measurements SET
            name = ?, value = ?, unit = ?, date = ?, trend = ?, goal = ?, synced = 1
          WHERE id = ?
        `,
							[
								serverMeasurement.name,
								serverMeasurement.value,
								serverMeasurement.unit,
								serverMeasurement.date,
								serverMeasurement.trend,
								serverMeasurement.goal ?? null,
								localId,
							],
						)
					}
				}

				// ===== ЛИЧНЫЕ РЕКОРДЫ =====
				for (const serverRecord of serverData.personalRecords ?? []) {
					const localId = serverRecord.localId

					if (serverRecord.isDeleted) {
						await db.runAsync(
							'DELETE FROM personal_records WHERE id = ?',
							localId,
						)
						continue
					}

					const local = await db.getFirstAsync<{ id: number; synced: number }>(
						'SELECT id, synced FROM personal_records WHERE id = ?',
						localId,
					)

					if (!local) {
						await db.runAsync(
							`
          INSERT INTO personal_records
            (id, exercise, weight, date, trend, category, notes, previous_record, improvement, synced)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `,
							[
								localId,
								serverRecord.exercise,
								serverRecord.weight,
								serverRecord.date,
								serverRecord.trend,
								serverRecord.category,
								serverRecord.notes ?? null,
								serverRecord.previousRecord ??
									serverRecord.previous_record ??
									null,
								serverRecord.improvement ?? null,
							],
						)
					} else if (local.synced === 1) {
						await db.runAsync(
							`
          UPDATE personal_records SET
            exercise = ?, weight = ?, date = ?, trend = ?, category = ?,
            notes = ?, previous_record = ?, improvement = ?, synced = 1
          WHERE id = ?
        `,
							[
								serverRecord.exercise,
								serverRecord.weight,
								serverRecord.date,
								serverRecord.trend,
								serverRecord.category,
								serverRecord.notes ?? null,
								serverRecord.previousRecord ??
									serverRecord.previous_record ??
									null,
								serverRecord.improvement ?? null,
								localId,
							],
						)
					}
				}
			})
		},
		[],
	)

	// Полная двусторонняя синхронизация — при логине или смене аккаунта
	const performInitialSync = useCallback(
		async (isPremium: boolean) => {
			if (!isPremium) return

			const networkState = await Network.getNetworkStateAsync()
			if (!networkState.isConnected) return

			try {
				setIsLoading(true)

				// Шаг 1: Скачиваем всё с сервера и мержим
				const { data: serverData } = await api.get('/sync/download')
				await mergeServerData(serverData)

				// Шаг 2: Отправляем локальные несинхронизированные данные
				const unsyncedWorkouts = await getWorkouts(undefined, undefined, {
					synced: false,
				})
				const unsyncedMeasurements = await getBodyMeasurements({
					synced: false,
				})
				const unsyncedRecords = await getPersonalRecords({ synced: false })

				const hasUnsynced =
					unsyncedWorkouts.length > 0 ||
					unsyncedMeasurements.length > 0 ||
					unsyncedRecords.length > 0

				if (hasUnsynced) {
					await api.post('/sync/upload', {
						workouts: unsyncedWorkouts,
						bodyMeasurements: unsyncedMeasurements,
						personalRecords: unsyncedRecords,
					})

					await markAsSynced(
						'workouts',
						unsyncedWorkouts
							.map(w => w.id)
							.filter((id): id is number => id !== undefined),
					)
					await markAsSynced(
						'body_measurements',
						unsyncedMeasurements
							.map(m => m.id)
							.filter((id): id is number => id !== undefined),
					)
					await markAsSynced(
						'personal_records',
						unsyncedRecords
							.map(r => r.id)
							.filter((id): id is number => id !== undefined),
					)
				}

			// Шаг 3: Обновляем UI
			await refreshAllData()
			await saveSyncMeta('success', {
				workouts: unsyncedWorkouts.length,
				measurements: unsyncedMeasurements.length,
				records: unsyncedRecords.length,
			})
		} catch (error) {
			console.error('Initial sync error:', error)
			await saveSyncMeta('error', { workouts: 0, measurements: 0, records: 0 })
		} finally {
			setIsLoading(false)
		}
	},
	[mergeServerData, refreshAllData],
)

	const pullServerDataSilent = useCallback(
		async (isPremium: boolean) => {
			if (!isPremium) return
			const networkState = await Network.getNetworkStateAsync()
			if (!networkState.isConnected || !networkState.isInternetReachable) return
			try {
				const { data: serverData } = await api.get('/sync/download')
				await mergeServerData(serverData)
			} catch (e) {
				console.warn('[Sync] pullServerDataSilent failed', e)
			}
		},
		[mergeServerData],
	)

	// Ручная синхронизация (кнопка в профиле)
	const syncWithServer = useCallback(
		async (isPremium: boolean) => {
			if (!isPremium) {
				Alert.alert('Только для премиум', 'Оформите подписку для синхронизации')
				return
			}

			const networkState = await Network.getNetworkStateAsync()
			if (!networkState.isConnected || !networkState.isInternetReachable) {
				Alert.alert(
					'Нет интернета',
					'Подключитесь к интернету для синхронизации',
				)
				return
			}

			setIsLoading(true)
			try {
				// Скачиваем и мержим
				const { data: serverData } = await api.get('/sync/download')
				await mergeServerData(serverData)

				// Загружаем все локальные данные на сервер
				const allWorkouts = await getWorkouts()
				const allMeasurements = await getBodyMeasurements()
				const allRecords = await getPersonalRecords()

				await api.post('/sync/upload', {
					workouts: allWorkouts,
					bodyMeasurements: allMeasurements,
					personalRecords: allRecords,
				})

				// Помечаем всё как синхронизированное
				await markAsSynced(
					'workouts',
					allWorkouts
						.map(w => w.id)
						.filter((id): id is number => id !== undefined),
				)
				await markAsSynced(
					'body_measurements',
					allMeasurements
						.map(m => m.id)
						.filter((id): id is number => id !== undefined),
				)
				await markAsSynced(
					'personal_records',
					allRecords
						.map(r => r.id)
						.filter((id): id is number => id !== undefined),
				)

			await refreshAllData()
			await saveSyncMeta('success', {
				workouts: allWorkouts.length,
				measurements: allMeasurements.length,
				records: allRecords.length,
			})
			Alert.alert('Синхронизация завершена')
		} catch (error) {
			console.error('Sync error', error)
			await saveSyncMeta('error', { workouts: 0, measurements: 0, records: 0 })
			Alert.alert(
				'Ошибка синхронизации',
				'Не удалось синхронизировать данные',
			)
		} finally {
			setIsLoading(false)
		}
	},
	[mergeServerData, refreshAllData],
)

	const importServerData = useCallback(
		async (serverData: {
			workouts?: any[]
			bodyMeasurements?: any[]
			personalRecords?: any[]
		}) => {
			const db = openDatabase()

			try {
				await db.withTransactionAsync(async () => {
					// Очищаем таблицы перед импортом
					await db.runAsync('DELETE FROM workouts')
					await db.runAsync('DELETE FROM body_measurements')
					await db.runAsync('DELETE FROM personal_records')

					// Импорт тренировок
					if (serverData.workouts && serverData.workouts.length > 0) {
						for (const workout of serverData.workouts) {
							await addWorkout(workout)
						}
					}

					// Импорт замеров тела
					if (
						serverData.bodyMeasurements &&
						serverData.bodyMeasurements.length > 0
					) {
						for (const measurement of serverData.bodyMeasurements) {
							await addBodyMeasurement(measurement)
						}
					}

					// Импорт личных рекордов
					if (
						serverData.personalRecords &&
						serverData.personalRecords.length > 0
					) {
						for (const record of serverData.personalRecords) {
							await addPersonalRecord(record)
						}
					}
				})

				console.log('Серверные данные успешно импортированы в локальную БД')
			} catch (error) {
				console.error('Ошибка при импорте данных с сервера:', error)
				throw error
				// или можно здесь показать уведомление пользователю, например:
				// Alert.alert('Ошибка', 'Не удалось загрузить данные с сервера')
			}
		},
		[], // зависимости useCallback — если addWorkout и другие функции стабильны, можно оставить пустым
	)

	const getExerciseRecords = useCallback(async (exerciseName: string) => {
		try {
			return await getExercisePersonalRecords(exerciseName)
		} catch (error) {
			console.error('Error getting exercise records:', error)
			throw error
		}
	}, [])

	const calculateOneRepMax = useCallback(
		(weight: number, reps: number): number => {
			if (weight <= 0 || reps <= 0) return 0
			if (reps === 1) return weight
			// Epley formula: 1RM = weight × (1 + reps / 30)
			return Math.round(weight * (1 + reps / 30))
		},
		[],
	)

	// Методы для тренировок
	const refreshWorkouts = useCallback(async (filter?: string) => {
		try {
			if (filter) setCurrentFilter(filter)

			const data = await getWorkouts(
				undefined,
				filter === 'all' ? undefined : filter,
			)
			setWorkouts(data)
			return data
		} catch (error) {
			console.error('Error refreshing workouts:', error)
			throw error
		}
	}, [])

	const getActiveWorkout = useCallback(async (id: number) => {
		try {
			return await getActiveWorkout(id)
		} catch (error) {
			console.error('Error getting active workout:', error)
			throw error
		}
	}, [])

	const getActiveExercises = useCallback(async (workoutId: number) => {
		try {
			return await getActiveExercisesFromDb(workoutId)
		} catch (error) {
			console.error('Error getting active exercises:', error)
			throw error
		}
	}, [])

	const getActiveSets = useCallback(async (exerciseId: number) => {
		try {
			return await getActiveSetsFromDb(exerciseId)
		} catch (error) {
			console.error('Error getting active sets:', error)
			throw error
		}
	}, [])

	const updateExerciseCollapsed = useCallback(
		async (exerciseId: number, collapsed: boolean) => {
			try {
				const result = await updateActiveExerciseCollapsed(
					exerciseId,
					collapsed,
				)
				return result
			} catch (error) {
				console.error('Error updating exercise collapsed state:', error)
				throw error
			}
		},
		[],
	)

	const refreshTemplates = useCallback(async () => {
		try {
			const data = await getTemplates()
			setTemplates(data)
		} catch (error) {
			console.error('Error refreshing templates:', error)
		}
	}, [])

	const createWorkoutTemplate = useCallback(
		async (
			template: Omit<WorkoutTemplate, 'id' | 'created_at' | 'updated_at'>,
			exercises: Omit<TemplateExercise, 'id' | 'template_id'>[],
		) => {
			const id = await createTemplate(template, exercises)
			await refreshTemplates()
			return id
		},
		[],
	)

	const getWorkoutTemplate = useCallback(async (id: number) => {
		return await getTemplateById(id)
	}, [])

	const editWorkoutTemplate = useCallback(
		async (
			id: number,
			template: Partial<WorkoutTemplate>,
			exercises?: Omit<TemplateExercise, 'id' | 'template_id'>[],
		) => {
			const result = await updateTemplate(id, template, exercises)
			await refreshTemplates()
			return result
		},
		[],
	)

	const removeTemplate = useCallback(async (id: number) => {
		const result = await deleteTemplate(id)
		await refreshTemplates()
		return result
	}, [])

	/**
	 * Пересчитать восстановление всех мышц и обновить UI.
	 * Вызывать при входе на экран Recovery.
	 */
	const refreshRecoveryWithRecalc = useCallback(async () => {
		await recalculateAllRecovery()
		await refreshRecoveryData()
	}, [])

	const createNewWorkout = useCallback(async (name: string) => {
		try {
			const id = await createActiveWorkout(name)
			await refreshActiveWorkouts()
			return id
		} catch (error) {
			console.error('Error creating workout:', error)
			throw error
		}
	}, [])

	// В DatabaseContext.tsx
	const completeWorkout = useCallback(
		async (workoutData: CompleteWorkoutData) => {
			try {
				const workoutId = await completeActiveWorkout(workoutData)

				// Получаем детальную информацию об упражнениях для расчета усталости
				const exercisesWithDetails = workoutData.exercises.map(ex => {
					// Находим детали упражнения из MUSCLE_GROUPS
					for (const group of muscle_groups) {
						for (const subgroup of group.subgroups) {
							const found = subgroup.exercises.find(e => e.name === ex.name)
							if (found) {
								console.log('Found')
								console.log(found)

								return {
									...ex,
									primaryFrontMuscles: found.primaryFrontMuscles,
									secondaryFrontMuscles: found.secondaryFrontMuscles,
									primaryBackMuscles: found.primaryBackMuscles,
									secondaryBackMuscles: found.secondaryBackMuscles,
								}
							}
						}
					}

					return ex
				})

				console.log(exercisesWithDetails)
				// Обновляем восстановление с учетом усталости каждой мышцы
				await updateRecoveryAfterWorkout(exercisesWithDetails)
				await refreshAllData()

				return workoutId
			} catch (error) {
				console.error('Error completing workout:', error)
				throw error
			}
		},
		[refreshAllData],
	)

	const getWorkoutDetails = useCallback(async (id: number) => {
		try {
			return await getFullWorkoutDetails(id)
		} catch (error) {
			console.error('Error getting workout details:', error)
			throw error
		}
	}, [])

	const deleteWorkout = useCallback(async (id: number) => {
		try {
			await softDeleteWorkout(id) // помечаем deleted_at, synced = 0
			await refreshAllData()
			return true
		} catch (error) {
			console.error('Error deleting workout:', error)
			throw error
		}
	}, [])

	// Методы для активных тренировок
	const refreshActiveWorkouts = useCallback(async () => {
		try {
			const data = await getActiveWorkouts()
			setActiveWorkouts(data)
		} catch (error) {
			console.error('Error refreshing active workouts:', error)
			throw error
		}
	}, [])

	const addExerciseToWorkout = useCallback(
		async (workoutId: number, exercise: any) => {
			try {
				const id = await addActiveExercise(workoutId, exercise)
				await refreshActiveWorkouts()
				return id
			} catch (error) {
				console.error('Error adding exercise:', error)
				throw error
			}
		},
		[],
	)

	const addSetToExercise = useCallback(async (exerciseId: number, set: any) => {
		try {
			const id = await addActiveSet(exerciseId, set)
			console.log('ID IN: ' + id)
			return id
		} catch (error) {
			console.error('Error adding set:', error)
			throw error
		}
	}, [])

	const updateSet = useCallback(async (setId: number, updates: any) => {
		try {
			return await updateActiveSet(setId, updates)
		} catch (error) {
			console.error('Error updating set:', error)
			throw error
		}
	}, [])

	const deleteSet = useCallback(async (setId: number) => {
		try {
			return await deleteActiveSet(setId)
		} catch (error) {
			console.error('Error deleting set:', error)
			throw error
		}
	}, [])

	const deleteExercise = useCallback(async (exerciseId: number) => {
		try {
			return await deleteActiveExercise(exerciseId)
		} catch (error) {
			console.error('Error deleting exercise:', error)
			throw error
		}
	}, [])

	const updateWorkout = useCallback(async (workoutId: number, updates: any) => {
		try {
			return await updateActiveWorkout(workoutId, updates)
		} catch (error) {
			console.error('Error updating workout:', error)
			throw error
		}
	}, [])

	const getWorkoutExercises = useCallback(async (workoutId: number) => {
		try {
			return await getActiveExercises(workoutId)
		} catch (error) {
			console.error('Error getting exercises:', error)
			throw error
		}
	}, [])

	const getExerciseSets = useCallback(async (exerciseId: number) => {
		try {
			return await getActiveSets(exerciseId)
		} catch (error) {
			console.error('Error getting sets:', error)
			throw error
		}
	}, [])

	const refreshPersonalRecords = useCallback(async () => {
		try {
			const data = await getPersonalRecords()
			setPersonalRecords(data)
		} catch (error) {
			console.error('Error refreshing personal records:', error)
			throw error
		}
	}, [])

	const refreshRecoveryData = useCallback(async () => {
		try {
			const data = await getRecoveryData()
			setRecoveryData(data)
		} catch (error) {
			console.error('Error refreshing recovery data:', error)
			throw error
		}
	}, [])

	const refreshUserProfile = useCallback(async () => {
		try {
			const data = await getUserProfile()
			setUserProfile(data)
		} catch (error) {
			console.error('Error refreshing user profile:', error)
			throw error
		}
	}, [])

	// Инициализация при монтировании
	useEffect(() => {
		initializeDatabase()
	}, [initializeDatabase])

	// Автосинхронизация при первом входе (после инициализации БД и появления user)
	useEffect(() => {
		if (!user || !isInitialized || hasSyncedOnStartup.current) return
		hasSyncedOnStartup.current = true
		performInitialSync(hasActivePremium(user))
	}, [user?.id, isInitialized, performInitialSync])

	// Обновляем статистику при изменении тренировок
	useEffect(() => {
		if (workouts.length > 0) {
			refreshStats()
		}
	}, [workouts, refreshStats])

	const value = {
		isInitialized,
		workouts,
		stats,
		personalRecords,
		bodyMeasurements,
		recoveryData,
		userProfile,
		activeWorkouts,
		isLoading,

		// Методы
		refreshWorkouts,
		createNewWorkout,
		completeWorkout,
		getWorkoutDetails,
		deleteWorkout,

		refreshActiveWorkouts,
		addExerciseToWorkout,
		addSetToExercise,
		updateSet,
		deleteSet,
		deleteExercise,
		updateWorkout,
		getWorkoutExercises,
		getExerciseSets,

		templates,
		refreshTemplates,
		createWorkoutTemplate,
		getWorkoutTemplate,
		editWorkoutTemplate,
		removeTemplate,
		refreshRecoveryWithRecalc,

		refreshStats,
		refreshPersonalRecords,
		refreshBodyMeasurements,
		refreshRecoveryData,
		refreshUserProfile,

		getActiveWorkout,
		getActiveExercises,
		getActiveSets,
		updateExerciseCollapsed,

		fetchExerciseHistory,
		getExerciseRecords,
		calculateOneRepMax,
		syncWithServer,
		performInitialSync,
		syncUnsyncedData,
		pullServerDataSilent,
	}

	return (
		<DatabaseContext.Provider value={value}>
			{children}
		</DatabaseContext.Provider>
	)
}

export const useDatabase = () => {
	const context = useContext(DatabaseContext)
	if (!context) {
		throw new Error('useDatabase must be used within DatabaseProvider')
	}
	return context
}
