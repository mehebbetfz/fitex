import { useLanguage } from '@/contexts/language-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const ALL_WORKOUT_HISTORY = [
	{
		id: '1',
		date: 'Сегодня',
		time: '18:30',
		duration: '45 мин',
		type: 'Силовая',
		muscleGroups: ['Грудь', 'Трицепс'],
		exercises: 4,
		sets: 16,
		volume: 4800,
	},
	{
		id: '2',
		date: 'Вчера',
		time: '19:15',
		duration: '60 мин',
		type: 'Кардио',
		muscleGroups: ['Ноги', 'Пресс'],
		exercises: 5,
		sets: 20,
		volume: 3200,
	},
	{
		id: '3',
		date: '2 дня назад',
		time: '17:45',
		duration: '50 мин',
		type: 'Верх тела',
		muscleGroups: ['Спина', 'Бицепс'],
		exercises: 5,
		sets: 18,
		volume: 4200,
	},
	{
		id: '4',
		date: '3 дня назад',
		time: '20:00',
		duration: '40 мин',
		type: 'Ноги',
		muscleGroups: ['Квадрицепс', 'Бицепс бедра'],
		exercises: 4,
		sets: 16,
		volume: 3800,
	},
	{
		id: '5',
		date: '4 дня назад',
		time: '18:00',
		duration: '55 мин',
		type: 'Круговая',
		muscleGroups: ['Все тело'],
		exercises: 6,
		sets: 24,
		volume: 5200,
	},
	{
		id: '6',
		date: '5 дней назад',
		time: '19:30',
		duration: '50 мин',
		type: 'Грудь',
		muscleGroups: ['Грудь', 'Плечи'],
		exercises: 5,
		sets: 20,
		volume: 4500,
	},
	{
		id: '7',
		date: '6 дней назад',
		time: '17:00',
		duration: '65 мин',
		type: 'Спина',
		muscleGroups: ['Спина', 'Бицепс'],
		exercises: 6,
		sets: 22,
		volume: 5000,
	},
	{
		id: '8',
		date: '7 дней назад',
		time: '18:45',
		duration: '55 мин',
		type: 'Ноги',
		muscleGroups: ['Квадрицепс', 'Икры'],
		exercises: 5,
		sets: 18,
		volume: 4200,
	},
	{
		id: '9',
		date: '8 дней назад',
		time: '19:15',
		duration: '40 мин',
		type: 'Кардио',
		muscleGroups: ['Ноги', 'Пресс'],
		exercises: 4,
		sets: 16,
		volume: 2800,
	},
	{
		id: '10',
		date: '9 дней назад',
		time: '17:30',
		duration: '70 мин',
		type: 'Верх тела',
		muscleGroups: ['Грудь', 'Спина', 'Плечи'],
		exercises: 7,
		sets: 28,
		volume: 6500,
	},
	{
		id: '11',
		date: '10 дней назад',
		time: '20:00',
		duration: '45 мин',
		type: 'Пресс',
		muscleGroups: ['Пресс', 'Косые мышцы'],
		exercises: 6,
		sets: 24,
		volume: 0,
	},
	{
		id: '12',
		date: '11 дней назад',
		time: '18:20',
		duration: '60 мин',
		type: 'Руки',
		muscleGroups: ['Бицепс', 'Трицепс'],
		exercises: 5,
		sets: 20,
		volume: 3800,
	},
	{
		id: '13',
		date: '12 дней назад',
		time: '19:10',
		duration: '50 мин',
		type: 'Плечи',
		muscleGroups: ['Плечи', 'Трапеции'],
		exercises: 5,
		sets: 18,
		volume: 3200,
	},
	{
		id: '14',
		date: '13 дней назад',
		time: '17:45',
		duration: '65 мин',
		type: 'Ноги',
		muscleGroups: ['Квадрицепс', 'Бицепс бедра', 'Ягодицы'],
		exercises: 6,
		sets: 24,
		volume: 5800,
	},
	{
		id: '15',
		date: '14 дней назад',
		time: '18:30',
		duration: '55 мин',
		type: 'Спина',
		muscleGroups: ['Широчайшие', 'Ромбовидные'],
		exercises: 5,
		sets: 20,
		volume: 5200,
	},
]

const MONTHS = [
	'Январь',
	'Февраль',
	'Март',
	'Апрель',
	'Май',
	'Июнь',
	'Июль',
	'Август',
	'Сентябрь',
	'Октябрь',
	'Ноябрь',
	'Декабрь',
]

export default function FullHistoryScreen() {
	const router = useRouter()
	const { t } = useLanguage()
	const navigation = useNavigation()
	const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
	const [selectedFilter, setSelectedFilter] = useState('all')

	const handleWourkoutPress = (id: string) => {
		router.push({
			pathname: `(routes)/workout-details/${id}`,
		})
	}

	// Группировка тренировок по месяцам
	const groupWorkoutsByMonth = () => {
		const grouped: Record<string, typeof ALL_WORKOUT_HISTORY> = {}

		ALL_WORKOUT_HISTORY.forEach(workout => {
			// Для демонстрации распределим тренировки по разным месяцам
			const date = new Date()
			const offset = parseInt(workout.id) - 1
			date.setDate(date.getDate() - offset)

			const monthKey = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`

			if (!grouped[monthKey]) {
				grouped[monthKey] = []
			}

			// Обновляем дату для отображения
			const workoutWithDate = {
				...workout,
				fullDate: date.toLocaleDateString('ru-RU', {
					day: 'numeric',
					month: 'long',
					year: 'numeric',
				}),
				dayOfWeek: date.toLocaleDateString('ru-RU', { weekday: 'long' }),
			}

			grouped[monthKey].push(workoutWithDate)
		})

		return grouped
	}

	const groupedWorkouts = groupWorkoutsByMonth()
	const months = Object.keys(groupedWorkouts)

	// Получаем все уникальные группы мышц
	const getAllMuscleGroups = () => {
		const groups = new Set<string>()
		ALL_WORKOUT_HISTORY.forEach(workout => {
			workout.muscleGroups.forEach(group => groups.add(group))
		})
		return Array.from(groups)
	}

	const muscleGroups = ['all', ...getAllMuscleGroups()]

	// Фильтруем тренировки
	const getFilteredWorkouts = () => {
		if (selectedFilter === 'all') return groupedWorkouts

		const filtered: Record<string, any[]> = {}

		Object.keys(groupedWorkouts).forEach(month => {
			const monthWorkouts = groupedWorkouts[month].filter(workout =>
				workout.muscleGroups.includes(selectedFilter),
			)

			if (monthWorkouts.length > 0) {
				filtered[month] = monthWorkouts
			}
		})

		return filtered
	}

	const filteredWorkouts = getFilteredWorkouts()

	const renderWorkoutCard = ({ item }: { item: any }) => (
		<TouchableOpacity
			onPress={() => handleWourkoutPress(item.id)}
			style={styles.workoutCard}
		>
			<View style={styles.workoutHeader}>
				<View>
					<Text style={styles.workoutDate}>{item.fullDate}</Text>
					<Text style={styles.workoutSubDate}>
						{item.dayOfWeek}, {item.time}
					</Text>
				</View>
				<View
					style={[
						styles.workoutTypeBadge,
						{ backgroundColor: getTypeColor(item.type) },
					]}
				>
					<Text style={styles.workoutTypeText}>{item.type}</Text>
				</View>
			</View>

			<View style={styles.muscleGroups}>
				{item.muscleGroups.map((muscle: string, index: number) => (
					<View key={index} style={styles.muscleTag}>
						<Text style={styles.muscleTagText}>{muscle}</Text>
					</View>
				))}
			</View>

			<View style={styles.workoutStats}>
				<View style={styles.statItem}>
					<Ionicons name='barbell' size={16} color='#8E8E93' />
					<Text style={styles.statText}>{item.exercises} {t('history', 'exercises')}</Text>
				</View>
				<View style={styles.statItem}>
					<Ionicons name='repeat' size={16} color='#8E8E93' />
					<Text style={styles.statText}>{item.sets} {t('history', 'sets')}</Text>
				</View>
				<View style={styles.statItem}>
					<Ionicons name='time' size={16} color='#8E8E93' />
					<Text style={styles.statText}>{item.duration}</Text>
				</View>
				{item.volume > 0 && (
					<View style={styles.statItem}>
						<Ionicons name='trending-up' size={16} color='#8E8E93' />
						<Text style={styles.statText}>
							{item.volume.toLocaleString()} {t('history', 'kg')}
						</Text>
					</View>
				)}
			</View>
		</TouchableOpacity>
	)

	const renderMonthSection = (month: string) => {
		const workouts = filteredWorkouts[month]
		if (!workouts || workouts.length === 0) return null

		const totalVolume = workouts.reduce(
			(sum, workout) => sum + workout.volume,
			0,
		)
		const totalWorkouts = workouts.length
		const totalTime = workouts.reduce((sum, workout) => {
			const minutes = parseInt(workout.duration)
			return sum + (isNaN(minutes) ? 0 : minutes)
		}, 0)

		return (
			<View key={month} style={styles.monthSection}>
				<View style={styles.monthHeader}>
					<Text style={styles.monthTitle}>{month}</Text>
					<View style={styles.monthStats}>
						<View style={styles.monthStat}>
							<Ionicons name='barbell-outline' size={14} color='#8E8E93' />
							<Text style={styles.monthStatText}>
								{totalWorkouts} {t('history', 'workout5')}
							</Text>
						</View>
						<View style={styles.monthStat}>
							<Ionicons name='time-outline' size={14} color='#8E8E93' />
							<Text style={styles.monthStatText}>{totalTime} {t('history', 'min')}</Text>
						</View>
						{totalVolume > 0 && (
							<View style={styles.monthStat}>
								<Ionicons
									name='trending-up-outline'
									size={14}
									color='#8E8E93'
								/>
								<Text style={styles.monthStatText}>
									{totalVolume.toLocaleString()} {t('history', 'kg')}
								</Text>
							</View>
						)}
					</View>
				</View>

				<View style={styles.workoutsList}>
					{workouts.map(workout => (
						<View key={workout.id}>{renderWorkoutCard({ item: workout })}</View>
					))}
				</View>
			</View>
		)
	}

	const getTypeColor = (type: string) => {
		const colors: Record<string, string> = {
			Силовая: 'rgba(255, 69, 58, 0.2)',
			Кардио: 'rgba(0, 122, 255, 0.2)',
			'Верх тела': 'rgba(52, 199, 89, 0.2)',
			Ноги: 'rgba(162, 132, 94, 0.2)',
			Круговая: 'rgba(175, 82, 222, 0.2)',
			Грудь: 'rgba(255, 45, 85, 0.2)',
			Спина: 'rgba(0, 199, 190, 0.2)',
			Пресс: 'rgba(255, 204, 0, 0.2)',
			Руки: 'rgba(88, 86, 214, 0.2)',
			Плечи: 'rgba(255, 149, 0, 0.2)',
		}
		return colors[type] || 'rgba(120, 120, 128, 0.2)'
	}

	const getFilterLabel = (filter: string) => {
		if (filter === 'all') return t('history', 'allMuscles')
		return filter
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name='arrow-back' size={24} color='#FFFFFF' />
				</TouchableOpacity>
				<View>
				<Text style={styles.title}>{t('history', 'title')}</Text>
				<Text style={styles.subtitle}>
					{ALL_WORKOUT_HISTORY.length} {t('history', 'workout5')}
				</Text>
				</View>
				<View style={styles.headerRight} />
			</View>

			{/* Фильтры */}
			<View style={styles.filtersSection}>
				<Text style={styles.filtersTitle}>{t('history', 'filterByMuscle')}</Text>
				<FlatList
					horizontal
					data={muscleGroups}
					renderItem={({ item }) => (
						<TouchableOpacity
							style={[
								styles.filterButton,
								selectedFilter === item && styles.filterButtonActive,
							]}
							onPress={() => setSelectedFilter(item)}
						>
							<Text
								style={[
									styles.filterText,
									selectedFilter === item && styles.filterTextActive,
								]}
							>
								{getFilterLabel(item)}
							</Text>
						</TouchableOpacity>
					)}
					keyExtractor={item => item}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.filtersContainer}
				/>
			</View>

			{/* Список тренировок по месяцам */}
			<FlatList
				data={Object.keys(filteredWorkouts)}
				renderItem={({ item }) => renderMonthSection(item)}
				keyExtractor={item => item}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<Ionicons name='barbell-outline' size={64} color='#3A3A3C' />
						<Text style={styles.emptyStateTitle}>{t('history', 'noWorkouts')}</Text>
						<Text style={styles.emptyStateText}>
							{t('history', 'noWorkoutsFilter')}
						</Text>
					</View>
				}
			/>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#121212',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingTop: 20,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#2C2C2E',
	},
	backButton: {
		marginRight: 16,
		padding: 4,
	},
	headerRight: {
		width: 40,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#FFFFFF',
	},
	subtitle: {
		fontSize: 14,
		color: '#8E8E93',
		marginTop: 4,
	},
	filtersSection: {
		paddingVertical: 16,
		paddingHorizontal: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#2C2C2E',
	},
	filtersTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#FFFFFF',
		marginBottom: 12,
	},
	filtersContainer: {
		paddingRight: 20,
	},
	filterButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: '#1C1C1E',
		borderRadius: 20,
		marginRight: 8,
		borderWidth: 1,
		borderColor: '#2C2C2E',
	},
	filterButtonActive: {
		backgroundColor: '#00ff2aff',
		borderColor: '#00ff2fff',
	},
	filterText: {
		fontSize: 14,
		color: '#8E8E93',
		fontWeight: '500',
	},
	filterTextActive: {
		color: '#FFFFFF',
		fontWeight: '600',
	},
	listContent: {
		paddingHorizontal: 10,
		paddingTop: 16,
		paddingBottom: 40,
	},
	monthSection: {
		marginBottom: 24,
	},
	monthHeader: {
		marginBottom: 12,
	},
	monthTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#FFFFFF',
		marginBottom: 8,
	},
	monthStats: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	monthStat: {
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 16,
		marginBottom: 4,
	},
	monthStatText: {
		fontSize: 13,
		color: '#8E8E93',
		marginLeft: 6,
	},
	workoutsList: {
		gap: 12,
	},
	workoutCard: {
		backgroundColor: '#1C1C1E',
		borderRadius: 16,
		padding: 16,
	},
	workoutHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 12,
	},
	workoutDate: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#FFFFFF',
	},
	workoutSubDate: {
		fontSize: 14,
		color: '#8E8E93',
		marginTop: 2,
	},
	workoutTypeBadge: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 12,
	},
	workoutTypeText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#FFFFFF',
	},
	muscleGroups: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 12,
	},
	muscleTag: {
		backgroundColor: '#2C2C2E',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
		marginRight: 8,
		marginBottom: 4,
	},
	muscleTagText: {
		fontSize: 12,
		color: '#8E8E93',
	},
	workoutStats: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		borderTopWidth: 1,
		borderTopColor: '#2C2C2E',
		paddingTop: 12,
		gap: 12,
	},
	statItem: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	statText: {
		fontSize: 12,
		color: '#8E8E93',
		marginLeft: 4,
	},
	emptyState: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: 100,
	},
	emptyStateTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#FFFFFF',
		marginTop: 16,
		marginBottom: 8,
	},
	emptyStateText: {
		fontSize: 16,
		color: '#8E8E93',
		textAlign: 'center',
		paddingHorizontal: 40,
	},
})
