import ManBackSvg from '@/components/man-back-svg'
import ManFrontSvg from '@/components/man-front-svg'
import { useLanguage } from '@/contexts/language-context'
import {
	manBackMuscleGroupParts,
	manFrontMuscleGroupParts,
} from '@/constants/images'
import { formatDate } from '@/scripts/database'
import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	Animated,
	Dimensions,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDatabase } from '../contexts/database-context'

const { width } = Dimensions.get('window')

const COLORS = {
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
} as const

const STATUS_COLORS = {
	recovered: '#34C759',
	recovering: '#FF9500',
	needs_rest: '#FF3B30',
	not_trained: '#3A3A3C',
} as const

const STATUS_BG = {
	recovered: 'rgba(52, 199, 89, 0.1)',
	recovering: 'rgba(255, 149, 0, 0.1)',
	needs_rest: 'rgba(255, 59, 48, 0.1)',
	not_trained: 'rgba(58, 58, 60, 0.3)',
} as const

const MUSCLE_IMAGE_TO_NAME_MAP: { [key: string]: string } = {
	leftPectoralisMajor: 'Грудь',
	rightPectoralisMajor: 'Грудь',
	leftPectoralisMinor: 'Грудь',
	rightPectoralisMinor: 'Грудь',
	rightSerratusAnterior: 'Грудь',
	leftSerratusAnterior: 'Грудь',
	upperAbs: 'Пресс',
	lowerAbs: 'Пресс',
	upperMiddleAbs: 'Пресс',
	lowerMiddleAbs: 'Пресс',
	leftExternalOblique: 'Пресс',
	rightExternalOblique: 'Пресс',
	leftInternalOblique: 'Пресс',
	rightInternalOblique: 'Пресс',
	leftTransversusAbdominis: 'Пресс',
	rightTransversusAbdominis: 'Пресс',
	leftLongBiceps: 'Бицепс',
	rightLongBiceps: 'Бицепс',
	leftShortBiceps: 'Бицепс',
	rightShortBiceps: 'Бицепс',
	leftFrontDeltoid: 'Плечи',
	rightFrontDeltoid: 'Плечи',
	leftMiddleDeltoid: 'Плечи',
	rightMiddleDeltoid: 'Плечи',
	leftRearDeltoid: 'Плечи',
	rightRearDeltoid: 'Плечи',
	leftUpperTrapezius: 'Трапеции',
	rightUpperTrapezius: 'Трапеции',
	leftLowerTrapezius: 'Трапеции',
	rightLowerTrapezius: 'Трапеции',
	leftVastusLateralis: 'Ноги',
	rightVastusLateralis: 'Ноги',
	leftVastusMedialis: 'Ноги',
	rightVastusMedialis: 'Ноги',
	leftVastusInternedius: 'Ноги',
	rightVastusInternedius: 'Ноги',
	leftGastrocnemius: 'Ноги',
	rightGastrocnemius: 'Ноги',
	leftTibialisAnterior: 'Ноги',
	rightTibialisAnterior: 'Ноги',
	leftBiceosFemoris: 'Ноги',
	rightBiceosFemoris: 'Ноги',
	leftSemitendinosus: 'Ноги',
	rightSemitendinosus: 'Ноги',
	leftGluteusMaximus: 'Ягодицы',
	rightGluteusMaximus: 'Ягодицы',
	leftGluteusMedius: 'Ягодицы',
	rightGluteusMedius: 'Ягодицы',
	leftIntraspinatus: 'Спина',
	rightIntraspinatus: 'Спина',
	leftLatissimusDorsi: 'Спина',
	rightLatissimusDorsi: 'Спина',
	leftThoracolumbarFascia: 'Спина',
	rightThoracolumbarFascia: 'Спина',
	rightExtensorDigitorum: 'Предплечья',
	leftExtensorDigitorum: 'Предплечья',
	rightExtensorCarpiUharis: 'Предплечья',
	leftExtensorCarpiUharis: 'Предплечья',
	rightExtensorCarpiRadialis: 'Предплечья',
	leftExtensorCarpiRadialis: 'Предплечья',
	leftFlexorDigitorumProfundus: 'Предплечья',
	leftFlexorPollicisLongus: 'Предплечья',
	rightFlexorDigitorumProfundus: 'Предплечья',
	rightFlexorPollicisLongus: 'Предплечья',
	leftTriceps: 'Трицепс',
	rightTriceps: 'Трицепс',
	leftScalenes: 'Шея',
	rightScalenes: 'Шея',
}

const MUSCLE_FRONT_CONFIG = [
	{
		id: '1',
		name: 'Грудь',
		position: { left: '-100%', top: '-150%' },
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
		position: { left: '-100%', top: '-210%' },
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
		name: 'Бицепс',
		position: { left: '-70%', top: '-180%' },
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
		name: 'Плечи',
		position: { left: '-70%', top: '-160%' },
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
		name: 'Трапеции',
		position: { left: '-100%', top: '-150%' },
		muscleImages: ['leftUpperTrapezius', 'rightUpperTrapezius'],
		icon: manFrontMuscleGroupParts.rectoralFull,
	},
	{
		id: '6',
		name: 'Ноги',
		position: { left: '-100%', top: '-260%' },
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
		id: '7',
		name: 'Предплечья',
		position: { left: '-100%', top: '-230%' },
		muscleImages: [
			'rightExtensorDigitorum',
			'leftExtensorDigitorum',
			'rightExtensorCarpiUharis',
			'leftExtensorCarpiUharis',
			'rightExtensorCarpiRadialis',
			'leftExtensorCarpiRadialis',
		],
		icon: manFrontMuscleGroupParts.forearmFull,
	},
	{
		id: '8',
		name: 'Шея',
		position: { left: '-100%', top: '-150%' },
		muscleImages: ['leftScalenes', 'rightScalenes'],
		icon: manFrontMuscleGroupParts.rectoralFull,
	},
]

const MUSCLE_BACK_CONFIG = [
	{
		id: '1',
		name: 'Ноги',
		position: { left: '-100%', top: '-280%' },
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
		position: { left: '-100%', top: '-220%' },
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
		position: { left: '-100%', top: '-240%' },
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
		position: { left: '-100%', top: '-180%' },
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
		position: { left: '-100%', top: '-150%' },
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
		position: { left: '-70%', top: '-150%' },
		muscleImages: ['leftRearDeltoid', 'rightRearDeltoid'],
		icon: manBackMuscleGroupParts.upperLegFull,
	},
	{
		id: '7',
		name: 'Трицепс',
		position: { left: '-100%', top: '-200%' },
		muscleImages: ['leftTriceps', 'rightTriceps'],
		icon: manBackMuscleGroupParts.triceps,
	},
]

// ─────────────────────────────────────────────
// Shimmer
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// FadeIn
// ─────────────────────────────────────────────
const FadeIn = ({
	show,
	children,
}: {
	show: boolean
	children: React.ReactNode
}) => {
	const anim = useRef(new Animated.Value(0)).current
	useEffect(() => {
		if (show) {
			Animated.timing(anim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}).start()
		}
	}, [show])
	return (
		<Animated.View style={{ opacity: anim, flexGrow: 1 }}>
			{children}
		</Animated.View>
	)
}

// ─────────────────────────────────────────────
// Скелетоны
// ─────────────────────────────────────────────
const StatCardSkeleton = () => (
	<View
		style={[
			styles.statCard,
			{
				flex: 1,
				backgroundColor: COLORS.cardLight + '44',
				borderColor: COLORS.border,
			},
		]}
	>
		<ShimmerBlock
			style={{
				height: 28,
				width: 36,
				borderRadius: 6,
				backgroundColor: COLORS.cardLight,
				marginBottom: 6,
			}}
		/>
		<ShimmerBlock
			style={{
				height: 12,
				width: 44,
				borderRadius: 4,
				backgroundColor: COLORS.cardLight,
			}}
		/>
	</View>
)

const DiagramSkeleton = () => (
	<View style={[styles.diagramCard, { gap: 16 }]}>
		<ShimmerBlock
			style={{
				height: 20,
				width: 120,
				borderRadius: 6,
				backgroundColor: COLORS.cardLight,
				alignSelf: 'flex-start',
			}}
		/>
		<View style={styles.svgRow}>
			<View style={styles.svgHalf}>
				<ShimmerBlock
					style={{
						width: '75%',
						height: 380,
						borderRadius: 16,
						backgroundColor: COLORS.cardLight,
					}}
				/>
			</View>
			<View style={styles.svgDivider} />
			<View style={styles.svgHalf}>
				<ShimmerBlock
					style={{
						width: '75%',
						height: 380,
						borderRadius: 16,
						backgroundColor: COLORS.cardLight,
					}}
				/>
			</View>
		</View>
		<View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
			{[100, 130, 80].map((w, i) => (
				<ShimmerBlock
					key={i}
					style={{
						height: 28,
						width: w,
						borderRadius: 20,
						backgroundColor: COLORS.cardLight,
					}}
				/>
			))}
		</View>
	</View>
)

const MuscleCardSkeleton = () => (
	<View style={[styles.muscleCard, { marginBottom: 6 }]}>
		<View
			style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 12 }}
		>
			<ShimmerBlock
				style={[styles.cardIconWrap, { backgroundColor: COLORS.cardLight }]}
			/>
		</View>
		<View style={styles.cardBody}>
			<ShimmerBlock
				style={{
					height: 15,
					width: 80,
					borderRadius: 4,
					backgroundColor: COLORS.cardLight,
					marginBottom: 6,
				}}
			/>
			<ShimmerBlock
				style={{
					height: 12,
					width: 110,
					borderRadius: 4,
					backgroundColor: COLORS.cardLight,
				}}
			/>
		</View>
		<ShimmerBlock
			style={{
				height: 32,
				width: 58,
				borderRadius: 10,
				backgroundColor: COLORS.cardLight,
			}}
		/>
	</View>
)

// ─────────────────────────────────────────────
// Разделитель секций
// ─────────────────────────────────────────────
const SectionLabel = ({ label }: { label: string }) => (
	<View style={styles.sectionLabelRow}>
		<View style={styles.sectionLabelLine} />
		<Text style={styles.sectionLabelText}>{label}</Text>
		<View style={styles.sectionLabelLine} />
	</View>
)

// ─────────────────────────────────────────────
// Дата последней тренировки (с переводом)
// ─────────────────────────────────────────────
const MuscleCardDate = ({ lastTrained }: { lastTrained: string }) => {
	const { t } = useLanguage()
	const noDataLabel = t('recovery', 'noData')
	return (
		<Text style={styles.cardDate} numberOfLines={1}>
			{lastTrained && lastTrained !== 'Нет данных' && lastTrained !== noDataLabel
				? `${t('recovery', 'lastTrained')} ${lastTrained}`
				: noDataLabel}
		</Text>
	)
}

// ─────────────────────────────────────────────
// Карточка мышцы
// ─────────────────────────────────────────────
type MuscleConfig = (typeof MUSCLE_FRONT_CONFIG)[0]

type MuscleCardProps = {
	muscle: MuscleConfig
	side: 'front' | 'back'
	isSelected: boolean
	liveStats: { status: string; recovery: number; lastTrained: string }
	allFrontImages: string[]
	allBackImages: string[]
}

const MuscleCard = ({
	muscle,
	side,
	isSelected,
	liveStats,
	allFrontImages,
	allBackImages,
}: MuscleCardProps) => {
	const liveColor =
		STATUS_COLORS[liveStats.status as keyof typeof STATUS_COLORS] ??
		STATUS_COLORS.not_trained
	const liveBg =
		STATUS_BG[liveStats.status as keyof typeof STATUS_BG] ??
		STATUS_BG.not_trained

	const allImages = side === 'front' ? allFrontImages : allBackImages
	const svgColors: { [key: string]: string } = {}
	allImages.forEach(key => {
		svgColors[key] = 'rgba(58,58,60,0.25)'
	})
	muscle.muscleImages.forEach(key => {
		svgColors[key] = liveColor
	})

	const { t } = useLanguage()
	const MUSCLE_NAME_KEYS: Record<string, string> = {
		'Грудь': 'chestLabel', 'Пресс': 'waistLabel', 'Бицепс': 'bicepsLabel',
		'Плечи': 'neckLabel', 'Трапеции': 'thighLabel', 'Ноги': 'hipsLabel',
		'Предплечья': 'calfLabel', 'Шея': 'neckLabel', 'Ягодицы': 'hipsLabel',
		'Спина': 'bodyFatLabel', 'Трицепс': 'bicepsLabel',
	}
	const muscleName = MUSCLE_NAME_KEYS[muscle.name]
		? t('measurements', MUSCLE_NAME_KEYS[muscle.name] as any)
		: muscle.name

	return (
		<TouchableOpacity
			style={[
				styles.muscleCard,
				isSelected && { borderColor: liveColor, backgroundColor: liveBg },
			]}
			activeOpacity={0.7}
		>
			<View
				style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 12 }}
			>
				<View style={[styles.cardIconWrap, { backgroundColor: COLORS.card }]}>
					<View
						style={{
							...styles.cardSvgContainer,
							position: 'absolute',
							left: muscle.position.left as any,
							top: muscle.position.top as any,
						}}
						pointerEvents='none'
					>
						{side === 'front' ? (
							<ManFrontSvg height={300} width={150} muscleColors={svgColors} />
						) : (
							<ManBackSvg height={300} width={150} muscleColors={svgColors} />
						)}
					</View>
				</View>
			</View>

		<View style={styles.cardBody}>
		<Text style={styles.cardName}>{muscleName}</Text>
			<MuscleCardDate lastTrained={liveStats.lastTrained} />
		</View>

			<View style={[styles.cardBadge, { backgroundColor: liveBg }]}>
				<View style={[styles.cardBadgeDot, { backgroundColor: liveColor }]} />
				<Text style={[styles.cardBadgeText, { color: liveColor }]}>
					{liveStats.recovery}%
				</Text>
			</View>
		</TouchableOpacity>
	)
}

// ─────────────────────────────────────────────
// Основной компонент
// ─────────────────────────────────────────────
export default function RecoveryTab() {
	const [muscleSide, setMuscleSide] = useState<string | null>(null)
	const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)
	const { t } = useLanguage()

	const { recoveryData, refreshRecoveryWithRecalc } = useDatabase()

	const hasData = recoveryData.length > 0

	// Stale-while-revalidate: если данные уже есть — обновляем тихо без скелетонов
	useFocusEffect(
		useCallback(() => {
			if (!hasData) {
				setLoading(true)
			}
			refreshRecoveryWithRecalc()
		}, [hasData]),
	)

	// Убираем скелетон как только данные появились — плавно
	useEffect(() => {
		if (hasData && loading) {
			const timer = setTimeout(() => setLoading(false), 300)
			return () => clearTimeout(timer)
		}
	}, [hasData, loading])

	const getMuscleGroupStats = useCallback(
		(
			muscleImages: string[],
			muscleName: string,
		): { status: string; recovery: number; lastTrained: string } => {
			const matchedById = muscleImages
				.map(imgKey =>
					recoveryData.find(
						r => r.muscle_id?.toLowerCase() === imgKey.toLowerCase(),
					),
				)
				.filter(Boolean) as typeof recoveryData

			const matched =
				matchedById.length > 0
					? matchedById
					: recoveryData.filter(
							r => r.muscle_name?.toLowerCase() === muscleName.toLowerCase(),
						)

		if (matched.length === 0)
			return { status: 'not_trained', recovery: 0, lastTrained: t('recovery', 'noData') }

			const avgRecovery = Math.round(
				matched.reduce((sum, r) => sum + (r.recovery ?? 0), 0) / matched.length,
			)
			const hasRest = matched.some(r => r.status === 'needs_rest')
			const allRecovered = matched.every(r => r.status === 'recovered')
			const status = hasRest
				? 'needs_rest'
				: allRecovered
					? 'recovered'
					: 'recovering'

			const lastDates = matched
				.map(r => r.last_trained)
				.filter(Boolean) as string[]
			const lastTrained =
				lastDates.length > 0
					? formatDate(lastDates.sort().reverse()[0])
				: t('recovery', 'noData')

		return { status, recovery: avgRecovery, lastTrained }
		},
		[recoveryData],
	)

	const frontDataWithStats = useMemo(
		() =>
			MUSCLE_FRONT_CONFIG.map(m => ({
				...m,
				stats: getMuscleGroupStats(m.muscleImages, m.name),
			})),
		[getMuscleGroupStats],
	)

	const backDataWithStats = useMemo(
		() =>
			MUSCLE_BACK_CONFIG.map(m => ({
				...m,
				stats: getMuscleGroupStats(m.muscleImages, m.name),
			})),
		[getMuscleGroupStats],
	)

	const allFrontImages = useMemo(
		() => MUSCLE_FRONT_CONFIG.flatMap(m => m.muscleImages),
		[],
	)
	const allBackImages = useMemo(
		() => MUSCLE_BACK_CONFIG.flatMap(m => m.muscleImages),
		[],
	)

	const getColorByStatus = useCallback(
		(status: string | undefined, opacity: number = 1): string => {
			const baseColor = (() => {
				switch (status) {
					case 'recovered':
						return STATUS_COLORS.recovered
					case 'recovering':
						return STATUS_COLORS.recovering
					case 'needs_rest':
						return STATUS_COLORS.needs_rest
					default:
						return STATUS_COLORS.not_trained
				}
			})()
			if (opacity >= 1) return baseColor
			const hex = baseColor.replace('#', '')
			const r = parseInt(hex.substring(0, 2), 16)
			const g = parseInt(hex.substring(2, 4), 16)
			const b = parseInt(hex.substring(4, 6), 16)
			return `rgba(${r}, ${g}, ${b}, ${opacity})`
		},
		[],
	)

	const getFrontMuscleColors = useCallback(() => {
		const muscleColors: { [key: string]: string } = {}
		MUSCLE_FRONT_CONFIG.forEach(muscle => {
			muscle.muscleImages.forEach(imageKey => {
				const record = recoveryData.find(
					r => r.muscle_id.toLowerCase() === imageKey.toLowerCase(),
				)
				let opacity = 0.7
				if (selectedMuscle && muscleSide === 'front')
					opacity = selectedMuscle === muscle.id ? 0.9 : 0.2
				muscleColors[imageKey] = getColorByStatus(record?.status, opacity)
			})
		})
		return muscleColors
	}, [recoveryData, selectedMuscle, muscleSide, getColorByStatus])

	const getBackMuscleColors = useCallback(() => {
		const muscleColors: { [key: string]: string } = {}
		MUSCLE_BACK_CONFIG.forEach(muscle => {
			muscle.muscleImages.forEach(imageKey => {
				const record = recoveryData.find(
					r => r.muscle_id.toLowerCase() === imageKey.toLowerCase(),
				)
				let opacity = 0.7
				if (selectedMuscle && muscleSide === 'back')
					opacity = selectedMuscle === muscle.id ? 0.9 : 0.2
				muscleColors[imageKey] = getColorByStatus(record?.status, opacity)
			})
		})
		return muscleColors
	}, [recoveryData, selectedMuscle, muscleSide, getColorByStatus])

	const handleMuscleSelect = (muscleId: string, type: string) => {
		setMuscleSide(type)
		setSelectedMuscle(selectedMuscle === muscleId ? null : muscleId)
	}

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 16 }}
			>
				{/* Header — всегда виден, пилюля меняется на скелетон во время загрузки */}
				<View style={styles.header}>
					<View>
						<Text style={styles.title}>{t('recovery', 'title')}</Text>
						<Text style={styles.subtitle}>{t('recovery', 'subtitle')}</Text>
					</View>
					{loading ? (
						<ShimmerBlock
							style={{
								height: 34,
								width: 80,
								borderRadius: 20,
								backgroundColor: COLORS.cardLight,
							}}
						/>
					) : (
						<FadeIn show={!loading}>
							<View
								style={{
									...styles.headerPill,
									alignSelf: 'flex-end',
									width: 100,
								}}
							>
								<View
									style={[
										styles.pillDot,
										{ backgroundColor: STATUS_COLORS.recovered },
									]}
								/>
								<Text style={styles.pillText}>
									{recoveryData.filter(r => r.status === 'recovered').length}{' '}
									{t('recovery', 'ready')}
								</Text>
							</View>
						</FadeIn>
					)}
				</View>

				{/* Quick stats */}
				<View style={styles.statsRow}>
					{loading ? (
						<>
							<StatCardSkeleton />
							<StatCardSkeleton />
							<StatCardSkeleton />
						</>
					) : (
						<View style={{ width: '100%' }}>
							<View
								style={{
									flexDirection: 'row',
									width: '100%',
									gap: 10,
									flex: 1,
								}}
							>
								{[
									{ status: 'recovered', labelKey: 'ready' as const },
									{ status: 'recovering', labelKey: 'recovering' as const },
									{ status: 'needs_rest', labelKey: 'rest' as const },
								].map(({ status, labelKey }) => {
									const label = t('recovery', labelKey)
									if (loading) return <StatCardSkeleton key={status} />

									const count = recoveryData.filter(
										r => r.status === status,
									).length
									const color =
										STATUS_COLORS[status as keyof typeof STATUS_COLORS]
									const bg = STATUS_BG[status as keyof typeof STATUS_BG]
									return (
										<FadeIn key={status} show={!loading}>
											<View
												style={[
													styles.statCard,
													{
														backgroundColor: bg,
														flexGrow: 1,
														borderColor: color + '55',
													},
												]}
											>
												<Text style={[styles.statCount, { color }]}>
													{count}
												</Text>
												<Text style={styles.statLabel}>{label}</Text>
											</View>
										</FadeIn>
									)
								})}
							</View>
						</View>
					)}
				</View>

							{/* Diagram + lists */}
				<View style={styles.modelSection}>
					{loading ? (
						<>
							<DiagramSkeleton />
							<View style={styles.listsCard}>
								<SectionLabel label={t('recovery', 'frontMuscles')} />
								{[1, 2, 3, 4].map(i => (
									<MuscleCardSkeleton key={`f${i}`} />
								))}
								<SectionLabel label={t('recovery', 'backMuscles')} />
								{[1, 2, 3].map(i => (
									<MuscleCardSkeleton key={`b${i}`} />
								))}
							</View>
						</>
					) : (
						<FadeIn show={!loading}>
							<View style={styles.diagramCard}>
								<Text style={styles.diagramTitle}>{t('recovery', 'muscleStatus')}</Text>

								<View style={styles.svgRow}>
									<View style={styles.svgHalf}>
										<ManBackSvg muscleColors={getBackMuscleColors()} />
									</View>
									<View style={styles.svgDivider} />
									<View style={styles.svgHalf}>
										<ManFrontSvg muscleColors={getFrontMuscleColors()} />
									</View>
								</View>

								<View style={styles.legendRow}>
									{[
										{ color: STATUS_COLORS.recovered, label: t('recovery', 'legendRecovered') },
										{ color: STATUS_COLORS.recovering, label: t('recovery', 'legendRecovering') },
										{ color: STATUS_COLORS.needs_rest, label: t('recovery', 'legendRest') },
									].map(({ color, label }) => (
										<View key={label} style={styles.legendItem}>
											<View
												style={[styles.legendDot, { backgroundColor: color }]}
											/>
											<Text style={styles.legendText}>{label}</Text>
										</View>
									))}
								</View>

								{selectedMuscle && (
									<TouchableOpacity
										style={styles.resetBtn}
										onPress={() => setSelectedMuscle(null)}
									>
										<Text style={styles.resetBtnText}>{t('recovery', 'showAll')}</Text>
									</TouchableOpacity>
								)}
							</View>

							<View style={styles.listsCard}>
								<SectionLabel label={t('recovery', 'frontMuscles')} />
								{frontDataWithStats.map(m => (
									<MuscleCard
										key={m.id}
										muscle={m}
										side='front'
										isSelected={
											selectedMuscle === m.id && muscleSide === 'front'
										}
										liveStats={m.stats}
										allFrontImages={allFrontImages}
										allBackImages={allBackImages}
									/>
								))}
								<SectionLabel label={t('recovery', 'backMuscles')} />
								{backDataWithStats.map(m => (
									<MuscleCard
										key={m.id}
										muscle={m}
										side='back'
										isSelected={
											selectedMuscle === m.id && muscleSide === 'back'
										}
										liveStats={m.stats}
										allFrontImages={allFrontImages}
										allBackImages={allBackImages}
									/>
								))}
							</View>
						</FadeIn>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#121212', paddingBottom: -40 },
	cardSvgContainer: { width: 180, height: 480 },

	// Header
	header: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 8,
		paddingTop: 20,
		paddingBottom: 8,
	},
	title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
	subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
	headerPill: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(52, 199, 89, 0.1)',
		borderRadius: 20,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderWidth: 1,
		borderColor: 'rgba(52, 199, 89, 0.2)',
		gap: 6,
	},
	pillDot: { width: 7, height: 7, borderRadius: 3.5 },
	pillText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

	// Stats row
	statsRow: {
		flexDirection: 'row',
		paddingHorizontal: 8,
		gap: 10,
		marginTop: 16,
	},
	statCard: {
		flex: 1,
		borderRadius: 16,
		paddingVertical: 16,
		alignItems: 'center',
		borderWidth: 1,
	},
	statCount: { fontSize: 24, fontWeight: 'bold' },
	statLabel: {
		fontSize: 12,
		color: COLORS.textSecondary,
		marginTop: 2,
		fontWeight: '500',
	},

	// Layout
	modelSection: { marginTop: 20, paddingHorizontal: 8, gap: 12 },

	// Diagram card
	diagramCard: {
		backgroundColor: COLORS.card,
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
		alignItems: 'center',
	},
	diagramTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: COLORS.text,
		alignSelf: 'flex-start',
		marginBottom: 16,
	},
	svgRow: { flexDirection: 'row', width: '100%', marginBottom: 16 },
	svgHalf: {
		flex: 1,
		alignItems: 'center',
		height: 440,
		justifyContent: 'center',
	},
	svgLabel: {
		fontSize: 11,
		color: COLORS.textSecondary,
		fontWeight: '600',
		letterSpacing: 0.8,
		textTransform: 'uppercase',
		marginBottom: 8,
	},
	svgDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: 20 },

	// Legend
	legendRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		gap: 8,
		width: '100%',
		marginBottom: 8,
	},
	legendItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: COLORS.cardLight,
		borderRadius: 20,
		paddingHorizontal: 10,
		paddingVertical: 5,
	},
	legendDot: { width: 8, height: 8, borderRadius: 4 },
	legendText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500' },

	// Reset button
	resetBtn: {
		marginTop: 10,
		paddingVertical: 10,
		paddingHorizontal: 20,
		backgroundColor: COLORS.cardLight,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: 'rgba(52, 199, 89, 0.3)',
	},
	resetBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },

	// Lists card
	listsCard: { gap: 4 },

	// Section label
	sectionLabelRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		marginVertical: 12,
	},
	sectionLabelLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
	sectionLabelText: {
		fontSize: 11,
		color: COLORS.textSecondary,
		fontWeight: '700',
		letterSpacing: 1.2,
		textTransform: 'uppercase',
	},

	// Muscle card
	muscleCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.card,
		borderRadius: 14,
		padding: 12,
		borderWidth: 1,
		borderColor: COLORS.border,
		marginBottom: 6,
		gap: 18,
	},
	cardIconWrap: {
		width: 50,
		height: 50,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
	},
	cardIcon: { width: '160%', height: '160%' },
	cardBody: { flex: 1, gap: 3 },
	cardName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
	cardDate: { fontSize: 12, color: COLORS.textSecondary },
	cardBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
		borderRadius: 10,
		paddingHorizontal: 10,
		paddingVertical: 6,
	},
	cardBadgeDot: { width: 6, height: 6, borderRadius: 3 },
	cardBadgeText: { fontSize: 13, fontWeight: '700' },

	// Unused legacy
	fullPageLoader: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#121212',
	},
	loadingSpinner: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: '#121212',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 20,
	},
	loadingText: { fontSize: 16, color: COLORS.textSecondary },
	skeletonText: { backgroundColor: COLORS.cardLight, borderRadius: 4 },
	skeletonModel: { backgroundColor: COLORS.cardLight, borderRadius: 12 },
})
