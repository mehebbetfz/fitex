import { useDatabase } from '@/app/contexts/database-context'
import { ExerciseDetailModal } from '@/app/modals/exercise-detail-modal'
import ExerciseHistoryModal from '@/app/modals/exercise-history-modal'
import { ExerciseSelectionModal } from '@/app/modals/exercise-selection.modal'
import {
	ExerciseFormItem,
	TemplateFormData,
} from '@/app/screens/create-template.screen'
import {
	manBackMuscleGroupParts,
	manFrontMuscleGroupParts,
} from '@/constants/images'
import { muscle_groups } from '@/constants/muscle-groups'
import { TemplateExercise, WorkoutTemplate } from '@/scripts/database'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
	Alert,
	AppState,
	Dimensions,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const WORKOUT_START_TIME_KEY = '@workout_start_time'
const WORKOUT_ACTIVE_KEY = '@workout_active'

const COLORS = {
	green: '#1cd22eff',
	primary: '#34C759',
	primaryDark: '#2CAE4E',
	background: '#000',
	card: '#1C1C1E',
	cardLight: '#2C2C2E',
	border: '#3A3A3C',
	text: '#FFFFFF',
	textSecondary: '#8E8E93',
	error: '#FF3B30',
	warning: '#FF9500',
	success: '#34C759',
	info: '#5AC8FA',
} as const

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface ExerciseSet {
	id?: number
	setNumber: number
	weight: number
	reps: number
	completed: boolean
}

interface Exercise {
	id?: number
	name: string
	muscleGroup: string
	sets: ExerciseSet[]
	collapsed: boolean
	order_index: number
}

interface ExerciseDetail {
	id: string
	name: string
	description: string
	image: any
	imagePosition?: any
	images?: any[]
	videoUrl?: string
	primaryMuscles: string[]
	secondaryMuscles: string[]
	primaryFrontMuscles: string[]
	secondaryFrontMuscles: string[]
	primaryBackMuscles: string[]
	secondaryBackMuscles: string[]
	tips: string[]
	equipment: string[]
	difficulty: 'Начинающий' | 'Средний' | 'Продвинутый'
}

const MUSCLE_GROUPS = muscle_groups

const MUSCLE_FRONT_DATA = [
	{
		id: 'chest',
		name: 'Грудь',
		status: 'recovering',
		recovery: 65,
		color: '#FF6B6B',
		lastTrained: '2 дня назад',
		muscleImages: [
			'leftPectoralisMajor',
			'rightPectoralisMajor',
			'leftPectoralisMinor',
			'rightPectoralisMinor',
			'rightSerratusAnterior',
			'leftSerratusAnterior',
		],
		icon: manFrontMuscleGroupParts.rectoralFull,
	},
	{
		id: 'press',
		name: 'Пресс',
		status: 'recovered',
		recovery: 100,
		color: '#4ECDC4',
		lastTrained: '4 дня назад',
		muscleImages: [
			'upperAbs',
			'lowerAbs',
			'upperMiddleAbs',
			'lowerMiddleAbs',
			'leftExternalOblique',
			'rightExternalOblique',
			'leftInternalOblique',
			'rightInternalOblique',
			'leftTransversusAbdominis',
			'rightTransversusAbdominis',
		],
		icon: manFrontMuscleGroupParts.pressFull,
	},
	{
		id: 'arms',
		name: 'Бицепс',
		status: 'recovering',
		recovery: 80,
		color: '#45B7D1',
		lastTrained: '3 дня назад',
		muscleImages: [
			'leftLongBiceps',
			'rightLongBiceps',
			'leftShortBiceps',
			'rightShortBiceps',
		],
		icon: manFrontMuscleGroupParts.bicepsFull,
	},
	{
		id: 'deltoids',
		name: 'Плечи',
		status: 'recovered',
		recovery: 100,
		color: '#96CEB4',
		lastTrained: '5 дней назад',
		muscleImages: [
			'leftFrontDeltoid',
			'rightFrontDeltoid',
			'leftMiddleDeltoid',
			'rightMiddleDeltoid',
		],
		icon: manFrontMuscleGroupParts.deltoidsFull,
	},
	{
		id: 'legs',
		name: 'Ноги',
		status: 'needs_rest',
		recovery: 25,
		color: '#FFEAA7',
		lastTrained: '1 день назад',
		muscleImages: [
			'leftVastusLateralis',
			'rightVastusLateralis',
			'leftVastusMedialis',
			'rightVastusMedialis',
			'leftVastusInternedius',
			'rightVastusInternedius',
			'leftGastrocnemius',
			'rightGastrocnemius',
			'leftTibialisAnterior',
			'rightTibialisAnterior',
			'rightGluteusMedius',
			'leftGluteusMedius',
		],
		icon: manFrontMuscleGroupParts.upperLegFull,
	},
]

const MUSCLE_BACK_DATA = [
	{
		id: '1',
		name: 'Ноги',
		position: {
			left: '-100%',
			top: '-280%',
		},
		muscleImages: [
			'leftBiceosFemoris',
			'leftGastrocnemius',
			'leftSemitendinosus',
			'rightBiceosFemoris',
			'rightGastrocnemius',
			'rightSemitendinosus',
		],
		icon: manBackMuscleGroupParts.deltoidFull,
	},
	{
		id: '2',
		name: 'Предплечья',
		position: {
			left: '-100%',
			top: '-220%',
		},
		muscleImages: [
			'leftFlexorDigitorumProfundus',
			'leftFlexorPollicisLongus',
			'rightFlexorDigitorumProfundus',
			'rightFlexorPollicisLongus',
		],
		icon: manBackMuscleGroupParts.internalOblique,
	},
	{
		id: '3',
		name: 'Ягодицы',
		position: {
			left: '-100%',
			top: '-240%',
		},
		muscleImages: [
			'leftGluteusMaximus',
			'leftGluteusMedius',
			'leftInternalOblique',
			'rightGluteusMaximus',
			'rightGluteusMedius',
			'rightInternalOblique',
		],
		icon: manBackMuscleGroupParts.forearmFull,
	},
	{
		id: '4',
		name: 'Спина',
		position: {
			left: '-100%',
			top: '-180%',
		},
		muscleImages: [
			'leftIntraspinatus',
			'leftLatissimusDorsi',
			'leftThoracolumbarFascia',
			'rightIntraspinatus',
			'rightLatissimusDorsi',
			'rightThoracolumbarFascia',
		],
		icon: manBackMuscleGroupParts.deltoidFull,
	},
	{
		id: '5',
		name: 'Трапеции',
		position: {
			left: '-100%',
			top: '-150%',
		},
		muscleImages: [
			'leftLowerTrapezius',
			'leftUpperTrapezius',
			'rightLowerTrapezius',
			'rightUpperTrapezius',
		],
		icon: manBackMuscleGroupParts.trapeziusFull,
	},
	{
		id: '6',
		name: 'Плечи',
		position: {
			left: '-70%',
			top: '-150%',
		},
		muscleImages: ['leftRearDeltoid', 'rightRearDeltoid'],
		icon: manBackMuscleGroupParts.upperLegFull,
	},
	{
		id: '7',
		name: 'Трицепс',
		position: {
			left: '-100%',
			top: '-200%',
		},
		muscleImages: ['leftTriceps', 'rightTriceps'],
		icon: manBackMuscleGroupParts.triceps,
	},
]

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
		return (
			<View style={styles.setRow}>
				<View style={styles.setNumberContainer}>
					<Text style={styles.setNumber}>{set.setNumber}</Text>
				</View>

				<View style={styles.setInputContainer}>
					<TextInput
						style={[
							styles.input,
							set.completed && styles.inputCompleted,
							styles.weightInput,
						]}
						value={set.weight === 0 ? '' : set.weight.toString()}
						onChangeText={value => {
							if (set.id) onUpdate(exerciseId, set.id, 'weight', value)
						}}
						keyboardType='numeric'
						placeholder='0'
						placeholderTextColor={COLORS.textSecondary}
					/>
					<Text style={styles.inputLabel}>кг</Text>
				</View>

				<View style={styles.setInputContainer}>
					<TextInput
						style={[
							styles.input,
							set.completed && styles.inputCompleted,
							styles.repsInput,
						]}
						value={set.reps === 0 ? '' : set.reps.toString()}
						onChangeText={value => {
							if (set.id) onUpdate(exerciseId, set.id, 'reps', value)
						}}
						keyboardType='numeric'
						placeholder='0'
						placeholderTextColor={COLORS.textSecondary}
					/>
				</View>

				<TouchableOpacity
					style={[styles.checkbox, set.completed && styles.checkboxCompleted]}
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
						if (set.id) onComplete(exerciseId, set.id)
					}}
					activeOpacity={0.6}
				>
					{set.completed && (
						<Ionicons name='checkmark' size={16} color={COLORS.background} />
					)}
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.deleteButton}
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
						if (set.id) onRemove(exerciseId, set.id)
					}}
					activeOpacity={0.6}
				>
					<Ionicons name='close' size={18} color={COLORS.error} />
				</TouchableOpacity>
			</View>
		)
	},
)

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
	onRemoveExercise: (exerciseId: number) => void
	onShowHistory?: () => void
	onShowExerciseDetails: (exerciseName: string) => ExerciseDetail | null
}

const ExerciseItem: React.FC<ExerciseItemProps> = React.memo(
	({
		exercise,
		onToggleCollapse,
		onSetComplete,
		onUpdateSet,
		onRemoveSet,
		onAddSet,
		onRemoveExercise,
		onShowHistory,
		onShowExerciseDetails,
	}) => {
		const [showHistoryModal, setShowHistoryModal] = useState(false)
		const [showDetailsModal, setShowDetailsModal] = useState(false)
		const [exerciseDetail, setExerciseDetail] = useState<ExerciseDetail | null>(
			null,
		)

		const completedSets = exercise.sets.filter(set => set.completed).length
		const totalSets = exercise.sets.length

		const handleShowDetails = () => {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
			const detail = onShowExerciseDetails(exercise.name)
			setExerciseDetail(detail)
			setShowDetailsModal(true)
		}

		return (
			<View style={styles.exerciseCard}>
				<View style={styles.exerciseHeader}>
					<TouchableOpacity
						style={styles.exerciseHeaderLeft}
						onPress={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
							if (exercise.id) onToggleCollapse(exercise.id)
						}}
						activeOpacity={0.7}
					>
						<Ionicons
							name={exercise.collapsed ? 'chevron-down' : 'chevron-up'}
							size={20}
							color={COLORS.primary}
						/>
						<View style={styles.exerciseInfo}>
							<Text style={styles.exerciseName}>{exercise.name}</Text>
							<View style={styles.exerciseMeta}>
								<View style={{ flexDirection: 'row' }}>
									<View style={styles.muscleGroupTag}>
										<Text style={styles.muscleGroupText}>
											{exercise.muscleGroup}
										</Text>
									</View>
									<View style={styles.setsIndicator}>
										<Ionicons
											name='barbell-outline'
											size={12}
											color={COLORS.textSecondary}
										/>
										<Text style={styles.setsText}>
											{completedSets}/{totalSets}
										</Text>
									</View>
								</View>

								<View style={styles.exerciseHeaderRight}>
									<TouchableOpacity
										style={styles.infoButton}
										onPress={handleShowDetails}
										activeOpacity={0.7}
									>
										<Ionicons
											name='information-circle-outline'
											size={23}
											color={COLORS.warning}
										/>
									</TouchableOpacity>

									{exercise.sets.length > 0 && (
										<TouchableOpacity
											style={styles.historyButton}
											onPress={() => {
												Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
												setShowHistoryModal(true)
											}}
											activeOpacity={0.7}
										>
											<Ionicons
												name='time-outline'
												size={20}
												color={COLORS.textSecondary}
											/>
										</TouchableOpacity>
									)}

									<TouchableOpacity
										style={styles.deleteExerciseButton}
										onPress={() => {
											Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
											if (exercise.id) {
												onRemoveExercise(exercise.id)
											}
										}}
										activeOpacity={0.7}
									>
										<Ionicons
											name='trash-outline'
											size={20}
											color={COLORS.error}
										/>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</TouchableOpacity>
				</View>

				<ExerciseHistoryModal
					visible={showHistoryModal}
					onClose={() => setShowHistoryModal(false)}
					exerciseName={exercise.name}
					currentSets={exercise.sets}
				/>

				{showDetailsModal && (
					<ExerciseDetailModal
						visible={showDetailsModal}
						onClose={() => setShowDetailsModal(false)}
						exerciseDetail={exerciseDetail}
					/>
				)}

				{!exercise.collapsed && (
					<>
						<View style={styles.setsContainer}>
							<View style={styles.setsHeader}>
								<Text
									style={{
										...styles.setHeaderText,
										...styles.setNumberContainer,
										width: 30,
									}}
								>
									#
								</Text>
								<Text style={{ ...styles.setHeaderText, width: 70 }}>Вес</Text>
								<Text style={{ ...styles.setHeaderText, width: 30 }}></Text>
								<Text style={{ ...styles.setHeaderText, width: 70 }}>
									Повт.
								</Text>
								<Text style={{ ...styles.setHeaderText, width: 40 }}>✓</Text>
								<Text style={{ ...styles.setHeaderText, width: 20 }}>x</Text>
							</View>

							{exercise.sets.map(set => (
								<SetRow
									key={`${exercise.id}-${set.id || set.setNumber}`} // Более стабильный ключ
									set={set}
									exerciseId={exercise.id!}
									onComplete={onSetComplete}
									onUpdate={onUpdateSet}
									onRemove={onRemoveSet}
								/>
							))}
						</View>

						<TouchableOpacity
							style={styles.addSetButton}
							onPress={() => {
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
								if (exercise.id) {
									onAddSet(exercise.id)
								}
							}}
							activeOpacity={0.7}
						>
							<Ionicons
								name='add-circle-outline'
								size={20}
								color={COLORS.primary}
							/>
							<Text style={styles.addSetText}>Добавить подход</Text>
						</TouchableOpacity>
					</>
				)}
			</View>
		)
	},
)

export default function CreateWorkoutScreen() {
	const router = useRouter()
	const { completeWorkout } = useDatabase()

	const [exercises, setExercises] = useState<Exercise[]>([])
	const [workoutName, setWorkoutName] = useState('Моя тренировка')
	const [timer, setTimer] = useState(0)
	const [isWorkoutActive, setIsWorkoutActive] = useState(false)
	const [isTimerRunning, setIsTimerRunning] = useState(false)
	const [notes, setNotes] = useState('')
	const [isSaving, setIsSaving] = useState(false)
	const [showExerciseSelection, setShowExerciseSelection] = useState(false)
	const [showTemplateSelection, setShowTemplateSelection] = useState(false)
	const [showCreateTemplate, setShowCreateTemplate] = useState(false)
	const [templateInitialData, setTemplateInitialData] =
		useState<TemplateFormData | null>(null)
	const [workoutDuration, setWorkoutDuration] = useState(0)
	const params = useLocalSearchParams()

	const templateId = params.templateId as string | undefined
	const templateName = params.templateName as string | undefined
	const templateExercises = params.templateExercises as string | undefined

	const handleSaveAsTemplate = () => {
		if (exercises.length === 0) {
			Alert.alert(
				'Ошибка',
				'Добавьте хотя бы одно упражнение для создания шаблона',
			)
			return
		}

		const templateExercises: ExerciseFormItem[] = exercises.map((ex, index) => {
			const avgWeight =
				ex.sets.length > 0
					? ex.sets.reduce((sum, set) => sum + set.weight, 0) / ex.sets.length
					: 0

			return {
				localId: `template-${Date.now()}-${index}`,
				name: ex.name,
				muscle_group: ex.muscleGroup,
				order_index: index,
				default_sets: ex.sets.length || 3,
				default_reps: ex.sets[0]?.reps || 10,
				default_weight: Math.round(avgWeight * 10) / 10,
			}
		})

		setTemplateInitialData({
			name: workoutName,
			description: notes,
			estimatedDuration: formatTime(workoutDuration),
			exercises: templateExercises,
		})

		setShowCreateTemplate(true)
	}

	useEffect(() => {
		if (templateExercises) {
			try {
				const parsedExercises = JSON.parse(templateExercises)
				setWorkoutName(templateName || 'Моя тренировка')

				const newExercises = parsedExercises.map((ex: any, i: number) => ({
					id: Date.now() + i,
					name: ex.name,
					muscleGroup: ex.muscle_group,
					sets: Array.from({ length: ex.default_sets || 3 }, (_, j) => ({
						id: Date.now() + i * 1000 + j,
						setNumber: j + 1,
						weight: ex.default_weight > 0 ? ex.default_weight : 0,
						reps: ex.default_reps || 10,
						completed: false,
					})),
					collapsed: false,
					order_index: ex.order_index || i,
				}))

				setExercises(newExercises)
				startWorkoutTimer()
			} catch (error) {
				console.error('Error parsing template exercises:', error)
			}
		}
	}, [templateExercises, templateName])

	const handleAppStateChange = useCallback(
		async (nextAppState: string) => {
			if (nextAppState === 'active' && isWorkoutActive) {
				await updateWorkoutDuration()
			}
		},
		[isWorkoutActive],
	)

	// И в useEffect:
	useEffect(() => {
		loadWorkoutState()
		const subscription = AppState.addEventListener(
			'change',
			handleAppStateChange,
		)
		return () => subscription.remove()
	}, [handleAppStateChange])

	const loadWorkoutState = async () => {
		try {
			const [startTimeStr, isActiveStr] = await Promise.all([
				AsyncStorage.getItem(WORKOUT_START_TIME_KEY),
				AsyncStorage.getItem(WORKOUT_ACTIVE_KEY),
			])
			const isActive = isActiveStr === 'true'
			setIsWorkoutActive(isActive)
			if (isActive && startTimeStr) {
				const startTime = parseInt(startTimeStr, 10)
				const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)
				setWorkoutDuration(elapsedSeconds)
			}
		} catch (error) {
			console.error('Error loading workout state:', error)
		}
	}

	const updateWorkoutDuration = async () => {
		try {
			const startTimeStr = await AsyncStorage.getItem(WORKOUT_START_TIME_KEY)
			if (startTimeStr) {
				const startTime = parseInt(startTimeStr, 10)
				const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)
				setWorkoutDuration(elapsedSeconds)
			}
		} catch (error) {
			console.error('Error updating workout duration:', error)
		}
	}

	useEffect(() => {
		return () => {
			// Очищаем всё при уходе со страницы
			setExercises([])
			setWorkoutDuration(0)
			setIsWorkoutActive(false)
			stopWorkoutTimer() // Очищаем AsyncStorage
		}
	}, [])

	useEffect(() => {
		let interval: NodeJS.Timeout

		if (isWorkoutActive) {
			interval = setInterval(() => {
				setWorkoutDuration(prev => prev + 1)
			}, 1000)
		}

		return () => {
			if (interval) {
				clearInterval(interval)
			}
		}
	}, [isWorkoutActive])

	const startWorkoutTimer = async () => {
		try {
			const startTime = Date.now()
			await Promise.all([
				AsyncStorage.setItem(WORKOUT_START_TIME_KEY, startTime.toString()),
				AsyncStorage.setItem(WORKOUT_ACTIVE_KEY, 'true'),
			])
			setIsWorkoutActive(true)
			setWorkoutDuration(0)
		} catch (error) {
			console.error('Error starting workout timer:', error)
		}
	}

	// В функции stopWorkoutTimer
	const stopWorkoutTimer = async () => {
		try {
			await Promise.all([
				AsyncStorage.removeItem(WORKOUT_START_TIME_KEY),
				AsyncStorage.removeItem(WORKOUT_ACTIVE_KEY),
				// Очищаем все старые ключи тренировок
				AsyncStorage.removeItem('@last_workout_data'),
			])
			setIsWorkoutActive(false)
		} catch (error) {
			console.error('Error stopping workout timer:', error)
		}
	}

	const handleTemplateSelect = useCallback(
		(template: WorkoutTemplate, templateExercises: TemplateExercise[]) => {
			setWorkoutName(template.name)

			const newExercises = templateExercises.map((ex, i) => ({
				id: Date.now() + i,
				name: ex.name,
				muscleGroup: ex.muscle_group,
				sets: Array.from({ length: ex.default_sets }, (_, j) => ({
					id: Date.now() + i * 1000 + j,
					setNumber: j + 1,
					weight: ex.default_weight > 0 ? ex.default_weight : undefined,
					reps: ex.default_reps,
					completed: false,
				})),
				collapsed: false,
				order_index: ex.order_index,
			}))

			setExercises(newExercises)
			startWorkoutTimer()
			setShowTemplateSelection(false)
		},
		[setWorkoutName, setExercises, startWorkoutTimer],
	)

	const handleStartEmpty = useCallback(() => {
		setShowTemplateSelection(false)
		setShowExerciseSelection(true)
	}, [])

	const { totalCompleted, totalSets, totalVolume } = useMemo(() => {
		let totalSets = 0
		let totalCompleted = 0
		let totalVolume = 0
		exercises.forEach(exercise => {
			exercise.sets.forEach(set => {
				totalSets++
				if (set.completed) totalCompleted++
				totalVolume += set.weight * set.reps
			})
		})
		return { totalCompleted, totalSets, totalVolume }
	}, [exercises])

	const formatTime = useCallback((seconds: number) => {
		const hrs = Math.floor(seconds / 3600)
		const mins = Math.floor((seconds % 3600) / 60)
		const secs = seconds % 60
		if (hrs > 0) {
			return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
		}
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
	}, [])

	const toggleExerciseCollapse = useCallback((exerciseId: number) => {
		setExercises(prev =>
			prev.map(exercise =>
				exercise.id === exerciseId
					? { ...exercise, collapsed: !exercise.collapsed }
					: exercise,
			),
		)
	}, [])

	const handleSetComplete = useCallback((exerciseId: number, setId: number) => {
		setExercises(prev =>
			prev.map(exercise => {
				if (exercise.id === exerciseId) {
					const updatedSets = exercise.sets.map(set =>
						set.id === setId ? { ...set, completed: !set.completed } : set,
					)
					return { ...exercise, sets: updatedSets }
				}
				return exercise
			}),
		)
	}, [])

	const handleUpdateSet = (
		exerciseId: number,
		setId: number,
		field: 'weight' | 'reps',
		value: string,
	) => {
		const numValue = value === '' ? 0 : parseFloat(value) || 0
		const validatedValue = Math.min(Math.max(numValue, 0), 999)
		setExercises(prev =>
			prev.map(exercise =>
				exercise.id === exerciseId
					? {
							...exercise,
							sets: exercise.sets.map(set =>
								set.id === setId ? { ...set, [field]: validatedValue } : set,
							),
						}
					: exercise,
			),
		)
	}

	const handleRemoveSet = (exerciseId: number, setId: number) => {
		Alert.alert('Удалить подход?', 'Это действие нельзя отменить', [
			{ text: 'Отмена', style: 'cancel' },
			{
				text: 'Удалить',
				style: 'destructive',
				onPress: () => {
					setExercises(prev =>
						prev.map(exercise =>
							exercise.id === exerciseId
								? {
										...exercise,
										sets: exercise.sets.filter(set => set.id !== setId),
									}
								: exercise,
						),
					)
				},
			},
		])
	}

	const handleAddSet = (exerciseId: number) => {
		setExercises(prev =>
			prev.map(exercise => {
				if (exercise.id === exerciseId) {
					const maxSetNumber = exercise.sets.reduce(
						(max, set) => Math.max(max, set.setNumber),
						0,
					)
					const tempId = Date.now() + Math.random()
					return {
						...exercise,
						sets: [
							...exercise.sets,
							{
								id: tempId,
								setNumber: maxSetNumber + 1,
								weight: 0,
								reps: 0,
								completed: false,
							},
						],
					}
				}
				return exercise
			}),
		)
	}

	const handleRemoveExercise = (exerciseId: number) => {
		// Добавляем флаг для предотвращения двойного вызова
		const alertShownRef = { current: false }

		if (alertShownRef.current) return
		alertShownRef.current = true

		Alert.alert(
			'Удалить упражнение?',
			'Все подходы также будут удалены',
			[
				{ text: 'Отмена', style: 'cancel' },
				{
					text: 'Удалить',
					style: 'destructive',
					onPress: () => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
						setExercises(prev => {
							const newExercises = prev.filter(ex => ex.id !== exerciseId)
							if (newExercises.length === 0 && prev.length > 0)
								stopWorkoutTimer()
							return newExercises
						})
					},
				},
			],
			{
				cancelable: true,
				onDismiss: () => {
					alertShownRef.current = false
				},
			},
		)
	}

	const handleExerciseSelect = (exercise: {
		name: string
		muscleGroup: string
	}) => {
		const tempId = Date.now() + Math.random()
		const newExercise: Exercise = {
			id: tempId,
			name: exercise.name,
			muscleGroup: exercise.muscleGroup,
			sets: [],
			collapsed: false,
			order_index: exercises.length,
		}

		setExercises(prev => {
			const newExercises = [...prev, newExercise]
			if (prev.length === 0 && newExercises.length === 1) startWorkoutTimer()
			return newExercises
		})
	}

	const handleFinishWorkout = async () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

		if (!workoutName.trim()) {
			Alert.alert('Ошибка', 'Введите название тренировки')
			return
		}
		if (exercises.length === 0) {
			Alert.alert('Ошибка', 'Добавьте хотя бы одно упражнение')
			return
		}

		// Предотвращаем двойное завершение
		if (isSaving) return

		Alert.alert(
			'Завершить тренировку?',
			`Вы выполнили ${exercises.length} упражнений, ${totalSets} подходов\nОбщий объем: ${totalVolume} кг\nВремя: ${formatTime(workoutDuration)}`,
			[
				{ text: 'Отмена', style: 'cancel' },
				{
					text: 'Завершить',
					onPress: async () => {
						setIsSaving(true)
						try {
							const workoutData = {
								name: workoutName,
								duration: workoutDuration,
								notes: notes,
								exercises: exercises.map((exercise, index) => ({
									name: exercise.name,
									muscle_group: exercise.muscleGroup,
									order_index: index,
									sets: exercise.sets.map(set => ({
										set_number: set.setNumber,
										weight: set.weight,
										reps: set.reps,
										completed: set.completed,
									})),
								})),
							}

							await completeWorkout(workoutData)
							await stopWorkoutTimer()

							// Очищаем состояние перед переходом
							setExercises([])
							setWorkoutName('Моя тренировка')
							setNotes('')
							setWorkoutDuration(0)

							// Используем replace с навигацией на главный таб
							router.replace('/(tabs)')
						} catch (error) {
							console.error('Error saving workout:', error)
							Alert.alert('Ошибка', 'Не удалось сохранить тренировку')
							setIsSaving(false)
						}
					},
				},
			],
		)
	}

	const handleDiscardWorkout = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

		if (
			exercises.length > 0 ||
			workoutDuration > 0 ||
			notes.trim().length > 0
		) {
			Alert.alert(
				'Отменить тренировку?',
				'Все данные будут удалены без сохранения',
				[
					{ text: 'Продолжить', style: 'cancel' },
					{
						text: 'Отменить',
						style: 'destructive',
						onPress: async () => {
							await stopWorkoutTimer()
							router.replace('/(tabs)')
						},
					},
				],
			)
		} else {
			router.replace('/(tabs)')
		}
	}

	const getExerciseDetails = useCallback(
		(exerciseName: string): ExerciseDetail | null => {
			for (const group of MUSCLE_GROUPS) {
				for (const subgroup of group.subgroups) {
					const found = subgroup.exercises.find(ex => ex.name === exerciseName)
					if (found) return found
				}
			}
			return null
		},
		[],
	)

	if (isSaving) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<View style={styles.loadingSpinner}>
						<Ionicons name='barbell' size={48} color={COLORS.primary} />
					</View>
					<Text style={styles.loadingText}>Сохранение тренировки...</Text>
				</View>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={handleDiscardWorkout}
					style={styles.headerButton}
					activeOpacity={0.7}
				>
					<Ionicons name='close' size={24} color={COLORS.text} />
				</TouchableOpacity>

				<View style={styles.headerCenter}>
					<TextInput
						style={styles.workoutNameInput}
						value={workoutName}
						onChangeText={setWorkoutName}
						placeholder='Название тренировки'
						placeholderTextColor={COLORS.textSecondary}
					/>
				</View>

				<TouchableOpacity
					onPress={handleFinishWorkout}
					style={styles.finishButton}
					activeOpacity={0.7}
				>
					<Text style={styles.finishButtonText}>Завершить</Text>
				</TouchableOpacity>
			</View>

			<ScrollView
				style={styles.content}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.contentContainer}
			>
				<View style={styles.statsCard}>
					<View style={styles.statsRow}>
						<View style={styles.statItem}>
							<Text style={styles.statNumber}>
								{totalCompleted}/{totalSets}
							</Text>
							<Text style={styles.statLabel}>Подходы</Text>
						</View>
						<View style={styles.statItem}>
							<Text style={styles.statNumber}>{exercises.length}</Text>
							<Text style={styles.statLabel}>Упражнения</Text>
						</View>
						{isWorkoutActive && (
							<View style={styles.statItem}>
								<Text style={styles.statNumber}>
									{formatTime(workoutDuration)}
								</Text>
								<Text style={styles.statLabel}>Время</Text>
							</View>
						)}
						<View style={styles.statItem}>
							<Text style={styles.statNumber}>{totalVolume}</Text>
							<Text style={styles.statLabel}>Объем</Text>
						</View>
					</View>
				</View>

				<View style={styles.exercisesSection}>
					<View style={styles.sectionHeader}>
						<Text style={{ ...styles.sectionTitle, paddingHorizontal: 16 }}>
							Упражнения
						</Text>
						<Text style={{ ...styles.sectionSubtitle, paddingHorizontal: 16 }}>
							{exercises.length} упражнений
						</Text>
					</View>

					{exercises.length === 0 ? (
						<View style={styles.emptyExercises}>
							<View style={styles.emptyIcon}>
								<Ionicons
									name='barbell-outline'
									size={48}
									color={COLORS.textSecondary}
								/>
							</View>
							<Text style={styles.emptyTitle}>Нет упражнений</Text>
							<Text style={styles.emptySubtitle}>
								Добавьте первое упражнение, чтобы начать тренировку
							</Text>
							<TouchableOpacity
								style={styles.addFirstExerciseButton}
								onPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
									setShowExerciseSelection(true)
								}}
								activeOpacity={0.7}
							>
								<Ionicons name='add' size={20} color={COLORS.background} />
								<Text style={styles.addFirstExerciseText}>
									Добавить упражнение
								</Text>
							</TouchableOpacity>
						</View>
					) : (
						<>
							{exercises.map(exercise => (
								<ExerciseItem
									key={exercise.id}
									exercise={exercise}
									onToggleCollapse={toggleExerciseCollapse}
									onSetComplete={handleSetComplete}
									onUpdateSet={handleUpdateSet}
									onRemoveSet={handleRemoveSet}
									onAddSet={handleAddSet}
									onRemoveExercise={handleRemoveExercise}
									onShowExerciseDetails={getExerciseDetails}
								/>
							))}

							<TouchableOpacity
								style={styles.addExerciseCard}
								onPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
									setShowExerciseSelection(true)
								}}
								activeOpacity={0.7}
							>
								<View style={styles.addExerciseIcon}>
									<Ionicons name='add' size={24} color={COLORS.primary} />
								</View>
								<Text style={styles.addExerciseCardText}>
									Добавить упражнение
								</Text>
							</TouchableOpacity>
						</>
					)}
				</View>

				<View style={styles.notesSection}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Заметки</Text>
						<Ionicons
							name='create-outline'
							size={20}
							color={COLORS.textSecondary}
						/>
					</View>
					<TextInput
						style={styles.notesInput}
						placeholder='Добавьте заметки к тренировке...'
						placeholderTextColor={COLORS.textSecondary}
						multiline
						numberOfLines={4}
						textAlignVertical='top'
						value={notes}
						onChangeText={setNotes}
					/>
				</View>

				<View style={styles.spacer} />
			</ScrollView>

			<ExerciseSelectionModal
				visible={showExerciseSelection}
				onClose={() => setShowExerciseSelection(false)}
				onSelectExercise={handleExerciseSelect}
			/>
		</SafeAreaView>
	)
}

interface ExerciseDetailModalProps {
	visible: boolean
	onClose: () => void
	exerciseDetail: ExerciseDetail | null
}

const galleryStyles = StyleSheet.create({
	container: { marginVertical: 16 },
	imageContainer: {
		width: SCREEN_WIDTH - 32,
		height: 200,
		borderRadius: 12,
		overflow: 'hidden',
	},
	image: { width: '100%', height: '100%' },
	pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: COLORS.textSecondary,
		marginHorizontal: 4,
	},
	activeDot: { backgroundColor: COLORS.primary },
})

const styles = StyleSheet.create({
	infoButton: { padding: 8 },
	video: { width: '100%', height: 200, marginVertical: 10, borderRadius: 16 },
	container: { flex: 1, backgroundColor: '#121212' },
	loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	loadingSpinner: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: COLORS.card,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 20,
	},
	loadingText: { fontSize: 16, color: COLORS.textSecondary },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 8,
		paddingVertical: 12,
		backgroundColor: COLORS.card,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	headerButton: { padding: 8 },
	headerCenter: { flex: 1, alignItems: 'center', marginHorizontal: 12 },
	workoutNameInput: {
		fontSize: 18,
		fontWeight: '600',
		color: COLORS.text,
		textAlign: 'center',
		padding: 8,
		minWidth: 200,
	},
	finishButton: {
		backgroundColor: COLORS.error,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
	},
	finishButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.background,
	},
	content: { flex: 1 },
	contentContainer: { paddingBottom: -40 },
	statsCard: {
		backgroundColor: COLORS.card,
		margin: 8,
		marginBottom: 0,
		borderRadius: 16,
		padding: 20,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
	statItem: { alignItems: 'center', flex: 1 },
	statNumber: {
		fontSize: 20,
		fontWeight: 'bold',
		color: COLORS.primary,
		marginBottom: 4,
	},
	statLabel: { fontSize: 12, color: COLORS.textSecondary },
	exercisesSection: { marginTop: 8 },
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
	},
	sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
	sectionSubtitle: { fontSize: 14, color: COLORS.textSecondary },
	emptyExercises: {
		alignItems: 'center',
		padding: 40,
		marginHorizontal: 8,
		backgroundColor: COLORS.card,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
		marginTop: 8,
	},
	emptyIcon: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: COLORS.cardLight,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 20,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: COLORS.text,
		marginBottom: 8,
	},
	emptySubtitle: {
		fontSize: 14,
		color: COLORS.textSecondary,
		textAlign: 'center',
		marginBottom: 24,
	},
	addFirstExerciseButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: COLORS.primary,
		paddingHorizontal: 24,
		paddingVertical: 14,
		borderRadius: 12,
	},
	addFirstExerciseText: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.background,
		marginLeft: 8,
	},
	exerciseCard: {
		backgroundColor: COLORS.card,
		marginHorizontal: 8,
		marginBottom: 12,
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	exerciseHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	exerciseHeaderLeft: { flexDirection: 'row', flex: 1 },
	exerciseInfo: { flex: 1, marginLeft: 12 },
	exerciseName: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.text,
		marginBottom: 4,
	},
	exerciseMeta: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
	},
	muscleGroupTag: {
		backgroundColor: 'rgba(52, 199, 89, 0.1)',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
	},
	muscleGroupText: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
	setsIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	setsText: { fontSize: 12, color: COLORS.textSecondary },
	exerciseHeaderRight: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
	},
	deleteExerciseButton: { padding: 4 },
	setsContainer: { marginTop: 8 },
	setsHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 8,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
		marginBottom: 4,
		textAlign: 'center',
	},
	setHeaderText: {
		fontSize: 12,
		fontWeight: '600',
		color: COLORS.textSecondary,
		width: 40,
		textAlign: 'center',
	},
	setRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255,255,255,0.05)',
	},
	setNumberContainer: {
		width: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	setNumber: { fontSize: 16, fontWeight: '600', color: COLORS.text },
	setInputContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	input: {
		height: 40,
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: 8,
		textAlign: 'center',
		fontSize: 16,
		color: COLORS.text,
		backgroundColor: COLORS.cardLight,
	},
	weightInput: { width: 80, marginRight: 4 },
	repsInput: { width: 80, marginRight: 4 },
	inputCompleted: {
		backgroundColor: 'rgba(52, 199, 89, 0.1)',
		borderColor: COLORS.primary,
	},
	inputLabel: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 4 },
	checkbox: {
		width: 32,
		height: 32,
		borderRadius: 16,
		borderWidth: 2,
		borderColor: COLORS.border,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: COLORS.cardLight,
	},
	checkboxCompleted: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
	deleteButton: {
		width: 40,
		height: 40,
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
		color: COLORS.primary,
		fontWeight: '600',
		marginLeft: 8,
	},
	addExerciseCard: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: COLORS.card,
		padding: 16,
		marginHorizontal: 8,
		marginBottom: 12,
		borderRadius: 16,
		borderWidth: 1,
		borderStyle: 'dashed',
		borderColor: COLORS.primary,
	},
	addExerciseIcon: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: 'rgba(52, 199, 89, 0.1)',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	addExerciseCardText: {
		fontSize: 16,
		color: COLORS.primary,
		fontWeight: '600',
	},
	notesSection: {
		backgroundColor: COLORS.card,
		margin: 8,
		marginTop: 8,
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	notesInput: {
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: 12,
		padding: 16,
		fontSize: 14,
		color: COLORS.text,
		minHeight: 100,
		backgroundColor: COLORS.cardLight,
		marginTop: 8,
	},
	spacer: { height: 20 },
	historyButton: { padding: 8, marginRight: 8 },
})
