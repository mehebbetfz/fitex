import { STATS_HISTORY_COLORS as COLORS, STATS_HISTORY_THEME as T } from '@/constants/stats-history-theme'
import { useLanguage } from '@/contexts/language-context'
import { translateGroupName, translateWorkoutType } from '@/constants/exercise-i18n'
import ActivityHeatmap from '@/components/activity-heatmap'
import {
	aggregateSetsByDay,
	buildHeatmapGrid,
} from '@/scripts/activity-heatmap'
import { Workout } from '@/scripts/database'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Animated,
	FlatList,
	Platform,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDatabase } from '../contexts/database-context'

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
							height: 14,
							marginTop: 2,
							backgroundColor: COLORS.cardLight,
						},
					]}
				/>
			</View>
			<ShimmerBlock
				style={[
					styles.workoutTypeBadge,
					{ width: 72, height: 26, backgroundColor: COLORS.cardLight },
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
							width: i === 1 ? 56 : i === 2 ? 46 : 64,
							height: 22,
							backgroundColor: COLORS.cardLight,
						},
					]}
				/>
			))}
		</View>

		<View style={styles.statGrid}>
			{[1, 2, 3, 4].map(i => (
				<View key={i} style={styles.statCell}>
					<ShimmerBlock
						style={{
							width: 14,
							height: 14,
							borderRadius: 4,
							backgroundColor: COLORS.cardLight,
						}}
					/>
					<ShimmerBlock
						style={{
							flex: 1,
							height: 14,
							borderRadius: 4,
							backgroundColor: COLORS.cardLight,
						}}
					/>
				</View>
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
	<SafeAreaView style={styles.container} edges={['top']}>
		<View style={styles.header}>
			<View>
				<ShimmerBlock
					style={[
						styles.title,
						{ width: 180, height: 30, backgroundColor: COLORS.cardLight },
					]}
				/>
				<ShimmerBlock
					style={[
						styles.countPill,
						{
							width: 120,
							height: 30,
							marginTop: 10,
							backgroundColor: COLORS.cardLight,
						},
					]}
				/>
			</View>
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
			style={styles.listFlex}
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
	const params = useLocalSearchParams<{ muscleGroup?: string | string[] }>()
	const { t, language } = useLanguage()
	const { workouts: allWorkouts, refreshWorkouts } = useDatabase()

	// Состояния для пагинации
	const [displayedWorkouts, setDisplayedWorkouts] = useState<Workout[]>([])
	const [currentPage, setCurrentPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const [refreshing, setRefreshing] = useState(false)
	const [selectedFilter, setSelectedFilter] = useState('all')
	const [isInitialLoading, setIsInitialLoading] = useState(true)
	const filterListRef = useRef<FlatList<string>>(null)

	const muscleGroupParam = useMemo(() => {
		const raw = params.muscleGroup
		if (!raw) return null
		const value = Array.isArray(raw) ? raw[0] : raw
		const trimmed = value?.trim()
		return trimmed ? trimmed : null
	}, [params.muscleGroup])

	// Первоначальная загрузка
	useEffect(() => {
		const loadInitialData = async () => {
			setIsInitialLoading(true)
			await refreshWorkouts()
			setIsInitialLoading(false)
		}
		loadInitialData()
	}, [])

	// Фильтр с экрана восстановления
	useEffect(() => {
		if (!muscleGroupParam) return
		setSelectedFilter(muscleGroupParam)
		router.setParams({ muscleGroup: '' })
	}, [muscleGroupParam, router])

	// Обновление при фокусе (без показа скелетонов)
	useFocusEffect(
		useCallback(() => {
			if (!isInitialLoading) {
				refreshWorkouts()
			}
		}, [isInitialLoading, refreshWorkouts]),
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

	const heatmapWeeks = useMemo(() => {
		const byDay = aggregateSetsByDay(filteredWorkouts)
		return buildHeatmapGrid(byDay)
	}, [filteredWorkouts])

	const heatmapLocale =
		language === 'en' ? 'en-US' : language === 'az' ? 'az-AZ' : 'ru-RU'

	const formatHeatmapDate = useCallback(
		(isoDate: string) => {
			try {
				return new Date(isoDate + 'T12:00:00').toLocaleDateString(
					heatmapLocale,
					{ day: 'numeric', month: 'long', year: 'numeric' },
				)
			} catch {
				return isoDate
			}
		},
		[heatmapLocale],
	)

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
		const nextPage = currentPage + 1
		const endIndex = nextPage * PAGE_SIZE
		const newWorkouts = filteredWorkouts.slice(0, endIndex)

		setDisplayedWorkouts(newWorkouts)
		setCurrentPage(nextPage)
		setHasMore(filteredWorkouts.length > endIndex)
		setIsLoadingMore(false)
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
		if (selectedFilter !== 'all') groups.add(selectedFilter)
		return ['all', ...Array.from(groups).sort()]
	}, [allWorkouts, selectedFilter])

	useEffect(() => {
		if (selectedFilter === 'all') return
		const index = muscleGroups.indexOf(selectedFilter)
		if (index < 0) return
		const timer = setTimeout(() => {
			filterListRef.current?.scrollToIndex({
				index,
				animated: true,
				viewPosition: 0.4,
			})
		}, 80)
		return () => clearTimeout(timer)
	}, [selectedFilter, muscleGroups])

	const handleWorkoutPress = (id: number) => {
		router.push({
			pathname: `/(routes)/workout-details/${id}`,
		})
	}

	const renderWorkoutCard = ({ item }: { item: Workout }) => {
		const { fullDate, dayOfWeek, time } = formatWorkoutDate(item.date, language, t('exercises', 'today'), t('exercises', 'yesterday'))
		const muscleGroupsList =
			item.muscle_groups?.split(',').filter(g => g.trim()) || []

		const stats: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }[] = [
			{ icon: 'barbell-outline', label: `${item.exercises_count} ${t('history', 'exercises')}` },
			{ icon: 'repeat-outline', label: `${item.sets_count} ${t('history', 'sets')}` },
			{ icon: 'time-outline', label: `${item.duration} ${t('history', 'min')}` },
		]
		if (item.volume > 0) {
			stats.push({
				icon: 'trending-up-outline',
				label: `${Number(item.volume).toFixed(2)} ${t('history', 'kg')}`,
			})
		}

		return (
			<TouchableOpacity
				activeOpacity={0.88}
				onPressIn={() => {
					if (Platform.OS !== 'web') {
						void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
					}
				}}
				onPress={() => item.id && handleWorkoutPress(item.id)}
				style={styles.workoutCard}
			>
				<View style={styles.workoutHeader}>
					<View style={styles.workoutHeaderText}>
						<Text style={styles.workoutDate}>{fullDate}</Text>
						<Text style={styles.workoutSubDate}>
							{dayOfWeek} · {time || item.time}
						</Text>
					</View>
					<View style={styles.workoutHeaderRight}>
						<View
							style={[
								styles.workoutTypeBadge,
								{ backgroundColor: getTypeColor(item.type) },
							]}
						>
							<Text style={styles.workoutTypeText}>
								{translateWorkoutType(item.type, language)}
							</Text>
						</View>
						<Ionicons name='chevron-forward' size={16} color={T.textTertiary} style={styles.chevron} />
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

				<View style={styles.statGrid}>
					{stats.map((s, i) => (
						<View key={`st-${i}`} style={styles.statCell}>
							<Ionicons name={s.icon} size={14} color={COLORS.primary} />
							<Text style={styles.statCellText} numberOfLines={1}>
								{s.label}
							</Text>
						</View>
					))}
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
		<SafeAreaView style={styles.container} edges={['top']}>
			<View style={styles.header}>
				<View>
					<Text style={styles.title}>{t('history', 'title')}</Text>
					<Text style={styles.countSubtitle}>
						{allWorkouts.length} {getWorkoutWord(allWorkouts.length)}
					</Text>
				</View>
			</View>

			<ActivityHeatmap
				weeks={heatmapWeeks}
				locale={heatmapLocale}
				title={t('history', 'activityTitle')}
				lessLabel={t('history', 'less')}
				moreLabel={t('history', 'more')}
				daySetsTemplate={t('history', 'daySets')}
				formatDate={formatHeatmapDate}
			/>

			{/* Фильтры */}
			{muscleGroups.length > 1 && (
				<View style={styles.filtersSection}>
					<Text style={styles.filtersTitle}>{t('history', 'filterByMuscle')}</Text>
					<FlatList
						ref={filterListRef}
						horizontal
						data={muscleGroups}
						renderItem={({ item }) => (
							<TouchableOpacity
								activeOpacity={0.85}
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
						onScrollToIndexFailed={({ index }) => {
							filterListRef.current?.scrollToOffset({
								offset: Math.max(0, index * 88),
								animated: true,
							})
						}}
					/>
				</View>
			)}

			{/* Список тренировок с пагинацией */}
			<FlatList
				style={styles.listFlex}
				data={displayedWorkouts}
				renderItem={renderWorkoutCard}
				keyExtractor={(item, index) =>
					item.id != null ? String(item.id) : `w-${index}`
				}
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
						<View style={styles.emptyIconWrap}>
							<Ionicons name='barbell-outline' size={40} color={COLORS.primary} />
						</View>
						<Text style={styles.emptyStateTitle}>{t('history', 'noWorkouts')}</Text>
						<Text style={styles.emptyStateText}>
							{selectedFilter === 'all'
								? t('history', 'startFirst')
								: t('history', 'noWorkoutsFilter')}
						</Text>
						{selectedFilter === 'all' ? (
							<TouchableOpacity
								style={styles.emptyCta}
								activeOpacity={0.88}
								onPress={() => router.push('/workout/create')}
							>
								<Text style={styles.emptyCtaText}>{t('progress', 'startFirstWorkoutCta')}</Text>
								<Ionicons name='arrow-forward' size={18} color='#fff' />
							</TouchableOpacity>
						) : null}
					</View>
				}
			/>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: T.background,
	},
	listFlex: {
		flex: 1,
	},
	header: {
		paddingHorizontal: 10,
		paddingTop: 16,
		paddingBottom: 8,
	},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
		color: T.text,
		marginBottom: 2,
	},
	countSubtitle: {
		fontSize: 13,
		color: COLORS.textSecondary,
		marginTop: 2,
	},
	filtersSection: {
		paddingTop: 8,
		paddingBottom: 8,
		paddingHorizontal: 10,
		borderBottomWidth: 1,
		borderBottomColor: T.borderSubtle,
	},
	filtersTitle: {
		fontSize: 17,
		fontWeight: '700',
		color: T.text,
		marginBottom: 8,
	},
	filtersContainer: {
		paddingRight: 16,
		gap: 8,
		flexDirection: 'row',
	},
	filterButton: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 18,
		backgroundColor: T.chipInactive,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	filterButtonActive: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
	filterText: {
		fontSize: 13,
		fontWeight: '600',
		color: COLORS.textSecondary,
	},
	filterTextActive: {
		color: T.text,
	},
	listContent: {
		paddingHorizontal: 10,
		paddingTop: 10,
		paddingBottom: 10,
	},
	workoutCard: {
		backgroundColor: COLORS.card,
		borderRadius: 12,
		padding: 11,
		borderWidth: 1,
		borderColor: COLORS.border,
		marginBottom: 8,
	},
	workoutHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 6,
	},
	workoutHeaderText: {
		flex: 1,
		paddingRight: 8,
	},
	workoutHeaderRight: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	chevron: { marginLeft: 2 },
	workoutDate: {
		fontSize: 15,
		fontWeight: 'bold',
		color: T.text,
	},
	workoutSubDate: {
		fontSize: 12,
		color: T.textSecondary,
		marginTop: 1,
	},
	workoutTypeBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 8,
	},
	workoutTypeText: {
		fontSize: 11,
		fontWeight: '600',
		color: T.text,
	},
	muscleGroups: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 8,
		gap: 6,
	},
	muscleTag: {
		backgroundColor: COLORS.cardLight,
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 10,
	},
	muscleTagText: {
		fontSize: 11,
		color: COLORS.textSecondary,
	},
	statGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
		marginTop: 0,
	},
	statCell: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		flexGrow: 1,
		minWidth: '47%',
		backgroundColor: T.statCellBg,
		borderRadius: 10,
		paddingVertical: 7,
		paddingHorizontal: 8,
		borderWidth: 1,
		borderColor: T.statCellBorder,
	},
	statCellText: {
		fontSize: 11,
		fontWeight: '600',
		color: '#E5E5EA',
		flex: 1,
	},
	loadingFooter: {
		paddingVertical: 12,
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
		paddingTop: 48,
		paddingHorizontal: 28,
	},
	emptyIconWrap: {
		width: 88,
		height: 88,
		borderRadius: 44,
		backgroundColor: T.pillBg,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: T.pillBorder,
		marginBottom: 20,
	},
	emptyStateTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: T.text,
		marginBottom: 8,
		textAlign: 'center',
	},
	emptyStateText: {
		fontSize: 15,
		color: T.textSecondary,
		textAlign: 'center',
		lineHeight: 22,
		marginBottom: 24,
	},
	emptyCta: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		backgroundColor: COLORS.primary,
		paddingVertical: 14,
		paddingHorizontal: 22,
		borderRadius: 14,
	},
	emptyCtaText: {
		fontSize: 16,
		fontWeight: '700',
		color: '#fff',
	},
})
