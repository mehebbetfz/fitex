import type { AppColors } from '@/constants/app-theme'
import SheetModalHeader from '@/components/ui/sheet-modal-header'
import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import * as db from '@/scripts/database'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

type Styles = ReturnType<typeof makeStyles>

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

const PAGE_SIZE = 5

const formatDate = (dateString: string): string => {
	const date = new Date(dateString)
	return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`
}

const getTrendColor = (trend: string, C: AppColors) =>
	trend === 'up' ? C.primary : trend === 'down' ? C.error : C.textSecondary

const getTrendIcon = (trend: string) =>
	trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove'

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

const MeasurementCardSkeleton = ({
	styles,
	skeleton,
}: {
	styles: Styles
	skeleton: string
}) => (
	<View style={styles.measurementItem}>
		<ShimmerBlock
			style={[styles.measurementIconWrap, { backgroundColor: skeleton }]}
		/>
		<View style={styles.measurementBody}>
			<ShimmerBlock
				style={[
					styles.measurementName,
					{ width: '60%', height: 14, backgroundColor: skeleton },
				]}
			/>
			<ShimmerBlock
				style={[
					styles.measurementDate,
					{
						width: '40%',
						height: 11,
						marginTop: 4,
						backgroundColor: skeleton,
					},
				]}
			/>
		</View>
		<View style={styles.measurementRight}>
			<ShimmerBlock
				style={[
					styles.measurementValue,
					{ width: 50, height: 15, backgroundColor: skeleton },
				]}
			/>
			<ShimmerBlock
				style={{
					width: 40,
					height: 11,
					marginTop: 3,
					backgroundColor: skeleton,
					borderRadius: 4,
				}}
			/>
		</View>
	</View>
)

const HistoryItemSkeleton = ({
	styles,
	skeleton,
}: {
	styles: Styles
	skeleton: string
}) => (
	<View style={styles.historyItem}>
		<View style={styles.historyDateRow}>
			<ShimmerBlock
				style={{
					width: 80,
					height: 14,
					backgroundColor: skeleton,
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
						backgroundColor: skeleton,
						borderRadius: 4,
						marginRight: 8,
					}}
				/>
				<ShimmerBlock
					style={{
						flex: 1,
						height: 13,
						backgroundColor: skeleton,
						borderRadius: 4,
						marginRight: 8,
					}}
				/>
				<ShimmerBlock
					style={{
						flex: 1,
						height: 13,
						backgroundColor: skeleton,
						borderRadius: 4,
					}}
				/>
			</View>
		))}
	</View>
)

const StatsSkeleton = ({
	styles,
	skeleton,
}: {
	styles: Styles
	skeleton: string
}) => (
	<View style={styles.statsRow}>
		{[1, 2, 3].map(i => (
			<ShimmerBlock
				key={i}
				style={[styles.statCard, { height: 70, backgroundColor: skeleton }]}
			/>
		))}
	</View>
)

const TabsSkeleton = ({
	styles,
	skeleton,
}: {
	styles: Styles
	skeleton: string
}) => (
	<View style={styles.tabs}>
		{[1, 2].map(i => (
			<ShimmerBlock
				key={i}
				style={{
					flex: 1,
					height: 36,
					backgroundColor: skeleton,
					borderRadius: 8,
				}}
			/>
		))}
	</View>
)

const LoadingFooter = ({
	styles,
	primary,
}: {
	styles: Styles
	primary: string
}) => {
	const { t } = useLanguage()
	return (
		<View style={styles.loadingFooter}>
			<ActivityIndicator size='small' color={primary} />
			<Text style={styles.loadingFooterText}>{t('measurements', 'loading')}</Text>
		</View>
	)
}

const InitialLoadingSkeleton = ({
	styles,
	skeleton,
}: {
	styles: Styles
	skeleton: string
}) => (
	<SafeAreaView style={styles.container}>
		<View style={styles.header}>
			<ShimmerBlock
				style={[
					styles.backButton,
					{
						width: 30,
						height: 30,
						borderRadius: 15,
						backgroundColor: skeleton,
					},
				]}
			/>
			<ShimmerBlock
				style={[
					styles.headerTitle,
					{ width: 150, height: 18, backgroundColor: skeleton },
				]}
			/>
			<ShimmerBlock
				style={[
					styles.addButton,
					{
						width: 30,
						height: 30,
						borderRadius: 15,
						backgroundColor: skeleton,
					},
				]}
			/>
		</View>

		<StatsSkeleton styles={styles} skeleton={skeleton} />
		<TabsSkeleton styles={styles} skeleton={skeleton} />

		<View style={styles.listContent}>
			{[1, 2, 3, 4].map(i => (
				<MeasurementCardSkeleton key={i} styles={styles} skeleton={skeleton} />
			))}
		</View>
	</SafeAreaView>
)

export default function MeasurementsHistoryScreen() {
	const router = useRouter()
	const { t } = useLanguage()
	const { colors: C } = useAppTheme()
	const styles = useMemo(() => makeStyles(C), [C])
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

	const [displayedHistory, setDisplayedHistory] = useState<HistoryEntry[]>([])
	const [currentPage, setCurrentPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const [isInitialLoading, setIsInitialLoading] = useState(true)

	const loadData = async () => {
		try {
			setLoading(true)
			const allMeasurements = await db.getBodyMeasurements()

			const latestByName = new Map<string, any>()
			const prevByName = new Map<string, any>()

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

	useEffect(() => {
		setCurrentPage(1)
		setDisplayedHistory(allHistoryData.slice(0, PAGE_SIZE))
		setHasMore(allHistoryData.length > PAGE_SIZE)
	}, [allHistoryData])

	const loadNextPage = useCallback(() => {
		if (isLoadingMore || !hasMore || loading || selectedTab !== 'history')
			return

		setIsLoadingMore(true)

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
		if (isLoadingMore)
			return <LoadingFooter styles={styles} primary={C.primary} />
		return null
	}

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
					color={C.primary}
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
							color={getTrendColor(item.trend, C)}
						/>
						<Text
							style={[
								styles.changeText,
								{ color: getTrendColor(item.trend, C) },
							]}
						>
							{item.change && item.change > 0 ? '+' : ''}
							{item.change?.toFixed(1)}
						</Text>
					</View>
				)}
			</View>
		</TouchableOpacity>
	)

	const renderHistoryItem = ({ item }: { item: HistoryEntry }) => (
		<View style={styles.historyItem}>
			<View style={styles.historyDateRow}>
				<Ionicons name='calendar-outline' size={14} color={C.primary} />
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
									? C.primary
									: m.change.replace(/[^0-9.-]/g, '') !== '0.0'
										? C.error
										: C.textSecondary,
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

	if (isInitialLoading) {
		return (
			<InitialLoadingSkeleton styles={styles} skeleton={C.skeleton} />
		)
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButton}
				>
					<Ionicons name='arrow-back' size={22} color={C.text} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{t('measurements', 'title')}</Text>
				<TouchableOpacity
					onPress={() => router.push('/(routes)/add-measurement')}
					style={styles.addButton}
				>
					<Ionicons name='add' size={22} color={C.primary} />
				</TouchableOpacity>
			</View>

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
							{tab === 'current'
								? t('measurements', 'current')
								: t('measurements', 'history')}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			{selectedTab === 'current' ? (
				loading ? (
					<View style={styles.listContent}>
						{[1, 2, 3, 4].map(i => (
							<MeasurementCardSkeleton
								key={i}
								styles={styles}
								skeleton={C.skeleton}
							/>
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
								<Ionicons name='body-outline' size={48} color={C.border} />
								<Text style={styles.emptyText}>
									{t('measurements', 'emptyTitle')}
								</Text>
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
							<Ionicons name='calendar-outline' size={48} color={C.border} />
							<Text style={styles.emptyText}>
								{t('measurements', 'emptyHistory')}
							</Text>
						</View>
					}
				/>
			)}

			<Modal
				animationType='slide'
				transparent
				visible={modalVisible}
				onRequestClose={() => setModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<TouchableOpacity
						style={StyleSheet.absoluteFill}
						activeOpacity={1}
						onPress={() => setModalVisible(false)}
					/>
					<View style={styles.modalContent}>
						{selectedMeasurement && (
							<>
								<SheetModalHeader
									title={selectedMeasurement.name}
									onClose={() => setModalVisible(false)}
								/>

								<View style={styles.modalStatsRow}>
									<View style={styles.modalStat}>
										<Text style={styles.modalStatLabel}>
											{t('measurements', 'value')}
										</Text>
										<Text style={styles.modalStatValue}>
											{selectedMeasurement.value} {selectedMeasurement.unit}
										</Text>
									</View>
									<View style={styles.modalStat}>
										<Text style={styles.modalStatLabel}>
											{t('measurements', 'date')}
										</Text>
										<Text style={styles.modalStatValue}>
											{formatDate(selectedMeasurement.date)}
										</Text>
									</View>
									<View style={styles.modalStat}>
										<Text style={styles.modalStatLabel}>
											{t('measurements', 'change')}
										</Text>
										<View style={styles.modalChangeRow}>
											<Ionicons
												name={getTrendIcon(selectedMeasurement.trend) as any}
												size={14}
												color={getTrendColor(selectedMeasurement.trend, C)}
											/>
											<Text
												style={[
													styles.modalStatValue,
													{
														color: getTrendColor(
															selectedMeasurement.trend,
															C,
														),
													},
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
																	? C.primary
																	: selectedMeasurement.progress >= 50
																		? C.accent
																		: C.error,
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
																	? C.primary
																	: selectedMeasurement.progress >= 50
																		? C.accent
																		: C.error,
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
										<Text style={styles.editBtnText}>
											{t('measurements', 'edit')}
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.deleteBtn}
										onPress={() =>
											handleDeleteMeasurement(selectedMeasurement.id)
										}
									>
										<Ionicons
											name='trash-outline'
											size={18}
											color={C.error}
										/>
										<Text style={styles.deleteBtnText}>
											{t('measurements', 'delete')}
										</Text>
									</TouchableOpacity>
								</View>
							</>
						)}
					</View>
				</View>
			</Modal>

			<TouchableOpacity
				style={styles.fab}
				onPress={() => router.push('/(routes)/add-measurement')}
			>
				<Ionicons name='add' size={24} color='#FFFFFF' />
			</TouchableOpacity>
		</SafeAreaView>
	)
}

function makeStyles(C: AppColors) {
	return StyleSheet.create({
		container: { flex: 1, backgroundColor: C.background },

		header: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingHorizontal: 12,
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: C.cardLight,
		},
		backButton: { padding: 4 },
		addButton: { padding: 4 },
		headerTitle: { fontSize: 18, fontWeight: '700', color: C.text },

		statsRow: {
			flexDirection: 'row',
			paddingHorizontal: 12,
			paddingVertical: 12,
			gap: 8,
		},
		statCard: {
			flex: 1,
			backgroundColor: C.card,
			borderRadius: 12,
			paddingVertical: 12,
			alignItems: 'center',
			borderWidth: 1,
			borderColor: C.cardLight,
		},
		statValue: {
			fontSize: 16,
			fontWeight: '700',
			color: C.text,
			marginBottom: 2,
		},
		statLabel: { fontSize: 11, color: C.textSecondary },

		tabs: {
			flexDirection: 'row',
			marginHorizontal: 12,
			backgroundColor: C.card,
			borderRadius: 10,
			padding: 3,
			marginBottom: 10,
		},
		tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
		activeTab: { backgroundColor: C.cardLight },
		tabText: { fontSize: 14, fontWeight: '500', color: C.textSecondary },
		activeTabText: { color: C.text },

		listContent: { paddingHorizontal: 12, paddingBottom: 100 },

		measurementItem: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: C.card,
			borderRadius: 12,
			paddingHorizontal: 12,
			paddingVertical: 10,
			marginBottom: 6,
			borderWidth: 1,
			borderColor: C.cardLight,
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
		measurementName: { fontSize: 14, fontWeight: '600', color: C.text },
		measurementDate: { fontSize: 11, color: C.textSecondary },
		measurementRight: { alignItems: 'flex-end', gap: 3 },
		measurementValue: { fontSize: 15, fontWeight: '700', color: C.text },
		measurementUnit: { fontSize: 12, fontWeight: '400', color: C.textSecondary },
		changeBadge: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 3,
		},
		changeText: { fontSize: 11, fontWeight: '600' },

		historyItem: {
			backgroundColor: C.card,
			borderRadius: 12,
			marginBottom: 8,
			borderWidth: 1,
			borderColor: C.cardLight,
			overflow: 'hidden',
		},
		historyDateRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			paddingHorizontal: 12,
			paddingVertical: 8,
			backgroundColor: C.cardLight,
		},
		historyDate: { fontSize: 13, fontWeight: '600', color: C.primary },
		historyRow: {
			flexDirection: 'row',
			alignItems: 'center',
			paddingHorizontal: 12,
			paddingVertical: 8,
			borderBottomWidth: 1,
			borderBottomColor: C.cardLight,
		},
		historyName: { flex: 2, fontSize: 13, color: C.textSecondary },
		historyValue: {
			flex: 1,
			fontSize: 13,
			fontWeight: '600',
			color: C.text,
			textAlign: 'center',
		},
		historyChange: {
			flex: 1,
			fontSize: 13,
			fontWeight: '600',
			textAlign: 'right',
		},

		emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
		emptyText: { fontSize: 15, color: C.textSecondary },

		modalOverlay: {
			flex: 1,
			backgroundColor: C.overlay,
			justifyContent: 'flex-end',
		},
		modalContent: {
			backgroundColor: C.modalSurface,
			borderTopLeftRadius: 20,
			borderTopRightRadius: 20,
			padding: 20,
		},
		sheetHandle: {
			alignSelf: 'center',
			width: 36,
			height: 4,
			borderRadius: 2,
			backgroundColor: C.border,
			marginBottom: 14,
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
		modalTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: C.text },
		modalStatsRow: {
			flexDirection: 'row',
			gap: 8,
			marginBottom: 16,
		},
		modalStat: {
			flex: 1,
			backgroundColor: C.cardLight,
			borderRadius: 10,
			padding: 12,
			gap: 4,
		},
		modalStatLabel: { fontSize: 11, color: C.textSecondary },
		modalStatValue: { fontSize: 15, fontWeight: '700', color: C.text },
		modalChangeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },

		goalSection: {
			backgroundColor: C.cardLight,
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
		goalLabel: { fontSize: 13, color: C.textSecondary },
		goalPercent: { fontSize: 14, fontWeight: '700' },
		progressBar: {
			height: 4,
			backgroundColor: C.border,
			borderRadius: 2,
			overflow: 'hidden',
		},
		progressFill: { height: '100%', borderRadius: 2 },

		modalActions: { flexDirection: 'row', gap: 10 },
		editBtn: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: C.primary,
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
			borderColor: C.error,
			paddingVertical: 13,
			borderRadius: 12,
			gap: 6,
		},
		deleteBtnText: { fontSize: 15, fontWeight: '600', color: C.error },

		fab: {
			position: 'absolute',
			bottom: 30,
			right: 20,
			width: 52,
			height: 52,
			borderRadius: 26,
			backgroundColor: C.primary,
			alignItems: 'center',
			justifyContent: 'center',
			shadowColor: C.primary,
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.35,
			shadowRadius: 8,
			elevation: 8,
		},

		loadingFooter: {
			paddingVertical: 20,
			alignItems: 'center',
			justifyContent: 'center',
			flexDirection: 'row',
			gap: 8,
		},
		loadingFooterText: {
			color: C.textSecondary,
			fontSize: 14,
		},
	})
}
