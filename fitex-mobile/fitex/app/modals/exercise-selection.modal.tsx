import { CachedVideo } from '@/components/cached-video'
import ManBackSvg from '@/components/man-back-svg'
import ManFrontSvg from '@/components/man-front-svg'
import {
	manBackMuscleGroupParts,
	manFrontMuscleGroupParts,
} from '@/constants/images'
import {
	translateDescription,
	translateDifficulty,
	translateEquipment,
	translateExerciseName,
	translateGroupName,
	translateMuscleName,
	translateTips,
} from '@/constants/exercise-i18n'
import { muscle_groups } from '@/constants/muscle-groups'
import { useLanguage } from '@/contexts/language-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Image } from 'expo-image'
import React, { useEffect, useRef, useState } from 'react'
import {
	Animated,
	Dimensions,
	FlatList,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

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

const MUSCLE_FRONT_DATA = [
	{
		id: '1',
		name: 'Грудь',
		muscleImages: [
			'leftPectoralisMajor',
			'rightPectoralisMajor',
			'leftPectoralisMinor',
			'rightPectoralisMinor',
			'rightSerratusAnterior',
			'leftSerratusAnterior',
		],
		icon: manFrontMuscleGroupParts.rectoralFull,
	},
	{
		id: '2',
		name: 'Пресс',
		muscleImages: [
			'upperAbs',
			'lowerAbs',
			'upperMiddleAbs',
			'lowerMiddleAbs',
			'leftExternalOblique',
			'rightExternalOblique',
			'leftInternalOblique',
			'rightInternalOblique',
			'leftTransversusAbdominis',
			'rightTransversusAbdominis',
		],
		icon: manFrontMuscleGroupParts.pressFull,
	},
	{
		id: '3',
		name: 'Руки',
		muscleImages: [
			'leftLongBiceps',
			'rightLongBiceps',
			'leftShortBiceps',
			'rightShortBiceps',
		],
		icon: manFrontMuscleGroupParts.bicepsFull,
	},
	{
		id: '4',
		name: 'Дельты',
		muscleImages: [
			'leftFrontDeltoid',
			'rightFrontDeltoid',
			'leftMiddleDeltoid',
			'rightMiddleDeltoid',
		],
		icon: manFrontMuscleGroupParts.deltoidsFull,
	},
	{
		id: '5',
		name: 'Ноги',
		muscleImages: [
			'leftVastusLateralis',
			'rightVastusLateralis',
			'leftVastusMedialis',
			'rightVastusMedialis',
			'leftVastusInternedius',
			'rightVastusInternedius',
			'leftGastrocnemius',
			'rightGastrocnemius',
			'leftTibialisAnterior',
			'rightTibialisAnterior',
			'rightGluteusMedius',
			'leftGluteusMedius',
		],
		icon: manFrontMuscleGroupParts.upperLegFull,
	},
	{
		id: '6',
		name: 'Предплечья',
		position: {
			left: '-100%',
			top: '-220%',
		},
		muscleImages: [
			'rightExtensorDigitorum',
			'leftExtensorDigitorum',
			'rightExtensorCarpiUharis',
			'leftExtensorCarpiUharis',
			'rightExtensorCarpiRadialis',
			'leftExtensorCarpiRadialis',
		],
		icon: manBackMuscleGroupParts.internalOblique,
	},
]

const MUSCLE_BACK_DATA = [
	{
		id: '1',
		name: 'Ноги',
		position: {
			left: '-100%',
			top: '-280%',
		},
		muscleImages: [
			'leftBiceosFemoris',
			'leftGastrocnemius',
			'leftSemitendinosus',
			'rightBiceosFemoris',
			'rightGastrocnemius',
			'rightSemitendinosus',
		],
		icon: manBackMuscleGroupParts.deltoidFull,
	},
	{
		id: '2',
		name: 'Предплечья',
		position: {
			left: '-100%',
			top: '-220%',
		},
		muscleImages: [
			'leftFlexorDigitorumProfundus',
			'leftFlexorPollicisLongus',
			'rightFlexorDigitorumProfundus',
			'rightFlexorPollicisLongus',
		],
		icon: manBackMuscleGroupParts.internalOblique,
	},
	{
		id: '3',
		name: 'Ягодицы',
		position: {
			left: '-100%',
			top: '-240%',
		},
		muscleImages: [
			'leftGluteusMaximus',
			'leftGluteusMedius',
			'leftInternalOblique',
			'rightGluteusMaximus',
			'rightGluteusMedius',
			'rightInternalOblique',
		],
		icon: manBackMuscleGroupParts.forearmFull,
	},
	{
		id: '4',
		name: 'Спина',
		position: {
			left: '-100%',
			top: '-180%',
		},
		muscleImages: [
			'leftIntraspinatus',
			'leftLatissimusDorsi',
			'leftThoracolumbarFascia',
			'rightIntraspinatus',
			'rightLatissimusDorsi',
			'rightThoracolumbarFascia',
		],
		icon: manBackMuscleGroupParts.deltoidFull,
	},
	{
		id: '5',
		name: 'Трапеции',
		position: {
			left: '-100%',
			top: '-150%',
		},
		muscleImages: [
			'leftLowerTrapezius',
			'leftUpperTrapezius',
			'rightLowerTrapezius',
			'rightUpperTrapezius',
		],
		icon: manBackMuscleGroupParts.trapeziusFull,
	},
	{
		id: '6',
		name: 'Плечи',
		position: {
			left: '-70%',
			top: '-150%',
		},
		muscleImages: ['leftRearDeltoid', 'rightRearDeltoid'],
		icon: manBackMuscleGroupParts.upperLegFull,
	},
	{
		id: '7',
		name: 'Трицепс',
		position: {
			left: '-100%',
			top: '-200%',
		},
		muscleImages: ['leftTriceps', 'rightTriceps'],
		icon: manBackMuscleGroupParts.triceps,
	},
]

interface ExerciseDetail {
	id: string
	name: string
	description: string
	image: any
	imagePosition?: any
	images?: any[]
	videoUrl?: string
	primaryMuscles: string[]
	secondaryMuscles: string[]
	primaryFrontMuscles: string[]
	secondaryFrontMuscles: string[]
	primaryBackMuscles: string[]
	secondaryBackMuscles: string[]
	tips: string[]
	equipment: string[]
	difficulty: 'Начинающий' | 'Средний' | 'Продвинутый'
}

interface MuscleSubgroup {
	id: string
	name: string
	image: any
	exercises: ExerciseDetail[]
}

interface MuscleGroup {
	id: string
	name: string
	image: any
	position: any
	subgroups: MuscleSubgroup[]
}

const MUSCLE_GROUPS: MuscleGroup[] = muscle_groups

interface ExerciseSelectionModalProps {
	visible: boolean
	onClose: () => void
	onSelectExercise: (exercise: { name: string; muscleGroup: string }) => void
}

const EXERCISES_PAGE_SIZE = 10

// ─── Shimmer ──────────────────────────────────────────────────────────────────

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
	return (
		<Animated.View
			style={[style, { opacity, backgroundColor: COLORS.cardLight }]}
		/>
	)
}

// Single skeleton card — matches real exercise card layout exactly
const ExerciseCardSkeleton = () => (
	<View style={modalStyles.exerciseListItem}>
		<ShimmerBlock
			style={[modalStyles.exerciseListImage, { width: 80, height: 100 }]}
		/>
		<View style={modalStyles.exerciseListContent}>
			<View style={modalStyles.exerciseListHeader}>
				<ShimmerBlock style={{ width: 130, height: 18, borderRadius: 4 }} />
				<ShimmerBlock style={{ width: 22, height: 22, borderRadius: 11 }} />
			</View>
			<ShimmerBlock
				style={{ width: '90%', height: 12, borderRadius: 4, marginBottom: 6 }}
			/>
			<ShimmerBlock
				style={{ width: '60%', height: 12, borderRadius: 4, marginBottom: 10 }}
			/>
			<View style={modalStyles.exerciseListTags}>
				<ShimmerBlock style={{ width: 72, height: 22, borderRadius: 6 }} />
				<ShimmerBlock style={{ width: 56, height: 22, borderRadius: 6 }} />
			</View>
		</View>
	</View>
)

// Fixed count skeleton — renders exactly EXERCISES_PAGE_SIZE items, no more
const ExercisesListSkeleton = () => (
	<View style={{ padding: 8 }}>
		{Array.from({ length: EXERCISES_PAGE_SIZE }).map((_, i) => (
			<ExerciseCardSkeleton key={i} />
		))}
	</View>
)

// ─── Load-more footer — only shown when paginating, never during initial load ──

const LoadMoreFooter = () => (
	<View style={modalStyles.loadingFooter}>
		<ShimmerBlock style={{ width: 200, height: 14, borderRadius: 4 }} />
	</View>
)

// ─── Main component ───────────────────────────────────────────────────────────

export const ExerciseSelectionModal: React.FC<ExerciseSelectionModalProps> = ({
	visible,
	onClose,
	onSelectExercise,
}) => {
	const { t, language } = useLanguage()
	const [selectedMuscleGroup, setSelectedMuscleGroup] =
		useState<MuscleGroup | null>(null)
	const [selectedExercise, setSelectedExercise] =
		useState<ExerciseDetail | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [favorites, setFavorites] = useState<string[]>([])

	const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current
	const [modalVisible, setModalVisible] = useState(false)

	// Pagination — single source of truth
	const [allExercises, setAllExercises] = useState<ExerciseDetail[]>([])
	const [displayedExercises, setDisplayedExercises] = useState<
		ExerciseDetail[]
	>([])
	const [currentPage, setCurrentPage] = useState(1)
	const [hasMore, setHasMore] = useState(false)
	const [isLoadingMore, setIsLoadingMore] = useState(false)

	// isInitialLoading: true only while we haven't rendered the first page yet
	const [isInitialLoading, setIsInitialLoading] = useState(false)

	// Keeps track of which group/query triggered the current load so stale
	// setState calls from previous selections don't leak in.
	const loadKey = useRef(0)
	const currentGroupIdRef = useRef<string | null>(null)
	const searchTimeoutRef = useRef<NodeJS.Timeout>(null)

	// ── Helpers ────────────────────────────────────────────────────────────────

	const getSideAndColorsForGroup = (groupName: string) => {
		// Сначала ищем в BACK — у них приоритет для задних групп
		const back = MUSCLE_BACK_DATA.find(g => g.name === groupName)
		if (back) {
			const colors: Record<string, string> = {}
			back.muscleImages.forEach(k => {
				colors[k] = COLORS.green
			})
			return { side: 'back' as const, colors }
		}
		const front = MUSCLE_FRONT_DATA.find(g => g.name === groupName)
		if (front) {
			const colors: Record<string, string> = {}
			front.muscleImages.forEach(k => {
				colors[k] = COLORS.green
			})
			return { side: 'front' as const, colors }
		}
		return { side: 'front' as const, colors: {} }
	}

	const getTintColor = (percent: number) => {
		const p = Math.max(0, Math.min(100, percent)) / 100
		const g = Math.round(255 * (1 - p))
		return `#ff${g.toString(16).padStart(2, '0')}00`
	}

	const getFrontMuscleColors = (ex: ExerciseDetail) => {
		const colors: Record<string, string> = {}
		MUSCLE_FRONT_DATA.forEach(m =>
			m.muscleImages.forEach(k => {
				if (ex.primaryFrontMuscles.includes(k)) colors[k] = getTintColor(100)
				else if (ex.secondaryFrontMuscles.includes(k))
					colors[k] = getTintColor(50)
			}),
		)
		return colors
	}

	const getBackMuscleColors = (ex: ExerciseDetail) => {
		const colors: Record<string, string> = {}
		MUSCLE_BACK_DATA.forEach(m =>
			m.muscleImages.forEach(k => {
				if (ex.primaryBackMuscles.includes(k)) colors[k] = getTintColor(100)
				else if (ex.secondaryBackMuscles.includes(k))
					colors[k] = getTintColor(50)
			}),
		)
		return colors
	}

	// ── Load exercises for a group or search query ─────────────────────────────

	const loadExercises = (exercises: ExerciseDetail[], source: string) => {
		const key = ++loadKey.current

		// Показываем скелетон
		setIsInitialLoading(true)
		setDisplayedExercises([])
		setAllExercises(exercises)

		// Используем setTimeout для гарантии обновления UI
		setTimeout(() => {
			if (loadKey.current !== key) {
				console.log(`Stale load cancelled: ${source}`)
				return // устаревший вызов, игнорируем
			}

			setDisplayedExercises(exercises.slice(0, EXERCISES_PAGE_SIZE))
			setCurrentPage(1)
			setHasMore(exercises.length > EXERCISES_PAGE_SIZE)
			setIsInitialLoading(false)
		}, 50)
	}

	// ── Effects ────────────────────────────────────────────────────────────────

	useEffect(() => {
		if (visible) {
			setModalVisible(true)
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
				tension: 65,
				friction: 11,
			}).start()
		} else {
			Animated.timing(slideAnim, {
				toValue: SCREEN_HEIGHT,
				duration: 260,
				useNativeDriver: true,
			}).start(() => {
				setModalVisible(false)
				setSelectedMuscleGroup(null)
				setSelectedExercise(null)
				setSearchQuery('')
				setDisplayedExercises([])
				setAllExercises([])
				setCurrentPage(1)
				setHasMore(false)
				setIsInitialLoading(false)
				loadKey.current = 0
				currentGroupIdRef.current = null
			})
		}
	}, [visible])

	// Default to first group on open
	useEffect(() => {
		if (visible && MUSCLE_GROUPS.length > 0 && !selectedMuscleGroup) {
			setSelectedMuscleGroup(MUSCLE_GROUPS[0])
		}
	}, [visible, selectedMuscleGroup])

	// Reload when group changes (and no active search)
	useEffect(() => {
		if (!selectedMuscleGroup || searchQuery) return

		// Обновляем ref с текущей группой
		currentGroupIdRef.current = selectedMuscleGroup.id

		const exercises = selectedMuscleGroup.subgroups.flatMap(sg => sg.exercises)

		// Добавляем небольшую задержку перед загрузкой
		const timeoutId = setTimeout(() => {
			// Проверяем, не изменилась ли группа за время задержки
			if (currentGroupIdRef.current === selectedMuscleGroup.id) {
				loadExercises(exercises, `group-${selectedMuscleGroup.id}`)
			}
		}, 100)

		return () => clearTimeout(timeoutId)
	}, [selectedMuscleGroup])

	// Reload when search query changes
	useEffect(() => {
		// Очищаем предыдущий таймаут поиска
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current)
		}

		if (!searchQuery) {
			// Возвращаемся к группе
			if (selectedMuscleGroup) {
				currentGroupIdRef.current = selectedMuscleGroup.id
				const exercises = selectedMuscleGroup.subgroups.flatMap(
					sg => sg.exercises,
				)
				loadExercises(exercises, `group-${selectedMuscleGroup.id}-clear`)
			}
			return
		}

		// Debounce для поиска
		searchTimeoutRef.current = setTimeout(() => {
			const q = searchQuery.toLowerCase()
			const filtered = MUSCLE_GROUPS.flatMap(group =>
				group.subgroups.flatMap(sg =>
					sg.exercises.filter(
						ex =>
							ex.name.toLowerCase().includes(q) ||
							ex.description.toLowerCase().includes(q) ||
							ex.primaryMuscles.some(m => m.toLowerCase().includes(q)),
					),
				),
			)
			loadExercises(filtered, `search-${searchQuery}`)
		}, 300)

		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current)
			}
		}
	}, [searchQuery])

	// ── Pagination ─────────────────────────────────────────────────────────────

	const loadNextPage = () => {
		if (isLoadingMore || !hasMore || isInitialLoading) return

		setIsLoadingMore(true)

		setTimeout(() => {
			const nextPage = currentPage + 1
			const end = nextPage * EXERCISES_PAGE_SIZE
			setDisplayedExercises(allExercises.slice(0, end))
			setCurrentPage(nextPage)
			setHasMore(allExercises.length > end)
			setIsLoadingMore(false)
		}, 50)
	}

	// ── Actions ────────────────────────────────────────────────────────────────

	const toggleFavorite = (id: string) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
		setFavorites(prev =>
			prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
		)
	}

	const handleBack = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
		if (selectedExercise) setSelectedExercise(null)
		else onClose()
	}

	const handleSelectExercise = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
		if (selectedExercise) {
			onSelectExercise({
				name: selectedExercise.name,
				muscleGroup: selectedMuscleGroup?.name || '',
			})
			onClose()
		}
	}

	const handleSelectMuscleGroup = (group: MuscleGroup) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
		setSelectedMuscleGroup(group)
		setSearchQuery('')
		setSelectedExercise(null)
	}

	// ── Render helpers ─────────────────────────────────────────────────────────

	const renderHeader = () => (
		<View style={modalStyles.header}>
			<TouchableOpacity
				style={modalStyles.backButton}
				onPress={handleBack}
				activeOpacity={0.7}
			>
				<Ionicons
					name={selectedExercise ? 'arrow-back' : 'close'}
					size={24}
					color={COLORS.text}
				/>
			</TouchableOpacity>
		<Text style={modalStyles.headerTitle} numberOfLines={1}>
			{selectedExercise ? translateExerciseName(selectedExercise.name, language ?? 'ru') : t('exercises', 'title')}
		</Text>
		</View>
	)

	const renderMuscleGroupsHorizontal = () => (
		<View style={modalStyles.groupsContainer}>
			<FlatList
				horizontal
				data={MUSCLE_GROUPS}
				keyExtractor={item => item.id}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={modalStyles.groupsList}
				renderItem={({ item }) => {
					const { side, colors } = getSideAndColorsForGroup(item.name)
					const isSelected = selectedMuscleGroup?.id === item.id
					return (
						<TouchableOpacity
							style={[
								modalStyles.groupCard,
								isSelected && modalStyles.groupCardActive,
							]}
							onPress={() => handleSelectMuscleGroup(item)}
							activeOpacity={0.7}
						>
							<View style={modalStyles.groupImageContainer}>
								<View
									style={{
										position: 'absolute',
										left: item.position.left,
										top: item.position.top,
									}}
								>
									{side === 'front' ? (
										<ManFrontSvg
											height={300}
											width={150}
											muscleColors={colors}
										/>
									) : (
										<ManBackSvg
											height={300}
											width={150}
											muscleColors={colors}
										/>
									)}
								</View>
							</View>
						<Text
							style={[
								modalStyles.groupName,
								isSelected && modalStyles.groupNameActive,
							]}
						>
							{translateGroupName(item.name, language ?? 'ru')}
						</Text>
						<Text style={modalStyles.groupCount}>
							{item.subgroups.reduce(
								(acc, sg) => acc + sg.exercises.length,
								0,
							)}
							</Text>
						</TouchableOpacity>
					)
				}}
			/>
		</View>
	)

	const renderSearch = () => (
		<View style={modalStyles.searchContainer}>
			<View style={modalStyles.searchInner}>
				<Ionicons name='search' size={20} color={COLORS.textSecondary} />
				<TextInput
					style={modalStyles.searchInput}
					placeholder={t('exercises', 'searchPlaceholder')}
					placeholderTextColor={COLORS.textSecondary}
					value={searchQuery}
					onChangeText={setSearchQuery}
				/>
				{searchQuery.length > 0 && (
					<TouchableOpacity onPress={() => setSearchQuery('')}>
						<Ionicons
							name='close-circle'
							size={20}
							color={COLORS.textSecondary}
						/>
					</TouchableOpacity>
				)}
			</View>
		</View>
	)

	const renderExerciseListItem = (item: ExerciseDetail) => (
		<TouchableOpacity
			key={item.id}
			style={modalStyles.exerciseListItem}
			onPress={() => {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
				setSelectedExercise(item)
			}}
			activeOpacity={0.7}
		>
			<View style={modalStyles.exerciseListImage}>
				<Image
					transition={200}
					source={item.image}
					style={{
						position: 'absolute',
						width: item.imagePosition ? item.imagePosition.width : '100%',
						height: '100%',
						left: item.imagePosition ? item.imagePosition.left : 0,
						transform: [
							{ scaleX: item.imagePosition ? item.imagePosition.scaleX : 1 },
						],
					}}
				/>
			</View>
			<View style={modalStyles.exerciseListContent}>
				<View style={modalStyles.exerciseListHeader}>
					<Text style={modalStyles.exerciseListName} numberOfLines={1}>
						{translateExerciseName(item.name, language ?? 'ru')}
					</Text>
					<TouchableOpacity
						onPress={e => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
							e.stopPropagation()
							toggleFavorite(item.id)
						}}
					>
						<Ionicons
							name={favorites.includes(item.id) ? 'star' : 'star-outline'}
							size={22}
							color={
								favorites.includes(item.id)
									? COLORS.primary
									: COLORS.textSecondary
							}
						/>
					</TouchableOpacity>
				</View>
			<Text style={modalStyles.exerciseListDescription} numberOfLines={2}>
				{translateDescription(item.name, language ?? 'ru') ?? item.description}
			</Text>
			<View style={modalStyles.exerciseListTags}>
				<View style={modalStyles.difficultyTag}>
					<Text style={modalStyles.difficultyText}>
						{translateDifficulty(item.difficulty, language ?? 'ru')}
					</Text>
				</View>
				<View style={modalStyles.equipmentTag}>
					<Text style={modalStyles.equipmentText}>
						{item.equipment.length > 1
							? `${translateEquipment(item.equipment[0], language ?? 'ru')} +${item.equipment.length - 1}`
							: translateEquipment(item.equipment[0], language ?? 'ru')}
					</Text>
				</View>
			</View>
			</View>
			<Ionicons name='chevron-forward' size={20} color={COLORS.textSecondary} />
		</TouchableOpacity>
	)

	const renderExercisesList = () => {
		// Show skeleton while first page is loading — nothing else
		if (isInitialLoading) {
			return <ExercisesListSkeleton />
		}

		if (!selectedMuscleGroup && !searchQuery) {
			return (
				<View style={modalStyles.emptyState}>
					<Ionicons
						name='body-outline'
						size={64}
						color={COLORS.textSecondary}
					/>
				<Text style={modalStyles.emptyStateTitle}>{t('exercises', 'selectMuscle')}</Text>
				<Text style={modalStyles.emptyStateText}>
						{t('exercises', 'selectMuscle')}
					</Text>
				</View>
			)
		}

		if (displayedExercises.length === 0) {
			return (
				<View style={modalStyles.emptyState}>
					<Ionicons
						name='search-outline'
						size={64}
						color={COLORS.textSecondary}
					/>
					<Text style={modalStyles.emptyStateTitle}>{t('exercises', 'notFound')}</Text>
				</View>
			)
		}

		// Group by subgroup when browsing (no search)
		if (selectedMuscleGroup && !searchQuery) {
			// Create a flat list of exercises with section headers
			const sections = selectedMuscleGroup.subgroups
				.map(sg => ({
					title: sg.name,
					data: sg.exercises.filter(ex =>
						displayedExercises.some(de => de.id === ex.id),
					),
				}))
				.filter(s => s.data.length > 0)

			// Flatten the data with section headers
			const flatData = sections.flatMap(section => [
				{ type: 'header', title: section.title, id: `header-${section.title}` },
				...section.data.map(ex => ({ type: 'exercise', data: ex, id: ex.id })),
			])

			return (
				<FlatList
					data={flatData}
					keyExtractor={item => item.id}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={[
						modalStyles.exercisesList,
						{ paddingBottom: 40 },
					]}
					onEndReached={loadNextPage}
					onEndReachedThreshold={0.3}
					ListFooterComponent={
						hasMore && !isInitialLoading ? <LoadMoreFooter /> : null
					}
					renderItem={({ item }) => {
						if (item.type === 'header') {
							return <View></View>
						}
						return renderExerciseListItem(item.data)
					}}
				/>
			)
		}

		// Flat list for search results
		return (
			<FlatList
				data={displayedExercises}
				keyExtractor={item => item.id}
				contentContainerStyle={[
					modalStyles.exercisesList,
					{ paddingBottom: 40 },
				]}
				showsVerticalScrollIndicator={false}
				renderItem={({ item }) => renderExerciseListItem(item)}
				onEndReached={loadNextPage}
				onEndReachedThreshold={0.3}
				ListFooterComponent={
					hasMore && !isInitialLoading ? <LoadMoreFooter /> : null
				}
			/>
		)
	}

	const renderExerciseDetail = () => {
		if (!selectedExercise) return null
		return (
			<View style={{ flex: 1, backgroundColor: COLORS.background }}>
				<ScrollView
					style={modalStyles.exerciseDetailContainer}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 120 }}
					keyboardShouldPersistTaps='handled'
				>
					<View style={modalStyles.exerciseDetailContent}>
						<View style={modalStyles.exerciseHeader}>
							<View style={modalStyles.exerciseTitleContainer}>
						<Text style={modalStyles.exerciseDetailTitle}>
								{translateExerciseName(selectedExercise.name, language ?? 'ru')}
							</Text>
							</View>

							{selectedExercise.videoUrl && (
								<CachedVideo
									remoteUrl={selectedExercise.videoUrl}
									videoId={selectedExercise.id}
									style={styles.video}
									autoPlay
									loop
									muted
								/>
							)}

							{selectedExercise.images &&
								selectedExercise.images.length > 0 && (
									<ImageGallery images={selectedExercise.images} />
								)}

							{!selectedExercise.videoUrl &&
								(!selectedExercise.images ||
									selectedExercise.images.length === 0) && (
									<View style={detailModalStyles.exerciseImageContainer}>
										<Image
											transition={200}
											source={selectedExercise.image}
											style={detailModalStyles.exerciseMainImage}
										/>
									</View>
								)}

							{!selectedExercise.videoUrl && (
								<View style={detailModalStyles.exerciseImageContainer}>
									<Image
										transition={200}
										source={selectedExercise.image}
										style={detailModalStyles.exerciseMainImage}
									/>
								</View>
							)}

						<Text style={modalStyles.exerciseDetailDescriptionFull}>
							{translateDescription(selectedExercise.name, language ?? 'ru') ?? selectedExercise.description}
						</Text>

							<View style={modalStyles.detailStats}>
								<View style={modalStyles.detailStat}>
									<View style={modalStyles.detailStatIcon}>
										<Ionicons name='barbell' size={18} color={COLORS.primary} />
									</View>
									<View>
										<Text style={modalStyles.detailStatLabel}>{t('exercises', 'difficulty')}</Text>
									<Text style={modalStyles.detailStatValue}>
										{translateDifficulty(selectedExercise.difficulty, language ?? 'ru')}
									</Text>
									</View>
								</View>
								<View style={modalStyles.detailStat}>
									<View style={modalStyles.detailStatIcon}>
										<Ionicons
											name='construct'
											size={18}
											color={COLORS.primary}
										/>
									</View>
									<View>
										<Text style={modalStyles.detailStatLabel}>
											{t('exercises', 'equipment')}
										</Text>
									{selectedExercise.equipment.map((item, index) => (
										<Text key={index} style={modalStyles.detailStatValue}>
											{translateEquipment(item, language ?? 'ru')}
										</Text>
									))}
									</View>
								</View>
							</View>
						</View>

						<View style={modalStyles.section}>
							<Text style={modalStyles.sectionTitle}>{t('exercises', 'workingMuscles')}</Text>
							<View style={modalStyles.muscleGroupsGridDetail}>
								<View style={modalStyles.muscleGroupItem}>
									<View style={modalStyles.muscleGroupHeader}>
										<Ionicons name='star' size={16} color={COLORS.primary} />
										<Text style={modalStyles.muscleGroupLabel}>{t('exercises', 'primaryMuscles')}</Text>
									</View>
								{selectedExercise.primaryMuscles.map((m, i) => (
									<View key={i} style={modalStyles.muscleItem}>
										<View style={modalStyles.muscleDot} />
										<Text style={modalStyles.muscleText}>{translateMuscleName(m, language ?? 'ru')}</Text>
									</View>
								))}
								</View>
								{selectedExercise.secondaryMuscles.length > 0 && (
									<View style={modalStyles.muscleGroupItem}>
										<View style={modalStyles.muscleGroupHeader}>
											<Ionicons
												name='star-outline'
												size={16}
												color={COLORS.textSecondary}
											/>
											<Text style={modalStyles.muscleGroupLabel}>
												{t('exercises', 'secondaryMuscles')}
											</Text>
										</View>
									{selectedExercise.secondaryMuscles.map((m, i) => (
										<View key={i} style={modalStyles.muscleItem}>
											<View style={modalStyles.muscleDotSecondary} />
											<Text style={modalStyles.muscleTextSecondary}>{translateMuscleName(m, language ?? 'ru')}</Text>
										</View>
									))}
									</View>
								)}
							</View>
							<View style={{ flexDirection: 'row' }}>
								<View style={styles.bodyImageContainer}>
									<ManBackSvg
										muscleColors={getBackMuscleColors(selectedExercise)}
									/>
								</View>
								<View style={styles.bodyImageContainer}>
									<ManFrontSvg
										muscleColors={getFrontMuscleColors(selectedExercise)}
									/>
								</View>
							</View>
						</View>

						<View style={modalStyles.section}>
							<Text style={modalStyles.sectionTitle}>{t('exercises', 'technique')}</Text>
							<View style={modalStyles.tipsList}>
							{(translateTips(selectedExercise.name, language ?? 'ru') ?? selectedExercise.tips).map((tip, i, arr) => (
								<View
									key={i}
									style={{
										...modalStyles.tipItem,
										borderBottomWidth: i !== arr.length - 1 ? 1 : 0,
										borderBottomColor: COLORS.border,
									}}
								>
									<View style={modalStyles.tipNumber}>
										<Text style={modalStyles.tipNumberText}>{i + 1}</Text>
									</View>
									<Text style={modalStyles.tipText}>{tip}</Text>
								</View>
							))}
								<View style={{ height: 40 }} />
							</View>
						</View>
						<View style={modalStyles.spacer} />
					</View>
				</ScrollView>

				<View style={modalStyles.fixedBottomButtonContainer}>
					<TouchableOpacity
						style={modalStyles.confirmButton}
						onPress={handleSelectExercise}
						activeOpacity={0.7}
					>
						<Text style={modalStyles.confirmButtonText}>
							{t('exercises', 'addToWorkout')}
						</Text>
					</TouchableOpacity>
					{selectedExercise && (
						<TouchableOpacity
							style={modalStyles.favoriteButton}
							onPress={() => toggleFavorite(selectedExercise.id)}
						>
							<Ionicons
								name={
									favorites.includes(selectedExercise.id)
										? 'star'
										: 'star-outline'
								}
								size={24}
								color={
									favorites.includes(selectedExercise.id)
										? COLORS.primary
										: COLORS.textSecondary
								}
							/>
						</TouchableOpacity>
					)}
				</View>
			</View>
		)
	}

	if (!modalVisible) return null

	return (
		<Modal
			transparent
			visible={modalVisible}
			animationType='none'
			onRequestClose={onClose}
		>
			<View style={modalStyles.modalOverlay}>
				<TouchableOpacity
					style={modalStyles.modalBackdrop}
					activeOpacity={1}
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
						onClose()
					}}
				/>
				<Animated.View
					style={[
						modalStyles.modalContainer,
						{ transform: [{ translateY: slideAnim }] },
					]}
				>
					{renderHeader()}
					<View style={modalStyles.content}>
						{!selectedExercise ? (
							<>
								{renderMuscleGroupsHorizontal()}
								{renderSearch()}
								{renderExercisesList()}
							</>
						) : (
							renderExerciseDetail()
						)}
					</View>
				</Animated.View>
			</View>
		</Modal>
	)
}

// ─── Image gallery ────────────────────────────────────────────────────────────

const ImageGallery = ({ images }: { images: any[] }) => {
	const [activeIndex, setActiveIndex] = useState(0)
	const onScroll = (e: any) => {
		const w = e.nativeEvent.layoutMeasurement.width
		setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / w))
	}
	return (
		<View style={galleryStyles.container}>
			<FlatList
				data={images}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onScroll={onScroll}
				scrollEventThrottle={16}
				renderItem={({ item }) => (
					<View style={galleryStyles.imageContainer}>
						<Image
							source={item}
							style={galleryStyles.image}
							contentFit='cover'
							transition={200}
						/>
					</View>
				)}
				keyExtractor={(_, i) => i.toString()}
			/>
			{images.length > 1 && (
				<View style={galleryStyles.pagination}>
					{images.map((_, i) => (
						<View
							key={i}
							style={[
								galleryStyles.dot,
								i === activeIndex && galleryStyles.activeDot,
							]}
						/>
					))}
				</View>
			)}
		</View>
	)
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const galleryStyles = StyleSheet.create({
	container: { marginVertical: 16 },
	imageContainer: {
		width: SCREEN_WIDTH - 32,
		height: 200,
		borderRadius: 12,
		overflow: 'hidden',
	},
	image: { width: '100%', height: '100%' },
	pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: COLORS.textSecondary,
		marginHorizontal: 4,
	},
	activeDot: { backgroundColor: COLORS.primary },
})

const detailModalStyles = StyleSheet.create({
	exerciseImageContainer: {
		width: '100%',
		height: 240,
		position: 'relative',
		marginBottom: 20,
	},
	exerciseMainImage: { width: '100%', height: '100%', borderRadius: 12 },
})

const modalStyles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: '#121212',
		justifyContent: 'flex-end',
	},
	modalBackdrop: { ...StyleSheet.absoluteFillObject },
	modalContainer: {
		backgroundColor: '#121212',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		height: '95%',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 8,
		paddingVertical: 12,
		backgroundColor: COLORS.card,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	backButton: { padding: 8 },
	headerTitle: {
		flex: 1,
		fontSize: 18,
		fontWeight: '600',
		color: COLORS.text,
		textAlign: 'center',
		marginHorizontal: 8,
	},
	content: { flex: 1 },
	groupsContainer: {
		maxHeight: 120,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
		backgroundColor: COLORS.card,
	},
	groupsList: { paddingHorizontal: 8, paddingVertical: 12, gap: 8 },
	groupCard: {
		width: 90,
		alignItems: 'center',
		backgroundColor: COLORS.cardLight,
		borderRadius: 12,
		padding: 8,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	groupCardActive: {
		borderColor: COLORS.primary,
		backgroundColor: 'rgba(52, 199, 89, 0.1)',
	},
	groupImageContainer: {
		width: 50,
		height: 50,
		marginBottom: 4,
		position: 'relative',
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: 10,
		backgroundColor: COLORS.card,
	},
	groupName: {
		fontSize: 11,
		fontWeight: '600',
		color: COLORS.textSecondary,
		textAlign: 'center',
	},
	groupNameActive: { color: COLORS.primary },
	groupCount: { fontSize: 9, color: COLORS.textSecondary, marginTop: 2 },
	searchContainer: {
		paddingHorizontal: 8,
		paddingVertical: 12,
		backgroundColor: COLORS.card,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	searchInner: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.cardLight,
		borderRadius: 12,
		paddingHorizontal: 8,
		paddingVertical: 12,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		color: COLORS.text,
		marginLeft: 12,
		marginRight: 8,
	},
	exercisesList: { padding: 8 },
	exerciseListItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.card,
		borderRadius: 14,
		padding: 12,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	exerciseListImage: {
		width: 80,
		height: 100,
		borderRadius: 10,
		marginRight: 12,
		overflow: 'hidden',
		position: 'relative',
	},
	exerciseListContent: { flex: 1 },
	exerciseListHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 6,
	},
	exerciseListName: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.text,
		flex: 1,
		marginRight: 8,
	},
	exerciseListDescription: {
		fontSize: 12,
		color: COLORS.textSecondary,
		marginBottom: 8,
		lineHeight: 16,
	},
	exerciseListTags: { flexDirection: 'row', gap: 8 },
	difficultyTag: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(52, 199, 89, 0.2)',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
	},
	difficultyText: {
		fontSize: 10,
		color: COLORS.text,
		fontWeight: '600',
		marginLeft: 4,
	},
	equipmentTag: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(142, 142, 147, 0.2)',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
	},
	equipmentText: {
		fontSize: 10,
		color: COLORS.text,
		fontWeight: '600',
		marginLeft: 4,
	},
	exerciseDetailContainer: {
		flex: 1,
		marginBottom: -80,
		backgroundColor: '#121212',
	},
	exerciseDetailContent: { padding: 16 },
	exerciseHeader: { marginBottom: 24 },
	exerciseTitleContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	exerciseDetailTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: COLORS.text,
		flex: 1,
		marginRight: 8,
	},
	exerciseDetailDescriptionFull: {
		fontSize: 15,
		color: COLORS.text,
		lineHeight: 22,
		marginBottom: 20,
	},
	detailStats: { justifyContent: 'space-between', marginTop: 16 },
	detailStat: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.card,
		padding: 12,
		borderRadius: 12,
		marginVertical: 4,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	detailStatIcon: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: 'rgba(52, 199, 89, 0.1)',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	detailStatLabel: {
		fontSize: 11,
		color: COLORS.textSecondary,
		marginBottom: 2,
	},
	detailStatValue: { fontSize: 13, fontWeight: '600', color: COLORS.text },
	section: { marginBottom: 24 },
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: COLORS.text,
		marginBottom: 16,
	},
	sectionHeader: {
		paddingHorizontal: 8,
		paddingVertical: 12,
		backgroundColor: COLORS.background,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	sectionHeaderText: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.primary,
	},
	muscleGroupsGridDetail: {
		backgroundColor: COLORS.card,
		borderRadius: 12,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	muscleGroupItem: { padding: 16 },
	muscleGroupHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
		marginLeft: -3,
	},
	muscleGroupLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: COLORS.text,
		marginLeft: 8,
	},
	muscleItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
	muscleDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: COLORS.primary,
		marginRight: 12,
	},
	muscleText: { fontSize: 14, color: COLORS.text, flex: 1 },
	muscleDotSecondary: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: COLORS.textSecondary,
		marginRight: 12,
	},
	muscleTextSecondary: { fontSize: 14, color: COLORS.textSecondary, flex: 1 },
	tipsList: {
		backgroundColor: COLORS.card,
		borderRadius: 12,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	tipItem: { flexDirection: 'row', alignItems: 'flex-start', padding: 16 },
	tipNumber: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: COLORS.primary,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
		flexShrink: 0,
	},
	tipNumberText: { fontSize: 12, fontWeight: 'bold', color: COLORS.background },
	tipText: { fontSize: 14, color: COLORS.text, flex: 1, lineHeight: 20 },
	confirmButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: COLORS.primary,
		paddingHorizontal: 32,
		paddingVertical: 18,
		borderRadius: 14,
		flex: 1,
		marginRight: 8,
		marginBottom: 16,
		marginTop: 8,
	},
	favoriteButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 18,
		paddingVertical: 18,
		borderRadius: 14,
		marginBottom: 16,
		marginTop: 8,
	},
	confirmButtonText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: COLORS.card,
		marginLeft: 8,
	},
	spacer: { height: 32 },
	emptyState: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 40,
	},
	emptyStateTitle: {
		fontSize: 16,
		color: COLORS.text,
		marginTop: 16,
		textAlign: 'center',
		fontWeight: '600',
	},
	emptyStateText: {
		fontSize: 14,
		color: COLORS.textSecondary,
		marginTop: 8,
		textAlign: 'center',
	},
	fixedBottomButtonContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		flexDirection: 'row',
		paddingHorizontal: 8,
		paddingVertical: 8,
		backgroundColor: COLORS.card,
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
		zIndex: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -3 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 8,
	},
	loadingFooter: {
		paddingVertical: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
})

const styles = StyleSheet.create({
	bodyImageContainer: {
		width: '50%',
		height: 450,
		position: 'relative',
		alignItems: 'center',
		justifyContent: 'center',
	},
	video: { width: '100%', height: 200, marginVertical: 10, borderRadius: 16 },
	cardIconWrap: {
		width: 50,
		height: 50,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
	},
	cardSvgContainer: { width: 180, height: 480 },
})
