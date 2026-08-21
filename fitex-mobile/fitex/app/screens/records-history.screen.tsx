import type { AppColors } from '@/constants/app-theme'
import { translateExerciseName } from '@/constants/exercise-i18n'
import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import * as db from '@/scripts/database'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

type Styles = ReturnType<typeof makeStyles>

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

const PAGE_SIZE = 10

const getTrendColor = (t: string, C: AppColors) =>
	t === 'up' ? C.primary : t === 'down' ? C.error : C.textSecondary
const getTrendIcon = (t: string) =>
	t === 'up' ? 'trending-up' : t === 'down' ? 'trending-down' : 'remove'

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

const RecordCardSkeleton = ({
	s,
	skeleton,
}: {
	s: Styles
	skeleton: string
}) => (
	<View style={s.recordItem}>
		<ShimmerBlock style={[s.categoryBar, { backgroundColor: skeleton }]} />
		<View style={s.recordBody}>
			<ShimmerBlock
				style={[
					s.exerciseName,
					{ width: '60%', height: 16, backgroundColor: skeleton },
				]}
			/>
			<View style={s.recordMeta}>
				<ShimmerBlock
					style={{
						width: 70,
						height: 12,
						backgroundColor: skeleton,
						borderRadius: 4,
					}}
				/>
			</View>
		</View>
		<View style={s.recordRight}>
			<ShimmerBlock
				style={[
					s.recordWeight,
					{ width: 60, height: 15, backgroundColor: skeleton },
				]}
			/>
			<ShimmerBlock
				style={{
					width: 45,
					height: 11,
					backgroundColor: skeleton,
					borderRadius: 4,
					marginTop: 3,
				}}
			/>
		</View>
	</View>
)

const StatsSkeleton = ({ s, skeleton }: { s: Styles; skeleton: string }) => (
	<View style={s.statsRow}>
		{[1, 2, 3].map(i => (
			<ShimmerBlock
				key={i}
				style={[s.statCard, { height: 70, backgroundColor: skeleton }]}
			/>
		))}
	</View>
)

const FilterSkeleton = ({ s, skeleton }: { s: Styles; skeleton: string }) => (
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
						{ width: 70, height: 34, backgroundColor: skeleton },
					]}
				/>
			)}
		/>
	</View>
)

const LoadingFooter = ({
	s,
	primary,
}: {
	s: Styles
	primary: string
}) => {
	const { t } = useLanguage()
	return (
		<View style={s.loadingFooter}>
			<ActivityIndicator size='small' color={primary} />
			<Text style={s.loadingFooterText}>{t('records', 'loading')}</Text>
		</View>
	)
}

const InitialLoadingSkeleton = ({
	s,
	skeleton,
}: {
	s: Styles
	skeleton: string
}) => (
	<SafeAreaView style={s.container}>
		<View style={s.header}>
			<ShimmerBlock
				style={[
					s.iconBtn,
					{
						width: 30,
						height: 30,
						borderRadius: 15,
						backgroundColor: skeleton,
					},
				]}
			/>
			<View style={{ alignItems: 'center' }}>
				<ShimmerBlock
					style={[
						s.headerTitle,
						{ width: 140, height: 18, backgroundColor: skeleton },
					]}
				/>
				<ShimmerBlock
					style={[
						s.headerSub,
						{
							width: 120,
							height: 11,
							marginTop: 4,
							backgroundColor: skeleton,
						},
					]}
				/>
			</View>
			<ShimmerBlock
				style={[
					s.autoBadge,
					{ width: 70, height: 30, backgroundColor: skeleton },
				]}
			/>
		</View>

		<StatsSkeleton s={s} skeleton={skeleton} />
		<FilterSkeleton s={s} skeleton={skeleton} />

		<View style={s.listContent}>
			{[1, 2, 3, 4, 5].map(i => (
				<RecordCardSkeleton key={i} s={s} skeleton={skeleton} />
			))}
		</View>
	</SafeAreaView>
)

export default function RecordsHistoryScreen() {
	const router = useRouter()
	const { t, language } = useLanguage()
	const { colors: C } = useAppTheme()
	const s = useMemo(() => makeStyles(C), [C])
	const [selectedCategory, setSelectedCategory] = useState('all')
	const [selectedRecord, setSelectedRecord] = useState<Record | null>(null)
	const [modalVisible, setModalVisible] = useState(false)
	const [allRecords, setAllRecords] = useState<Record[]>([])
	const [loading, setLoading] = useState(true)

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

	useEffect(() => {
		setCurrentPage(1)
		setDisplayedRecords(allRecords.slice(0, PAGE_SIZE))
		setHasMore(allRecords.length > PAGE_SIZE)
	}, [allRecords])

	const loadNextPage = useCallback(() => {
		if (isLoadingMore || !hasMore || loading) return

		setIsLoadingMore(true)

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
		if (isLoadingMore) return <LoadingFooter s={s} primary={C.primary} />
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
					{ backgroundColor: CATEGORY_COLORS[item.category] ?? C.primary },
				]}
			/>
			<View style={s.recordBody}>
				<Text style={s.exerciseName} numberOfLines={1}>
					{translateExerciseName(item.exercise, language)}
				</Text>
				<View style={s.recordMeta}>
					<Ionicons name='calendar-outline' size={12} color={C.textSecondary} />
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
							color={getTrendColor(item.trend, C)}
						/>
						<Text
							style={[s.improveText, { color: getTrendColor(item.trend, C) }]}
						>
							{item.improvement}
						</Text>
					</View>
				) : null}
			</View>
		</TouchableOpacity>
	)

	if (isInitialLoading) {
		return <InitialLoadingSkeleton s={s} skeleton={C.skeleton} />
	}

	return (
		<SafeAreaView style={s.container}>
			<View style={s.header}>
				<TouchableOpacity onPress={() => router.back()} style={s.iconBtn}>
					<Ionicons name='arrow-back' size={22} color={C.text} />
				</TouchableOpacity>
				<View>
					<Text style={s.headerTitle}>{t('records', 'title')}</Text>
					<Text style={s.headerSub}>{t('records', 'autoUpdate')}</Text>
				</View>
				<View style={s.autoBadge}>
					<Ionicons name='flash' size={14} color={C.accent} />
					<Text style={s.autoBadgeText}>{t('records', 'auto')}</Text>
				</View>
			</View>

			<View style={s.statsRow}>
				<View style={s.statCard}>
					<Text style={s.statValue}>{allRecords.length}</Text>
					<Text style={s.statLabel}>{t('records', 'total')}</Text>
				</View>
				<View style={s.statCard}>
					<Text style={[s.statValue, { color: C.primary }]}>
						{allRecords.filter(r => r.trend === 'up').length}
					</Text>
					<Text style={s.statLabel}>{t('records', 'improved')}</Text>
				</View>
				<View style={s.statCard}>
					<Text style={[s.statValue, { color: C.accent }]}>
						{allRecords.filter(r => r.category === 'strength').length}
					</Text>
					<Text style={s.statLabel}>{t('records', 'strength')}</Text>
				</View>
			</View>

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
									color={active ? '#FFFFFF' : C.textSecondary}
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

			{loading ? (
				<View style={s.listContent}>
					{[1, 2, 3].map(i => (
						<RecordCardSkeleton key={i} s={s} skeleton={C.skeleton} />
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
							<Ionicons name='trophy-outline' size={48} color={C.border} />
							<Text style={s.emptyTitle}>{t('records', 'empty')}</Text>
							<Text style={s.emptyText}>{t('records', 'emptyHint')}</Text>
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
				<View style={s.modalOverlay}>
					<TouchableOpacity
						style={StyleSheet.absoluteFill}
						activeOpacity={1}
						onPress={() => setModalVisible(false)}
					/>
					<View style={s.modalContent}>
						<View style={s.sheetHandle} />
						{selectedRecord && (
							<>
								<View style={s.modalHeader}>
									<View
										style={[
											s.modalCatDot,
											{
												backgroundColor:
													CATEGORY_COLORS[selectedRecord.category] ??
													C.primary,
											},
										]}
									/>
									<Text style={s.modalTitle} numberOfLines={1}>
										{translateExerciseName(selectedRecord.exercise, language)}
									</Text>
									<TouchableOpacity onPress={() => setModalVisible(false)}>
										<Ionicons name='close' size={22} color={C.textSecondary} />
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
										<Text style={s.modalStatLabel}>
											{t('records', 'previous')}
										</Text>
										<Text style={s.modalStatValue}>
											{selectedRecord.previousRecord || '—'}
										</Text>
									</View>
									<View style={s.modalStat}>
										<Text style={s.modalStatLabel}>
											{t('records', 'progress')}
										</Text>
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
												color={getTrendColor(selectedRecord.trend, C)}
											/>
											<Text
												style={[
													s.modalStatValue,
													{ color: getTrendColor(selectedRecord.trend, C) },
												]}
											>
												{selectedRecord.improvement || '—'}
											</Text>
										</View>
									</View>
								</View>

								<View style={s.modalDateRow}>
									<Ionicons
										name='calendar-outline'
										size={14}
										color={C.textSecondary}
									/>
									<Text style={s.modalDate}>
										{db.formatDate(selectedRecord.date) || selectedRecord.date}
									</Text>
									<View style={s.autoTag}>
										<Ionicons name='flash' size={11} color={C.accent} />
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

function makeStyles(C: AppColors) {
	return StyleSheet.create({
		container: { flex: 1, backgroundColor: C.background },
		center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

		header: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingHorizontal: 12,
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: C.cardLight,
		},
		iconBtn: { padding: 4 },
		headerTitle: { fontSize: 18, fontWeight: '700', color: C.text },
		headerSub: { fontSize: 11, color: C.textSecondary, marginTop: 1 },
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
		autoBadgeText: { fontSize: 12, fontWeight: '600', color: C.accent },

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
			fontSize: 18,
			fontWeight: '700',
			color: C.text,
			marginBottom: 2,
		},
		statLabel: { fontSize: 11, color: C.textSecondary },

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
			backgroundColor: C.card,
			borderWidth: 1,
			borderColor: C.cardLight,
		},
		filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
		filterChipText: { fontSize: 13, fontWeight: '500', color: C.textSecondary },
		filterChipTextActive: { color: '#FFFFFF' },

		listContent: { paddingHorizontal: 12, paddingBottom: 40, gap: 6 },

		recordItem: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: C.card,
			borderRadius: 12,
			borderWidth: 1,
			borderColor: C.cardLight,
			overflow: 'hidden',
		},
		categoryBar: { width: 3, alignSelf: 'stretch' },
		recordBody: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, gap: 3 },
		exerciseName: { fontSize: 14, fontWeight: '600', color: C.text },
		recordMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
		recordDate: { fontSize: 12, color: C.textSecondary },
		recordNotes: { fontSize: 12, color: C.textSecondary, flex: 1 },
		recordRight: { paddingRight: 12, alignItems: 'flex-end', gap: 3 },
		recordWeight: { fontSize: 15, fontWeight: '700', color: C.text },
		improveBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
		improveText: { fontSize: 11, fontWeight: '600' },

		emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 10 },
		emptyTitle: { fontSize: 16, fontWeight: '600', color: C.text },
		emptyText: {
			fontSize: 13,
			color: C.textSecondary,
			textAlign: 'center',
			lineHeight: 20,
		},

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
			marginBottom: 16,
		},
		modalCatDot: { width: 10, height: 10, borderRadius: 5 },
		modalTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: C.text },
		modalStatsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
		modalStat: {
			flex: 1,
			backgroundColor: C.cardLight,
			borderRadius: 10,
			padding: 12,
			gap: 4,
		},
		modalStatLabel: { fontSize: 11, color: C.textSecondary },
		modalStatValue: { fontSize: 15, fontWeight: '700', color: C.text },
		modalDateRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			marginBottom: 12,
		},
		modalDate: { fontSize: 13, color: C.textSecondary, flex: 1 },
		autoTag: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 3,
			backgroundColor: 'rgba(255,149,0,0.1)',
			borderRadius: 8,
			paddingHorizontal: 7,
			paddingVertical: 3,
		},
		autoTagText: { fontSize: 11, color: C.accent, fontWeight: '600' },
		notesBox: {
			backgroundColor: C.cardLight,
			borderRadius: 10,
			padding: 12,
			marginBottom: 4,
		},
		notesText: { fontSize: 14, color: C.textSecondary, lineHeight: 20 },

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
