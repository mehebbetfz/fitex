import { WorkoutTemplate } from '@/scripts/database'
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
import { useDatabase } from '../contexts/database-context'

const COLORS = {
	primary: '#34C759',
	background: '#121212',
	card: '#1C1C1E',
	cardLight: '#2C2C2E',
	border: '#3A3A3C',
	text: '#FFFFFF',
	textSecondary: '#8E8E93',
	error: '#FF3B30',
	warning: '#FF9500',
	blue: '#0A84FF',
	purple: '#BF5AF2',
} as const

// Количество шаблонов для загрузки за раз
const PAGE_SIZE = 5

const getMuscleGroupColor = (groups: string) => {
	if (groups.includes('Ноги') || groups.includes('Квадрицепс')) return '#FFEAA7'
	if (groups.includes('Грудь')) return '#FF6B6B'
	if (groups.includes('Спина')) return '#4ECDC4'
	if (groups.includes('Бицепс') || groups.includes('Трицепс')) return '#45B7D1'
	if (groups.includes('Плечи') || groups.includes('Дельты')) return '#DDA0DD'
	if (groups.includes('Пресс')) return '#98D8C8'
	return COLORS.primary
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

// ── Скелетон карточки шаблона ──
const TemplateCardSkeleton = () => (
	<View style={styles.templateItem}>
		<ShimmerBlock
			style={[styles.categoryBar, { backgroundColor: COLORS.cardLight }]}
		/>
		<View style={styles.templateBody}>
			<ShimmerBlock
				style={[
					styles.templateName,
					{ width: '60%', height: 16, backgroundColor: COLORS.cardLight },
				]}
			/>
			<View style={styles.templateMeta}>
				<ShimmerBlock
					style={{
						width: 40,
						height: 12,
						backgroundColor: COLORS.cardLight,
						borderRadius: 4,
					}}
				/>
				<View style={styles.metaDivider} />
				<ShimmerBlock
					style={{
						width: 45,
						height: 12,
						backgroundColor: COLORS.cardLight,
						borderRadius: 4,
					}}
				/>
				<View style={styles.metaDivider} />
				<ShimmerBlock
					style={{
						width: 80,
						height: 12,
						backgroundColor: COLORS.cardLight,
						borderRadius: 4,
					}}
				/>
			</View>
		</View>
		<View style={styles.templateRight}>
			<ShimmerBlock
				style={{
					width: 20,
					height: 20,
					borderRadius: 10,
					backgroundColor: COLORS.cardLight,
				}}
			/>
		</View>
	</View>
)

// ── Скелетон статистики ──
const StatsSkeleton = () => (
	<View style={styles.statsRow}>
		{[1, 2, 3].map(i => (
			<ShimmerBlock
				key={i}
				style={[
					styles.statCard,
					{ height: 70, backgroundColor: COLORS.cardLight },
				]}
			/>
		))}
	</View>
)

// ── Скелетон для подгрузки ──
const LoadingFooter = () => (
	<View style={styles.loadingFooter}>
		<ActivityIndicator size='small' color={COLORS.primary} />
		<Text style={styles.loadingFooterText}>Загрузка шаблонов...</Text>
	</View>
)

// ── Полный скелетон для первой загрузки ──
const InitialLoadingSkeleton = () => (
	<SafeAreaView style={styles.container}>
		<View style={styles.header}>
			<ShimmerBlock
				style={[
					styles.iconBtn,
					{
						width: 30,
						height: 30,
						borderRadius: 15,
						backgroundColor: COLORS.cardLight,
					},
				]}
			/>
			<View style={{ alignItems: 'center' }}>
				<ShimmerBlock
					style={[
						styles.headerTitle,
						{ width: 120, height: 18, backgroundColor: COLORS.cardLight },
					]}
				/>
				<ShimmerBlock
					style={[
						styles.headerSub,
						{
							width: 80,
							height: 11,
							marginTop: 4,
							backgroundColor: COLORS.cardLight,
						},
					]}
				/>
			</View>
			<ShimmerBlock
				style={[
					styles.addButton,
					{
						width: 30,
						height: 30,
						borderRadius: 15,
						backgroundColor: COLORS.cardLight,
					},
				]}
			/>
		</View>

		<StatsSkeleton />

		<View style={styles.listContent}>
			{[1, 2, 3, 4].map(i => (
				<TemplateCardSkeleton key={i} />
			))}
		</View>
	</SafeAreaView>
)

export default function TemplatesScreen() {
	const router = useRouter()
	const { templates: allTemplates, refreshTemplates, isLoading } = useDatabase()
	const [selectedTemplate, setSelectedTemplate] =
		useState<WorkoutTemplate | null>(null)
	const [modalVisible, setModalVisible] = useState(false)

	// Состояния для пагинации
	const [displayedTemplates, setDisplayedTemplates] = useState<
		WorkoutTemplate[]
	>([])
	const [currentPage, setCurrentPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const [isInitialLoading, setIsInitialLoading] = useState(true)

	// Первоначальная загрузка
	useEffect(() => {
		const loadInitialData = async () => {
			setIsInitialLoading(true)
			await refreshTemplates()
			setIsInitialLoading(false)
		}
		loadInitialData()
	}, [])

	// Обновление при фокусе
	useFocusEffect(
		useCallback(() => {
			if (!isInitialLoading) {
				refreshTemplates()
			}
		}, [isInitialLoading]),
	)

	// Обновление отображаемых шаблонов при изменении всех шаблонов
	useEffect(() => {
		setCurrentPage(1)
		setDisplayedTemplates(allTemplates.slice(0, PAGE_SIZE))
		setHasMore(allTemplates.length > PAGE_SIZE)
	}, [allTemplates])

	// Загрузка следующей порции
	const loadNextPage = useCallback(() => {
		if (isLoadingMore || !hasMore) return

		setIsLoadingMore(true)

		// Небольшая задержка для плавности
		setTimeout(() => {
			const nextPage = currentPage + 1
			const endIndex = nextPage * PAGE_SIZE
			const newTemplates = allTemplates.slice(0, endIndex)

			setDisplayedTemplates(newTemplates)
			setCurrentPage(nextPage)
			setHasMore(allTemplates.length > endIndex)
			setIsLoadingMore(false)
		}, 500)
	}, [currentPage, allTemplates, hasMore, isLoadingMore])

	const handleTemplatePress = (template: WorkoutTemplate) => {
		setSelectedTemplate(template)
		setModalVisible(true)
	}

	const handleUseTemplate = () => {
		if (selectedTemplate) {
			setModalVisible(false)
			router.replace({
				pathname: '/workout/create',
				params: {
					templateId: selectedTemplate.id,
					templateName: selectedTemplate.name,
				},
			})
		}
	}

	const handleEditTemplate = () => {
		if (selectedTemplate) {
			setModalVisible(false)
			router.push({
				pathname: `/(routes)/edit-template/${selectedTemplate.id}`,
			})
		}
	}

	const renderFooter = () => {
		if (!hasMore) return null
		if (isLoadingMore) return <LoadingFooter />
		return null
	}

	const renderItem = ({ item }: { item: WorkoutTemplate }) => (
		<TouchableOpacity
			style={styles.templateItem}
			onPress={() => handleTemplatePress(item)}
			activeOpacity={0.7}
		>
			<View
				style={[
					styles.categoryBar,
					{ backgroundColor: getMuscleGroupColor(item.muscle_groups) },
				]}
			/>
			<View style={styles.templateBody}>
				<Text style={styles.templateName} numberOfLines={1}>
					{item.name}
				</Text>
				<View style={styles.templateMeta}>
					<Ionicons name='barbell-outline' size={12} color='#8E8E93' />
					<Text style={styles.metaText}>{item.exercises_count} упр.</Text>

					<View style={styles.metaDivider} />

					<Ionicons name='time-outline' size={12} color='#8E8E93' />
					<Text style={styles.metaText}>
						{item.estimated_duration || 60} мин
					</Text>

					{item.description ? (
						<>
							<View style={styles.metaDivider} />
							<Text style={styles.metaDesc} numberOfLines={1}>
								{item.description}
							</Text>
						</>
					) : null}
				</View>
			</View>
			<View style={styles.templateRight}>
				<Ionicons name='chevron-forward' size={20} color='#8E8E93' />
			</View>
		</TouchableOpacity>
	)

	// Показываем полный скелетон при первой загрузке
	if (isInitialLoading) {
		return <InitialLoadingSkeleton />
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
					<Ionicons name='arrow-back' size={22} color='#FFF' />
				</TouchableOpacity>
				<View>
					<Text style={styles.headerTitle}>Мои шаблоны</Text>
					<Text style={styles.headerSub}>Быстрый старт тренировки</Text>
				</View>
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => router.push('/(routes)/add-template')}
				>
					<Ionicons name='add' size={24} color={COLORS.primary} />
				</TouchableOpacity>
			</View>

			{/* Quick stats */}
			<View style={styles.statsRow}>
				<View style={styles.statCard}>
					<Text style={styles.statValue}>{allTemplates.length}</Text>
					<Text style={styles.statLabel}>Шаблонов</Text>
				</View>
				<View style={styles.statCard}>
					<Text style={[styles.statValue, { color: '#FF6B6B' }]}>
						{
							allTemplates.filter(t => t.muscle_groups?.includes('Грудь'))
								.length
						}
					</Text>
					<Text style={styles.statLabel}>Грудь</Text>
				</View>
				<View style={styles.statCard}>
					<Text style={[styles.statValue, { color: '#4ECDC4' }]}>
						{
							allTemplates.filter(t => t.muscle_groups?.includes('Спина'))
								.length
						}
					</Text>
					<Text style={styles.statLabel}>Спина</Text>
				</View>
			</View>

			{/* List with pagination */}
			<FlatList
				data={displayedTemplates}
				renderItem={renderItem}
				keyExtractor={item => String(item.id)}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
				onEndReached={loadNextPage}
				onEndReachedThreshold={0.3}
				ListFooterComponent={renderFooter}
				ListEmptyComponent={
					<View style={styles.emptyWrap}>
						<Ionicons name='copy-outline' size={48} color='#3A3A3C' />
						<Text style={styles.emptyTitle}>Нет шаблонов</Text>
						<Text style={styles.emptyText}>
							Создайте свой первый шаблон{'\n'}чтобы быстро начинать тренировки
						</Text>
						<TouchableOpacity
							style={styles.emptyButton}
							onPress={() => router.push('/(routes)/add-template')}
						>
							<Text style={styles.emptyButtonText}>Создать шаблон</Text>
						</TouchableOpacity>
					</View>
				}
			/>

			{/* Detail modal */}
			<Modal
				animationType='slide'
				transparent
				visible={modalVisible}
				onRequestClose={() => setModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						{selectedTemplate && (
							<>
								<View style={styles.modalHeader}>
									<View
										style={[
											styles.modalCatDot,
											{
												backgroundColor: getMuscleGroupColor(
													selectedTemplate.muscle_groups,
												),
											},
										]}
									/>
									<Text style={styles.modalTitle} numberOfLines={1}>
										{selectedTemplate.name}
									</Text>
									<TouchableOpacity onPress={() => setModalVisible(false)}>
										<Ionicons name='close' size={22} color='#8E8E93' />
									</TouchableOpacity>
								</View>

								<View style={styles.modalStatsRow}>
									<View style={styles.modalStat}>
										<Text style={styles.modalStatLabel}>Упражнений</Text>
										<Text style={styles.modalStatValue}>
											{selectedTemplate.exercises_count}
										</Text>
									</View>
									<View style={styles.modalStat}>
										<Text style={styles.modalStatLabel}>Длительность</Text>
										<Text style={styles.modalStatValue}>
											{selectedTemplate.estimated_duration || 60} мин
										</Text>
									</View>
									<View style={styles.modalStat}>
										<Text style={styles.modalStatLabel}>Группы мышц</Text>
										<Text style={styles.modalStatValue} numberOfLines={1}>
											{selectedTemplate.muscle_groups?.split(',').length || 0}
										</Text>
									</View>
								</View>

								{selectedTemplate.description ? (
									<View style={styles.notesBox}>
										<Text style={styles.notesText}>
											{selectedTemplate.description}
										</Text>
									</View>
								) : null}

								<View style={styles.muscleGroupsPreview}>
									{selectedTemplate.muscle_groups
										?.split(',')
										.map((group, i) => (
											<View key={i} style={styles.muscleChip}>
												<Text style={styles.muscleChipText}>
													{group.trim()}
												</Text>
											</View>
										))}
								</View>

								{/* Кнопки действий */}
								<View style={styles.modalButtons}>
									<TouchableOpacity
										style={styles.useButton}
										onPress={handleUseTemplate}
									>
										<Ionicons name='play' size={18} color='#FFF' />
										<Text style={styles.useButtonText}>Использовать</Text>
									</TouchableOpacity>

									<TouchableOpacity
										style={styles.editButton}
										onPress={handleEditTemplate}
									>
										<Ionicons
											name='create-outline'
											size={18}
											color={COLORS.blue}
										/>
										<Text style={styles.editButtonText}>Редактировать</Text>
									</TouchableOpacity>
								</View>
							</>
						)}
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
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
	addButton: { padding: 4 },

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

	listContent: { paddingHorizontal: 12, paddingBottom: 40, gap: 6 },

	templateItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#2C2C2E',
		overflow: 'hidden',
	},
	categoryBar: { width: 3, alignSelf: 'stretch' },
	templateBody: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, gap: 3 },
	templateName: { fontSize: 14, fontWeight: '600', color: '#FFF' },
	templateMeta: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		flexWrap: 'wrap',
	},
	metaText: { fontSize: 12, color: '#8E8E93' },
	metaDivider: {
		width: 1,
		height: 10,
		backgroundColor: '#2C2C2E',
		marginHorizontal: 4,
	},
	metaDesc: { fontSize: 12, color: '#8E8E93', flex: 1 },
	templateRight: { paddingRight: 12 },

	emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 10 },
	emptyTitle: { fontSize: 16, fontWeight: '600', color: '#FFF' },
	emptyText: {
		fontSize: 13,
		color: '#8E8E93',
		textAlign: 'center',
		lineHeight: 20,
	},
	emptyButton: {
		backgroundColor: COLORS.primary,
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 10,
		marginTop: 10,
	},
	emptyButtonText: { fontSize: 14, fontWeight: '600', color: '#000' },

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
	notesBox: {
		backgroundColor: '#242424',
		borderRadius: 10,
		padding: 12,
		marginBottom: 12,
	},
	notesText: { fontSize: 14, color: '#B0B0B0', lineHeight: 20 },
	muscleGroupsPreview: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
		marginBottom: 20,
	},
	muscleChip: {
		backgroundColor: '#2C2C2E',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 8,
	},
	muscleChipText: { fontSize: 11, color: '#FFF' },
	modalButtons: { gap: 8 },
	useButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		backgroundColor: COLORS.primary,
		borderRadius: 12,
		paddingVertical: 16,
	},
	useButtonText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
	editButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: COLORS.blue,
		borderRadius: 12,
		paddingVertical: 16,
	},
	editButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.blue },

	// Новые стили для пагинации и скелетонов
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
})
