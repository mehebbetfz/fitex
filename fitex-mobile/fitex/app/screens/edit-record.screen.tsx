import * as db from '@/scripts/database'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const EXERCISE_CATEGORIES = [
	{
		id: 'strength',
		name: 'Сила',
		icon: 'barbell',
		exercises: [
			'Жим лежа',
			'Приседания',
			'Становая тяга',
			'Подтягивания',
			'Жим штанги стоя',
			'Тяга штанги в наклоне',
		],
	},
	{
		id: 'cardio',
		name: 'Кардио',
		icon: 'heart',
		exercises: [
			'Бег 5 км',
			'Бег 10 км',
			'Велосипед 20 км',
			'Плавание 100 м',
			'Прыжки на скакалке',
		],
	},
	{
		id: 'endurance',
		name: 'Выносливость',
		icon: 'time',
		exercises: [
			'Отжимания',
			'Планка',
			'Приседания (на время)',
			'Берпи',
			'Скалолазание',
		],
	},
]

export default function EditRecordScreen() {
	const router = useRouter()
	const { id } = useLocalSearchParams<{ id: string }>()

	const [selectedCategory, setSelectedCategory] = useState(
		EXERCISE_CATEGORIES[0],
	)
	const [exercise, setExercise] = useState('')
	const [weight, setWeight] = useState('')
	const [date, setDate] = useState('')
	const [notes, setNotes] = useState('')
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (id) {
			loadRecordData()
		}
	}, [id])

	const loadRecordData = async () => {
		try {
			setLoading(true)
			const recordId = parseInt(id)
			const record = await db.getRecordById(recordId)

			if (record) {
				setExercise(record.exercise)
				setWeight(record.weight)
				setDate(record.date)
				setNotes(record.notes || '')

				// Находим соответствующую категорию
				const category = EXERCISE_CATEGORIES.find(
					cat => cat.id === record.category,
				)
				if (category) {
					setSelectedCategory(category)
				}
			}
		} catch (error) {
			console.error('Error loading record:', error)
			Alert.alert('Ошибка', 'Не удалось загрузить данные рекорда')
		} finally {
			setLoading(false)
		}
	}

	const handleUpdate = async () => {
		if (!exercise.trim()) {
			Alert.alert('Ошибка', 'Введите название упражнения')
			return
		}

		if (!weight.trim()) {
			Alert.alert('Ошибка', 'Введите вес/результат')
			return
		}

		try {
			const recordId = parseInt(id)

			// Получаем текущий рекорд для расчета тренда
			const currentRecord = await db.getRecordById(recordId)
			if (!currentRecord) {
				Alert.alert('Ошибка', 'Рекорд не найден')
				return
			}

			// Рассчитываем тренд на основе предыдущих рекордов
			const previousRecords = await db.getPersonalRecords()
			const previousForExercise = previousRecords
				.filter(r => r.exercise === exercise && r.id !== recordId)
				.sort(
					(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
				)[0]

			let trend: 'up' | 'down' | 'stable' = 'stable'
			let improvement = ''

			if (previousForExercise) {
				const previousWeight = parseFloat(previousForExercise.weight)
				const currentWeight = parseFloat(weight)

				if (currentWeight > previousWeight) {
					trend = 'up'
					improvement = `+${(currentWeight - previousWeight).toFixed(1)}`
				} else if (currentWeight < previousWeight) {
					trend = 'down'
					improvement = `-${(previousWeight - currentWeight).toFixed(1)}`
				}
			}

			await db.updatePersonalRecord(recordId, {
				exercise,
				weight,
				date,
				trend,
				category: selectedCategory.id as any,
				notes: notes.trim() || undefined,
				improvement,
			})

			Alert.alert('Успех', 'Рекорд обновлен!', [
				{ text: 'OK', onPress: () => router.back() },
			])
		} catch (error) {
			console.error('Error updating record:', error)
			Alert.alert('Ошибка', 'Не удалось обновить рекорд')
		}
	}

	const handleDelete = async () => {
		Alert.alert('Удаление', 'Вы уверены, что хотите удалить этот рекорд?', [
			{ text: 'Отмена', style: 'cancel' },
			{
				text: 'Удалить',
				style: 'destructive',
				onPress: async () => {
					try {
						const recordId = parseInt(id)
						await db.deletePersonalRecord(recordId)

						Alert.alert('Успех', 'Рекорд удален!', [
							{ text: 'OK', onPress: () => router.back() },
						])
					} catch (error) {
						console.error('Error deleting record:', error)
						Alert.alert('Ошибка', 'Не удалось удалить рекорд')
					}
				},
			},
		])
	}

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size='large' color='#34C759' />
					<Text style={styles.loadingText}>Загрузка данных...</Text>
				</View>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Заголовок */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => router.back()}
				>
					<Ionicons name='arrow-back' size={24} color='#FFFFFF' />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Редактировать рекорд</Text>
				<View style={styles.placeholder} />
			</View>

			<ScrollView contentContainerStyle={styles.content}>
				{/* Выбор категории */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Категория</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.categoriesScroll}
					>
						<View style={styles.categoriesContainer}>
							{EXERCISE_CATEGORIES.map((category, index) => (
								<TouchableOpacity
									key={index}
									style={[
										styles.categoryButton,
										selectedCategory.id === category.id &&
											styles.selectedCategoryButton,
									]}
									onPress={() => setSelectedCategory(category)}
								>
									<Ionicons
										name={category.icon as any}
										size={24}
										color={
											selectedCategory.id === category.id
												? '#FFFFFF'
												: '#8E8E93'
										}
									/>
									<Text
										style={[
											styles.categoryText,
											selectedCategory.id === category.id &&
												styles.selectedCategoryText,
										]}
									>
										{category.name}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</ScrollView>
				</View>

				{/* Упражнение */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Упражнение</Text>
					<View style={styles.exerciseContainer}>
						<TextInput
							style={styles.exerciseInput}
							value={exercise}
							onChangeText={setExercise}
							placeholder='Введите упражнение'
							placeholderTextColor='#8E8E93'
						/>
					</View>
					{selectedCategory.exercises.length > 0 && (
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							style={styles.exercisesScroll}
						>
							<View style={styles.exercisesContainer}>
								{selectedCategory.exercises.map((ex, index) => (
									<TouchableOpacity
										key={index}
										style={[
											styles.exerciseButton,
											exercise === ex && styles.selectedExerciseButton,
										]}
										onPress={() => setExercise(ex)}
									>
										<Text
											style={[
												styles.exerciseButtonText,
												exercise === ex && styles.selectedExerciseButtonText,
											]}
										>
											{ex}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</ScrollView>
					)}
				</View>

				{/* Вес/Результат */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Вес/Результат</Text>
					<TextInput
						style={styles.weightInput}
						value={weight}
						onChangeText={setWeight}
						placeholder='Например: 100 кг или 22:30'
						placeholderTextColor='#8E8E93'
					/>
					<Text style={styles.weightHint}>
						Укажите вес (кг) или время (мм:сс) в зависимости от упражнения
					</Text>
				</View>

				{/* Дата */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Дата</Text>
					<TextInput
						style={styles.dateInput}
						value={date}
						onChangeText={setDate}
						placeholder='YYYY-MM-DD'
						placeholderTextColor='#8E8E93'
					/>
				</View>

				{/* Заметки */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Заметки</Text>
					<TextInput
						style={styles.notesInput}
						value={notes}
						onChangeText={setNotes}
						placeholder='Например: 3 подхода по 5 повторений'
						placeholderTextColor='#8E8E93'
						multiline
						numberOfLines={4}
					/>
				</View>

				{/* Кнопки */}
				<View style={styles.buttonsContainer}>
					<TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
						<Text style={styles.updateButtonText}>Обновить рекорд</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
						<Ionicons name='trash' size={20} color='#FF3B30' />
						<Text style={styles.deleteButtonText}>Удалить рекорд</Text>
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
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		marginTop: 12,
		color: '#FFFFFF',
		fontSize: 16,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 10,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#2C2C2E',
	},
	backButton: {
		padding: 4,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#FFFFFF',
	},
	placeholder: {
		width: 32,
	},
	content: {
		padding: 20,
		paddingBottom: 40,
	},
	section: {
		marginBottom: 30,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#FFFFFF',
		marginBottom: 12,
	},
	categoriesScroll: {
		marginHorizontal: -20,
	},
	categoriesContainer: {
		flexDirection: 'row',
		paddingHorizontal: 20,
		gap: 12,
	},
	categoryButton: {
		backgroundColor: '#1E1E1E',
		borderRadius: 12,
		padding: 16,
		alignItems: 'center',
		minWidth: 100,
	},
	selectedCategoryButton: {
		backgroundColor: '#34C759',
	},
	categoryText: {
		fontSize: 14,
		color: '#8E8E93',
		marginTop: 8,
	},
	selectedCategoryText: {
		color: '#FFFFFF',
	},
	exerciseContainer: {
		marginBottom: 12,
	},
	exerciseInput: {
		backgroundColor: '#1E1E1E',
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		color: '#FFFFFF',
	},
	exercisesScroll: {
		marginHorizontal: -20,
	},
	exercisesContainer: {
		flexDirection: 'row',
		paddingHorizontal: 20,
		gap: 8,
	},
	exerciseButton: {
		backgroundColor: '#1E1E1E',
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	selectedExerciseButton: {
		backgroundColor: '#34C759',
	},
	exerciseButtonText: {
		fontSize: 14,
		color: '#8E8E93',
	},
	selectedExerciseButtonText: {
		color: '#FFFFFF',
	},
	weightInput: {
		backgroundColor: '#1E1E1E',
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		color: '#FFFFFF',
		marginBottom: 8,
	},
	weightHint: {
		fontSize: 12,
		color: '#8E8E93',
		marginLeft: 4,
	},
	dateInput: {
		backgroundColor: '#1E1E1E',
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		color: '#FFFFFF',
	},
	notesInput: {
		backgroundColor: '#1E1E1E',
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		color: '#FFFFFF',
		textAlignVertical: 'top',
		minHeight: 100,
	},
	buttonsContainer: {
		marginTop: 20,
		gap: 12,
	},
	updateButton: {
		backgroundColor: '#34C759',
		borderRadius: 12,
		paddingVertical: 18,
		alignItems: 'center',
	},
	updateButtonText: {
		fontSize: 18,
		fontWeight: '600',
		color: '#FFFFFF',
	},
	deleteButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: '#FF3B30',
		borderRadius: 12,
		paddingVertical: 18,
		gap: 8,
	},
	deleteButtonText: {
		fontSize: 18,
		fontWeight: '600',
		color: '#FF3B30',
	},
})
