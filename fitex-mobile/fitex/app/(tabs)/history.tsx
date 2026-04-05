import { useLanguage } from '@/contexts/language-context'
import { translateGroupName, translateWorkoutType } from '@/constants/exercise-i18n'
import { Workout } from '@/scripts/database'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Animated,
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDatabase } from '../contexts/database-context'

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

// Количество тренировок для загрузки за раз
const PAGE_SIZE = 5

// Функция для форматирования даты
const formatWorkoutDate = (
	dateString: string,
	locale: string,
	todayLabel: string,
	yesterdayLabel: string,
): { fullDate: string; dayOfWeek: string; time: string } => {
	try {
		const date = new Date(dateString)
		const today = new Date()
		const yesterday = new Date(today)
		yesterday.setDate(yesterday.getDate() - 1)

		let fullDate = ''
		if (date.toDateString() === today.toDateString()) {
			fullDate = todayLabel
		} else if (date.toDateString() === yesterday.toDateString()) {
			fullDate = yesterdayLabel
		} else {
			fullDate = date.toLocaleDateString(locale, {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			})
		}

		const dayOfWeek = date.toLocaleDateString(locale, { weekday: 'long' })
		const time = date.toLocaleTimeString(locale, {
			hour: '2-digit',
			minute: '2-digit',
		})

		return { fullDate, dayOfWeek, time }
	} catch (error) {
		return { fullDate: dateString, dayOfWeek: '', time: '' }
	}
}

// Получение месяца из даты
const getMonthFromDate = (dateString: string): string => {
	const date = new Date(dateString)
	return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

// ── Shimmer animation hook ──
const useShimmer = () => {
	const anim = useRef(new Animated.Value(0)).current
	useEffect(() => {
		const loop = Animated.loop(
			Animated.sequence([
				Animated.timing(anim, {
					toValue: 1,
					duration: 750,
					useNativeDriver: true,
				}),
				Animated.timing(anim, {
					toValue: 0,
					duration: 750,
					useNativeDriver: true,
				}),
			]),
		)
		loop.start()
		return () => loop.stop()
	}, [])
	return anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] })
}

const ShimmerBlock = ({ style }: { style: any }) => {
	const opacity = useShimmer()
	return <Animated.View style={[style, { opacity }]} />
}

// ── Скелетон карточки тренировки ──
const WorkoutCardSkeleton = () => (
	<View style={styles.workoutCard}>
		<View style={styles.workoutHeader}>
			<View>
				<ShimmerBlock
					style={[
						styles.workoutDate,
						{ width: 120, height: 20, backgroundColor: COLORS.cardLight },
					]}
				/>
				<ShimmerBlock
					style={[
						styles.workoutSubDate,
						{
							width: 100,
							height: 16,
							marginTop: 4,
							backgroundColor: COLORS.cardLight,
						},
					]}
				/>
			</View>
			<ShimmerBlock
				style={[
					styles.workoutTypeBadge,
					{ width: 80, height: 30, backgroundColor: COLORS.cardLight },
				]}
			/>
		</View>

		<View style={styles.muscleGroups}>
			{[1, 2, 3].map(i => (
				<ShimmerBlock
					key={i}
					style={[
						styles.muscleTag,
						{
							width: i === 1 ? 60 : i === 2 ? 50 : 70,
							height: 24,
							backgroundColor: COLORS.cardLight,
						},
					]}
				/>
			))}
		</View>

		<View style={styles.workoutStats}>
			{[1, 2, 3, 4].map(i => (
				<ShimmerBlock
					key={i}
					style={[
						styles.statItem,
						{
							width: i === 1 ? 70 : i === 2 ? 80 : i === 3 ? 65 : 90,
							height: 20,
							backgroundColor: COLORS.cardLight,
						},
					]}
				/>
			))}
		</View>
	</View>
)

// ── Скелетон для подгрузки ──
const LoadingFooter = () => {
	const { t } = useLanguage()
	return (
		<View style={styles.loadingFooter}>
			<ActivityIndicator size='small' color={COLORS.primary} />
			<Text style={styles.loadingFooterText}>{t('history', 'workoutsLoading')}</Text>
		</View>
	)
}

// ── Скелетон для первой загрузки ──
const InitialLoadingSkeleton = () => (
	<SafeAreaView style={styles.container}>
		<View style={styles.header}>
			<View>
				<ShimmerBlock
					style={[
						styles.title,
						{ width: 150, height: 28, backgroundColor: COLORS.cardLight },
					]}
				/>
				<ShimmerBlock
					style={[
						styles.subtitle,
						{
							width: 80,
							height: 16,
							marginTop: 4,
							backgroundColor: COLORS.cardLight,
						},
					]}
				/>
			</View>
			<View style={styles.headerRight} />
		</View>

		<View style={styles.filtersSection}>
			<ShimmerBlock
				style={[
					styles.filtersTitle,
					{ width: 150, height: 20, backgroundColor: COLORS.cardLight },
				]}
			/>
			<View style={styles.filtersContainer}>
				{[1, 2, 3, 4, 5].map(i => (
					<ShimmerBlock
						key={i}
						style={[
							styles.filterButton,
							{ width: i === 2 ? 100 : i === 4 ? 80 : 70, paddingVertical: 12 },
						]}
					/>
				))}
			</View>
		</View>

		<FlatList
			data={[1, 2, 3]}
			renderItem={() => <WorkoutCardSkeleton />}
			keyExtractor={item => item.toString()}
			contentContainerStyle={styles.listContent}
			showsVerticalScrollIndicator={false}
		/>
	</SafeAreaView>
)

export default function FullHistoryScreen() {
	const router = useRouter()
	const { t, language } = useLanguage()
	const {
		workouts: allWorkouts,
		isLoading,
		refreshWorkouts,
		loadMoreWorkouts,
	} = useDatabase()

	// Состояния для пагинации
	const [displayedWorkouts, setDisplayedWorkouts] = useState<Workout[]>([])
	const [currentPage, setCurrentPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const [refreshing, setRefreshing] = useState(false)
	const [selectedFilter, setSelectedFilter] = useState('all')
	const [isInitialLoading, setIsInitialLoading] = useState(true)

	// Первоначальная загрузка
	useEffect(() => {
		const loadInitialData = async () => {
			setIsInitialLoading(true)
			await refreshWorkouts()
			setIsInitialLoading(false)
		}
		loadInitialData()
	}, [])

	// Обновление при фокусе (без показа скелетонов)
	useFocusEffect(
		useCallback(() => {
			if (!isInitialLoading) {
				refreshWorkouts()
			}
		}, [isInitialLoading]),
	)

	// Фильтрация тренировок
	const filteredWorkouts = useMemo(() => {
		if (selectedFilter === 'all') return allWorkouts

		return allWorkouts.filter(workout =>
			workout.muscle_groups
				?.split(',')
				.some(group => group.trim() === selectedFilter),
		)
	}, [allWorkouts, selectedFilter])

	// Сброс пагинации при изменении фильтра
	useEffect(() => {
		setCurrentPage(1)
		setDisplayedWorkouts(filteredWorkouts.slice(0, PAGE_SIZE))
		setHasMore(filteredWorkouts.length > PAGE_SIZE)
	}, [filteredWorkouts, selectedFilter])

	// Загрузка следующей порции
	const loadNextPage = useCallback(() => {
		if (isLoadingMore || !hasMore) return

		setIsLoadingMore(true)

		// Имитация задержки сети для плавности
		setTimeout(() => {
			const nextPage = currentPage + 1
			const startIndex = currentPage * PAGE_SIZE
			const endIndex = nextPage * PAGE_SIZE
			const newWorkouts = filteredWorkouts.slice(0, endIndex)

			setDisplayedWorkouts(newWorkouts)
			setCurrentPage(nextPage)
			setHasMore(filteredWorkouts.length > endIndex)
			setIsLoadingMore(false)
		}, 500) // Небольшая задержка для видимости загрузки
	}, [currentPage, filteredWorkouts, hasMore, isLoadingMore])

	// Обновление свайпом
	const onRefresh = useCallback(async () => {
		setRefreshing(true)
		await refreshWorkouts()
		setCurrentPage(1)
		setDisplayedWorkouts(filteredWorkouts.slice(0, PAGE_SIZE))
		setHasMore(filteredWorkouts.length > PAGE_SIZE)
		setRefreshing(false)
	}, [refreshWorkouts, filteredWorkouts])

	// Получаем уникальные группы мышц
	const muscleGroups = useMemo(() => {
		const groups = new Set<string>()
		allWorkouts.forEach(workout => {
			if (workout.muscle_groups) {
				workout.muscle_groups.split(',').forEach(group => {
					if (group.trim()) groups.add(group.trim())
				})
			}
		})
		return ['all', ...Array.from(groups).sort()]
	}, [allWorkouts])

	const handleWorkoutPress = (id: number) => {
		router.push({
			pathname: `/(routes)/workout-details/${id}`,
		})
	}

	const renderWorkoutCard = ({ item }: { item: Workout }) => {
		const { fullDate, dayOfWeek, time } = formatWorkoutDate(item.date, language, t('exercises', 'today'), t('exercises', 'yesterday'))
		const muscleGroupsList =
			item.muscle_groups?.split(',').filter(g => g.trim()) || []

		return (
			<TouchableOpacity
				onPress={() => item.id && handleWorkoutPress(item.id)}
				style={styles.workoutCard}
			>
				<View style={styles.workoutHeader}>
					<View>
						<Text style={styles.workoutDate}>{fullDate}</Text>
						<Text style={styles.workoutSubDate}>
							{dayOfWeek}, {time || item.time}
						</Text>
					</View>
				<View
					style={[
						styles.workoutTypeBadge,
						{ backgroundColor: getTypeColor(item.type) },
					]}
				>
					<Text style={styles.workoutTypeText}>{translateWorkoutType(item.type, language)}</Text>
				</View>
			</View>

			{muscleGroupsList.length > 0 && (
				<View style={styles.muscleGroups}>
					{muscleGroupsList.map((muscle: string, index: number) => (
						<View key={index} style={styles.muscleTag}>
							<Text style={styles.muscleTagText}>{translateGroupName(muscle, language)}</Text>
						</View>
					))}
					</View>
				)}

				<View style={styles.workoutStats}>
					<View style={styles.statItem}>
						<Ionicons name='barbell' size={16} color='#8E8E93' />
						<Text style={styles.statText}>{item.exercises_count} {t('history', 'exercises')}</Text>
					</View>
					<View style={styles.statItem}>
						<Ionicons name='repeat' size={16} color='#8E8E93' />
						<Text style={styles.statText}>{item.sets_count} {t('history', 'sets')}</Text>
					</View>
					<View style={styles.statItem}>
						<Ionicons name='time' size={16} color='#8E8E93' />
						<Text style={styles.statText}>{item.duration} {t('history', 'min')}</Text>
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
	}

	const renderFooter = () => {
		if (!hasMore) return null
		if (isLoadingMore) return <LoadingFooter />
		return null
	}

	const getWorkoutWord = (count: number) => {
		if (language === 'ru') {
			if (count % 10 === 1 && count % 100 !== 11) return t('history', 'workout1')
			if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100))
				return t('history', 'workout2')
			return t('history', 'workout5')
		}
		return count === 1 ? t('history', 'workout1') : t('history', 'workout5')
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
		return translateGroupName(filter, language)
	}

	// Показываем полный скелетон при первой загрузке
	if (isInitialLoading) {
		return <InitialLoadingSkeleton />
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<View>
					<Text style={styles.title}>{t('history', 'title')}</Text>
					<Text style={styles.subtitle}>
						{allWorkouts.length} {getWorkoutWord(allWorkouts.length)}
					</Text>
				</View>
				<View style={styles.headerRight} />
			</View>

			{/* Фильтры */}
			{muscleGroups.length > 1 && (
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
			)}

			{/* Список тренировок с пагинацией */}
			<FlatList
				data={displayedWorkouts}
				renderItem={renderWorkoutCard}
				keyExtractor={item => item.id?.toString() || Math.random().toString()}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
				onEndReached={loadNextPage}
				onEndReachedThreshold={0.3} // Срабатывает когда осталось 30% до конца
				ListFooterComponent={renderFooter}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor={COLORS.primary}
						colors={[COLORS.primary]}
					/>
				}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<Ionicons name='barbell-outline' size={64} color='#3A3A3C' />
						<Text style={styles.emptyStateTitle}>{t('history', 'noWorkouts')}</Text>
						<Text style={styles.emptyStateText}>
							{selectedFilter === 'all'
								? t('history', 'startFirst')
								: t('history', 'noWorkoutsFilter')}
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
		paddingBottom: -40,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 8,
		paddingTop: 20,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#2C2C2E',
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
		paddingHorizontal: 8,
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
		gap: 8,
		display: 'flex',
		flexDirection: 'row',
	},
	filterButton: {
		paddingHorizontal: 8,
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: '#1E1E1E',
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	filterButtonActive: {
		backgroundColor: '#34C759',
		borderColor: '#34C759',
	},
	filterText: {
		fontSize: 13,
		fontWeight: '600',
		color: '#8E8E93',
	},
	filterTextActive: {
		color: '#FFFFFF',
	},
	listContent: {
		paddingHorizontal: 8,
		paddingTop: 16,
		paddingBottom: 20,
	},
	workoutCard: {
		backgroundColor: '#1C1C1E',
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
		marginBottom: 8,
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
		gap: 8,
	},
	muscleTag: {
		backgroundColor: '#2C2C2E',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
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
	loadingFooter: {
		paddingVertical: 20,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: 8,
	},
	loadingFooterText: {
		color: COLORS.textSecondary,
		fontSize: 14,
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
