import { useLanguage } from '@/contexts/language-context'
import * as db from '@/scripts/database'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Animated,
	FlatList,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface Measurement {
	id: string
	name: string
	value: number
	unit: string
	trend: 'up' | 'down' | 'stable'
	date: string
	change?: number
	goal?: number
	progress?: number
}

interface HistoryEntry {
	id: string
	date: string
	rawDate: string
	measurements: Array<{ name: string; value: string; change: string }>
}

const MEASUREMENT_ICONS: Record<string, string> = {
	Вес: 'scale',
	Грудь: 'body',
	Талия: 'body',
	Бедра: 'body',
	Бицепс: 'fitness',
	Шея: 'body',
	Икры: 'body',
	Плечо: 'body',
	Жир: 'water',
	Мышцы: 'fitness',
}

// Количество записей истории для загрузки за раз
const PAGE_SIZE = 5

const formatDate = (dateString: string): string => {
	const date = new Date(dateString)
	return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`
}

const getTrendColor = (trend: string) =>
	trend === 'up' ? '#34C759' : trend === 'down' ? '#FF3B30' : '#8E8E93'

const getTrendIcon = (trend: string) =>
	trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove'

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

// ── Скелетон карточки замера (текущие) ──
const MeasurementCardSkeleton = () => (
	<View style={styles.measurementItem}>
		<ShimmerBlock
			style={[styles.measurementIconWrap, { backgroundColor: '#2C2C2E' }]}
		/>
		<View style={styles.measurementBody}>
			<ShimmerBlock
				style={[
					styles.measurementName,
					{ width: '60%', height: 14, backgroundColor: '#2C2C2E' },
				]}
			/>
			<ShimmerBlock
				style={[
					styles.measurementDate,
					{
						width: '40%',
						height: 11,
						marginTop: 4,
						backgroundColor: '#2C2C2E',
					},
				]}
			/>
		</View>
		<View style={styles.measurementRight}>
			<ShimmerBlock
				style={[
					styles.measurementValue,
					{ width: 50, height: 15, backgroundColor: '#2C2C2E' },
				]}
			/>
			<ShimmerBlock
				style={{
					width: 40,
					height: 11,
					marginTop: 3,
					backgroundColor: '#2C2C2E',
					borderRadius: 4,
				}}
			/>
		</View>
	</View>
)

// ── Скелетон записи истории ──
const HistoryItemSkeleton = () => (
	<View style={styles.historyItem}>
		<View style={styles.historyDateRow}>
			<ShimmerBlock
				style={{
					width: 80,
					height: 14,
					backgroundColor: '#2C2C2E',
					borderRadius: 4,
				}}
			/>
		</View>
		{[1, 2, 3].map(i => (
			<View key={i} style={styles.historyRow}>
				<ShimmerBlock
					style={{
						flex: 2,
						height: 13,
						backgroundColor: '#2C2C2E',
						borderRadius: 4,
						marginRight: 8,
					}}
				/>
				<ShimmerBlock
					style={{
						flex: 1,
						height: 13,
						backgroundColor: '#2C2C2E',
						borderRadius: 4,
						marginRight: 8,
					}}
				/>
				<ShimmerBlock
					style={{
						flex: 1,
						height: 13,
						backgroundColor: '#2C2C2E',
						borderRadius: 4,
					}}
				/>
			</View>
		))}
	</View>
)

// ── Скелетон статистики ──
const StatsSkeleton = () => (
	<View style={styles.statsRow}>
		{[1, 2, 3].map(i => (
			<ShimmerBlock
				key={i}
				style={[styles.statCard, { height: 70, backgroundColor: '#2C2C2E' }]}
			/>
		))}
	</View>
)

// ── Скелетон табов ──
const TabsSkeleton = () => (
	<View style={styles.tabs}>
		{[1, 2].map(i => (
			<ShimmerBlock
				key={i}
				style={{
					flex: 1,
					height: 36,
					backgroundColor: '#2C2C2E',
					borderRadius: 8,
				}}
			/>
		))}
	</View>
)

// ── Скелетон для подгрузки ──
const LoadingFooter = () => {
	const { t } = useLanguage()
	return (
		<View style={styles.loadingFooter}>
			<ActivityIndicator size='small' color='#34C759' />
			<Text style={styles.loadingFooterText}>{t('measurements', 'loading')}</Text>
		</View>
	)
}

// ── Полный скелетон для первой загрузки ──
const InitialLoadingSkeleton = () => (
	<SafeAreaView style={styles.container}>
		<View style={styles.header}>
			<ShimmerBlock
				style={[
					styles.backButton,
					{
						width: 30,
						height: 30,
						borderRadius: 15,
						backgroundColor: '#2C2C2E',
					},
				]}
			/>
			<ShimmerBlock
				style={[
					styles.headerTitle,
					{ width: 150, height: 18, backgroundColor: '#2C2C2E' },
				]}
			/>
			<ShimmerBlock
				style={[
					styles.addButton,
					{
						width: 30,
						height: 30,
						borderRadius: 15,
						backgroundColor: '#2C2C2E',
					},
				]}
			/>
		</View>

		<StatsSkeleton />
		<TabsSkeleton />

		<View style={styles.listContent}>
			{[1, 2, 3, 4].map(i => (
				<MeasurementCardSkeleton key={i} />
			))}
		</View>
	</SafeAreaView>
)

export default function MeasurementsHistoryScreen() {
	const router = useRouter()
	const { t } = useLanguage()
	const [selectedTab, setSelectedTab] = useState<'current' | 'history'>(
		'current',
	)
	const [selectedMeasurement, setSelectedMeasurement] =
		useState<Measurement | null>(null)
	const [modalVisible, setModalVisible] = useState(false)
	const [currentMeasurements, setCurrentMeasurements] = useState<Measurement[]>(
		[],
	)
	const [allHistoryData, setAllHistoryData] = useState<HistoryEntry[]>([])
	const [loading, setLoading] = useState(true)

	// Состояния для пагинации
	const [displayedHistory, setDisplayedHistory] = useState<HistoryEntry[]>([])
	const [currentPage, setCurrentPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const [isInitialLoading, setIsInitialLoading] = useState(true)

	const loadData = async () => {
		try {
			setLoading(true)
			const allMeasurements = await db.getBodyMeasurements()

			// ── Текущие: последнее значение каждого типа + реальный change ──
			const latestByName = new Map<string, any>()
			const prevByName = new Map<string, any>()

			// Сортируем по дате desc
			const sorted = [...allMeasurements].sort(
				(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
			)

			sorted.forEach(m => {
				if (!latestByName.has(m.name)) {
					latestByName.set(m.name, m)
				} else if (!prevByName.has(m.name)) {
					prevByName.set(m.name, m)
				}
			})

			const formattedCurrent: Measurement[] = Array.from(
				latestByName.values(),
			).map((m, index) => {
				const prev = prevByName.get(m.name)
				const change = prev ? m.value - prev.value : 0
				return {
					id: m.id?.toString() || index.toString(),
					name: m.name,
					value: m.value,
					unit: m.unit,
					trend: m.trend ?? 'stable',
					date: m.date,
					change,
					goal: m.goal,
					progress: m.goal ? (m.value / m.goal) * 100 : undefined,
				}
			})
			setCurrentMeasurements(formattedCurrent)

			// ── История: группируем по дате ──
			const groupedByDate = new Map<string, any[]>()
			allMeasurements.forEach(m => {
				if (!groupedByDate.has(m.date)) groupedByDate.set(m.date, [])
				groupedByDate.get(m.date)!.push(m)
			})

			const datesSorted = Array.from(groupedByDate.keys()).sort(
				(a, b) => new Date(b).getTime() - new Date(a).getTime(),
			)

			const formattedHistory: HistoryEntry[] = datesSorted.map((date, i) => {
				const entries = groupedByDate.get(date)!
				const prevDate = datesSorted[i + 1]
				const prevEntries = prevDate ? groupedByDate.get(prevDate)! : []

				return {
					id: i.toString(),
					date: formatDate(date),
					rawDate: date,
					measurements: entries.map(m => {
						const prev = prevEntries.find(p => p.name === m.name)
						const change = prev ? m.value - prev.value : 0
						return {
							name: m.name,
							value: `${m.value} ${m.unit}`,
							change: `${change > 0 ? '+' : ''}${change.toFixed(1)} ${m.unit}`,
						}
					}),
				}
			})
			setAllHistoryData(formattedHistory)
		} catch (error) {
			console.error('Error loading measurements:', error)
		} finally {
			setLoading(false)
			setIsInitialLoading(false)
		}
	}

	useFocusEffect(
		useCallback(() => {
			loadData()
		}, []),
	)

	// Обновление отображаемой истории при изменении всех данных
	useEffect(() => {
		setCurrentPage(1)
		setDisplayedHistory(allHistoryData.slice(0, PAGE_SIZE))
		setHasMore(allHistoryData.length > PAGE_SIZE)
	}, [allHistoryData])

	// Загрузка следующей порции истории
	const loadNextPage = useCallback(() => {
		if (isLoadingMore || !hasMore || loading || selectedTab !== 'history')
			return

		setIsLoadingMore(true)

		// Небольшая задержка для плавности
		setTimeout(() => {
			const nextPage = currentPage + 1
			const endIndex = nextPage * PAGE_SIZE
			const newHistory = allHistoryData.slice(0, endIndex)

			setDisplayedHistory(newHistory)
			setCurrentPage(nextPage)
			setHasMore(allHistoryData.length > endIndex)
			setIsLoadingMore(false)
		}, 500)
	}, [
		currentPage,
		allHistoryData,
		hasMore,
		isLoadingMore,
		loading,
		selectedTab,
	])

	const handleDeleteMeasurement = async (id: string) => {
	Alert.alert(t('measurements', 'confirmDelete'), t('measurements', 'confirmDeleteMsg'), [
		{ text: t('common', 'cancel'), style: 'cancel' },
			{
				text: t('measurements', 'delete'),
				style: 'destructive',
				onPress: async () => {
					await db.deleteBodyMeasurement(Number(id))
					setModalVisible(false)
					loadData()
				},
			},
		])
	}

	const renderFooter = () => {
		if (!hasMore || selectedTab !== 'history') return null
		if (isLoadingMore) return <LoadingFooter />
		return null
	}

	// ── Карточка текущего замера ──
	const renderMeasurementItem = ({ item }: { item: Measurement }) => (
		<TouchableOpacity
			style={styles.measurementItem}
			onPress={() => {
				setSelectedMeasurement(item)
				setModalVisible(true)
			}}
			activeOpacity={0.7}
		>
			<View style={styles.measurementIconWrap}>
				<Ionicons
					name={(MEASUREMENT_ICONS[item.name] ?? 'body') as any}
					size={16}
					color='#34C759'
				/>
			</View>
			<View style={styles.measurementBody}>
				<Text style={styles.measurementName}>{item.name}</Text>
				<Text style={styles.measurementDate}>{formatDate(item.date)}</Text>
			</View>
			<View style={styles.measurementRight}>
				<Text style={styles.measurementValue}>
					{item.value}
					<Text style={styles.measurementUnit}> {item.unit}</Text>
				</Text>
				{item.change !== 0 && (
					<View style={styles.changeBadge}>
						<Ionicons
							name={getTrendIcon(item.trend) as any}
							size={11}
							color={getTrendColor(item.trend)}
						/>
						<Text
							style={[styles.changeText, { color: getTrendColor(item.trend) }]}
						>
							{item.change && item.change > 0 ? '+' : ''}
							{item.change?.toFixed(1)}
						</Text>
					</View>
				)}
			</View>
		</TouchableOpacity>
	)

	// ── Запись истории ──
	const renderHistoryItem = ({ item }: { item: HistoryEntry }) => (
		<View style={styles.historyItem}>
			<View style={styles.historyDateRow}>
				<Ionicons name='calendar-outline' size={14} color='#34C759' />
				<Text style={styles.historyDate}>{item.date}</Text>
			</View>
			{item.measurements.map((m, i) => (
				<View
					key={i}
					style={[
						styles.historyRow,
						i === item.measurements.length - 1 && { borderBottomWidth: 0 },
					]}
				>
					<Text style={styles.historyName}>{m.name}</Text>
					<Text style={styles.historyValue}>{m.value}</Text>
					<Text
						style={[
							styles.historyChange,
							{
								color: m.change.includes('+')
									? '#34C759'
									: m.change.replace(/[^0-9.-]/g, '') !== '0.0'
										? '#FF3B30'
										: '#8E8E93',
							},
						]}
					>
						{m.change}
					</Text>
				</View>
			))}
		</View>
	)

	const weightMeasurement = currentMeasurements.find(m => m.name === 'Вес')

	// Показываем полный скелетон при первой загрузке
	if (isInitialLoading) {
		return <InitialLoadingSkeleton />
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButton}
				>
					<Ionicons name='arrow-back' size={22} color='#FFFFFF' />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{t('measurements', 'title')}</Text>
				<TouchableOpacity
					onPress={() => router.push('/(routes)/add-measurement')}
					style={styles.addButton}
				>
					<Ionicons name='add' size={22} color='#34C759' />
				</TouchableOpacity>
			</View>

			{/* Quick stats */}
			<View style={styles.statsRow}>
				<View style={styles.statCard}>
					<Text style={styles.statValue}>
					{weightMeasurement
						? `${weightMeasurement.change && weightMeasurement.change > 0 ? '+' : ''}${weightMeasurement.change?.toFixed(1) ?? '0'} ${t('records', 'kg')}`
						: `— ${t('records', 'kg')}`}
					</Text>
					<Text style={styles.statLabel}>{t('measurements', 'weightChange')}</Text>
				</View>
				<View style={styles.statCard}>
					<Text style={styles.statValue}>{currentMeasurements.length}</Text>
					<Text style={styles.statLabel}>{t('measurements', 'bodyChange')}</Text>
				</View>
				<View style={styles.statCard}>
					<Text style={styles.statValue}>
						{currentMeasurements.length > 0
							? Math.floor(
									(Date.now() -
										new Date(currentMeasurements[0].date).getTime()) /
										86400000,
								)
							: '—'}
					</Text>
					<Text style={styles.statLabel}>{t('measurements', 'daysAgo')}</Text>
				</View>
			</View>

			{/* Tabs */}
			<View style={styles.tabs}>
				{(['current', 'history'] as const).map(tab => (
					<TouchableOpacity
						key={tab}
						style={[styles.tab, selectedTab === tab && styles.activeTab]}
						onPress={() => setSelectedTab(tab)}
					>
						<Text
							style={[
								styles.tabText,
								selectedTab === tab && styles.activeTabText,
							]}
						>
							{tab === 'current' ? t('measurements', 'current') : t('measurements', 'history')}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* List */}
			{selectedTab === 'current' ? (
				loading ? (
					<View style={styles.listContent}>
						{[1, 2, 3, 4].map(i => (
							<MeasurementCardSkeleton key={i} />
						))}
					</View>
				) : (
					<FlatList
						data={currentMeasurements}
						renderItem={renderMeasurementItem}
						keyExtractor={item => item.id}
						contentContainerStyle={styles.listContent}
						showsVerticalScrollIndicator={false}
						ListEmptyComponent={
							<View style={styles.emptyWrap}>
								<Ionicons name='body-outline' size={48} color='#3A3A3C' />
								<Text style={styles.emptyText}>{t('measurements', 'emptyTitle')}</Text>
							</View>
						}
					/>
				)
			) : (
				<FlatList
					data={displayedHistory}
					renderItem={renderHistoryItem}
					keyExtractor={item => item.id}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
					onEndReached={loadNextPage}
					onEndReachedThreshold={0.3}
					ListFooterComponent={renderFooter}
					ListEmptyComponent={
						<View style={styles.emptyWrap}>
							<Ionicons name='calendar-outline' size={48} color='#3A3A3C' />
							<Text style={styles.emptyText}>{t('measurements', 'emptyHistory')}</Text>
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
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						{selectedMeasurement && (
							<>
								<View style={styles.modalHeader}>
									<View style={styles.modalIconWrap}>
										<Ionicons
											name={
												(MEASUREMENT_ICONS[selectedMeasurement.name] ??
													'body') as any
											}
											size={18}
											color='#34C759'
										/>
									</View>
									<Text style={styles.modalTitle}>
										{selectedMeasurement.name}
									</Text>
									<TouchableOpacity onPress={() => setModalVisible(false)}>
										<Ionicons name='close' size={22} color='#8E8E93' />
									</TouchableOpacity>
								</View>

								<View style={styles.modalStatsRow}>
									<View style={styles.modalStat}>
										<Text style={styles.modalStatLabel}>{t('measurements', 'value')}</Text>
										<Text style={styles.modalStatValue}>
											{selectedMeasurement.value} {selectedMeasurement.unit}
										</Text>
									</View>
									<View style={styles.modalStat}>
										<Text style={styles.modalStatLabel}>{t('measurements', 'date')}</Text>
										<Text style={styles.modalStatValue}>
											{formatDate(selectedMeasurement.date)}
										</Text>
									</View>
									<View style={styles.modalStat}>
										<Text style={styles.modalStatLabel}>{t('measurements', 'change')}</Text>
										<View style={styles.modalChangeRow}>
											<Ionicons
												name={getTrendIcon(selectedMeasurement.trend) as any}
												size={14}
												color={getTrendColor(selectedMeasurement.trend)}
											/>
											<Text
												style={[
													styles.modalStatValue,
													{ color: getTrendColor(selectedMeasurement.trend) },
												]}
											>
												{selectedMeasurement.change &&
												selectedMeasurement.change > 0
													? '+'
													: ''}
												{selectedMeasurement.change?.toFixed(1)}{' '}
												{selectedMeasurement.unit}
											</Text>
										</View>
									</View>
								</View>

								{selectedMeasurement.goal &&
									selectedMeasurement.progress !== undefined && (
										<View style={styles.goalSection}>
											<View style={styles.goalHeader}>
												<Text style={styles.goalLabel}>
													{t('measurements', 'goal')}: {selectedMeasurement.goal}{' '}
													{selectedMeasurement.unit}
												</Text>
												<Text
													style={[
														styles.goalPercent,
														{
															color:
																selectedMeasurement.progress >= 80
																	? '#34C759'
																	: selectedMeasurement.progress >= 50
																		? '#FF9500'
																		: '#FF3B30',
														},
													]}
												>
													{selectedMeasurement.progress.toFixed(1)}%
												</Text>
											</View>
											<View style={styles.progressBar}>
												<View
													style={[
														styles.progressFill,
														{
															width: `${Math.min(selectedMeasurement.progress, 100)}%`,
															backgroundColor:
																selectedMeasurement.progress >= 80
																	? '#34C759'
																	: selectedMeasurement.progress >= 50
																		? '#FF9500'
																		: '#FF3B30',
														},
													]}
												/>
											</View>
										</View>
									)}

								<View style={styles.modalActions}>
									<TouchableOpacity
										style={styles.editBtn}
										onPress={() => {
											setModalVisible(false)
											router.push(
												`/(routes)/edit-measurement/${selectedMeasurement.id}`,
											)
										}}
									>
										<Ionicons name='create-outline' size={18} color='#FFFFFF' />
										<Text style={styles.editBtnText}>{t('measurements', 'edit')}</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.deleteBtn}
										onPress={() =>
											handleDeleteMeasurement(selectedMeasurement.id)
										}
									>
										<Ionicons name='trash-outline' size={18} color='#FF3B30' />
										<Text style={styles.deleteBtnText}>{t('measurements', 'delete')}</Text>
									</TouchableOpacity>
								</View>
							</>
						)}
					</View>
				</View>
			</Modal>

			{/* FAB */}
			<TouchableOpacity
				style={styles.fab}
				onPress={() => router.push('/(routes)/add-measurement')}
			>
				<Ionicons name='add' size={24} color='#FFFFFF' />
			</TouchableOpacity>
		</SafeAreaView>
	)
}

// Обновляем стили, добавляем новые
const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#121212' },

	// Header
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 12,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#2C2C2E',
	},
	backButton: { padding: 4 },
	addButton: { padding: 4 },
	headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },

	// Stats
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
		fontSize: 16,
		fontWeight: '700',
		color: '#FFFFFF',
		marginBottom: 2,
	},
	statLabel: { fontSize: 11, color: '#8E8E93' },

	// Tabs
	tabs: {
		flexDirection: 'row',
		marginHorizontal: 12,
		backgroundColor: '#1C1C1E',
		borderRadius: 10,
		padding: 3,
		marginBottom: 10,
	},
	tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
	activeTab: { backgroundColor: '#2C2C2E' },
	tabText: { fontSize: 14, fontWeight: '500', color: '#8E8E93' },
	activeTabText: { color: '#FFFFFF' },

	// List
	listContent: { paddingHorizontal: 12, paddingBottom: 100 },

	// Measurement item (current tab)
	measurementItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		marginBottom: 6,
		borderWidth: 1,
		borderColor: '#2C2C2E',
		gap: 10,
	},
	measurementIconWrap: {
		width: 32,
		height: 32,
		borderRadius: 9,
		backgroundColor: 'rgba(52,199,89,0.1)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	measurementBody: { flex: 1, gap: 2 },
	measurementName: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
	measurementDate: { fontSize: 11, color: '#8E8E93' },
	measurementRight: { alignItems: 'flex-end', gap: 3 },
	measurementValue: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
	measurementUnit: { fontSize: 12, fontWeight: '400', color: '#8E8E93' },
	changeBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
	},
	changeText: { fontSize: 11, fontWeight: '600' },

	// History item
	historyItem: {
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: '#2C2C2E',
		overflow: 'hidden',
	},
	historyDateRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 8,
		backgroundColor: '#242424',
	},
	historyDate: { fontSize: 13, fontWeight: '600', color: '#34C759' },
	historyRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#2C2C2E',
	},
	historyName: { flex: 2, fontSize: 13, color: '#B0B0B0' },
	historyValue: {
		flex: 1,
		fontSize: 13,
		fontWeight: '600',
		color: '#FFFFFF',
		textAlign: 'center',
	},
	historyChange: {
		flex: 1,
		fontSize: 13,
		fontWeight: '600',
		textAlign: 'right',
	},

	// Empty
	emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
	emptyText: { fontSize: 15, color: '#8E8E93' },

	// Modal
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
		marginBottom: 20,
	},
	modalIconWrap: {
		width: 34,
		height: 34,
		borderRadius: 10,
		backgroundColor: 'rgba(52,199,89,0.1)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
	modalStatsRow: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 16,
	},
	modalStat: {
		flex: 1,
		backgroundColor: '#242424',
		borderRadius: 10,
		padding: 12,
		gap: 4,
	},
	modalStatLabel: { fontSize: 11, color: '#8E8E93' },
	modalStatValue: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
	modalChangeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },

	// Goal
	goalSection: {
		backgroundColor: '#242424',
		borderRadius: 10,
		padding: 12,
		marginBottom: 16,
		gap: 8,
	},
	goalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	goalLabel: { fontSize: 13, color: '#8E8E93' },
	goalPercent: { fontSize: 14, fontWeight: '700' },
	progressBar: {
		height: 4,
		backgroundColor: '#3A3A3C',
		borderRadius: 2,
		overflow: 'hidden',
	},
	progressFill: { height: '100%', borderRadius: 2 },

	// Modal actions
	modalActions: { flexDirection: 'row', gap: 10 },
	editBtn: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#34C759',
		paddingVertical: 13,
		borderRadius: 12,
		gap: 6,
	},
	editBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
	deleteBtn: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: '#FF3B30',
		paddingVertical: 13,
		borderRadius: 12,
		gap: 6,
	},
	deleteBtnText: { fontSize: 15, fontWeight: '600', color: '#FF3B30' },

	// FAB
	fab: {
		position: 'absolute',
		bottom: 30,
		right: 20,
		width: 52,
		height: 52,
		borderRadius: 26,
		backgroundColor: '#34C759',
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#34C759',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.35,
		shadowRadius: 8,
		elevation: 8,
	},

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
