import { useDatabase } from '@/app/contexts/database-context'
import { ExerciseDetailModal } from '@/app/modals/exercise-detail-modal'
import ExerciseHistoryModal from '@/app/modals/exercise-history-modal'
import { ExerciseSelectionModal } from '@/app/modals/exercise-selection.modal'
import type { AppColors } from '@/constants/app-theme'
import {
	manBackMuscleGroupParts,
	manFrontMuscleGroupParts,
} from '@/constants/images'
import { muscle_groups } from '@/constants/muscle-groups'
import { translateExerciseName, translateGroupName } from '@/constants/exercise-i18n'
import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import { TemplateExercise, WorkoutTemplate } from '@/scripts/database'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	Alert,
	Animated,
	AppState,
	type AppStateStatus,
	Dimensions,
	FlatList,
	Keyboard,
	Modal,
	PanResponder,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
	clearWorkoutDraft,
	loadWorkoutDraft,
	saveWorkoutDraft,
	WORKOUT_ACTIVE_KEY,
	WORKOUT_START_TIME_KEY,
} from '@/scripts/workout-draft'
import {
	DEFAULT_REST_SETTINGS,
	REST_DURATION_OPTIONS,
	formatRestSeconds,
	loadRestSettings,
	saveRestSettings,
	type RestSettings,
} from '@/services/rest-settings'
import { playRestCompleteSound, preloadRestSound, unloadRestSound } from '@/services/rest-sound'
import {
	loadPreferFocusMode,
	savePreferFocusMode,
} from '@/services/workout-ui-prefs'
import { CachedVideo } from '@/components/cached-video'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const REST_FLOAT_W = 120
const REST_FLOAT_H = 88
const REST_FLOAT_POS_KEY = '@fitex/rest_float_pos'
const EXERCISE_DRAWER_W = Math.min(320, SCREEN_WIDTH * 0.82)

function clampRestFloat(x: number, y: number) {
	const maxX = Math.max(8, SCREEN_WIDTH - REST_FLOAT_W - 8)
	const maxY = Math.max(72, SCREEN_HEIGHT - REST_FLOAT_H - 48)
	return {
		x: Math.min(Math.max(8, x), maxX),
		y: Math.min(Math.max(64, y), maxY),
	}
}

/** Вес/повторы: запятая как десятичный разделитель, один parse, ограничение 0…999 */
function parseWeightRepsInput(raw: string): number {
	const t = raw.replace(',', '.').trim()
	if (t === '' || t === '.') return 0
	const n = parseFloat(t)
	if (!Number.isFinite(n)) return 0
	return Math.min(Math.max(n, 0), 999)
}

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
		opts?: { autoComplete?: boolean },
	) => void
	onRemove: (exerciseId: number, setId: number) => void
}

const SetRow: React.FC<SetRowProps> = React.memo(
	({ set, exerciseId, onComplete, onUpdate, onRemove }) => {
		const { t } = useLanguage()
		const { colors: COLORS } = useAppTheme()
		const styles = useMemo(() => makeStyles(COLORS), [COLORS])
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

		const flushToParent = () => {
			if (!set.id) return
			onUpdate(exerciseId, set.id, 'weight', weightText, { autoComplete: false })
			onUpdate(exerciseId, set.id, 'reps', repsText, { autoComplete: false })
		}

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
						value={weightText}
						onChangeText={setWeightText}
						onFocus={() => {
							weightFocused.current = true
						}}
						onBlur={() => {
							weightFocused.current = false
							if (set.id) {
								onUpdate(exerciseId, set.id, 'weight', weightText, {
									autoComplete: false,
								})
							}
						}}
						keyboardType='decimal-pad'
						placeholder='0'
						placeholderTextColor={COLORS.textSecondary}
						maxLength={10}
					/>
					<Text style={styles.inputLabel}>{t('workout', 'kg')}</Text>
				</View>

				<View style={styles.setInputContainer}>
					<TextInput
						style={[
							styles.input,
							set.completed && styles.inputCompleted,
							styles.repsInput,
						]}
						value={repsText}
						onChangeText={setRepsText}
						onFocus={() => {
							repsFocused.current = true
						}}
						onBlur={() => {
							repsFocused.current = false
							if (set.id) onUpdate(exerciseId, set.id, 'reps', repsText)
						}}
						keyboardType='decimal-pad'
						placeholder='0'
						placeholderTextColor={COLORS.textSecondary}
						maxLength={10}
						returnKeyType='done'
						onSubmitEditing={() => {
							repsFocused.current = false
							if (set.id) onUpdate(exerciseId, set.id, 'reps', repsText)
						}}
					/>
				</View>

				<TouchableOpacity
					style={[styles.checkbox, set.completed && styles.checkboxCompleted]}
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
						if (set.id) {
							flushToParent()
							onComplete(exerciseId, set.id)
						}
					}}
					activeOpacity={0.6}
				>
					{set.completed && (
						<Ionicons name='checkmark' size={16} color='#000' />
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
		opts?: { autoComplete?: boolean },
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
		const { t, language } = useLanguage()
		const { colors: COLORS } = useAppTheme()
		const styles = useMemo(() => makeStyles(COLORS), [COLORS])
		const [showHistoryModal, setShowHistoryModal] = useState(false)
		const [showDetailsModal, setShowDetailsModal] = useState(false)
		const [exerciseDetail, setExerciseDetail] = useState<ExerciseDetail | null>(
			null,
		)

		const completedSets = exercise.sets.filter(set => set.completed).length
		const totalSets = exercise.sets.length
		const catalog = useMemo(
			() => onShowExerciseDetails(exercise.name),
			[exercise.name, onShowExerciseDetails],
		)
		const thumbSource = catalog?.images?.[0] ?? catalog?.image ?? null

		const handleShowDetails = () => {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
			const detail = onShowExerciseDetails(exercise.name)
			setExerciseDetail(detail)
			setShowDetailsModal(true)
		}

		return (
			<View style={styles.exerciseCard}>
				<View
					style={[
						styles.exerciseHeader,
						exercise.collapsed && styles.exerciseHeaderCollapsed,
					]}
				>
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
							size={18}
							color={COLORS.primary}
						/>
						<View style={styles.exerciseThumbWrap}>
							{thumbSource ? (
								<Image
									source={thumbSource}
									style={styles.exerciseThumb}
									contentFit='cover'
								/>
							) : (
								<View style={styles.exerciseThumbPlaceholder}>
									<Ionicons
										name='barbell-outline'
										size={18}
										color={COLORS.textSecondary}
									/>
								</View>
							)}
						</View>
						<View style={styles.exerciseInfo}>
							<Text style={styles.exerciseName} numberOfLines={1}>
								{translateExerciseName(exercise.name, language ?? 'ru')}
							</Text>
							<View style={styles.exerciseMeta}>
								<View style={styles.muscleGroupTag}>
									<Text style={styles.muscleGroupText} numberOfLines={1}>
										{translateGroupName(exercise.muscleGroup, language ?? 'ru')}
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
						</View>
					</TouchableOpacity>

					<View style={styles.exerciseHeaderRight}>
						<TouchableOpacity
							style={styles.infoButton}
							onPress={handleShowDetails}
							activeOpacity={0.7}
						>
							<Ionicons
								name='information-circle-outline'
								size={20}
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
									size={18}
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
							<Ionicons name='trash-outline' size={18} color={COLORS.error} />
						</TouchableOpacity>
					</View>
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
							<Text style={{ ...styles.setHeaderText, width: 70 }}>{t('workout', 'weight')}</Text>
							<Text style={{ ...styles.setHeaderText, width: 30 }}></Text>
							<Text style={{ ...styles.setHeaderText, width: 70 }}>
								{t('workout', 'reps')}
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
							<Text style={styles.addSetText}>{t('workout', 'addSet')}</Text>
						</TouchableOpacity>
					</>
				)}
			</View>
		)
	},
)

export default function CreateWorkoutScreen() {
	const router = useRouter()
	const { completeWorkout, getWorkoutTemplate, createWorkoutTemplate } = useDatabase()
	const { t, language } = useLanguage()
	const { colors: COLORS } = useAppTheme()
	const styles = useMemo(() => makeStyles(COLORS), [COLORS])

	const [exercises, setExercises] = useState<Exercise[]>([])
	const [workoutName, setWorkoutName] = useState('')
	const [timer, setTimer] = useState(0)
	const [isWorkoutActive, setIsWorkoutActive] = useState(false)
	const [isTimerRunning, setIsTimerRunning] = useState(false)
	const [notes, setNotes] = useState('')
	const [isSaving, setIsSaving] = useState(false)
	const [showExerciseSelection, setShowExerciseSelection] = useState(false)
	const [showTemplateSelection, setShowTemplateSelection] = useState(false)
	const [workoutDuration, setWorkoutDuration] = useState(0)
	const [restSettings, setRestSettings] = useState<RestSettings>(DEFAULT_REST_SETTINGS)
	const [restEnabled, setRestEnabled] = useState(true)
	const [restRemaining, setRestRemaining] = useState<number | null>(null)
	const [restKind, setRestKind] = useState<'sets' | 'exercises' | null>(null)
	const [showRestModal, setShowRestModal] = useState(false)
	const restInitialSecRef = useRef(90)
	const restFloatDragged = useRef(false)
	const [showNotesModal, setShowNotesModal] = useState(false)
	const [useFocusMode, setUseFocusMode] = useState(true)
	const [activeExerciseIndex, setActiveExerciseIndex] = useState(0)
	const [isVideoPlaying, setIsVideoPlaying] = useState(false)
	const [showFocusHistoryModal, setShowFocusHistoryModal] = useState(false)
	const [showFocusDetailsModal, setShowFocusDetailsModal] = useState(false)
	const [showExerciseDrawer, setShowExerciseDrawer] = useState(false)
	const exerciseDrawerX = useRef(new Animated.Value(-EXERCISE_DRAWER_W)).current
	const drawerOpenedByButton = useRef(false)
	const [notesKeyboardHeight, setNotesKeyboardHeight] = useState(0)
	const restFloatPan = useRef(
		new Animated.ValueXY({
			x: SCREEN_WIDTH - REST_FLOAT_W - 12,
			y: 110,
		}),
	).current
	const restFloatReady = useRef(false)
	const params = useLocalSearchParams()
	const templateHydrated = useRef(false)
	const draftRestored = useRef(false)
	const skipNextDraftSave = useRef(false)
	const draftSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
	const restEnabledRef = useRef(true)
	const restSettingsRef = useRef(restSettings)

	restEnabledRef.current = restEnabled
	restSettingsRef.current = restSettings

	useEffect(() => {
		loadRestSettings().then(s => {
			setRestSettings(s)
			setRestEnabled(s.enabledByDefault)
		})
		void loadPreferFocusMode().then(setUseFocusMode)
	}, [])

	useEffect(() => {
		if (!showNotesModal) {
			setNotesKeyboardHeight(0)
			return
		}
		const showEvent =
			Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
		const hideEvent =
			Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
		const onShow = Keyboard.addListener(showEvent, e => {
			setNotesKeyboardHeight(e.endCoordinates.height)
		})
		const onHide = Keyboard.addListener(hideEvent, () => {
			setNotesKeyboardHeight(0)
		})
		return () => {
			onShow.remove()
			onHide.remove()
		}
	}, [showNotesModal])

	useEffect(() => {
		let cancelled = false
		void AsyncStorage.getItem(REST_FLOAT_POS_KEY).then(raw => {
			if (cancelled || !raw) return
			try {
				const parsed = JSON.parse(raw) as { x?: number; y?: number }
				if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
					const next = clampRestFloat(parsed.x, parsed.y)
					restFloatPan.setValue(next)
				}
			} catch {
				// ignore
			} finally {
				restFloatReady.current = true
			}
		})
		return () => {
			cancelled = true
		}
	}, [restFloatPan])

	const restFloatPanResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => true,
				onMoveShouldSetPanResponder: (_, g) =>
					Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
				onPanResponderGrant: () => {
					restFloatDragged.current = false
					restFloatPan.extractOffset()
				},
				onPanResponderMove: (_, g) => {
					if (Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4) {
						restFloatDragged.current = true
					}
					restFloatPan.setValue({ x: g.dx, y: g.dy })
				},
				onPanResponderRelease: () => {
					restFloatPan.flattenOffset()
					if (!restFloatDragged.current) {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
						setShowRestModal(true)
						return
					}
					restFloatPan.stopAnimation(({ x, y }) => {
						const next = clampRestFloat(x, y)
						Animated.spring(restFloatPan, {
							toValue: next,
							useNativeDriver: false,
							friction: 7,
							tension: 80,
						}).start()
						void AsyncStorage.setItem(REST_FLOAT_POS_KEY, JSON.stringify(next))
					})
				},
			}),
		[restFloatPan],
	)

	const clearRestTimer = useCallback(() => {
		if (restIntervalRef.current) {
			clearInterval(restIntervalRef.current)
			restIntervalRef.current = null
		}
		setRestRemaining(null)
		setRestKind(null)
		setShowRestModal(false)
	}, [])

	const startRestTimer = useCallback(
		(seconds: number, kind: 'sets' | 'exercises') => {
			if (restIntervalRef.current) {
				clearInterval(restIntervalRef.current)
				restIntervalRef.current = null
			}
			restInitialSecRef.current = seconds
			setRestKind(kind)
			setRestRemaining(seconds)
			restIntervalRef.current = setInterval(() => {
				setRestRemaining(prev => {
					if (prev == null) return null
					if (prev <= 1) {
						if (restIntervalRef.current) {
							clearInterval(restIntervalRef.current)
							restIntervalRef.current = null
						}
						void Haptics.notificationAsync(
							Haptics.NotificationFeedbackType.Success,
						)
						void playRestCompleteSound()
						setRestKind(null)
						setShowRestModal(false)
						return null
					}
					return prev - 1
				})
			}, 1000)
		},
		[],
	)

	const applyRestDuration = useCallback(
		(seconds: number) => {
			const kind = restKind ?? 'sets'
			startRestTimer(seconds, kind)
			const patch =
				kind === 'exercises'
					? { betweenExercisesSec: seconds }
					: { betweenSetsSec: seconds }
			void saveRestSettings(patch).then(setRestSettings)
		},
		[restKind, startRestTimer],
	)

	useEffect(() => {
		void preloadRestSound()
		return () => {
			if (restIntervalRef.current) clearInterval(restIntervalRef.current)
			void unloadRestSound()
		}
	}, [])

	const templateId = params.templateId as string | undefined
	const templateName = params.templateName as string | undefined
	const templateExercises = params.templateExercises as string | undefined

	useEffect(() => {
		// Default name only when starting fresh (no restore / template yet)
		if (!draftRestored.current && !templateHydrated.current && !workoutName) {
			setWorkoutName(t('workout', 'myWorkout'))
		}
	}, [t, workoutName])

	const persistDraftNow = useCallback(async () => {
		if (skipNextDraftSave.current) return
		if (!isWorkoutActive && exercises.length === 0) return
		await saveWorkoutDraft({
			workoutName,
			notes,
			exercises,
		})
	}, [exercises, isWorkoutActive, notes, workoutName])

	const scheduleDraftSave = useCallback(() => {
		if (skipNextDraftSave.current) return
		if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current)
		draftSaveTimer.current = setTimeout(() => {
			void persistDraftNow()
		}, 350)
	}, [persistDraftNow])

	// Ensure unmount flush respects discard/finish
	useEffect(() => {
		return () => {
			if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current)
			if (skipNextDraftSave.current) return
			void persistDraftNow()
		}
	}, [persistDraftNow])

	const handleSaveAsTemplate = async () => {
		if (exercises.length === 0) {
			Alert.alert(t('common', 'error'), t('workout', 'saveTemplateError'))
			return
		}
		const name = workoutName.trim() || t('workout', 'myWorkout')
		const muscleGroups = [
			...new Set(exercises.map(ex => ex.muscleGroup).filter(Boolean)),
		].join(',')
		try {
			await createWorkoutTemplate(
				{
					name,
					description: notes.trim(),
					estimated_duration: Math.max(1, Math.round(workoutDuration / 60) || 60),
					muscle_groups: muscleGroups,
					exercises_count: exercises.length,
				},
				exercises.map((ex, index) => {
					const avgWeight =
						ex.sets.length > 0
							? ex.sets.reduce((sum, set) => sum + set.weight, 0) / ex.sets.length
							: 0
					return {
						name: ex.name,
						muscle_group: ex.muscleGroup,
						order_index: index,
						default_sets: ex.sets.length || 3,
						default_reps: ex.sets[0]?.reps || 10,
						default_weight: Math.round(avgWeight * 10) / 10,
					}
				}),
			)
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
			Alert.alert(t('templates', 'savedTitle'), t('templates', 'savedMsg'))
		} catch (e) {
			console.error(e)
			Alert.alert(t('common', 'error'), t('workout', 'saveTemplateError'))
		}
	}

	useEffect(() => {
		let cancelled = false

		const boot = async () => {
			if (draftRestored.current || templateHydrated.current) return

			const draft = await loadWorkoutDraft()
			if (cancelled) return

			// Resume unfinished workout after app kill / leave
			if (draft && draft.exercises.length > 0 && !templateId && !templateExercises) {
				draftRestored.current = true
				templateHydrated.current = true
				skipNextDraftSave.current = true
				setWorkoutName(draft.workoutName || t('workout', 'myWorkout'))
				setNotes(draft.notes || '')
				setExercises(draft.exercises)
				const firstOpen = draft.exercises.findIndex(ex =>
					ex.sets.some(s => !s.completed),
				)
				setActiveExerciseIndex(firstOpen >= 0 ? firstOpen : 0)
				setIsVideoPlaying(false)
				const elapsed = Math.max(
					0,
					Math.floor((Date.now() - draft.startTime) / 1000),
				)
				setWorkoutDuration(elapsed)
				setIsWorkoutActive(true)
				setIsTimerRunning(true)
				await AsyncStorage.setItem(WORKOUT_ACTIVE_KEY, 'true')
				await AsyncStorage.setItem(
					WORKOUT_START_TIME_KEY,
					String(draft.startTime),
				)
				skipNextDraftSave.current = false
				return
			}

			if (templateHydrated.current) return

			const hydrate = (parsedExercises: any[], name?: string) => {
				templateHydrated.current = true
				draftRestored.current = true
				setWorkoutName(name || templateName || t('workout', 'myWorkout'))
				const newExercises = parsedExercises.map((ex: any, i: number) => ({
					id: Date.now() + i,
					name: ex.name,
					muscleGroup: ex.muscle_group,
					sets: Array.from(
						{
							length: Math.max(
								1,
								Math.min(Number(ex.default_sets) || 3, 20),
							),
						},
						(_, j) => ({
							id: Date.now() + i * 1000 + j,
							setNumber: j + 1,
							weight:
								ex.default_weight != null && Number(ex.default_weight) > 0
									? Number(ex.default_weight)
									: 0,
							reps:
								ex.default_reps != null && Number(ex.default_reps) > 0
									? Number(ex.default_reps)
									: 0,
							completed: false,
						}),
					),
					collapsed: false,
					order_index: ex.order_index || i,
				}))
				setExercises(newExercises)
				setActiveExerciseIndex(0)
				setIsVideoPlaying(false)
				void startWorkoutTimer()
			}

			if (templateExercises) {
				try {
					hydrate(JSON.parse(templateExercises), templateName)
				} catch (error) {
					console.error('Error parsing template exercises:', error)
				}
				return
			}

			if (templateId) {
				const id = parseInt(templateId, 10)
				if (!Number.isFinite(id)) return
				const data = await getWorkoutTemplate(id)
				if (cancelled) return
				if (data?.exercises?.length) {
					hydrate(data.exercises, data.template.name || templateName)
				}
			}
		}

		void boot()
		return () => {
			cancelled = true
		}
	}, [templateExercises, templateId, templateName, t, getWorkoutTemplate])

	const handleAppStateChange = useCallback(
		async (nextAppState: AppStateStatus) => {
			if (nextAppState === 'background' || nextAppState === 'inactive') {
				await persistDraftNow()
				return
			}
			if (nextAppState === 'active' && isWorkoutActive) {
				await updateWorkoutDuration()
			}
		},
		[isWorkoutActive, persistDraftNow],
	)

	useEffect(() => {
		void loadWorkoutState()
		const subscription = AppState.addEventListener('change', handleAppStateChange)
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

	// Persist draft while editing; do NOT clear on unmount (app kill / leave tabs)
	useEffect(() => {
		if (!draftRestored.current && !templateHydrated.current) return
		if (!isWorkoutActive && exercises.length === 0) return
		scheduleDraftSave()
		return () => {
			if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current)
		}
	}, [exercises, workoutName, notes, isWorkoutActive, scheduleDraftSave])

	useEffect(() => {
		let interval: ReturnType<typeof setInterval>

		if (isWorkoutActive && isTimerRunning) {
			interval = setInterval(() => {
				setWorkoutDuration(prev => prev + 1)
			}, 1000)
		}

		return () => {
			if (interval) {
				clearInterval(interval)
			}
		}
	}, [isWorkoutActive, isTimerRunning])

	const startWorkoutTimer = async () => {
		try {
			const startTime = Date.now()
			await Promise.all([
				AsyncStorage.setItem(WORKOUT_START_TIME_KEY, startTime.toString()),
				AsyncStorage.setItem(WORKOUT_ACTIVE_KEY, 'true'),
			])
			setIsWorkoutActive(true)
			setIsTimerRunning(true)
			setIsVideoPlaying(false)
			setWorkoutDuration(0)
		} catch (error) {
			console.error('Error starting workout timer:', error)
		}
	}

	const toggleWorkoutTimer = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
		setIsVideoPlaying(prev => !prev)
	}

	const toggleFocusMode = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		setUseFocusMode(prev => {
			const next = !prev
			void savePreferFocusMode(next)
			return next
		})
	}

	const stopWorkoutTimer = async () => {
		try {
			await clearWorkoutDraft()
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
				sets: Array.from(
					{ length: Math.max(1, Math.min(Number(ex.default_sets) || 3, 20)) },
					(_, j) => ({
						id: Date.now() + i * 1000 + j,
						setNumber: j + 1,
						weight:
							ex.default_weight != null && Number(ex.default_weight) > 0
								? Number(ex.default_weight)
								: 0,
						reps:
							ex.default_reps != null && Number(ex.default_reps) > 0
								? Number(ex.default_reps)
								: 0,
						completed: false,
					}),
				),
				collapsed: false,
				order_index: ex.order_index,
			}))

			setExercises(newExercises)
			setActiveExerciseIndex(0)
			setIsVideoPlaying(false)
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
				if (!set.completed || !(set.reps > 0)) return
				totalSets++
				totalCompleted++
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
		setExercises(prev => {
			const next = prev.map(exercise => {
				if (exercise.id !== exerciseId) return exercise
				const updatedSets = exercise.sets.map(set =>
					set.id === setId ? { ...set, completed: !set.completed } : set,
				)
				return { ...exercise, sets: updatedSets }
			})

			const exercise = prev.find(e => e.id === exerciseId)
			const target = exercise?.sets.find(s => s.id === setId)
			const becomingComplete = target && !target.completed

			if (becomingComplete && restEnabledRef.current && exercise) {
				const maxSetNumber = exercise.sets.reduce(
					(max, s) => Math.max(max, s.setNumber),
					0,
				)
				const isLastSet = target.setNumber === maxSetNumber
				const settings = restSettingsRef.current
				const duration = isLastSet
					? settings.betweenExercisesSec
					: settings.betweenSetsSec
				const kind = isLastSet ? 'exercises' : 'sets'
				// Defer so state update for exercises isn't blocked
				setTimeout(() => startRestTimer(duration, kind), 0)
			}

			return next
		})
	}, [startRestTimer])

	const handleUpdateSet = useCallback((
		exerciseId: number,
		setId: number,
		field: 'weight' | 'reps',
		value: string,
		opts?: { autoComplete?: boolean },
	) => {
		const validatedValue = parseWeightRepsInput(value)
		const allowAuto = opts?.autoComplete !== false
		setExercises(prev => {
			let justCompleted = false

			const next = prev.map(exercise => {
				if (exercise.id !== exerciseId) return exercise

				let sets = exercise.sets.map(set => {
					if (set.id !== setId) return set
					const updated = { ...set, [field]: validatedValue }
					if (field === 'reps' && allowAuto) {
						if (validatedValue > 0) {
							if (!set.completed) justCompleted = true
							updated.completed = true
						} else {
							updated.completed = false
						}
					}
					return updated
				})

				// После ввода повторений — новая пустая строка подхода (если это был последний)
				if (field === 'reps' && allowAuto && validatedValue > 0) {
					const last = sets[sets.length - 1]
					if (last?.id === setId) {
						const maxSetNumber = sets.reduce(
							(max, s) => Math.max(max, s.setNumber),
							0,
						)
						sets = [
							...sets,
							{
								id: Date.now() + Math.random(),
								setNumber: maxSetNumber + 1,
								weight: last.weight,
								reps: 0,
								completed: false,
							},
						]
					}
				}

				return { ...exercise, sets }
			})

			if (justCompleted && restEnabledRef.current) {
				const settings = restSettingsRef.current
				setTimeout(
					() => startRestTimer(settings.betweenSetsSec, 'sets'),
					0,
				)
			}

			return next
		})
	}, [startRestTimer])

	const handleRemoveSet = (exerciseId: number, setId: number) => {
		const remove = () => {
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
		}

		const target = exercises
			.find(ex => ex.id === exerciseId)
			?.sets.find(set => set.id === setId)
		const isEmpty = !target || (target.weight <= 0 && target.reps <= 0)

		if (isEmpty) {
			remove()
			return
		}

		Alert.alert(t('workout', 'deleteSet'), t('workout', 'deleteSetMsg'), [
			{ text: t('common', 'cancel'), style: 'cancel' },
			{
				text: t('workout', 'delete'),
				style: 'destructive',
				onPress: remove,
			},
		])
	}

	const handleAddSet = (exerciseId: number) => {
		setExercises(prev => {
			let justCompleted = false
			const next = prev.map(exercise => {
				if (exercise.id !== exerciseId) return exercise

				const last = exercise.sets[exercise.sets.length - 1]
				let sets = exercise.sets

				if (last && last.weight > 0 && last.reps > 0) {
					if (!last.completed) justCompleted = true
					sets = sets.map((s, i) =>
						i === sets.length - 1 ? { ...s, completed: true } : s,
					)
				}

				const maxSetNumber = sets.reduce(
					(max, set) => Math.max(max, set.setNumber),
					0,
				)
				const tempId = Date.now() + Math.random()
				return {
					...exercise,
					sets: [
						...sets,
						{
							id: tempId,
							setNumber: maxSetNumber + 1,
							weight: last?.weight ?? 0,
							reps: 0,
							completed: false,
						},
					],
				}
			})

			if (justCompleted && restEnabledRef.current) {
				const settings = restSettingsRef.current
				setTimeout(
					() => startRestTimer(settings.betweenSetsSec, 'sets'),
					0,
				)
			}

			return next
		})
	}

	const handleRemoveExercise = (exerciseId: number) => {
		const alertShownRef = { current: false }

		if (alertShownRef.current) return
		alertShownRef.current = true

		Alert.alert(
			t('workout', 'deleteExercise'),
			t('workout', 'deleteExerciseMsg'),
			[
				{ text: t('common', 'cancel'), style: 'cancel' },
				{
					text: t('workout', 'delete'),
					style: 'destructive',
					onPress: () => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
						setExercises(prev => {
							const idx = prev.findIndex(ex => ex.id === exerciseId)
							const newExercises = prev.filter(ex => ex.id !== exerciseId)
							if (newExercises.length === 0 && prev.length > 0)
								stopWorkoutTimer()
							setActiveExerciseIndex(cur => {
								if (newExercises.length === 0) return 0
								if (idx < 0) return Math.min(cur, newExercises.length - 1)
								if (cur > idx) return cur - 1
								if (cur >= newExercises.length) return newExercises.length - 1
								return cur
							})
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
			sets: [
				{
					id: tempId + 0.1,
					setNumber: 1,
					weight: 0,
					reps: 0,
					completed: false,
				},
			],
			collapsed: false,
			order_index: exercises.length,
		}

		setExercises(prev => {
			const newExercises = [...prev, newExercise]
			setActiveExerciseIndex(newExercises.length - 1)
			setIsVideoPlaying(false)
			if (prev.length === 0 && newExercises.length === 1) startWorkoutTimer()
			return newExercises
		})
	}

	const handleFinishWorkout = async () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

		if (!workoutName.trim()) {
			Alert.alert(t('common', 'error'), t('workout', 'noNameError'))
			return
		}
		if (exercises.length === 0) {
			Alert.alert(t('common', 'error'), t('workout', 'noExercisesError'))
			return
		}

		const filledExercises = exercises
			.map(exercise => ({
				...exercise,
				sets: exercise.sets.filter(set => set.completed && set.reps > 0),
			}))
			.filter(exercise => exercise.sets.length > 0)

		if (filledExercises.length === 0) {
			Alert.alert(t('common', 'error'), t('workout', 'noExercisesError'))
			return
		}

		if (isSaving) return

		const filledSets = filledExercises.reduce((n, ex) => n + ex.sets.length, 0)
		const filledVolume = filledExercises.reduce(
			(sum, ex) =>
				sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
			0,
		)

		Alert.alert(
			t('workout', 'finishTitle'),
			`${filledExercises.length} ${t('workout', 'exercises')}, ${filledSets} ${t('workout', 'sets')}\n${t('workout', 'volume')}: ${filledVolume.toFixed(2)} ${t('workout', 'kg')}\n${t('workout', 'time')}: ${formatTime(workoutDuration)}`,
			[
				{ text: t('common', 'cancel'), style: 'cancel' },
				{
					text: t('workout', 'finish'),
					onPress: async () => {
						setIsSaving(true)
						try {
							const workoutData = {
								name: workoutName,
								duration: workoutDuration,
								notes: notes,
								exercises: filledExercises.map((exercise, index) => ({
									name: exercise.name,
									muscle_group: exercise.muscleGroup,
									order_index: index,
									sets: exercise.sets.map((set, setIndex) => ({
										set_number: setIndex + 1,
										weight: set.weight,
										reps: set.reps,
										completed: true,
									})),
								})),
							}

							skipNextDraftSave.current = true
							if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current)
							clearRestTimer()
							await completeWorkout(workoutData)
							await stopWorkoutTimer()

							setExercises([])
							setWorkoutName(t('workout', 'myWorkout'))
							setNotes('')
							setWorkoutDuration(0)

							router.replace('/(tabs)')
						} catch (error) {
							skipNextDraftSave.current = false
							console.error('Error saving workout:', error)
							Alert.alert(t('common', 'error'), t('workout', 'saveError'))
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
				t('workout', 'discardTitle'),
				t('workout', 'discardMsg'),
				[
					{ text: t('workout', 'continueBtn'), style: 'cancel' },
					{
						text: t('workout', 'discard'),
						style: 'destructive',
						onPress: async () => {
							skipNextDraftSave.current = true
							if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current)
							clearRestTimer()
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
					if (found) return found as ExerciseDetail
				}
			}
			return null
		},
		[],
	)

	useEffect(() => {
		setIsVideoPlaying(false)
		setShowFocusHistoryModal(false)
		setShowFocusDetailsModal(false)
	}, [activeExerciseIndex])

	useEffect(() => {
		if (showExerciseDrawer && drawerOpenedByButton.current) {
			drawerOpenedByButton.current = false
			exerciseDrawerX.setValue(-EXERCISE_DRAWER_W)
			Animated.spring(exerciseDrawerX, {
				toValue: 0,
				useNativeDriver: true,
				friction: 9,
				tension: 70,
			}).start()
		}
	}, [showExerciseDrawer, exerciseDrawerX])

	const closeExerciseDrawer = useCallback(() => {
		Animated.timing(exerciseDrawerX, {
			toValue: -EXERCISE_DRAWER_W,
			duration: 200,
			useNativeDriver: true,
		}).start(({ finished }) => {
			if (finished) setShowExerciseDrawer(false)
		})
	}, [exerciseDrawerX])

	const openExerciseDrawer = useCallback(() => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		drawerOpenedByButton.current = true
		setShowExerciseDrawer(true)
	}, [])

	const snapExerciseDrawer = useCallback(
		(open: boolean) => {
			if (open) {
				Animated.spring(exerciseDrawerX, {
					toValue: 0,
					useNativeDriver: true,
					friction: 9,
					tension: 70,
				}).start()
			} else {
				closeExerciseDrawer()
			}
		},
		[closeExerciseDrawer, exerciseDrawerX],
	)

	const edgeOpenPanResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => false,
				onMoveShouldSetPanResponder: (_, g) =>
					g.dx > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.15,
				onPanResponderGrant: () => {
					exerciseDrawerX.setValue(-EXERCISE_DRAWER_W)
					setShowExerciseDrawer(true)
				},
				onPanResponderMove: (_, g) => {
					const x = Math.min(
						0,
						Math.max(-EXERCISE_DRAWER_W, -EXERCISE_DRAWER_W + g.dx),
					)
					exerciseDrawerX.setValue(x)
				},
				onPanResponderRelease: (_, g) => {
					const shouldOpen =
						g.dx > EXERCISE_DRAWER_W * 0.28 || g.vx > 0.45
					if (shouldOpen) {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
						snapExerciseDrawer(true)
					} else {
						closeExerciseDrawer()
					}
				},
				onPanResponderTerminate: () => {
					closeExerciseDrawer()
				},
			}),
		[closeExerciseDrawer, exerciseDrawerX, snapExerciseDrawer],
	)

	const drawerClosePanResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => false,
				onMoveShouldSetPanResponder: (_, g) =>
					g.dx < -10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.15,
				onPanResponderMove: (_, g) => {
					const x = Math.min(0, Math.max(-EXERCISE_DRAWER_W, g.dx))
					exerciseDrawerX.setValue(x)
				},
				onPanResponderRelease: (_, g) => {
					const shouldClose =
						g.dx < -EXERCISE_DRAWER_W * 0.28 || g.vx < -0.45
					if (shouldClose) {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
						closeExerciseDrawer()
					} else {
						snapExerciseDrawer(true)
					}
				},
				onPanResponderTerminate: () => {
					snapExerciseDrawer(true)
				},
			}),
		[closeExerciseDrawer, exerciseDrawerX, snapExerciseDrawer],
	)

	const selectFocusExercise = useCallback(
		(index: number) => {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
			setActiveExerciseIndex(index)
			closeExerciseDrawer()
		},
		[closeExerciseDrawer],
	)

	const handleVideoEnded = useCallback(() => {
		setIsVideoPlaying(false)
	}, [])

	const activeExercise =
		exercises.length > 0
			? exercises[Math.min(activeExerciseIndex, exercises.length - 1)]
			: null
	const activeDetail = activeExercise
		? getExerciseDetails(activeExercise.name)
		: null

	const openNextExercisePicker = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
		setShowExerciseSelection(true)
	}

	const renderRestFloat = () =>
		restRemaining != null ? (
			<Animated.View
				style={[
					styles.restFloat,
					{
						transform: restFloatPan.getTranslateTransform(),
					},
				]}
				{...restFloatPanResponder.panHandlers}
			>
				<View style={styles.restFloatHandle}>
					<View style={styles.restFloatHandleBar} />
				</View>
				<Text style={styles.restFloatLabel} numberOfLines={1}>
					{t('workout', 'restTimer')}
				</Text>
				<Text style={styles.restFloatTime}>{formatTime(restRemaining)}</Text>
			</Animated.View>
		) : null

	const renderRestModal = () => {
		const selectedDuration =
			restKind === 'exercises'
				? restSettings.betweenExercisesSec
				: restSettings.betweenSetsSec

		return (
			<Modal
				visible={showRestModal && restRemaining != null}
				animationType='fade'
				transparent
				onRequestClose={() => setShowRestModal(false)}
			>
				<View style={styles.restModalRoot}>
					<TouchableOpacity
						style={styles.restModalClose}
						onPress={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
							setShowRestModal(false)
						}}
						activeOpacity={0.7}
					>
						<Ionicons name='close' size={28} color={COLORS.text} />
					</TouchableOpacity>

					<ScrollView
						contentContainerStyle={styles.restModalContent}
						showsVerticalScrollIndicator={false}
						bounces={false}
					>
						<Text style={styles.restModalKind} numberOfLines={1}>
							{restKind === 'exercises'
								? t('workout', 'restBetweenExercises')
								: t('workout', 'restBetweenSets')}
						</Text>

						<Text style={styles.restModalTime}>
							{formatTime(restRemaining ?? 0)}
						</Text>

						<Text style={styles.restModalDurationLabel}>
							{t('workout', 'restSetDuration')}
						</Text>
						<View style={styles.restModalChips}>
							{REST_DURATION_OPTIONS.map(sec => {
								const on = selectedDuration === sec
								return (
									<TouchableOpacity
										key={sec}
										style={[
											styles.restModalChip,
											on && styles.restModalChipOn,
										]}
										onPress={() => {
											Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
											applyRestDuration(sec)
										}}
										activeOpacity={0.7}
									>
										<Text
											style={[
												styles.restModalChipText,
												on && styles.restModalChipTextOn,
											]}
										>
											{formatRestSeconds(sec)}
										</Text>
									</TouchableOpacity>
								)
							})}
						</View>

						<View style={styles.restModalActions}>
							<View style={styles.restModalAdjustRow}>
								<TouchableOpacity
									style={[styles.restModalBtn, styles.restModalBtnHalf]}
									onPress={() => {
										Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
										setRestRemaining(prev =>
											prev == null ? null : Math.max(1, prev - 15),
										)
									}}
									activeOpacity={0.7}
								>
									<Ionicons name='remove' size={22} color={COLORS.text} />
									<Text style={styles.restModalBtnText}>
										{t('workout', 'restMinus15')}
									</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={[styles.restModalBtn, styles.restModalBtnHalf]}
									onPress={() => {
										Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
										setRestRemaining(prev => (prev == null ? null : prev + 15))
									}}
									activeOpacity={0.7}
								>
									<Ionicons name='add' size={22} color={COLORS.text} />
									<Text style={styles.restModalBtnText}>
										{t('workout', 'restAdd15')}
									</Text>
								</TouchableOpacity>
							</View>

							<TouchableOpacity
								style={styles.restModalBtn}
								onPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
									const kind = restKind ?? 'sets'
									startRestTimer(restInitialSecRef.current, kind)
								}}
								activeOpacity={0.7}
							>
								<Ionicons name='refresh' size={22} color={COLORS.text} />
								<Text style={styles.restModalBtnText}>
									{t('workout', 'restReset')}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[styles.restModalBtn, styles.restModalBtnPrimary]}
								onPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
									clearRestTimer()
								}}
								activeOpacity={0.7}
							>
								<Ionicons name='play-forward' size={22} color='#000' />
								<Text
									style={[styles.restModalBtnText, styles.restModalBtnTextPrimary]}
								>
									{t('workout', 'restSkip')}
								</Text>
							</TouchableOpacity>
						</View>
					</ScrollView>
				</View>
			</Modal>
		)
	}

	const renderExerciseDrawer = () => (
		<Modal
			visible={showExerciseDrawer}
			transparent
			animationType='none'
			onRequestClose={closeExerciseDrawer}
		>
			<View style={styles.exerciseDrawerRoot}>
				<Pressable
					style={styles.exerciseDrawerBackdrop}
					onPress={closeExerciseDrawer}
				/>
				<Animated.View
					style={[
						styles.exerciseDrawerPanel,
						{ transform: [{ translateX: exerciseDrawerX }] },
					]}
					{...drawerClosePanResponder.panHandlers}
				>
					<View style={styles.exerciseDrawerHeader}>
						<Text style={styles.exerciseDrawerTitle}>
							{t('workout', 'exercisesList')}
						</Text>
						<TouchableOpacity
							onPress={closeExerciseDrawer}
							style={styles.headerButton}
							activeOpacity={0.7}
						>
							<Ionicons name='close' size={22} color={COLORS.text} />
						</TouchableOpacity>
					</View>
					<ScrollView
						style={styles.exerciseDrawerList}
						showsVerticalScrollIndicator={false}
					>
						{exercises.map((ex, index) => {
							const detail = getExerciseDetails(ex.name)
							const thumb = detail?.images?.[0] ?? detail?.image ?? null
							const done = ex.sets.filter(s => s.completed && s.reps > 0).length
							const total = ex.sets.length
							const active = index === activeExerciseIndex
							return (
								<TouchableOpacity
									key={ex.id ?? index}
									style={[
										styles.exerciseDrawerItem,
										active && styles.exerciseDrawerItemActive,
									]}
									onPress={() => selectFocusExercise(index)}
									activeOpacity={0.7}
								>
									<Text style={styles.exerciseDrawerIndex}>{index + 1}</Text>
									<View style={styles.exerciseDrawerThumb}>
										{thumb ? (
											<Image
												source={thumb}
												style={styles.exerciseDrawerThumbImg}
												contentFit='cover'
											/>
										) : (
											<Ionicons
												name='barbell-outline'
												size={18}
												color={COLORS.textSecondary}
											/>
										)}
									</View>
									<View style={styles.exerciseDrawerInfo}>
										<Text
											style={[
												styles.exerciseDrawerName,
												active && styles.exerciseDrawerNameActive,
											]}
											numberOfLines={2}
										>
											{translateExerciseName(ex.name, language ?? 'ru')}
										</Text>
										<Text style={styles.exerciseDrawerMeta} numberOfLines={1}>
											{translateGroupName(ex.muscleGroup, language ?? 'ru')} ·{' '}
											{done}/{total}
										</Text>
									</View>
									{active ? (
										<Ionicons name='checkmark-circle' size={20} color={COLORS.primary} />
									) : (
										<Ionicons
											name='chevron-forward'
											size={18}
											color={COLORS.textSecondary}
										/>
									)}
								</TouchableOpacity>
							)
						})}
					</ScrollView>
				</Animated.View>
			</View>
		</Modal>
	)

	const activePoster =
		activeDetail?.images?.[0] ?? activeDetail?.image ?? null

	const renderFocusMedia = () => {
		if (!activeDetail) return null
		const hasVideo = !!activeDetail.videoUrl

		return (
			<View style={styles.focusMedia}>
				{hasVideo ? (
					<CachedVideo
						key={activeDetail.id}
						remoteUrl={activeDetail.videoUrl}
						videoId={activeDetail.id}
						style={styles.focusVideo}
						playing={isVideoPlaying}
						loop={false}
						muted
						nativeControls={false}
						poster={activePoster}
						onEnded={handleVideoEnded}
					/>
				) : activePoster ? (
					<View style={styles.focusVideo}>
						<Image
							source={activePoster}
							style={styles.focusPhoto}
							contentFit='contain'
						/>
					</View>
				) : null}
			</View>
		)
	}

	const renderEmptyExercises = () => (
		<View style={styles.emptyExercises}>
			<View style={styles.emptyIcon}>
				<Ionicons name='barbell-outline' size={48} color={COLORS.textSecondary} />
			</View>
			<Text style={styles.emptyTitle}>{t('workout', 'noExercises')}</Text>
			<Text style={styles.emptySubtitle}>{t('workout', 'noExercisesSubtitle')}</Text>
			<TouchableOpacity
				style={styles.addFirstExerciseButton}
				onPress={() => {
					Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
					setShowExerciseSelection(true)
				}}
				activeOpacity={0.7}
			>
				<Ionicons name='add' size={20} color='#000' />
				<Text style={styles.addFirstExerciseText}>{t('workout', 'addExercise')}</Text>
			</TouchableOpacity>
		</View>
	)

	if (isSaving) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<View style={styles.loadingSpinner}>
						<Ionicons name='barbell' size={48} color={COLORS.primary} />
					</View>
					<Text style={styles.loadingText}>{t('workout', 'saving')}</Text>
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
						placeholder={t('workout', 'myWorkout')}
						placeholderTextColor={COLORS.textSecondary}
					/>
				</View>

				<TouchableOpacity
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
						setShowNotesModal(true)
					}}
					style={styles.headerButton}
					activeOpacity={0.7}
				>
					<Ionicons
						name={notes.trim() ? 'document-text' : 'document-text-outline'}
						size={22}
						color={notes.trim() ? COLORS.primary : COLORS.textSecondary}
					/>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={toggleFocusMode}
					style={styles.headerButton}
					activeOpacity={0.7}
				>
					<Ionicons
						name={useFocusMode ? 'list-outline' : 'play-circle-outline'}
						size={22}
						color={COLORS.text}
					/>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={handleFinishWorkout}
					style={styles.finishIconButton}
					activeOpacity={0.7}
					accessibilityLabel={t('workout', 'finish')}
				>
					<Ionicons name='flag' size={22} color={COLORS.error} />
				</TouchableOpacity>
			</View>

			<ScrollView
				style={styles.content}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.contentContainer}
				keyboardShouldPersistTaps='handled'
			>
				<View style={styles.statsCard}>
					<View style={styles.statsRow}>
						<View style={styles.statItem}>
							<Text
								style={styles.statNumber}
								numberOfLines={1}
								adjustsFontSizeToFit
								minimumFontScale={0.7}
							>
								{totalCompleted}/{totalSets}
							</Text>
							<Text style={styles.statLabel} numberOfLines={1}>
								{t('workout', 'sets')}
							</Text>
						</View>
						<View style={styles.statItem}>
							<Text
								style={styles.statNumber}
								numberOfLines={1}
								adjustsFontSizeToFit
								minimumFontScale={0.7}
							>
								{exercises.length}
							</Text>
							<Text style={styles.statLabel} numberOfLines={1}>
								{t('workout', 'exercises')}
							</Text>
						</View>
						{isWorkoutActive && (
							<View style={styles.statItem}>
								<Text
									style={styles.statNumber}
									numberOfLines={1}
									adjustsFontSizeToFit
									minimumFontScale={0.65}
								>
									{formatTime(workoutDuration)}
								</Text>
								<Text style={styles.statLabel} numberOfLines={1}>
									{t('workout', 'time')}
								</Text>
							</View>
						)}
						<View style={styles.statItem}>
							<Text
								style={styles.statNumber}
								numberOfLines={1}
								adjustsFontSizeToFit
								minimumFontScale={0.65}
							>
								{totalVolume >= 1_000_000
									? `${(totalVolume / 1_000_000).toFixed(1)}M`
									: totalVolume >= 10_000
										? `${Math.round(totalVolume / 1000)}k`
										: totalVolume >= 1000
											? `${(totalVolume / 1000).toFixed(1)}k`
											: `${Math.round(totalVolume)}`}
							</Text>
							<Text style={styles.statLabel} numberOfLines={1}>
								{t('workout', 'volume')}
							</Text>
						</View>
						<View style={styles.restCompact}>
							<TouchableOpacity
								style={[
									styles.restStartBtn,
									restRemaining != null && styles.restStartBtnActive,
								]}
								onPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
									startRestTimer(restSettings.betweenSetsSec, 'sets')
								}}
								activeOpacity={0.7}
								accessibilityLabel={t('workout', 'restStart')}
							>
								<Ionicons
									name='timer-outline'
									size={16}
									color={
										restRemaining != null ? '#000' : COLORS.primary
									}
								/>
							</TouchableOpacity>
							<Switch
								value={restEnabled}
								onValueChange={v => {
									setRestEnabled(v)
									if (!v) clearRestTimer()
								}}
								trackColor={{
									false: COLORS.border,
									true: `${COLORS.primary}80`,
								}}
								thumbColor={restEnabled ? COLORS.primary : COLORS.textSecondary}
								style={styles.restSwitch}
							/>
						</View>
					</View>
				</View>

				{useFocusMode && exercises.length > 0 && activeExercise ? (
					<View style={styles.focusSection}>
						<View style={styles.focusToolbar}>
						<TouchableOpacity
							style={styles.focusDrawerBtn}
							onPress={openExerciseDrawer}
							activeOpacity={0.7}
							accessibilityLabel={t('workout', 'exercisesList')}
						>
							<Ionicons name='menu-outline' size={20} color={COLORS.text} />
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.focusToolbarBtn}
							onPress={toggleWorkoutTimer}
							activeOpacity={0.7}
						>
							<Ionicons
								name={isVideoPlaying ? 'pause' : 'play'}
								size={18}
								color='#000'
							/>
							<Text style={styles.focusToolbarBtnText} numberOfLines={1}>
								{isVideoPlaying ? t('workout', 'pause') : t('workout', 'start')}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.focusCounterBtn}
							onPress={openExerciseDrawer}
							activeOpacity={0.7}
						>
							<Text style={styles.focusCounterBtnText}>
								{activeExerciseIndex + 1}/{exercises.length}
							</Text>
							<Ionicons name='chevron-forward' size={14} color={COLORS.primary} />
						</TouchableOpacity>
					</View>

					{renderFocusMedia()}

						<View style={styles.focusExerciseHeader}>
							<View style={styles.focusExerciseThumbWrap}>
								{activePoster ? (
									<Image
										source={activePoster}
										style={styles.focusExerciseThumb}
										contentFit='cover'
									/>
								) : (
									<Ionicons
										name='barbell-outline'
										size={20}
										color={COLORS.textSecondary}
									/>
								)}
							</View>
							<View style={styles.focusExerciseInfo}>
								<Text style={styles.focusExerciseName} numberOfLines={2}>
									{translateExerciseName(
										activeExercise.name,
										language ?? 'ru',
									)}
								</Text>
								<Text style={styles.focusExerciseMeta} numberOfLines={1}>
									{translateGroupName(
										activeExercise.muscleGroup,
										language ?? 'ru',
									)}{' '}
									· {activeExerciseIndex + 1}/{exercises.length}
								</Text>
							</View>
							<View style={styles.focusExerciseActions}>
								<TouchableOpacity
									style={styles.infoButton}
									onPress={() => {
										Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
										setShowFocusDetailsModal(true)
									}}
									activeOpacity={0.7}
								>
									<Ionicons
										name='information-circle-outline'
										size={22}
										color={COLORS.warning}
									/>
								</TouchableOpacity>
								{activeExercise.sets.length > 0 && (
									<TouchableOpacity
										style={styles.historyButton}
										onPress={() => {
											Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
											setShowFocusHistoryModal(true)
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
							</View>
						</View>

						<ExerciseHistoryModal
							visible={showFocusHistoryModal}
							onClose={() => setShowFocusHistoryModal(false)}
							exerciseName={activeExercise.name}
							currentSets={activeExercise.sets}
						/>

						{showFocusDetailsModal && (
							<ExerciseDetailModal
								visible={showFocusDetailsModal}
								onClose={() => setShowFocusDetailsModal(false)}
								exerciseDetail={activeDetail}
							/>
						)}

						<View style={styles.focusSetsCard}>
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
								<Text style={{ ...styles.setHeaderText, width: 70 }}>
									{t('workout', 'weight')}
								</Text>
								<Text style={{ ...styles.setHeaderText, width: 30 }} />
								<Text style={{ ...styles.setHeaderText, width: 70 }}>
									{t('workout', 'reps')}
								</Text>
								<Text style={{ ...styles.setHeaderText, width: 40 }}>✓</Text>
								<Text style={{ ...styles.setHeaderText, width: 20 }}>x</Text>
							</View>
							{activeExercise.sets.map(set => (
								<SetRow
									key={`${activeExercise.id}-${set.id || set.setNumber}`}
									set={set}
									exerciseId={activeExercise.id!}
									onComplete={handleSetComplete}
									onUpdate={handleUpdateSet}
									onRemove={handleRemoveSet}
								/>
							))}
							<TouchableOpacity
								style={styles.addSetButton}
								onPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
									if (activeExercise.id) handleAddSet(activeExercise.id)
								}}
								activeOpacity={0.7}
							>
								<Ionicons name='add' size={18} color={COLORS.primary} />
								<Text style={styles.addSetText}>{t('workout', 'addSet')}</Text>
							</TouchableOpacity>
						</View>

						<TouchableOpacity
							style={styles.nextExerciseBtn}
							onPress={openNextExercisePicker}
							activeOpacity={0.7}
						>
							<Text style={styles.nextExerciseBtnText}>
								{t('workout', 'nextExercise')}
							</Text>
							<Ionicons name='chevron-forward' size={20} color='#000' />
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.saveTemplateCard}
							onPress={() => {
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
								void handleSaveAsTemplate()
							}}
							activeOpacity={0.7}
						>
							<Ionicons name='copy-outline' size={20} color={COLORS.primary} />
							<Text style={styles.saveTemplateText}>
								{t('workout', 'saveAsTemplate')}
							</Text>
						</TouchableOpacity>
					</View>
				) : (
					<View style={styles.exercisesSection}>
						<View style={styles.sectionHeader}>
							<Text style={{ ...styles.sectionTitle, paddingHorizontal: 16 }}>
								{t('workout', 'exercises')}
							</Text>
							<Text style={{ ...styles.sectionSubtitle, paddingHorizontal: 16 }}>
								{exercises.length} {t('workout', 'exercises').toLowerCase()}
							</Text>
						</View>

						{exercises.length === 0 ? (
							renderEmptyExercises()
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
										{t('workout', 'addExercise')}
									</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={styles.saveTemplateCard}
									onPress={() => {
										Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
										void handleSaveAsTemplate()
									}}
									activeOpacity={0.7}
								>
									<Ionicons name='copy-outline' size={20} color={COLORS.primary} />
									<Text style={styles.saveTemplateText}>
										{t('workout', 'saveAsTemplate')}
									</Text>
								</TouchableOpacity>
							</>
						)}
					</View>
				)}

				<View style={styles.spacer} />
			</ScrollView>

			{renderRestFloat()}
			{renderRestModal()}
			{renderExerciseDrawer()}

			{useFocusMode && exercises.length > 0 && !showExerciseDrawer ? (
				<View
					style={styles.focusEdgeSwipeZone}
					{...edgeOpenPanResponder.panHandlers}
				/>
			) : null}

			<Modal
				visible={showNotesModal}
				animationType='slide'
				transparent
				onRequestClose={() => setShowNotesModal(false)}
			>
				<View style={styles.notesModalAvoid}>
					<Pressable
						style={styles.notesModalBackdrop}
						onPress={() => {
							Keyboard.dismiss()
							setShowNotesModal(false)
						}}
					>
						<Pressable
							style={[
								styles.notesModalSheet,
								{ marginBottom: notesKeyboardHeight },
							]}
							onPress={e => e.stopPropagation()}
						>
							<View style={styles.notesModalHeader}>
								<Text style={styles.notesModalTitle}>{t('workout', 'notes')}</Text>
								<TouchableOpacity
									onPress={() => {
										Keyboard.dismiss()
										setShowNotesModal(false)
									}}
									style={styles.headerButton}
									activeOpacity={0.7}
								>
									<Ionicons name='close' size={22} color={COLORS.text} />
								</TouchableOpacity>
							</View>
							<TextInput
								style={styles.notesModalInput}
								placeholder={t('workout', 'notesPlaceholder')}
								placeholderTextColor={COLORS.textSecondary}
								multiline
								textAlignVertical='top'
								value={notes}
								onChangeText={setNotes}
								autoFocus
							/>
						</Pressable>
					</Pressable>
				</View>
			</Modal>

			<ExerciseSelectionModal
				visible={showExerciseSelection}
				onClose={() => setShowExerciseSelection(false)}
				onSelectExercise={handleExerciseSelect}
				preferredMuscleGroup={
					activeExercise?.muscleGroup ??
					(exercises.length > 0
						? exercises[exercises.length - 1]?.muscleGroup
						: null)
				}
			/>
		</SafeAreaView>
	)
}

interface ExerciseDetailModalProps {
	visible: boolean
	onClose: () => void
	exerciseDetail: ExerciseDetail | null
}

function makeGalleryStyles(C: AppColors) {
	return StyleSheet.create({
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
			backgroundColor: C.textSecondary,
			marginHorizontal: 4,
		},
		activeDot: { backgroundColor: C.primary },
	})
}

function makeStyles(C: AppColors) {
	return StyleSheet.create({
	infoButton: { padding: 8 },
	video: { width: '100%', height: 200, marginVertical: 10, borderRadius: 16 },
	container: { flex: 1, backgroundColor: C.background, overflow: 'visible' },
	loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	loadingSpinner: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: C.card,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 20,
	},
	loadingText: { fontSize: 16, color: C.textSecondary },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 8,
		paddingVertical: 12,
		backgroundColor: C.card,
		borderBottomWidth: 1,
		borderBottomColor: C.border,
	},
	headerButton: { padding: 8 },
	headerCenter: { flex: 1, alignItems: 'center', marginHorizontal: 4 },
	workoutNameInput: {
		fontSize: 16,
		fontWeight: '600',
		color: C.text,
		textAlign: 'center',
		paddingVertical: 6,
		paddingHorizontal: 4,
		minWidth: 100,
		maxWidth: '100%',
	},
	finishIconButton: {
		padding: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	content: { flex: 1 },
	contentContainer: { paddingBottom: 24 },
	statsCard: {
		backgroundColor: C.card,
		marginHorizontal: 8,
		marginTop: 8,
		borderRadius: 12,
		paddingVertical: 8,
		paddingHorizontal: 8,
		borderWidth: 1,
		borderColor: C.border,
	},
	statsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
	},
	statItem: {
		flex: 1,
		minWidth: 0,
		alignItems: 'center',
		overflow: 'hidden',
		paddingHorizontal: 2,
	},
	statNumber: {
		fontSize: 13,
		fontWeight: '700',
		color: C.primary,
		fontVariant: ['tabular-nums'],
		width: '100%',
		textAlign: 'center',
	},
	statLabel: {
		fontSize: 9,
		color: C.textSecondary,
		marginTop: 1,
		flexShrink: 0,
		width: '100%',
		textAlign: 'center',
	},
	restCompact: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
		paddingLeft: 6,
		borderLeftWidth: 1,
		borderLeftColor: C.border,
		flexShrink: 0,
	},
	restStartBtn: {
		alignItems: 'center',
		justifyContent: 'center',
		width: 32,
		height: 32,
		borderRadius: 8,
		backgroundColor: `${C.primary}18`,
		borderWidth: 1,
		borderColor: `${C.primary}44`,
	},
	restStartBtnActive: {
		backgroundColor: C.primary,
		borderColor: C.primary,
	},
	restStartBtnText: {
		fontSize: 11,
		fontWeight: '700',
		color: C.primary,
	},
	restStartBtnTextActive: {
		color: '#000',
	},
	restSwitch: {
		transform: [{ scaleX: 0.78 }, { scaleY: 0.78 }],
	},
	restToggleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: C.card,
		marginHorizontal: 8,
		marginTop: 8,
		borderRadius: 16,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: C.border,
		gap: 12,
	},
	restToggleLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		flex: 1,
	},
	restToggleTitle: {
		fontSize: 15,
		fontWeight: '600',
		color: C.text,
	},
	restToggleSubtitle: {
		fontSize: 12,
		color: C.textSecondary,
		marginTop: 2,
	},
	restFloat: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: REST_FLOAT_W,
		zIndex: 10000,
		elevation: 12,
		backgroundColor: C.card,
		borderRadius: 16,
		paddingHorizontal: 12,
		paddingTop: 8,
		paddingBottom: 10,
		borderWidth: 1,
		borderColor: C.primary,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 10,
	},
	restFloatHandle: {
		alignItems: 'center',
		marginBottom: 4,
	},
	restFloatHandleBar: {
		width: 28,
		height: 4,
		borderRadius: 2,
		backgroundColor: C.border,
	},
	restFloatLabel: {
		fontSize: 11,
		fontWeight: '600',
		color: C.textSecondary,
		textAlign: 'center',
	},
	restFloatTime: {
		fontSize: 26,
		fontWeight: '700',
		color: C.primary,
		textAlign: 'center',
		fontVariant: ['tabular-nums'],
		marginTop: 2,
	},
	restModalRoot: {
		flex: 1,
		backgroundColor: C.background,
	},
	restModalContent: {
		flexGrow: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 24,
		paddingTop: 72,
		paddingBottom: 40,
	},
	restModalClose: {
		position: 'absolute',
		top: 56,
		right: 20,
		padding: 8,
		zIndex: 2,
	},
	restModalKind: {
		fontSize: 16,
		fontWeight: '600',
		color: C.textSecondary,
		marginBottom: 16,
		textAlign: 'center',
	},
	restModalTime: {
		fontSize: 88,
		fontWeight: '800',
		color: C.primary,
		fontVariant: ['tabular-nums'],
		letterSpacing: -2,
		marginBottom: 28,
	},
	restModalDurationLabel: {
		fontSize: 13,
		fontWeight: '600',
		color: C.textSecondary,
		alignSelf: 'stretch',
		maxWidth: 360,
		marginBottom: 10,
	},
	restModalChips: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		alignSelf: 'stretch',
		maxWidth: 360,
		marginBottom: 28,
	},
	restModalChip: {
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: C.border,
		backgroundColor: C.card,
	},
	restModalChipOn: {
		borderColor: C.primary,
		backgroundColor: `${C.primary}22`,
	},
	restModalChipText: {
		color: C.textSecondary,
		fontWeight: '700',
		fontSize: 13,
	},
	restModalChipTextOn: {
		color: C.primary,
	},
	restModalActions: {
		width: '100%',
		maxWidth: 360,
		gap: 12,
	},
	restModalAdjustRow: {
		flexDirection: 'row',
		gap: 12,
	},
	restModalBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		paddingVertical: 16,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: C.border,
		backgroundColor: C.card,
	},
	restModalBtnHalf: {
		flex: 1,
	},
	restModalBtnPrimary: {
		backgroundColor: C.primary,
		borderColor: C.primary,
	},
	restModalBtnText: {
		fontSize: 16,
		fontWeight: '700',
		color: C.text,
	},
	restModalBtnTextPrimary: {
		color: '#000',
	},
	restBanner: {
		backgroundColor: C.card,
		marginHorizontal: 8,
		marginTop: 8,
		borderRadius: 12,
		padding: 12,
		borderWidth: 1,
		borderColor: C.primary,
	},
	restBannerTop: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	restBannerLabel: {
		fontSize: 13,
		fontWeight: '600',
		color: C.textSecondary,
	},
	restBannerTime: {
		fontSize: 24,
		fontWeight: '700',
		color: C.primary,
		fontVariant: ['tabular-nums'],
	},
	restBannerActions: {
		flexDirection: 'row',
		gap: 8,
	},
	restBannerBtn: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 8,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: C.border,
		backgroundColor: C.background,
	},
	restBannerBtnPrimary: {
		borderColor: C.primary,
		backgroundColor: `${C.primary}22`,
	},
	restBannerBtnText: {
		fontSize: 13,
		fontWeight: '600',
		color: C.textSecondary,
	},
	restBannerBtnTextPrimary: {
		color: C.primary,
	},
	focusSection: {
		marginTop: 8,
		paddingBottom: 8,
	},
	focusEdgeSwipeZone: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
		width: 28,
		zIndex: 40,
	},
	focusToolbar: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingHorizontal: 8,
		marginBottom: 8,
	},
	focusDrawerBtn: {
		width: 40,
		height: 40,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: C.card,
		borderWidth: 1,
		borderColor: C.border,
	},
	focusToolbarBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: C.primary,
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 10,
		alignSelf: 'flex-start',
	},
	focusToolbarBtnText: {
		fontSize: 13,
		fontWeight: '700',
		color: '#000',
	},
	focusCounterBtn: {
		marginLeft: 'auto',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderRadius: 10,
		backgroundColor: C.card,
		borderWidth: 1,
		borderColor: C.border,
	},
	focusCounterBtnText: {
		fontSize: 13,
		fontWeight: '700',
		color: C.primary,
		fontVariant: ['tabular-nums'],
	},
	exerciseDrawerRoot: {
		flex: 1,
		flexDirection: 'row',
	},
	exerciseDrawerBackdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.45)',
	},
	exerciseDrawerPanel: {
		width: EXERCISE_DRAWER_W,
		height: '100%',
		backgroundColor: C.card,
		borderRightWidth: 1,
		borderRightColor: C.border,
		paddingTop: 12,
		paddingBottom: 24,
		zIndex: 2,
	},
	exerciseDrawerHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 12,
		paddingBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: C.border,
	},
	exerciseDrawerTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: C.text,
	},
	exerciseDrawerList: {
		flex: 1,
		paddingHorizontal: 8,
		paddingTop: 8,
	},
	exerciseDrawerItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingVertical: 10,
		paddingHorizontal: 8,
		borderRadius: 12,
		marginBottom: 6,
		backgroundColor: C.background,
		borderWidth: 1,
		borderColor: C.border,
	},
	exerciseDrawerItemActive: {
		borderColor: C.primary,
		backgroundColor: `${C.primary}14`,
	},
	exerciseDrawerIndex: {
		width: 22,
		fontSize: 13,
		fontWeight: '700',
		color: C.textSecondary,
		textAlign: 'center',
	},
	exerciseDrawerThumb: {
		width: 44,
		height: 44,
		borderRadius: 8,
		overflow: 'hidden',
		backgroundColor: C.cardLight,
		alignItems: 'center',
		justifyContent: 'center',
	},
	exerciseDrawerThumbImg: {
		width: '100%',
		height: '100%',
	},
	exerciseDrawerInfo: {
		flex: 1,
		minWidth: 0,
	},
	exerciseDrawerName: {
		fontSize: 14,
		fontWeight: '600',
		color: C.text,
	},
	exerciseDrawerNameActive: {
		color: C.primary,
	},
	exerciseDrawerMeta: {
		fontSize: 11,
		color: C.textSecondary,
		marginTop: 2,
	},
	focusMediaChip: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: C.card,
		borderWidth: 1,
		borderColor: C.border,
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderRadius: 10,
	},
	focusMediaChipText: {
		flex: 1,
		fontSize: 12,
		fontWeight: '600',
		color: C.text,
	},
	focusMedia: {
		marginHorizontal: 8,
		marginBottom: 8,
		gap: 8,
	},
	focusVideo: {
		width: '100%',
		height: 200,
		borderRadius: 12,
		overflow: 'hidden',
		backgroundColor: C.card,
	},
	focusPhotosWrap: {
		borderRadius: 12,
		overflow: 'hidden',
		backgroundColor: C.card,
		borderWidth: 1,
		borderColor: C.border,
	},
	focusPhotoSlide: {
		width: SCREEN_WIDTH - 16,
		height: 180,
		alignItems: 'center',
		justifyContent: 'center',
	},
	focusPhoto: {
		width: '100%',
		height: '100%',
	},
	focusPhotoDots: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 6,
		paddingVertical: 8,
	},
	focusPhotoDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: C.border,
	},
	focusPhotoDotActive: {
		backgroundColor: C.primary,
	},
	focusExerciseHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		marginHorizontal: 8,
		marginBottom: 8,
		padding: 12,
		backgroundColor: C.card,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: C.border,
	},
	focusExerciseThumbWrap: {
		width: 48,
		height: 48,
		borderRadius: 10,
		overflow: 'hidden',
		backgroundColor: C.cardLight,
		alignItems: 'center',
		justifyContent: 'center',
	},
	focusExerciseThumb: {
		width: '100%',
		height: '100%',
	},
	focusExerciseInfo: { flex: 1, minWidth: 0 },
	focusExerciseName: {
		fontSize: 16,
		fontWeight: '700',
		color: C.text,
	},
	focusExerciseMeta: {
		fontSize: 12,
		color: C.textSecondary,
		marginTop: 2,
	},
	focusExerciseActions: {
		flexDirection: 'row',
		alignItems: 'center',
		flexShrink: 0,
	},
	focusSetsCard: {
		backgroundColor: C.card,
		marginHorizontal: 8,
		marginBottom: 8,
		borderRadius: 12,
		padding: 12,
		borderWidth: 1,
		borderColor: C.border,
	},
	nextExerciseBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
		backgroundColor: C.primary,
		marginHorizontal: 8,
		marginBottom: 8,
		paddingVertical: 14,
		borderRadius: 12,
	},
	nextExerciseBtnText: {
		fontSize: 16,
		fontWeight: '700',
		color: '#000',
	},
	notesModalAvoid: {
		flex: 1,
	},
	notesModalBackdrop: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.45)',
		justifyContent: 'flex-end',
	},
	notesModalSheet: {
		backgroundColor: C.card,
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 28,
		minHeight: 280,
		maxHeight: SCREEN_HEIGHT * 0.75,
		borderWidth: 1,
		borderColor: C.border,
	},
	notesModalHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	notesModalTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: C.text,
	},
	notesModalInput: {
		borderWidth: 1,
		borderColor: C.border,
		borderRadius: 12,
		padding: 14,
		fontSize: 15,
		color: C.text,
		minHeight: 160,
		backgroundColor: C.cardLight,
	},
	exercisesSection: { marginTop: 8 },
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
	},
	sectionTitle: { fontSize: 18, fontWeight: 'bold', color: C.text },
	sectionSubtitle: { fontSize: 14, color: C.textSecondary },
	emptyExercises: {
		alignItems: 'center',
		padding: 40,
		marginHorizontal: 8,
		backgroundColor: C.card,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: C.border,
		marginTop: 8,
	},
	emptyIcon: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: C.cardLight,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 20,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: C.text,
		marginBottom: 8,
	},
	emptySubtitle: {
		fontSize: 14,
		color: C.textSecondary,
		textAlign: 'center',
		marginBottom: 24,
	},
	addFirstExerciseButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: C.primary,
		paddingHorizontal: 24,
		paddingVertical: 14,
		borderRadius: 12,
	},
	addFirstExerciseText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#000',
		marginLeft: 8,
	},
	exerciseCard: {
		backgroundColor: C.card,
		marginHorizontal: 8,
		marginBottom: 12,
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: C.border,
	},
	exerciseHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
		gap: 8,
	},
	exerciseHeaderCollapsed: {
		marginBottom: 0,
	},
	exerciseHeaderLeft: {
		flexDirection: 'row',
		flex: 1,
		alignItems: 'center',
		minWidth: 0,
	},
	exerciseThumbWrap: {
		width: 44,
		height: 44,
		borderRadius: 8,
		overflow: 'hidden',
		backgroundColor: C.cardLight,
		marginLeft: 8,
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
	},
	exerciseThumb: {
		width: '100%',
		height: '100%',
	},
	exerciseThumbPlaceholder: {
		width: 44,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
	},
	exerciseInfo: { flex: 1, marginLeft: 12, minWidth: 0 },
	exerciseName: {
		fontSize: 15,
		fontWeight: '600',
		color: C.text,
		marginBottom: 4,
	},
	exerciseMeta: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		flexWrap: 'nowrap',
	},
	muscleGroupTag: {
		backgroundColor: 'rgba(52, 199, 89, 0.1)',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
		maxWidth: '70%',
		flexShrink: 1,
	},
	muscleGroupText: { fontSize: 12, color: C.primary, fontWeight: '500' },
	setsIndicator: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		flexShrink: 0,
	},
	setsText: { fontSize: 12, color: C.textSecondary },
	exerciseHeaderRight: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
		flexShrink: 0,
	},
	deleteExerciseButton: { padding: 4 },
	setsContainer: { marginTop: 8 },
	setsHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 8,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: C.border,
		marginBottom: 4,
		textAlign: 'center',
	},
	setHeaderText: {
		fontSize: 12,
		fontWeight: '600',
		color: C.textSecondary,
		width: 40,
		textAlign: 'center',
	},
	setRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: C.track,
	},
	setNumberContainer: {
		width: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	setNumber: { fontSize: 16, fontWeight: '600', color: C.text },
	setInputContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	input: {
		height: 40,
		borderWidth: 1,
		borderColor: C.border,
		borderRadius: 8,
		textAlign: 'center',
		fontSize: 16,
		color: C.text,
		backgroundColor: C.cardLight,
	},
	weightInput: { width: 80, marginRight: 4 },
	repsInput: { width: 80, marginRight: 4 },
	inputCompleted: {
		backgroundColor: 'rgba(52, 199, 89, 0.1)',
		borderColor: C.primary,
	},
	inputLabel: { fontSize: 12, color: C.textSecondary, marginLeft: 4 },
	checkbox: {
		width: 32,
		height: 32,
		borderRadius: 16,
		borderWidth: 2,
		borderColor: C.border,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: C.cardLight,
	},
	checkboxCompleted: {
		backgroundColor: C.primary,
		borderColor: C.primary,
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
		color: C.primary,
		fontWeight: '600',
		marginLeft: 8,
	},
	addExerciseCard: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: C.card,
		padding: 16,
		marginHorizontal: 8,
		marginBottom: 12,
		borderRadius: 16,
		borderWidth: 1,
		borderStyle: 'dashed',
		borderColor: C.primary,
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
		color: C.primary,
		fontWeight: '600',
	},
	saveTemplateCard: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		backgroundColor: 'rgba(52,199,89,0.08)',
		padding: 14,
		marginHorizontal: 8,
		marginBottom: 12,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: 'rgba(52,199,89,0.2)',
	},
	saveTemplateText: {
		fontSize: 15,
		color: C.primary,
		fontWeight: '700',
	},
	notesSection: {
		backgroundColor: C.card,
		margin: 8,
		marginTop: 8,
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: C.border,
	},
	notesInput: {
		borderWidth: 1,
		borderColor: C.border,
		borderRadius: 12,
		padding: 16,
		fontSize: 14,
		color: C.text,
		minHeight: 100,
		backgroundColor: C.cardLight,
		marginTop: 8,
	},
	spacer: { height: 20 },
	historyButton: { padding: 8, marginRight: 8 },
	})
}
