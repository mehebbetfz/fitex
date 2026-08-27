import { CachedVideo } from '@/components/cached-video'
import ManBackSvg from '@/components/man-back-svg'
import ManFrontSvg from '@/components/man-front-svg'
import SheetModalHeader from '@/components/ui/sheet-modal-header'
import type { AppColors } from '@/constants/app-theme'
import {
	manBackMuscleGroupParts,
	manFrontMuscleGroupParts,
} from '@/constants/images'
import {
	translateDescription,
	translateEquipment,
	translateExerciseName,
	translateMuscleName,
	translateTips,
} from '@/constants/exercise-i18n'
import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Image } from 'expo-image'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
	Animated,
	Dimensions,
	FlatList,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const MUSCLE_FRONT_DATA = [
	{
		id: 'chest',
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
		id: 'press',
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
		id: 'arms',
		name: 'Бицепс',
		muscleImages: [
			'leftLongBiceps',
			'rightLongBiceps',
			'leftShortBiceps',
			'rightShortBiceps',
		],
		icon: manFrontMuscleGroupParts.bicepsFull,
	},
	{
		id: 'deltoids',
		name: 'Плечи',
		muscleImages: [
			'leftFrontDeltoid',
			'rightFrontDeltoid',
			'leftMiddleDeltoid',
			'rightMiddleDeltoid',
		],
		icon: manFrontMuscleGroupParts.deltoidsFull,
	},
	{
		id: 'legs',
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

interface ExerciseDetailModalProps {
	visible: boolean
	onClose: () => void
	exerciseDetail: ExerciseDetail | null
}

const ImageGallery = ({ images }: { images: any[] }) => {
	const { colors: C } = useAppTheme()
	const galleryStyles = useMemo(() => makeGalleryStyles(C), [C])
	const [activeIndex, setActiveIndex] = useState(0)

	const onScroll = (event: any) => {
		const slideSize = event.nativeEvent.layoutMeasurement.width
		const index = event.nativeEvent.contentOffset.x / slideSize
		setActiveIndex(Math.round(index))
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
				keyExtractor={(_, index) => index.toString()}
			/>
			{images.length > 1 && (
				<View style={galleryStyles.pagination}>
					{images.map((_, index) => (
						<View
							key={index}
							style={[
								galleryStyles.dot,
								index === activeIndex && galleryStyles.activeDot,
							]}
						/>
					))}
				</View>
			)}
		</View>
	)
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
	visible,
	onClose,
	exerciseDetail,
}) => {
	const { t, language } = useLanguage()
	const { colors: C } = useAppTheme()
	const styles = useMemo(() => makeStyles(C), [C])
	const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current
	const [modalVisible, setModalVisible] = useState(false)

	useEffect(() => {
		if (visible) {
			setModalVisible(true)
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}).start()
		} else {
			Animated.timing(slideAnim, {
				toValue: SCREEN_HEIGHT,
				duration: 250,
				useNativeDriver: true,
			}).start(() => {
				setModalVisible(false)
			})
		}
	}, [visible])

	const handleClose = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
		onClose()
	}

	const getDifficultyLabel = (diff: string) => {
		const MAP: Record<string, string> = {
			'Начинающий': t('exercises', 'diffBeginner'),
			'Средний': t('exercises', 'diffIntermediate'),
			'Продвинутый': t('exercises', 'diffAdvanced'),
		}
		return MAP[diff] || diff
	}

	if (!modalVisible || !exerciseDetail) return null

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

	return (
		<Modal
			transparent
			visible={modalVisible}
			animationType='none'
			onRequestClose={handleClose}
		>
			<View style={styles.modalOverlay}>
				<Pressable
					style={styles.modalBackdrop}
					onPress={handleClose}
					accessibilityRole='button'
					accessibilityLabel='Close'
				/>
				<Animated.View
					style={[
						styles.modalContainer,
						{ transform: [{ translateY: slideAnim }] },
					]}
				>
					<View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
						<SheetModalHeader
							title={translateExerciseName(exerciseDetail.name, language ?? 'ru')}
							onClose={handleClose}
						/>
					</View>

					<ScrollView
						style={styles.content}
						showsVerticalScrollIndicator={false}
					>
						<View style={styles.exerciseDetailContent}>
							<View style={styles.exerciseTitleContainer}>
							<Text style={styles.exerciseDetailTitle}>
								{translateExerciseName(exerciseDetail.name, language ?? 'ru')}
							</Text>
							</View>

							{exerciseDetail.videoUrl && (
								<CachedVideo
									remoteUrl={exerciseDetail?.videoUrl}
									videoId={exerciseDetail?.id ?? ''}
									style={styles.video}
									autoPlay={true}
									loop={true}
									muted={true}
								/>
							)}

							{exerciseDetail.images && exerciseDetail.images.length > 0 && (
								<ImageGallery images={exerciseDetail.images} />
							)}

							{!exerciseDetail.videoUrl &&
								(!exerciseDetail.images ||
									exerciseDetail.images.length === 0) && (
									<View style={styles.exerciseImageContainer}>
										<Image
											transition={200}
											source={exerciseDetail.image}
											style={styles.exerciseMainImage}
										/>
									</View>
								)}

						<Text style={styles.exerciseDetailDescriptionFull}>
							{translateDescription(exerciseDetail.name, language ?? 'ru') ?? exerciseDetail.description}
						</Text>

							<View style={styles.detailStats}>
								<View style={styles.detailStat}>
									<View style={styles.detailStatIcon}>
										<Ionicons name='barbell' size={18} color={C.primary} />
									</View>
									<View>
										<Text style={styles.detailStatLabel}>{t('exercises', 'difficulty')}</Text>
									<Text style={styles.detailStatValue}>
										{getDifficultyLabel(exerciseDetail.difficulty)}
									</Text>
									</View>
								</View>
								<View style={styles.detailStat}>
									<View style={styles.detailStatIcon}>
										<Ionicons
											name='construct'
											size={18}
											color={C.primary}
										/>
									</View>
									<View>
										<Text style={styles.detailStatLabel}>{t('exercises', 'equipment')}</Text>
									{exerciseDetail.equipment.map((item, index) => (
										<Text key={index} style={styles.detailStatValue}>
											{translateEquipment(item, language ?? 'ru')}
										</Text>
									))}
									</View>
								</View>
							</View>

							<View style={styles.section}>
								<Text style={styles.sectionTitle}>{t('exercises', 'workingMuscles')}</Text>
								<View style={styles.muscleGroupsGridDetail}>
									<View style={styles.muscleGroupItem}>
										<View style={styles.muscleGroupHeader}>
											<Ionicons name='star' size={16} color={C.primary} />
											<Text style={styles.muscleGroupLabel}>{t('exercises', 'primaryMuscles')}</Text>
										</View>
									{exerciseDetail.primaryMuscles.map((m, i) => (
										<View key={i} style={styles.muscleItem}>
											<View style={styles.muscleDot} />
											<Text style={styles.muscleText}>{translateMuscleName(m, language ?? 'ru')}</Text>
										</View>
									))}
									</View>
									{exerciseDetail.secondaryMuscles.length > 0 && (
										<View style={styles.muscleGroupItem}>
											<View style={styles.muscleGroupHeader}>
												<Ionicons
													name='star-outline'
													size={16}
													color={C.textSecondary}
												/>
												<Text style={styles.muscleGroupLabel}>
												{t('exercises', 'secondaryMuscles')}
												</Text>
											</View>
										{exerciseDetail.secondaryMuscles.map((m, i) => (
											<View key={i} style={styles.muscleItem}>
												<View style={styles.muscleDotSecondary} />
												<Text style={styles.muscleTextSecondary}>{translateMuscleName(m, language ?? 'ru')}</Text>
											</View>
										))}
										</View>
									)}
								</View>
								<View style={{ flexDirection: 'row' }}>
									<View style={styles.bodyImageContainer}>
										<ManBackSvg
											muscleColors={getBackMuscleColors(exerciseDetail)}
										/>
									</View>
									<View style={styles.bodyImageContainer}>
										<ManFrontSvg
											muscleColors={getFrontMuscleColors(exerciseDetail)}
										/>
									</View>
								</View>
							</View>

							<View style={styles.section}>
								<Text style={styles.sectionTitle}>{t('exercises', 'technique')}</Text>
							<View style={styles.tipsList}>
								{(translateTips(exerciseDetail.name, language ?? 'ru') ?? exerciseDetail.tips).map((tip, index, arr) => (
									<View
										key={index}
										style={{
											...styles.tipItem,
											borderBottomWidth: index !== arr.length - 1 ? 1 : 0,
											borderBottomColor: C.border,
										}}
									>
										<View style={styles.tipNumber}>
											<Text style={styles.tipNumberText}>{index + 1}</Text>
										</View>
										<Text style={styles.tipText}>{tip}</Text>
									</View>
								))}
								</View>
							</View>

							<View style={styles.spacer} />
						</View>
					</ScrollView>
				</Animated.View>
			</View>
		</Modal>
	)
}

function makeGalleryStyles(C: AppColors) {
	return StyleSheet.create({
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
			backgroundColor: C.textSecondary,
			marginHorizontal: 4,
		},
		activeDot: { backgroundColor: C.primary },
	})
}

function makeStyles(C: AppColors) {
	return StyleSheet.create({
		modalOverlay: {
			flex: 1,
			backgroundColor: C.background,
			justifyContent: 'flex-end',
		},
		modalBackdrop: { ...StyleSheet.absoluteFillObject },
		modalContainer: {
			backgroundColor: C.background,
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
			backgroundColor: C.card,
			borderBottomWidth: 1,
			borderBottomColor: C.border,
		},
		backButton: { padding: 8 },
		headerTitle: {
			flex: 1,
			fontSize: 18,
			fontWeight: '600',
			color: C.text,
			textAlign: 'center',
			marginHorizontal: 8,
		},
		content: { flex: 1 },
		exerciseDetailContent: { padding: 16 },
		exerciseTitleContainer: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 12,
		},
		exerciseDetailTitle: {
			fontSize: 24,
			fontWeight: 'bold',
			color: C.text,
			flex: 1,
			marginRight: 8,
		},
		exerciseImageContainer: {
			width: '100%',
			height: 240,
			position: 'relative',
			marginBottom: 20,
		},
		exerciseMainImage: { width: '100%', height: '100%', borderRadius: 12 },
		exerciseDetailDescriptionFull: {
			fontSize: 15,
			color: C.text,
			lineHeight: 22,
			marginBottom: 20,
		},
		detailStats: { marginBottom: 24 },
		detailStat: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: C.card,
			padding: 12,
			borderRadius: 12,
			marginBottom: 8,
			borderWidth: 1,
			borderColor: C.border,
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
			color: C.textSecondary,
			marginBottom: 2,
		},
		detailStatValue: { fontSize: 13, fontWeight: '600', color: C.text },
		section: { marginBottom: 24 },
		sectionTitle: {
			fontSize: 18,
			fontWeight: 'bold',
			color: C.text,
			marginBottom: 16,
		},
		muscleGroupsGridDetail: {
			backgroundColor: C.card,
			borderRadius: 12,
			overflow: 'hidden',
			borderWidth: 1,
			borderColor: C.border,
		},
		muscleGroupItem: { padding: 16 },
		muscleGroupHeader: {
			flexDirection: 'row',
			alignItems: 'center',
			marginBottom: 12,
		},
		muscleGroupLabel: {
			fontSize: 14,
			fontWeight: '600',
			color: C.text,
			marginLeft: 8,
		},
		muscleItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
		muscleDot: {
			width: 8,
			height: 8,
			borderRadius: 4,
			backgroundColor: C.primary,
			marginRight: 12,
		},
		muscleText: { fontSize: 14, color: C.text, flex: 1 },
		muscleDotSecondary: {
			width: 8,
			height: 8,
			borderRadius: 4,
			backgroundColor: C.textSecondary,
			marginRight: 12,
		},
		muscleTextSecondary: { fontSize: 14, color: C.textSecondary, flex: 1 },
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
		tipsList: {
			backgroundColor: C.card,
			borderRadius: 12,
			overflow: 'hidden',
			borderWidth: 1,
			borderColor: C.border,
		},
		tipItem: { flexDirection: 'row', alignItems: 'flex-start', padding: 16 },
		tipNumber: {
			width: 24,
			height: 24,
			borderRadius: 12,
			backgroundColor: C.primary,
			alignItems: 'center',
			justifyContent: 'center',
			marginRight: 12,
			flexShrink: 0,
		},
		tipNumberText: { fontSize: 12, fontWeight: 'bold', color: '#000' },
		tipText: { fontSize: 14, color: C.text, flex: 1, lineHeight: 20 },

		spacer: { height: 32 },
	})
}
