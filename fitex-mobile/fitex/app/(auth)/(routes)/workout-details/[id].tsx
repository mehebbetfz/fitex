import { useLanguage } from '@/contexts/language-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import {
	Alert,
	Dimensions,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { LineChart } from 'react-native-chart-kit'
import { SafeAreaView } from 'react-native-safe-area-context'

// Типы данных
interface ExerciseSet {
	setNumber: number
	weight: number
	reps: number
	completed: boolean
}

interface Exercise {
	id: string
	name: string
	muscleGroup: string
	sets: ExerciseSet[]
	notes?: string
	oneRepMax?: number
	volume: number
}

interface WorkoutDetail {
	id: string
	date: string
	time: string
	duration: string
	type: string
	muscleGroups: string[]
	exercises: Exercise[]
	totalVolume: number
	totalExercises: number
	totalSets: number
	rating?: number
	notes?: string
}

// Моковые данные детальных тренировок
const DETAILED_WORKOUTS: WorkoutDetail[] = [
	{
		id: '1',
		date: 'Сегодня',
		time: '18:30',
		duration: '45 мин',
		type: 'Силовая',
		muscleGroups: ['Грудь', 'Трицепс'],
		totalVolume: 4800,
		totalExercises: 4,
		totalSets: 16,
		rating: 4,
		notes: 'Хорошая тренировка, прогресс по жиму лежа',
		exercises: [
			{
				id: 'ex1',
				name: 'Жим штанги лежа',
				muscleGroup: 'Грудь',
				volume: 2000,
				oneRepMax: 120,
				notes: 'Прогресс на 5 кг',
				sets: [
					{ setNumber: 1, weight: 60, reps: 12, completed: true },
					{ setNumber: 2, weight: 70, reps: 10, completed: true },
					{ setNumber: 3, weight: 80, reps: 8, completed: true },
					{ setNumber: 4, weight: 85, reps: 6, completed: true },
				],
			},
			{
				id: 'ex2',
				name: 'Разводка гантелей',
				muscleGroup: 'Грудь',
				volume: 900,
				sets: [
					{ setNumber: 1, weight: 15, reps: 12, completed: true },
					{ setNumber: 2, weight: 17.5, reps: 10, completed: true },
					{ setNumber: 3, weight: 20, reps: 8, completed: true },
					{ setNumber: 4, weight: 20, reps: 8, completed: true },
				],
			},
			{
				id: 'ex3',
				name: 'Жим штанги узким хватом',
				muscleGroup: 'Трицепс',
				volume: 1200,
				notes: 'Фокус на технике',
				sets: [
					{ setNumber: 1, weight: 40, reps: 12, completed: true },
					{ setNumber: 2, weight: 45, reps: 10, completed: true },
					{ setNumber: 3, weight: 50, reps: 8, completed: true },
					{ setNumber: 4, weight: 50, reps: 8, completed: true },
				],
			},
			{
				id: 'ex4',
				name: 'Разгибание рук на блоке',
				muscleGroup: 'Трицепс',
				volume: 700,
				sets: [
					{ setNumber: 1, weight: 30, reps: 15, completed: true },
					{ setNumber: 2, weight: 35, reps: 12, completed: true },
					{ setNumber: 3, weight: 40, reps: 10, completed: true },
					{ setNumber: 4, weight: 40, reps: 10, completed: true },
				],
			},
		],
	},
	{
		id: '2',
		date: 'Вчера',
		time: '19:15',
		duration: '60 мин',
		type: 'Кардио',
		muscleGroups: ['Ноги', 'Пресс'],
		totalVolume: 3200,
		totalExercises: 5,
		totalSets: 20,
		rating: 5,
		notes: 'Интенсивная кардио сессия',
		exercises: [
			{
				id: 'ex5',
				name: 'Беговая дорожка',
				muscleGroup: 'Ноги',
				volume: 0,
				notes: 'Интервальный бег',
				sets: [
					{ setNumber: 1, weight: 0, reps: 10, completed: true },
					{ setNumber: 2, weight: 0, reps: 10, completed: true },
					{ setNumber: 3, weight: 0, reps: 10, completed: true },
					{ setNumber: 4, weight: 0, reps: 10, completed: true },
				],
			},
			// ... другие упражнения
		],
	},
	// ... другие тренировки
]

// Данные для графиков прогресса
const PROGRESS_DATA = {
	'Жим штанги лежа': {
		labels: ['1 нед', '2 нед', '3 нед', '4 нед'],
		data: [75, 80, 85, 90],
	},
	'Разводка гантелей': {
		labels: ['1 нед', '2 нед', '3 нед', '4 нед'],
		data: [12.5, 15, 17.5, 20],
	},
}

export default function WorkoutDetailScreen() {
	const { t } = useLanguage()
	const { id } = useLocalSearchParams<{ id: string }>()
	const [workout, setWorkout] = useState<WorkoutDetail | null>(null)
	const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
		null,
	)
	const [showNotes, setShowNotes] = useState(false)

	useEffect(() => {
		if (id) {
			const foundWorkout = DETAILED_WORKOUTS.find(w => w.id === id)
			if (foundWorkout) {
				setWorkout(foundWorkout)
				setSelectedExercise(foundWorkout.exercises[0])
			}
		}
	}, [id])

	const handleDeleteWorkout = () => {
		Alert.alert(
			t('workout', 'deleteExercise'),
			t('workout', 'deleteSetMsg'),
			[
				{ text: t('common', 'cancel'), style: 'cancel' },
				{
					text: t('common', 'delete'),
					style: 'destructive',
					onPress: () => {
						router.back()
					},
				},
			],
		)
	}

	const renderExerciseCard = (exercise: Exercise) => (
		<TouchableOpacity
			key={exercise.id}
			style={[
				styles.exerciseCard,
				selectedExercise?.id === exercise.id && styles.exerciseCardActive,
			]}
			onPress={() => setSelectedExercise(exercise)}
		>
			<View style={styles.exerciseHeader}>
				<View style={styles.exerciseInfo}>
					<Text style={styles.exerciseName}>{exercise.name}</Text>
					<View style={styles.muscleTagSmall}>
						<Text style={styles.muscleTagTextSmall}>
							{exercise.muscleGroup}
						</Text>
					</View>
				</View>
				<View style={styles.exerciseStats}>
				<Text style={styles.volumeText}>{exercise.volume} {t('records', 'kg')}</Text>
				<Text style={styles.setsText}>{exercise.sets.length} {t('workout', 'sets')}</Text>
			</View>
			</View>
			{exercise.notes && (
				<Text style={styles.exerciseNotes} numberOfLines={1}>
					{exercise.notes}
				</Text>
			)}
		</TouchableOpacity>
	)

	const renderProgressChart = () => {
		if (
			!selectedExercise ||
			!PROGRESS_DATA[selectedExercise.name as keyof typeof PROGRESS_DATA]
		) {
			return null
		}

		const data =
			PROGRESS_DATA[selectedExercise.name as keyof typeof PROGRESS_DATA]

		return (
			<View style={styles.chartContainer}>
					<Text style={styles.chartTitle}>{t('records', 'progress')}</Text>
				<LineChart
					data={{
						labels: data.labels,
						datasets: [{ data: data.data }],
					}}
					width={Dimensions.get('window').width - 80}
					height={200}
					chartConfig={{
						backgroundColor: '#1C1C1E',
						backgroundGradientFrom: '#1C1C1E',
						backgroundGradientTo: '#1C1C1E',
						decimalPlaces: 0,
						color: (opacity = 1) => `rgba(0, 255, 72, ${opacity})`,
						labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
						style: {
							borderRadius: 16,
						},
						propsForDots: {
							r: '6',
							strokeWidth: '2',
							stroke: '#00ff48',
						},
					}}
					bezier
					style={{
						marginVertical: 8,
						borderRadius: 16,
					}}
				/>
			</View>
		)
	}

	if (!workout) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.centerContent}>
					<Ionicons name='barbell-outline' size={64} color='#8E8E93' />
				<Text style={styles.notFoundText}>{t('history', 'noWorkouts')}</Text>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => router.back()}
				>
					<Text style={styles.backButtonText}>{t('common', 'cancel')}</Text>
				</TouchableOpacity>
				</View>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Хедер */}
				<View style={styles.header}>
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => router.back()}
					>
						<Ionicons name='arrow-back' size={24} color='#FFFFFF' />
					</TouchableOpacity>
					<View style={styles.headerTitle}>
						<Text style={styles.headerTitleText}>{t('workout', 'title')}</Text>
						<Text style={styles.headerSubtitle}>
							{workout.date}, {workout.time}
						</Text>
					</View>
					<TouchableOpacity
						style={styles.deleteButton}
						onPress={handleDeleteWorkout}
					>
						<Ionicons name='trash-outline' size={20} color='#FF3B30' />
					</TouchableOpacity>
				</View>

				{/* Основная информация */}
				<View style={styles.overviewCard}>
					<View style={styles.overviewHeader}>
						<View>
							<Text style={styles.workoutType}>{workout.type}</Text>
							<Text style={styles.duration}>{workout.duration}</Text>
						</View>
						{workout.rating && (
							<View style={styles.ratingContainer}>
								<Ionicons name='star' size={20} color='#FFD60A' />
								<Text style={styles.ratingText}>{workout.rating}/5</Text>
							</View>
						)}
					</View>

					<View style={styles.muscleGroups}>
						{workout.muscleGroups.map((muscle, index) => (
							<View key={index} style={styles.muscleTag}>
								<Text style={styles.muscleTagText}>{muscle}</Text>
							</View>
						))}
					</View>

					{workout.notes && (
						<TouchableOpacity
							style={styles.notesContainer}
							onPress={() => setShowNotes(!showNotes)}
						>
							<View style={styles.notesHeader}>
								<Ionicons
									name='document-text-outline'
									size={16}
									color='#8E8E93'
								/>
								<Text style={styles.notesTitle}>{t('workout', 'notes')}</Text>
								<Ionicons
									name={showNotes ? 'chevron-up' : 'chevron-down'}
									size={16}
									color='#8E8E93'
								/>
							</View>
							{showNotes && (
								<Text style={styles.notesText}>{workout.notes}</Text>
							)}
						</TouchableOpacity>
					)}

					<View style={styles.statsGrid}>
						<View style={styles.statItem}>
							<Text style={styles.statValue}>{workout.totalExercises}</Text>
					<Text style={styles.statLabel}>{t('workout', 'exercises')}</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{workout.totalSets}</Text>
						<Text style={styles.statLabel}>{t('workout', 'sets')}</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>
							{workout.totalVolume.toLocaleString()}
						</Text>
						<Text style={styles.statLabel}>{t('progress', 'totalVolume')}</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>
							{Math.round(workout.totalVolume / workout.totalSets)}
						</Text>
						<Text style={styles.statLabel}>{t('workout', 'weight')}/{t('workout', 'sets')}</Text>
					</View>
					</View>
				</View>

				{/* Список упражнений */}
				<View style={styles.section}>
				<Text style={styles.sectionTitle}>
					{t('workout', 'exercises')} ({workout.exercises.length})
				</Text>
					<View style={styles.exercisesList}>
						{workout.exercises.map(renderExerciseCard)}
					</View>
				</View>

				{/* Детали выбранного упражнения */}
				{selectedExercise && (
					<View style={styles.section}>
					<Text style={styles.sectionTitle}>
						{selectedExercise.name} - {t('workout', 'sets')}
					</Text>

					<View style={styles.setsTable}>
						<View style={styles.tableHeader}>
							<Text style={styles.tableHeaderText}>{t('workout', 'sets')}</Text>
							<Text style={styles.tableHeaderText}>{t('workout', 'weight')} ({t('records', 'kg')})</Text>
							<Text style={styles.tableHeaderText}>{t('workout', 'reps')}</Text>
							<Text style={styles.tableHeaderText}>{t('progress', 'totalVolume')}</Text>
						</View>

							{selectedExercise.sets.map((set, index) => (
								<View key={index} style={styles.tableRow}>
									<Text style={styles.tableCell}>{set.setNumber}</Text>
									<Text style={styles.tableCell}>{set.weight}</Text>
									<Text style={styles.tableCell}>{set.reps}</Text>
									<Text style={styles.tableCell}>{set.weight * set.reps}</Text>
								</View>
							))}

						<View style={styles.tableFooter}>
							<Text style={styles.tableFooterText}>{t('common', 'all')}:</Text>
							<Text style={styles.tableFooterText}>
								{selectedExercise.sets.reduce(
									(sum, set) => sum + set.weight,
									0,
								)}{' '}
								{t('records', 'kg')}
							</Text>
								<Text style={styles.tableFooterText}>
									{selectedExercise.sets.reduce(
										(sum, set) => sum + set.reps,
										0,
									)}
								</Text>
								<Text style={styles.tableFooterText}>
								{selectedExercise.volume} {t('records', 'kg')}
							</Text>
							</View>
						</View>

						{selectedExercise.oneRepMax && (
							<View style={styles.oneRepMaxContainer}>
								<Ionicons name='trophy-outline' size={16} color='#FFD60A' />
								<Text style={styles.oneRepMaxText}>
									1RM: {selectedExercise.oneRepMax} {t('records', 'kg')}
								</Text>
							</View>
						)}

						{selectedExercise.notes && (
							<View style={styles.exerciseNotesFull}>
								<Ionicons
									name='information-circle-outline'
									size={16}
									color='#8E8E93'
								/>
								<Text style={styles.exerciseNotesFullText}>
									{selectedExercise.notes}
								</Text>
							</View>
						)}
					</View>
				)}

				{/* График прогресса */}
				{renderProgressChart()}

				{/* Кнопки действий */}
				<View style={styles.actionsContainer}>
					<TouchableOpacity style={styles.editButton}>
						<Ionicons name='create-outline' size={20} color='#FFFFFF' />
					<Text style={styles.editButtonText}>{t('common', 'edit')}</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.shareButton}>
					<Ionicons name='share-outline' size={20} color='#00ff48' />
					<Text style={styles.shareButtonText}>{t('export', 'dialogTitle')}</Text>
				</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#121212',
	},
	centerContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	notFoundText: {
		fontSize: 18,
		color: '#FFFFFF',
		marginTop: 16,
		marginBottom: 24,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingTop: 20,
		paddingBottom: 16,
	},
	backButton: {
		padding: 4,
		marginRight: 16,
	},
	headerTitle: {
		flex: 1,
	},
	headerTitleText: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#FFFFFF',
	},
	headerSubtitle: {
		fontSize: 14,
		color: '#8E8E93',
		marginTop: 2,
	},
	deleteButton: {
		padding: 8,
	},
	overviewCard: {
		backgroundColor: '#1C1C1E',
		marginHorizontal: 20,
		borderRadius: 16,
		padding: 16,
		marginBottom: 24,
	},
	overviewHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	workoutType: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#FFFFFF',
	},
	duration: {
		fontSize: 16,
		color: '#8E8E93',
		marginTop: 2,
	},
	ratingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 214, 10, 0.1)',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 12,
	},
	ratingText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#FFD60A',
		marginLeft: 4,
	},
	muscleGroups: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 16,
	},
	muscleTag: {
		backgroundColor: '#2C2C2E',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 12,
		marginRight: 8,
		marginBottom: 8,
	},
	muscleTagText: {
		fontSize: 14,
		color: '#8E8E93',
		fontWeight: '500',
	},
	muscleTagSmall: {
		backgroundColor: '#2C2C2E',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 8,
		alignSelf: 'flex-start',
		marginTop: 4,
	},
	muscleTagTextSmall: {
		fontSize: 12,
		color: '#8E8E93',
	},
	notesContainer: {
		backgroundColor: '#2C2C2E',
		borderRadius: 12,
		padding: 12,
		marginBottom: 16,
	},
	notesHeader: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	notesTitle: {
		fontSize: 14,
		fontWeight: '600',
		color: '#8E8E93',
		marginLeft: 8,
		marginRight: 'auto',
	},
	notesText: {
		fontSize: 14,
		color: '#FFFFFF',
		marginTop: 8,
		lineHeight: 20,
	},
	statsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},
	statItem: {
		width: '48%',
		backgroundColor: '#2C2C2E',
		borderRadius: 12,
		padding: 12,
		marginBottom: 8,
		alignItems: 'center',
	},
	statValue: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#00ff48',
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 12,
		color: '#8E8E93',
		textAlign: 'center',
	},
	section: {
		paddingHorizontal: 10,
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#FFFFFF',
		marginBottom: 12,
	},
	exercisesList: {
		gap: 8,
	},
	exerciseCard: {
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		padding: 12,
		borderWidth: 1,
		borderColor: '#2C2C2E',
	},
	exerciseCardActive: {
		borderColor: '#00ff48',
		backgroundColor: 'rgba(0, 255, 72, 0.05)',
	},
	exerciseHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 8,
	},
	exerciseInfo: {
		flex: 1,
	},
	exerciseName: {
		fontSize: 16,
		fontWeight: '600',
		color: '#FFFFFF',
		marginBottom: 4,
	},
	exerciseStats: {
		alignItems: 'flex-end',
	},
	volumeText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#00ff48',
		marginBottom: 2,
	},
	setsText: {
		fontSize: 12,
		color: '#8E8E93',
	},
	exerciseNotes: {
		fontSize: 12,
		color: '#8E8E93',
		flexDirection: 'row',
		alignItems: 'center',
	},
	setsTable: {
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		overflow: 'hidden',
	},
	tableHeader: {
		flexDirection: 'row',
		backgroundColor: '#2C2C2E',
		paddingVertical: 12,
		paddingHorizontal: 16,
	},
	tableHeaderText: {
		flex: 1,
		fontSize: 14,
		fontWeight: '600',
		color: '#8E8E93',
		textAlign: 'center',
	},
	tableRow: {
		flexDirection: 'row',
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#2C2C2E',
	},
	tableCell: {
		flex: 1,
		fontSize: 16,
		color: '#FFFFFF',
		textAlign: 'center',
	},
	tableFooter: {
		flexDirection: 'row',
		backgroundColor: '#2C2C2E',
		paddingVertical: 12,
		paddingHorizontal: 16,
	},
	tableFooterText: {
		flex: 1,
		fontSize: 16,
		fontWeight: 'bold',
		color: '#00ff48',
		textAlign: 'center',
	},
	oneRepMaxContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 214, 10, 0.1)',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		marginTop: 12,
		alignSelf: 'flex-start',
	},
	oneRepMaxText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#FFD60A',
		marginLeft: 8,
	},
	exerciseNotesFull: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		backgroundColor: '#2C2C2E',
		padding: 12,
		borderRadius: 8,
		marginTop: 12,
	},
	exerciseNotesFullText: {
		flex: 1,
		fontSize: 14,
		color: '#FFFFFF',
		marginLeft: 8,
		lineHeight: 20,
	},
	chartContainer: {
		backgroundColor: '#1C1C1E',
		marginHorizontal: 20,
		borderRadius: 16,
		padding: 16,
		marginBottom: 24,
		alignItems: 'center',
	},
	chartTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#FFFFFF',
		marginBottom: 8,
		alignSelf: 'flex-start',
	},
	actionsContainer: {
		flexDirection: 'row',
		paddingHorizontal: 10,
		marginBottom: 32,
		gap: 12,
	},
	editButton: {
		flex: 1,
		flexDirection: 'row',
		backgroundColor: '#2C2C2E',
		paddingVertical: 14,
		paddingHorizontal: 10,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	editButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#FFFFFF',
		marginLeft: 8,
	},
	shareButton: {
		flex: 1,
		flexDirection: 'row',
		backgroundColor: 'rgba(0, 255, 72, 0.1)',
		paddingVertical: 14,
		paddingHorizontal: 10,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: '#00ff48',
	},
	shareButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#00ff48',
		marginLeft: 8,
	},
	backButtonText: {
		fontSize: 16,
		color: '#00ff48',
		fontWeight: '600',
		paddingHorizontal: 10,
		paddingVertical: 10,
	},
})
