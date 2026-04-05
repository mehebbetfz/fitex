import { useLanguage } from '@/contexts/language-context'
import * as db from '@/scripts/database'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Animated,
	FlatList,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface Record {
	id: string
	exercise: string
	weight: string
	date: string
	trend: 'up' | 'down' | 'stable'
	category: 'strength' | 'cardio' | 'endurance'
	notes?: string
	previousRecord?: string
	improvement?: string
}

const getCategories = (t: (s: string, k: string) => string) => [
	{ id: 'all', name: t('records', 'all'), icon: 'list' },
	{ id: 'strength', name: t('records', 'strength'), icon: 'barbell' },
	{ id: 'cardio', name: t('records', 'cardio'), icon: 'heart' },
	{ id: 'endurance', name: t('records', 'endurance'), icon: 'time' },
]

const CATEGORY_COLORS: Record<string, string> = {
	strength: '#FF9500',
	cardio: '#FF2D55',
	endurance: '#5856D6',
}

// Количество рекордов для загрузки за раз
const PAGE_SIZE = 10

const getTrendColor = (t: string) =>
	t === 'up' ? '#34C759' : t === 'down' ? '#FF3B30' : '#8E8E93'
const getTrendIcon = (t: string) =>
	t === 'up' ? 'trending-up' : t === 'down' ? 'trending-down' : 'remove'

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

// ── Скелетон карточки рекорда ──
const RecordCardSkeleton = () => (
	<View style={s.recordItem}>
		<ShimmerBlock style={[s.categoryBar, { backgroundColor: '#2C2C2E' }]} />
		<View style={s.recordBody}>
			<ShimmerBlock
				style={[
					s.exerciseName,
					{ width: '60%', height: 16, backgroundColor: '#2C2C2E' },
				]}
			/>
			<View style={s.recordMeta}>
				<ShimmerBlock
					style={{
						width: 70,
						height: 12,
						backgroundColor: '#2C2C2E',
						borderRadius: 4,
					}}
				/>
			</View>
		</View>
		<View style={s.recordRight}>
			<ShimmerBlock
				style={[
					s.recordWeight,
					{ width: 60, height: 15, backgroundColor: '#2C2C2E' },
				]}
			/>
			<ShimmerBlock
				style={{
					width: 45,
					height: 11,
					backgroundColor: '#2C2C2E',
					borderRadius: 4,
					marginTop: 3,
				}}
			/>
		</View>
	</View>
)

// ── Скелетон статистики ──
const StatsSkeleton = () => (
	<View style={s.statsRow}>
		{[1, 2, 3].map(i => (
			<ShimmerBlock
				key={i}
				style={[s.statCard, { height: 70, backgroundColor: '#2C2C2E' }]}
			/>
		))}
	</View>
)

// ── Скелетон фильтров ──
const FilterSkeleton = () => (
	<View style={s.filterRow}>
		<FlatList
			horizontal
			data={[1, 2, 3, 4]}
			keyExtractor={item => item.toString()}
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={{ gap: 8 }}
			renderItem={() => (
				<ShimmerBlock
					style={[
						s.filterChip,
						{ width: 70, height: 34, backgroundColor: '#2C2C2E' },
					]}
				/>
			)}
		/>
	</View>
)

// ── Скелетон для подгрузки ──
const LoadingFooter = () => {
	const { t } = useLanguage()
	return (
		<View style={s.loadingFooter}>
			<ActivityIndicator size='small' color='#34C759' />
			<Text style={s.loadingFooterText}>{t('records', 'loading')}</Text>
		</View>
	)
}

// ── Полный скелетон для первой загрузки ──
const InitialLoadingSkeleton = () => (
	<SafeAreaView style={s.container}>
		<View style={s.header}>
			<ShimmerBlock
				style={[
					s.iconBtn,
					{
						width: 30,
						height: 30,
						borderRadius: 15,
						backgroundColor: '#2C2C2E',
					},
				]}
			/>
			<View style={{ alignItems: 'center' }}>
				<ShimmerBlock
					style={[
						s.headerTitle,
						{ width: 140, height: 18, backgroundColor: '#2C2C2E' },
					]}
				/>
				<ShimmerBlock
					style={[
						s.headerSub,
						{
							width: 120,
							height: 11,
							marginTop: 4,
							backgroundColor: '#2C2C2E',
						},
					]}
				/>
			</View>
			<ShimmerBlock
				style={[
					s.autoBadge,
					{ width: 70, height: 30, backgroundColor: '#2C2C2E' },
				]}
			/>
		</View>

		<StatsSkeleton />
		<FilterSkeleton />

		<View style={s.listContent}>
			{[1, 2, 3, 4, 5].map(i => (
				<RecordCardSkeleton key={i} />
			))}
		</View>
	</SafeAreaView>
)

export default function RecordsHistoryScreen() {
	const router = useRouter()
	const { t } = useLanguage()
	const [selectedCategory, setSelectedCategory] = useState('all')
	const [selectedRecord, setSelectedRecord] = useState<Record | null>(null)
	const [modalVisible, setModalVisible] = useState(false)
	const [allRecords, setAllRecords] = useState<Record[]>([])
	const [loading, setLoading] = useState(true)

	// Состояния для пагинации
	const [displayedRecords, setDisplayedRecords] = useState<Record[]>([])
	const [currentPage, setCurrentPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const [isInitialLoading, setIsInitialLoading] = useState(true)

	const loadRecords = async (category?: string) => {
		try {
			const dbRecords = await db.getPersonalRecords(category)
			return dbRecords.map((r, i) => ({
				id: r.id?.toString() || i.toString(),
				exercise: r.exercise,
				weight: r.weight,
				date: r.date,
				trend: r.trend,
				category: r.category,
				notes: r.notes,
				previousRecord: r.previous_record,
				improvement: r.improvement,
			}))
		} catch {
			console.error('Error loading records')
			return []
		}
	}

	// Первоначальная загрузка
	useEffect(() => {
		const loadInitialData = async () => {
			setIsInitialLoading(true)
			const records = await loadRecords()
			setAllRecords(records)
			setIsInitialLoading(false)
			setLoading(false)
		}
		loadInitialData()
	}, [])

	// Загрузка при смене категории
	useEffect(() => {
		const loadCategoryData = async () => {
			if (isInitialLoading) return

			setLoading(true)
			const records = await loadRecords(
				selectedCategory !== 'all' ? selectedCategory : undefined,
			)
			setAllRecords(records)
			setLoading(false)
		}
		loadCategoryData()
	}, [selectedCategory])

	// Обновление при фокусе
	useFocusEffect(
		useCallback(() => {
			if (!isInitialLoading) {
				const refreshData = async () => {
					const records = await loadRecords(
						selectedCategory !== 'all' ? selectedCategory : undefined,
					)
					setAllRecords(records)
				}
				refreshData()
			}
		}, [selectedCategory, isInitialLoading]),
	)

	// Обновление отображаемых рекордов при изменении всех рекордов
	useEffect(() => {
		setCurrentPage(1)
		setDisplayedRecords(allRecords.slice(0, PAGE_SIZE))
		setHasMore(allRecords.length > PAGE_SIZE)
	}, [allRecords])

	// Загрузка следующей порции
	const loadNextPage = useCallback(() => {
		if (isLoadingMore || !hasMore || loading) return

		setIsLoadingMore(true)

		// Небольшая задержка для плавности
		setTimeout(() => {
			const nextPage = currentPage + 1
			const endIndex = nextPage * PAGE_SIZE
			const newRecords = allRecords.slice(0, endIndex)

			setDisplayedRecords(newRecords)
			setCurrentPage(nextPage)
			setHasMore(allRecords.length > endIndex)
			setIsLoadingMore(false)
		}, 500)
	}, [currentPage, allRecords, hasMore, isLoadingMore, loading])

	const renderFooter = () => {
		if (!hasMore) return null
		if (isLoadingMore) return <LoadingFooter />
		return null
	}

	const renderItem = ({ item }: { item: Record }) => (
		<TouchableOpacity
			style={s.recordItem}
			onPress={() => {
				setSelectedRecord(item)
				setModalVisible(true)
			}}
			activeOpacity={0.7}
		>
			<View
				style={[
					s.categoryBar,
					{ backgroundColor: CATEGORY_COLORS[item.category] ?? '#34C759' },
				]}
			/>
			<View style={s.recordBody}>
				<Text style={s.exerciseName} numberOfLines={1}>
					{item.exercise}
				</Text>
				<View style={s.recordMeta}>
					<Ionicons name='calendar-outline' size={12} color='#8E8E93' />
					<Text style={s.recordDate}>
						{db.formatDate(item.date) || item.date}
					</Text>
					{item.notes ? (
						<Text style={s.recordNotes} numberOfLines={1}>
							· {item.notes}
						</Text>
					) : null}
				</View>
			</View>
			<View style={s.recordRight}>
				<Text style={s.recordWeight}>{item.weight}</Text>
				{item.improvement ? (
					<View style={s.improveBadge}>
						<Ionicons
							name={getTrendIcon(item.trend) as any}
							size={11}
							color={getTrendColor(item.trend)}
						/>
						<Text style={[s.improveText, { color: getTrendColor(item.trend) }]}>
							{item.improvement}
						</Text>
					</View>
				) : null}
			</View>
		</TouchableOpacity>
	)

	// Показываем полный скелетон при первой загрузке
	if (isInitialLoading) {
		return <InitialLoadingSkeleton />
	}

	return (
		<SafeAreaView style={s.container}>
			{/* Header */}
			<View style={s.header}>
				<TouchableOpacity onPress={() => router.back()} style={s.iconBtn}>
					<Ionicons name='arrow-back' size={22} color='#FFF' />
				</TouchableOpacity>
				<View>
				<Text style={s.headerTitle}>{t('records', 'title')}</Text>
				<Text style={s.headerSub}>{t('records', 'autoUpdate')}</Text>
				</View>
				<View style={s.autoBadge}>
					<Ionicons name='flash' size={14} color='#FF9500' />
					<Text style={s.autoBadgeText}>{t('records', 'auto')}</Text>
				</View>
			</View>

			{/* Quick stats */}
			<View style={s.statsRow}>
				<View style={s.statCard}>
					<Text style={s.statValue}>{allRecords.length}</Text>
					<Text style={s.statLabel}>{t('records', 'total')}</Text>
				</View>
				<View style={s.statCard}>
					<Text style={[s.statValue, { color: '#34C759' }]}>
						{allRecords.filter(r => r.trend === 'up').length}
					</Text>
					<Text style={s.statLabel}>{t('records', 'improved')}</Text>
				</View>
				<View style={s.statCard}>
					<Text style={[s.statValue, { color: '#FF9500' }]}>
						{allRecords.filter(r => r.category === 'strength').length}
					</Text>
					<Text style={s.statLabel}>{t('records', 'strength')}</Text>
				</View>
			</View>

			{/* Category filter */}
			<View style={s.filterRow}>
				<FlatList
					horizontal
					data={getCategories(t)}
					keyExtractor={item => item.id}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ gap: 8 }}
					renderItem={({ item }) => {
						const active = selectedCategory === item.id

						return (
							<TouchableOpacity
								style={[s.filterChip, active && s.filterChipActive]}
								onPress={() => setSelectedCategory(item.id)}
							>
								<Ionicons
									name={item.icon as any}
									size={14}
									color={active ? '#FFF' : '#8E8E93'}
								/>
								<Text
									style={[s.filterChipText, active && s.filterChipTextActive]}
								>
									{item.name}
								</Text>
							</TouchableOpacity>
						)
					}}
				/>
			</View>

			{/* List with pagination */}
			{loading ? (
				<View style={s.listContent}>
					{[1, 2, 3].map(i => (
						<RecordCardSkeleton key={i} />
					))}
				</View>
			) : (
				<FlatList
					data={displayedRecords}
					renderItem={renderItem}
					keyExtractor={item => item.id}
					contentContainerStyle={s.listContent}
					showsVerticalScrollIndicator={false}
					onEndReached={loadNextPage}
					onEndReachedThreshold={0.3}
					ListFooterComponent={renderFooter}
					ListEmptyComponent={
						<View style={s.emptyWrap}>
							<Ionicons name='trophy-outline' size={48} color='#3A3A3C' />
							<Text style={s.emptyTitle}>{t('records', 'empty')}</Text>
							<Text style={s.emptyText}>{t('records', 'emptyHint')}</Text>
						</View>
					}
				/>
			)}

			{/* Detail modal */}
			<Modal
				animationType='slide'
				transparent
				visible={modalVisible}
				onRequestClose={() => setModalVisible(false)}
			>
				<View style={s.modalOverlay}>
					<View style={s.modalContent}>
						{selectedRecord && (
							<>
								<View style={s.modalHeader}>
									<View
										style={[
											s.modalCatDot,
											{
												backgroundColor:
													CATEGORY_COLORS[selectedRecord.category] ?? '#34C759',
											},
										]}
									/>
									<Text style={s.modalTitle} numberOfLines={1}>
										{selectedRecord.exercise}
									</Text>
									<TouchableOpacity onPress={() => setModalVisible(false)}>
										<Ionicons name='close' size={22} color='#8E8E93' />
									</TouchableOpacity>
								</View>

								<View style={s.modalStatsRow}>
									<View style={s.modalStat}>
										<Text style={s.modalStatLabel}>{t('records', 'record')}</Text>
										<Text style={s.modalStatValue}>
											{selectedRecord.weight}
										</Text>
									</View>
									<View style={s.modalStat}>
										<Text style={s.modalStatLabel}>{t('records', 'previous')}</Text>
										<Text style={s.modalStatValue}>
											{selectedRecord.previousRecord || '—'}
										</Text>
									</View>
									<View style={s.modalStat}>
										<Text style={s.modalStatLabel}>{t('records', 'progress')}</Text>
										<View
											style={{
												flexDirection: 'row',
												alignItems: 'center',
												gap: 4,
											}}
										>
											<Ionicons
												name={getTrendIcon(selectedRecord.trend) as any}
												size={14}
												color={getTrendColor(selectedRecord.trend)}
											/>
											<Text
												style={[
													s.modalStatValue,
													{ color: getTrendColor(selectedRecord.trend) },
												]}
											>
												{selectedRecord.improvement || '—'}
											</Text>
										</View>
									</View>
								</View>

								<View style={s.modalDateRow}>
									<Ionicons name='calendar-outline' size={14} color='#8E8E93' />
									<Text style={s.modalDate}>
										{db.formatDate(selectedRecord.date) || selectedRecord.date}
									</Text>
									<View style={s.autoTag}>
										<Ionicons name='flash' size={11} color='#FF9500' />
										<Text style={s.autoTagText}>{t('records', 'auto')}</Text>
									</View>
								</View>

								{selectedRecord.notes ? (
									<View style={s.notesBox}>
										<Text style={s.notesText}>{selectedRecord.notes}</Text>
									</View>
								) : null}
							</>
						)}
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	)
}

// Обновляем стили, добавляем новые
const s = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#121212' },
	center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 12,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#2C2C2E',
	},
	iconBtn: { padding: 4 },
	headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
	headerSub: { fontSize: 11, color: '#8E8E93', marginTop: 1 },
	autoBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		backgroundColor: 'rgba(255,149,0,0.12)',
		borderRadius: 20,
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderWidth: 1,
		borderColor: 'rgba(255,149,0,0.2)',
	},
	autoBadgeText: { fontSize: 12, fontWeight: '600', color: '#FF9500' },

	statsRow: {
		flexDirection: 'row',
		paddingHorizontal: 12,
		paddingVertical: 12,
		gap: 8,
	},
	statCard: {
		flex: 1,
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		paddingVertical: 12,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#2C2C2E',
	},
	statValue: {
		fontSize: 18,
		fontWeight: '700',
		color: '#FFF',
		marginBottom: 2,
	},
	statLabel: { fontSize: 11, color: '#8E8E93' },

	filterRow: {
		flexDirection: 'row',
		paddingHorizontal: 12,
		gap: 8,
		marginBottom: 8,
		flexWrap: 'wrap',
	},
	filterChip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
		paddingHorizontal: 12,
		paddingVertical: 7,
		borderRadius: 20,
		backgroundColor: '#1C1C1E',
		borderWidth: 1,
		borderColor: '#2C2C2E',
	},
	filterChipActive: { backgroundColor: '#34C759', borderColor: '#34C759' },
	filterChipText: { fontSize: 13, fontWeight: '500', color: '#8E8E93' },
	filterChipTextActive: { color: '#FFF' },

	listContent: { paddingHorizontal: 12, paddingBottom: 40, gap: 6 },

	recordItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#2C2C2E',
		overflow: 'hidden',
	},
	categoryBar: { width: 3, alignSelf: 'stretch' },
	recordBody: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, gap: 3 },
	exerciseName: { fontSize: 14, fontWeight: '600', color: '#FFF' },
	recordMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	recordDate: { fontSize: 12, color: '#8E8E93' },
	recordNotes: { fontSize: 12, color: '#8E8E93', flex: 1 },
	recordRight: { paddingRight: 12, alignItems: 'flex-end', gap: 3 },
	recordWeight: { fontSize: 15, fontWeight: '700', color: '#FFF' },
	improveBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
	improveText: { fontSize: 11, fontWeight: '600' },

	emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 10 },
	emptyTitle: { fontSize: 16, fontWeight: '600', color: '#FFF' },
	emptyText: {
		fontSize: 13,
		color: '#8E8E93',
		textAlign: 'center',
		lineHeight: 20,
	},

	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.6)',
		justifyContent: 'flex-end',
	},
	modalContent: {
		backgroundColor: '#1C1C1E',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
	},
	modalHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		marginBottom: 16,
	},
	modalCatDot: { width: 10, height: 10, borderRadius: 5 },
	modalTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#FFF' },
	modalStatsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
	modalStat: {
		flex: 1,
		backgroundColor: '#242424',
		borderRadius: 10,
		padding: 12,
		gap: 4,
	},
	modalStatLabel: { fontSize: 11, color: '#8E8E93' },
	modalStatValue: { fontSize: 15, fontWeight: '700', color: '#FFF' },
	modalDateRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginBottom: 12,
	},
	modalDate: { fontSize: 13, color: '#8E8E93', flex: 1 },
	autoTag: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		backgroundColor: 'rgba(255,149,0,0.1)',
		borderRadius: 8,
		paddingHorizontal: 7,
		paddingVertical: 3,
	},
	autoTagText: { fontSize: 11, color: '#FF9500', fontWeight: '600' },
	notesBox: {
		backgroundColor: '#242424',
		borderRadius: 10,
		padding: 12,
		marginBottom: 4,
	},
	notesText: { fontSize: 14, color: '#B0B0B0', lineHeight: 20 },

	// Новые стили для пагинации и скелетонов
	loadingFooter: {
		paddingVertical: 20,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: 8,
	},
	loadingFooterText: {
		color: '#8E8E93',
		fontSize: 14,
	},
})
