import { useDatabase } from '@/app/contexts/database-context'
import type { AppColors } from '@/constants/app-theme'
import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	Alert,
	FlatList,
	Image,
	Modal,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

function parseWeightRepsInput(raw: string): number {
	const t = raw.replace(',', '.').trim()
	if (t === '' || t === '.') return 0
	const n = parseFloat(t)
	if (!Number.isFinite(n)) return 0
	return Math.min(Math.max(n, 0), 999)
}

// Типы
interface ExerciseSet {
	id?: number
	setId?: string // Для совместимости со старым кодом
	setNumber: number
	weight: number
	reps: number
	completed: boolean
}

interface Exercise {
	id?: number
	exerciseId?: string // Для совместимости со старым кодом
	name: string
	muscleGroup: string
	sets: ExerciseSet[]
	collapsed: boolean
}

interface MuscleGroup {
	id: string
	name: string
	image: string
	exercises: string[]
}

// Данные для модального окна
const MUSCLE_GROUPS: MuscleGroup[] = [
	{
		id: 'chest',
		name: 'Грудь',
		image: 'https://cdn-icons-png.flaticon.com/512/3062/3062634.png',
		exercises: [
			'Жим лежа',
			'Жим на наклонной',
			'Разведение гантелей',
			'Бабочка',
			'Отжимания',
		],
	},
	{
		id: 'back',
		name: 'Спина',
		image: 'https://cdn-icons-png.flaticon.com/512/3062/3062647.png',
		exercises: [
			'Тяга верхнего блока',
			'Тяга штанги в наклоне',
			'Тяга гантели',
			'Подтягивания',
			'Гиперэкстензия',
		],
	},
	{
		id: 'legs',
		name: 'Ноги',
		image: 'https://cdn-icons-png.flaticon.com/512/3062/3062653.png',
		exercises: [
			'Приседания',
			'Жим ногами',
			'Выпады',
			'Разгибания ног',
			'Сгибания ног',
		],
	},
	{
		id: 'shoulders',
		name: 'Плечи',
		image: 'https://cdn-icons-png.flaticon.com/512/3062/3062645.png',
		exercises: [
			'Жим штанги стоя',
			'Махи гантелями',
			'Тяга к подбородку',
			'Разведение в наклоне',
		],
	},
	{
		id: 'arms',
		name: 'Руки',
		image: 'https://cdn-icons-png.flaticon.com/512/3062/3062636.png',
		exercises: [
			'Сгибания рук со штангой',
			'Французский жим',
			'Молотки',
			'Разгибания на блоке',
		],
	},
	{
		id: 'core',
		name: 'Пресс',
		image: 'https://cdn-icons-png.flaticon.com/512/3062/3062639.png',
		exercises: ['Скручивания', 'Планка', 'Подъемы ног', 'Русский твист'],
	},
]

// Подкомпонент для строки подхода
interface SetRowProps {
	set: ExerciseSet
	exerciseId: number
	onComplete: (exerciseId: number, setId: number) => void
	onUpdate: (
		exerciseId: number,
		setId: number,
		field: 'weight' | 'reps',
		value: string,
	) => void
	onRemove: (exerciseId: number, setId: number) => void
}

const SetRow: React.FC<SetRowProps> = React.memo(
	({ set, exerciseId, onComplete, onUpdate, onRemove }) => {
		const { colors: COLORS } = useAppTheme()
		const styles = useMemo(() => makeStyles(COLORS), [COLORS])
		const setId = set.id || parseInt(set.setId || '0')

		const [weightText, setWeightText] = useState(
			() => (set.weight === 0 ? '' : String(set.weight)),
		)
		const [repsText, setRepsText] = useState(() => (set.reps === 0 ? '' : String(set.reps)))
		const weightFocused = useRef(false)
		const repsFocused = useRef(false)

		useEffect(() => {
			if (!weightFocused.current) {
				setWeightText(set.weight === 0 ? '' : String(set.weight))
			}
		}, [set.weight, set.id])

		useEffect(() => {
			if (!repsFocused.current) {
				setRepsText(set.reps === 0 ? '' : String(set.reps))
			}
		}, [set.reps, set.id])

		const flushBoth = useCallback(async () => {
			await onUpdate(exerciseId, setId, 'weight', weightText)
			await onUpdate(exerciseId, setId, 'reps', repsText)
		}, [exerciseId, setId, onUpdate, weightText, repsText])

		return (
			<View style={styles.setRow}>
				<Text style={styles.setNumber}>{set.setNumber}</Text>

				<TextInput
					style={[styles.input, set.completed && styles.inputCompleted]}
					value={weightText}
					onChangeText={setWeightText}
					onFocus={() => {
						weightFocused.current = true
					}}
					onBlur={() => {
						weightFocused.current = false
						void onUpdate(exerciseId, setId, 'weight', weightText)
					}}
					keyboardType='decimal-pad'
					editable={!set.completed}
					placeholderTextColor={COLORS.textSecondary}
					maxLength={10}
				/>

				<TextInput
					style={[styles.input, set.completed && styles.inputCompleted]}
					value={repsText}
					onChangeText={setRepsText}
					onFocus={() => {
						repsFocused.current = true
					}}
					onBlur={() => {
						repsFocused.current = false
						void onUpdate(exerciseId, setId, 'reps', repsText)
					}}
					keyboardType='decimal-pad'
					editable={!set.completed}
					placeholderTextColor={COLORS.textSecondary}
					maxLength={10}
				/>

				<TouchableOpacity
					style={[styles.checkbox, set.completed && styles.checkboxCompleted]}
					onPress={() => {
						void (async () => {
							await flushBoth()
							await onComplete(exerciseId, setId)
						})()
					}}
					activeOpacity={0.7}
				>
					{set.completed && (
						<Ionicons name='checkmark' size={16} color='#000' />
					)}
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.deleteButton}
					onPress={() => onRemove(exerciseId, setId)}
					activeOpacity={0.7}
				>
					<Ionicons name='trash-outline' size={18} color={COLORS.error} />
				</TouchableOpacity>
			</View>
		)
	},
)

// Подкомпонент для упражнения
interface ExerciseItemProps {
	exercise: Exercise
	onToggleCollapse: (id: number) => void
	onSetComplete: (exerciseId: number, setId: number) => void
	onUpdateSet: (
		exerciseId: number,
		setId: number,
		field: 'weight' | 'reps',
		value: string,
	) => void
	onRemoveSet: (exerciseId: number, setId: number) => void
	onAddSet: (exerciseId: number) => void
}

const ExerciseSetsHeader = () => {
	const { t } = useLanguage()
	const { colors: COLORS } = useAppTheme()
	const styles = useMemo(() => makeStyles(COLORS), [COLORS])
	return (
		<View style={styles.setsHeader}>
			<Text style={{ ...styles.setHeaderText, width: 20 }}>#</Text>
			<Text style={{ ...styles.setHeaderText, width: 80 }}>{t('templates', 'weight')} ({t('records', 'kg')})</Text>
			<Text style={{ ...styles.setHeaderText, width: 80 }}>{t('templates', 'reps')}</Text>
			<Text style={styles.setHeaderText}></Text>
			<Text style={styles.setHeaderText}></Text>
		</View>
	)
}

const ExerciseItem: React.FC<ExerciseItemProps> = React.memo(
	({
		exercise,
		onToggleCollapse,
		onSetComplete,
		onUpdateSet,
		onRemoveSet,
		onAddSet,
	}) => {
		const { t } = useLanguage()
		const { colors: COLORS } = useAppTheme()
		const styles = useMemo(() => makeStyles(COLORS), [COLORS])
		const exerciseId = exercise.id || parseInt(exercise.exerciseId || '0')

		return (
			<View style={styles.exerciseCard}>
				<TouchableOpacity
					style={styles.exerciseHeader}
					onPress={() => onToggleCollapse(exerciseId)}
					activeOpacity={0.7}
				>
					<View style={styles.exerciseHeaderContent}>
						<Ionicons
							name={exercise.collapsed ? 'chevron-down' : 'chevron-up'}
							size={20}
							color={COLORS.primary}
							style={styles.collapseIcon}
						/>
						<View>
							<Text style={styles.exerciseName}>{exercise.name}</Text>
							<Text style={styles.exerciseMuscle}>{exercise.muscleGroup}</Text>
						</View>
					</View>
					<TouchableOpacity activeOpacity={0.7}>
						<Ionicons
							name='ellipsis-vertical'
							size={20}
							color={COLORS.textSecondary}
						/>
					</TouchableOpacity>
				</TouchableOpacity>

				{!exercise.collapsed && (
					<>
					<ExerciseSetsHeader />

						{exercise.sets.map(set => (
							<SetRow
								key={set.id || set.setId}
								set={set}
								exerciseId={exerciseId}
								onComplete={onSetComplete}
								onUpdate={onUpdateSet}
								onRemove={onRemoveSet}
							/>
						))}

						<TouchableOpacity
						style={styles.addSetButton}
						onPress={() => onAddSet(exerciseId)}
						activeOpacity={0.7}
					>
						<Ionicons name='add' size={20} color={COLORS.primary} />
						<Text style={styles.addSetText}>{t('workout', 'addSet')}</Text>
					</TouchableOpacity>
					</>
				)}
			</View>
		)
	},
)

// Основной компонент
export default function WorkoutScreen() {
	const router = useRouter()
	const { t } = useLanguage()
	const { colors: COLORS } = useAppTheme()
	const styles = useMemo(() => makeStyles(COLORS), [COLORS])
	const params = useLocalSearchParams()
	const workoutId = params.id ? parseInt(params.id as string) : 0
	const {
		getActiveWorkout,
		updateWorkout,
		getWorkoutExercises,
		getExerciseSets,
		updateSet,
		addSetToExercise,
		deleteSet,
		addExerciseToWorkout,
		deleteExercise,
		completeWorkout,
		getActiveExercises,
		getActiveSets,
	} = useDatabase()

	const [workoutName, setWorkoutName] = useState('')
	const [exercises, setExercises] = useState<Exercise[]>([])
	const [timer, setTimer] = useState(0)
	const [isTimerRunning, setIsTimerRunning] = useState(false)
	const [showAddExerciseModal, setShowAddExerciseModal] = useState(false)
	const [selectedMuscleGroup, setSelectedMuscleGroup] =
		useState<MuscleGroup | null>(null)
	const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
	const [imageError, setImageError] = useState<{ [key: string]: boolean }>({})
	const [notes, setNotes] = useState('')

	// Загрузка данных тренировки
	useEffect(() => {
		if (workoutId) {
			loadWorkoutData()
		}
	}, [workoutId])

	const loadWorkoutData = async () => {
		try {
			// Загружаем данные тренировки
			const workout = await getActiveWorkout(workoutId)
			if (workout) {
				setWorkoutName(workout.name)
				setTimer(workout.duration || 0)
			}

			// Загружаем упражнения
			const activeExercises = await getActiveExercises(workoutId)
			const exercisesWithSets = await Promise.all(
				activeExercises.map(async (ex: any) => {
					const sets = await getActiveSets(ex.id)
					return {
						id: ex.id,
						name: ex.name,
						muscleGroup: ex.muscle_group,
						sets: sets.map((set: any, index: number) => ({
							id: set.id,
							setNumber: set.set_number,
							weight: set.weight,
							reps: set.reps,
							completed: set.completed,
						})),
						collapsed: ex.collapsed,
					}
				}),
			)
			setExercises(exercisesWithSets)
		} catch (error) {
			console.error('Error loading workout data:', error)
			Alert.alert(t('common', 'error'), t('common', 'unknownError'))
		}
	}

	// Таймер
	useEffect(() => {
		let interval: NodeJS.Timeout
		if (isTimerRunning) {
			interval = setInterval(() => {
				setTimer(prev => prev + 1)
			}, 1000)
		}
		return () => clearInterval(interval)
	}, [isTimerRunning])

	// Автосохранение тренировки
	useEffect(() => {
		const saveWorkoutDuration = async () => {
			try {
				await updateWorkout(workoutId, { duration: timer })
			} catch (error) {
				console.error('Error saving workout duration:', error)
			}
		}

		const debouncedSave = setTimeout(saveWorkoutDuration, 5000)
		return () => clearTimeout(debouncedSave)
	}, [timer, workoutId])

	// Мемоизированные вычисления
	const { totalCompleted, totalSets } = useMemo(() => {
		const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
		const totalCompleted = exercises.reduce(
			(sum, ex) => sum + ex.sets.filter(set => set.completed).length,
			0,
		)
		return { totalCompleted, totalSets }
	}, [exercises])

	const formatTime = useCallback((seconds: number) => {
		const hrs = Math.floor(seconds / 3600)
		const mins = Math.floor((seconds % 3600) / 60)
		const secs = seconds % 60
		return `${hrs.toString().padStart(2, '0')}:${mins
			.toString()
			.padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
	}, [])

	// Обработчики с useCallback
	const toggleExerciseCollapse = useCallback(async (exerciseId: number) => {
		setExercises(prev =>
			prev.map(exercise =>
				exercise.id === exerciseId
					? { ...exercise, collapsed: !exercise.collapsed }
					: exercise,
			),
		)
	}, [])

	const handleSetComplete = useCallback(
		async (exerciseId: number, setId: number) => {
			try {
				await updateSet(setId, { completed: true })
				await loadWorkoutData() // Перезагружаем данные
			} catch (error) {
				console.error('Error completing set:', error)
				Alert.alert(t('common', 'error'), t('common', 'unknownError'))
			}
		},
		[t],
	)

	const handleUpdateSet = useCallback(
		async (
			exerciseId: number,
			setId: number,
			field: 'weight' | 'reps',
			value: string,
		) => {
			try {
				const validatedValue = parseWeightRepsInput(value)

				await updateSet(setId, { [field]: validatedValue })
				await loadWorkoutData() // Перезагружаем данные
			} catch (error) {
				console.error('Error updating set:', error)
				Alert.alert(t('common', 'error'), t('common', 'unknownError'))
			}
		},
		[t],
	)

	const handleRemoveSet = useCallback(
		async (exerciseId: number, setId: number) => {
			Alert.alert(t('workout', 'deleteSet'), t('workout', 'deleteSetMsg'), [
				{ text: t('common', 'cancel'), style: 'cancel' },
				{
					text: t('common', 'delete'),
					style: 'destructive',
					onPress: async () => {
						try {
							await deleteSet(setId)
							await loadWorkoutData()
						} catch (error) {
							console.error('Error deleting set:', error)
							Alert.alert(t('common', 'error'), t('common', 'unknownError'))
						}
					},
				},
			])
		},
		[t],
	)

	const handleAddSet = useCallback(
		async (exerciseId: number) => {
			try {
				const maxSetNumber =
					exercises
						.find(ex => ex.id === exerciseId)
						?.sets.reduce((max, set) => Math.max(max, set.setNumber), 0) || 0

				await addSetToExercise(exerciseId, {
					set_number: maxSetNumber + 1,
					weight: 0,
					reps: 0,
					completed: false,
				})
				await loadWorkoutData() // Перезагружаем данные
			} catch (error) {
				console.error('Error adding set:', error)
				Alert.alert(t('common', 'error'), t('common', 'unknownError'))
			}
		},
		[exercises, t],
	)

	const handleFinishWorkout = useCallback(async () => {
		Alert.alert(
			t('workout', 'finishTitle'),
			`${exercises.length} ${t('workout', 'exercises')} · ${totalSets} ${t('workout', 'sets')}`,
			[
				{ text: t('common', 'cancel'), style: 'cancel' },
				{
					text: t('workout', 'finish'),
					onPress: async () => {
						try {
							if (notes.trim()) {
								await updateWorkout(workoutId, { notes: notes.trim() })
							}
							const completedId = await completeWorkout(workoutId)
							Alert.alert(t('common', 'success'), `#${completedId}`)
							router.back()
						} catch (error) {
							console.error('Error completing workout:', error)
							Alert.alert(t('common', 'error'), t('common', 'unknownError'))
						}
					},
				},
			],
		)
	}, [exercises, totalSets, notes, workoutId, router, t])

	const handleAddExercise = useCallback(async () => {
		if (selectedExercise && selectedMuscleGroup) {
			try {
				await addExerciseToWorkout(workoutId, {
					name: selectedExercise,
					muscle_group: selectedMuscleGroup.name,
					order_index: exercises.length + 1,
					collapsed: false,
				})

				setShowAddExerciseModal(false)
				setSelectedMuscleGroup(null)
				setSelectedExercise(null)
				await loadWorkoutData() // Перезагружаем данные
			} catch (error) {
				console.error('Error adding exercise:', error)
				Alert.alert(t('common', 'error'), t('common', 'unknownError'))
			}
		}
	}, [selectedExercise, selectedMuscleGroup, workoutId, exercises.length, t])

	const handleRemoveExercise = useCallback(async (exerciseId: number) => {
		Alert.alert(t('workout', 'deleteExercise'), t('workout', 'deleteExerciseMsg'), [
			{ text: t('common', 'cancel'), style: 'cancel' },
			{
				text: t('common', 'delete'),
				style: 'destructive',
				onPress: async () => {
					try {
						await deleteExercise(exerciseId)
						await loadWorkoutData()
					} catch (error) {
						console.error('Error deleting exercise:', error)
						Alert.alert(t('common', 'error'), t('common', 'unknownError'))
					}
				},
			},
		])
	}, [t])

	// Рендер элементов для FlatList
	const renderExerciseItem = useCallback(
		({ item }: { item: Exercise }) => (
			<ExerciseItem
				exercise={item}
				onToggleCollapse={toggleExerciseCollapse}
				onSetComplete={handleSetComplete}
				onUpdateSet={handleUpdateSet}
				onRemoveSet={handleRemoveSet}
				onAddSet={handleAddSet}
			/>
		),
		[
			toggleExerciseCollapse,
			handleSetComplete,
			handleUpdateSet,
			handleRemoveSet,
			handleAddSet,
		],
	)

	const renderMuscleGroupItem = useCallback(
		({ item }: { item: MuscleGroup }) => (
			<TouchableOpacity
				style={styles.muscleGroupCard}
				onPress={() => setSelectedMuscleGroup(item)}
				activeOpacity={0.7}
			>
				<View style={styles.muscleGroupImageContainer}>
					{imageError[item.id] ? (
						<Ionicons name='barbell-outline' size={40} color={COLORS.primary} />
					) : (
						<Image
							source={{ uri: item.image }}
							style={styles.muscleGroupImage}
							onError={() =>
								setImageError(prev => ({ ...prev, [item.id]: true }))
							}
						/>
					)}
				</View>
				<Text style={styles.muscleGroupName}>{item.name}</Text>
			<Text style={styles.muscleGroupExercisesCount}>
				{item.exercises.length} {t('workout', 'exercises')}
				</Text>
			</TouchableOpacity>
		),
		[imageError, styles, COLORS.primary, t],
	)

	const renderExerciseListItem = useCallback(
		({ item }: { item: string }) => (
			<TouchableOpacity
				style={styles.exerciseItem}
				onPress={() => setSelectedExercise(item)}
				activeOpacity={0.7}
			>
				<Text style={styles.exerciseItemName}>{item}</Text>
				<Ionicons
					name='chevron-forward'
					size={20}
					color={COLORS.textSecondary}
				/>
			</TouchableOpacity>
		),
		[styles, COLORS.textSecondary],
	)

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButton}
					activeOpacity={0.7}
				>
					<Ionicons name='close' size={28} color={COLORS.textSecondary} />
				</TouchableOpacity>
			<Text style={styles.headerTitle}>{t('workout', 'title')}</Text>
			<TouchableOpacity
				onPress={handleFinishWorkout}
				style={styles.finishButton}
				activeOpacity={0.7}
			>
				<Text style={styles.finishButtonText}>{t('common', 'done')}</Text>
			</TouchableOpacity>
			</View>

			<View style={styles.workoutInfo}>
				<TextInput
					style={styles.workoutName}
					value={workoutName}
					onChangeText={async text => {
						setWorkoutName(text)
						try {
							await updateWorkout(workoutId, { name: text })
						} catch (error) {
							console.error('Error updating workout name:', error)
						}
					}}
					placeholder={t('workout', 'namePlaceholder')}
					placeholderTextColor={COLORS.textSecondary}
				/>

				<View style={styles.statsRow}>
					<View style={styles.stat}>
						<Text style={styles.statNumber}>
							{totalCompleted}/{totalSets}
						</Text>
						<Text style={styles.statLabel}>{t('workout', 'sets')}</Text>
					</View>
					<View style={styles.stat}>
						<Text style={styles.statNumber}>{exercises.length}</Text>
						<Text style={styles.statLabel}>{t('workout', 'exercises')}</Text>
					</View>
					<View style={styles.stat}>
						<Text style={styles.statNumber}>{formatTime(timer)}</Text>
						<Text style={styles.statLabel}>{t('workout', 'time')}</Text>
					</View>
				</View>

				<TouchableOpacity
					style={styles.timerButton}
					onPress={() => setIsTimerRunning(!isTimerRunning)}
					activeOpacity={0.7}
				>
					<Ionicons
						name={isTimerRunning ? 'pause' : 'play'}
						size={20}
						color={COLORS.primary}
					/>
					<Text style={styles.timerButtonText}>
						{isTimerRunning ? t('workout', 'pause') : t('workout', 'start')}
					</Text>
				</TouchableOpacity>
			</View>

			<FlatList
				data={exercises}
				renderItem={renderExerciseItem}
				keyExtractor={item =>
					item.id?.toString() || item.exerciseId || Math.random().toString()
				}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.exercisesList}
				initialNumToRender={5}
				maxToRenderPerBatch={10}
				windowSize={10}
				ListFooterComponent={
					<>
						<TouchableOpacity
							style={styles.addExerciseButton}
							onPress={() => setShowAddExerciseModal(true)}
							activeOpacity={0.7}
						>
							<Ionicons
								name='add-circle-outline'
								size={24}
								color={COLORS.primary}
							/>
							<Text style={styles.addExerciseText}>{t('workout', 'addExercise')}</Text>
						</TouchableOpacity>

						<View style={styles.notesSection}>
						<Text style={styles.notesTitle}>{t('workout', 'notes')}</Text>
						<TextInput
							style={styles.notesInput}
							placeholder={t('workout', 'notesPlaceholder')}
								placeholderTextColor={COLORS.textSecondary}
								multiline
								numberOfLines={4}
								textAlignVertical='top'
								value={notes}
								onChangeText={setNotes}
							/>
						</View>
					</>
				}
			/>

			{/* Модальное окно добавления упражнения */}
			<Modal
				visible={showAddExerciseModal}
				animationType='slide'
				transparent={true}
				onRequestClose={() => setShowAddExerciseModal(false)}
				statusBarTranslucent
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
						<Text style={styles.modalTitle}>
							{selectedMuscleGroup
								? selectedExercise
									? t('workout', 'confirmExercise')
									: `${t('workout', 'exercisesFor')} ${selectedMuscleGroup.name}`
								: t('exercises', 'selectMuscle')}
						</Text>
							<TouchableOpacity
								onPress={() => {
									if (selectedExercise) {
										setSelectedExercise(null)
									} else if (selectedMuscleGroup) {
										setSelectedMuscleGroup(null)
									} else {
										setShowAddExerciseModal(false)
									}
								}}
								style={styles.modalCloseButton}
								activeOpacity={0.7}
							>
								<Ionicons name='close' size={24} color={COLORS.textSecondary} />
							</TouchableOpacity>
						</View>

						{!selectedMuscleGroup ? (
							// Шаг 1: Выбор группы мышц
							<FlatList
								data={MUSCLE_GROUPS}
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.muscleGroupsList}
								renderItem={renderMuscleGroupItem}
								keyExtractor={item => item.id}
								initialNumToRender={3}
								windowSize={5}
							/>
						) : !selectedExercise ? (
							// Шаг 2: Выбор упражнения
							<FlatList
								data={selectedMuscleGroup.exercises}
								contentContainerStyle={styles.exercisesListModal}
								renderItem={renderExerciseListItem}
								keyExtractor={item => item}
								initialNumToRender={10}
								maxToRenderPerBatch={20}
								windowSize={21}
							/>
						) : (
							// Шаг 3: Подтверждение
							<View style={styles.confirmationContainer}>
							<Text style={styles.confirmationTitle}>{t('workout', 'selectedExercise')}:</Text>
							<View style={styles.selectedExerciseCard}>
								<Text style={styles.selectedExerciseName}>
									{selectedExercise}
								</Text>
								<Text style={styles.selectedExerciseGroup}>
									{t('exercises', 'workingMuscles')}: {selectedMuscleGroup?.name}
								</Text>
							</View>

							<TouchableOpacity
								style={styles.confirmButton}
								onPress={handleAddExercise}
								activeOpacity={0.7}
							>
								<Text style={styles.confirmButtonText}>
									{t('workout', 'addExercise')}
								</Text>
							</TouchableOpacity>
							</View>
						)}
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	)
}

function makeStyles(C: AppColors) {
	return StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: C.background,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingVertical: 16,
		backgroundColor: C.card,
		borderBottomWidth: 1,
		borderBottomColor: C.border,
	},
	backButton: {
		padding: 4,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: C.text,
	},
	finishButton: {
		padding: 8,
	},
	finishButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: C.primary,
	},
	workoutInfo: {
		backgroundColor: C.card,
		padding: 20,
		marginBottom: 12,
		marginTop: 8,
		borderRadius: 16,
		marginHorizontal: 16,
	},
	workoutName: {
		fontSize: 20,
		fontWeight: 'bold',
		color: C.text,
		marginBottom: 20,
		backgroundColor: C.inputBg,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: C.border,
	},
	statsRow: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 20,
	},
	stat: {
		alignItems: 'center',
	},
	statNumber: {
		fontSize: 18,
		fontWeight: 'bold',
		color: C.primary,
		marginBottom: 6,
	},
	statLabel: {
		fontSize: 12,
		color: C.textSecondary,
	},
	timerButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(52, 199, 89, 0.1)',
		paddingVertical: 14,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: 'rgba(52, 199, 89, 0.2)',
	},
	timerButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: C.primary,
		marginLeft: 8,
	},
	exercisesList: {
		paddingVertical: 10,
	},
	exerciseCard: {
		backgroundColor: C.card,
		marginBottom: 12,
		padding: 16,
		marginHorizontal: 16,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: C.border,
	},
	exerciseHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	exerciseHeaderContent: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	collapseIcon: {
		marginRight: 12,
	},
	exerciseName: {
		fontSize: 18,
		fontWeight: 'bold',
		color: C.text,
	},
	exerciseMuscle: {
		fontSize: 14,
		color: C.textSecondary,
		marginTop: 4,
	},
	setsHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 8,
		marginBottom: 12,
	},
	setHeaderText: {
		fontSize: 12,
		fontWeight: '600',
		color: C.textSecondary,
		width: 60,
		textAlign: 'center',
	},
	setRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: C.border,
	},
	setNumber: {
		fontSize: 16,
		fontWeight: '600',
		color: C.text,
		width: 30,
		textAlign: 'center',
	},
	input: {
		width: 80,
		height: 50,
		borderWidth: 1,
		borderColor: C.border,
		borderRadius: 8,
		textAlign: 'center',
		fontSize: 16,
		color: C.text,
		backgroundColor: C.inputBg,
	},
	inputCompleted: {
		backgroundColor: C.card,
		color: C.textSecondary,
		borderColor: C.primary,
	},
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: C.border,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: C.inputBg,
	},
	checkboxCompleted: {
		backgroundColor: C.primary,
		borderColor: C.primary,
	},
	deleteButton: {
		width: 60,
		alignItems: 'center',
		justifyContent: 'center',
	},
	addSetButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
		marginTop: 8,
		borderRadius: 8,
		backgroundColor: 'rgba(52, 199, 89, 0.1)',
		borderWidth: 1,
		borderColor: 'rgba(52, 199, 89, 0.2)',
	},
	addSetText: {
		fontSize: 14,
		color: C.primary,
		fontWeight: '600',
		marginLeft: 8,
	},
	addExerciseButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: C.card,
		padding: 16,
		marginBottom: 12,
		marginHorizontal: 16,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: C.border,
	},
	addExerciseText: {
		fontSize: 16,
		color: C.primary,
		fontWeight: '600',
		marginLeft: 8,
	},
	notesSection: {
		backgroundColor: C.card,
		padding: 20,
		marginBottom: 20,
		marginHorizontal: 16,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: C.border,
	},
	notesTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: C.text,
		marginBottom: 12,
	},
	notesInput: {
		borderWidth: 1,
		borderColor: C.border,
		borderRadius: 12,
		padding: 16,
		fontSize: 14,
		color: C.text,
		minHeight: 100,
		backgroundColor: C.inputBg,
	},
	// Стили для модального окна
	modalOverlay: {
		flex: 1,
		backgroundColor: C.overlay,
		justifyContent: 'flex-end',
	},
	modalContent: {
		backgroundColor: C.modalSurface,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		padding: 20,
		maxHeight: '80%',
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: C.text,
		flex: 1,
	},
	modalCloseButton: {
		padding: 4,
	},
	muscleGroupsList: {
		paddingVertical: 10,
	},
	muscleGroupCard: {
		width: 120,
		backgroundColor: C.cardLight,
		borderRadius: 16,
		padding: 16,
		marginRight: 12,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: C.border,
	},
	muscleGroupImageContainer: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: C.background,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 12,
		overflow: 'hidden',
	},
	muscleGroupImage: {
		width: 40,
		height: 40,
		tintColor: C.primary,
	},
	muscleGroupName: {
		fontSize: 16,
		fontWeight: '600',
		color: C.text,
		marginBottom: 4,
		textAlign: 'center',
	},
	muscleGroupExercisesCount: {
		fontSize: 12,
		color: C.textSecondary,
		textAlign: 'center',
	},
	exercisesListModal: {
		paddingVertical: 10,
	},
	exerciseItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 16,
		paddingHorizontal: 16,
		backgroundColor: C.cardLight,
		borderRadius: 12,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: C.border,
	},
	exerciseItemName: {
		fontSize: 16,
		color: C.text,
		flex: 1,
	},
	confirmationContainer: {
		padding: 20,
		alignItems: 'center',
	},
	confirmationTitle: {
		fontSize: 18,
		color: C.text,
		marginBottom: 20,
	},
	selectedExerciseCard: {
		backgroundColor: C.cardLight,
		borderRadius: 16,
		padding: 20,
		width: '100%',
		borderWidth: 1,
		borderColor: C.primary,
		marginBottom: 30,
	},
	selectedExerciseName: {
		fontSize: 20,
		fontWeight: 'bold',
		color: C.primary,
		marginBottom: 8,
		textAlign: 'center',
	},
	selectedExerciseGroup: {
		fontSize: 14,
		color: C.textSecondary,
		textAlign: 'center',
	},
	confirmButton: {
		backgroundColor: C.primary,
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 12,
		width: '100%',
		alignItems: 'center',
	},
	confirmButtonText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#000',
	},
	})
}