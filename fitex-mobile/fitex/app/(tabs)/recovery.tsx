import ManBackSvg from '@/components/man-back-svg'
import ManFrontSvg from '@/components/man-front-svg'
import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import type { AppColors } from '@/constants/app-theme'
import { translateGroupName } from '@/constants/exercise-i18n'
import {
	manBackMuscleGroupParts,
	manFrontMuscleGroupParts,
} from '@/constants/images'
import { Language } from '@/locales'
import { dateLocaleFor } from '@/locales'
import {
	DEFAULT_RECOVERY_SETTINGS,
	getRecoveryHoursForGroup,
	hoursUntilRecoveryTarget,
	loadRecoverySettings,
	statusFromRecoveryPct,
	type RecoverySettings,
} from '@/services/recovery-settings'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState, Fragment } from 'react'
import {
	Animated,
	Dimensions,
	LayoutChangeEvent,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import Svg, { Circle, Polyline } from 'react-native-svg'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../contexts/auth-context'
import { useDatabase } from '../contexts/database-context'

const { width } = Dimensions.get('window')

/** Same viewBox as ManFrontSvg / ManBackSvg */
const BODY_VB = { minX: -100, minY: -100, w: 800, h: 1200 } as const

/**
 * Callout origins in SVG user units (viewBox space), on the outer
 * side of each group so the line leaves the muscle correctly.
 * Front → labels on the right → prefer higher-x (person's left).
 * Back → labels on the left → prefer lower-x (person's left).
 */
const FRONT_CALLOUT_SVG: Record<string, { x: number; y: number }> = {
	Шея: { x: 296, y: 210 },
	Трапеции: { x: 296, y: 228 },
	Плечи: { x: 385, y: 250 },
	Грудь: { x: 319, y: 268 },
	Бицепс: { x: 401, y: 315 },
	Пресс: { x: 300, y: 365 },
	Предплечья: { x: 415, y: 420 },
	Ноги: { x: 350, y: 520 },
}

const BACK_CALLOUT_SVG: Record<string, { x: number; y: number }> = {
	Трапеции: { x: 300, y: 200 },
	Плечи: { x: 227, y: 248 },
	Трицепс: { x: 199, y: 315 },
	Спина: { x: 246, y: 315 },
	Предплечья: { x: 175, y: 415 },
	Ягодицы: { x: 280, y: 455 },
	Ноги: { x: 255, y: 555 },
}

type RecoveryCalloutItem = {
	id: string
	name: string
	recovery: number
	status: string
	color: string
}

function svgPointToStage(
	svgX: number,
	svgY: number,
	svgLeft: number,
	svgTop: number,
	dispW: number,
	dispH: number,
) {
	return {
		x: svgLeft + ((svgX - BODY_VB.minX) / BODY_VB.w) * dispW,
		y: svgTop + ((svgY - BODY_VB.minY) / BODY_VB.h) * dispH,
	}
}

const STATUS_COLORS_FIXED = {
	recovered: '#34C759',
	recovering: '#FF9500',
	needs_rest: '#FF3B30',
} as const

const STATUS_BG_FIXED = {
	recovered: 'rgba(52, 199, 89, 0.1)',
	recovering: 'rgba(255, 149, 0, 0.1)',
	needs_rest: 'rgba(255, 59, 48, 0.1)',
} as const

function statusColors(colors: AppColors) {
	return {
		...STATUS_COLORS_FIXED,
		not_trained: colors.border,
	}
}

function statusBg(colors: AppColors) {
	return {
		...STATUS_BG_FIXED,
		not_trained: colors.track,
	}
}

/** Recovery body groups → top-level names stored on workouts */
const RECOVERY_TO_HISTORY_FILTER: Record<string, string> = {
	Грудь: 'Грудь',
	Пресс: 'Пресс',
	Бицепс: 'Руки',
	Трицепс: 'Руки',
	Предплечья: 'Руки',
	Плечи: 'Дельты',
	Трапеции: 'Спина',
	Ноги: 'Ноги',
	Ягодицы: 'Ноги',
	Спина: 'Спина',
	Шея: 'Дельты',
}

const formatRecoveryLastTrained = (
	dateString: string,
	language: Language,
	todayLabel: string,
	yesterdayLabel: string,
): string => {
	try {
		const date = new Date(dateString)
		const today = new Date()
		const yesterday = new Date(today)
		yesterday.setDate(yesterday.getDate() - 1)

		if (date.toDateString() === today.toDateString()) return todayLabel
		if (date.toDateString() === yesterday.toDateString()) return yesterdayLabel

		return date.toLocaleDateString(dateLocaleFor(language), {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		})
	} catch {
		return dateString
	}
}

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
const StatCardSkeleton = () => {
	const { colors } = useAppTheme()
	const styles = useMemo(() => makeStyles(colors), [colors])
	return (
		<View
			style={[
				styles.statCard,
				{
					flex: 1,
					backgroundColor: colors.cardLight + '44',
					borderColor: colors.border,
				},
			]}
		>
			<ShimmerBlock
				style={{
					height: 28,
					width: 36,
					borderRadius: 6,
					backgroundColor: colors.cardLight,
					marginBottom: 6,
				}}
			/>
			<ShimmerBlock
				style={{
					height: 12,
					width: 44,
					borderRadius: 4,
					backgroundColor: colors.cardLight,
				}}
			/>
		</View>
	)
}

const DiagramSkeleton = () => {
	const { colors } = useAppTheme()
	const styles = useMemo(() => makeStyles(colors), [colors])
	return (
		<View style={[styles.diagramCard, { gap: 16 }]}>
			<ShimmerBlock
				style={{
					height: 20,
					width: 120,
					borderRadius: 6,
					backgroundColor: colors.cardLight,
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
							backgroundColor: colors.cardLight,
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
							backgroundColor: colors.cardLight,
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
							backgroundColor: colors.cardLight,
						}}
					/>
				))}
			</View>
		</View>
	)
}

const MuscleCardSkeleton = () => {
	const { colors } = useAppTheme()
	const styles = useMemo(() => makeStyles(colors), [colors])
	return (
		<View style={[styles.muscleCard, { marginBottom: 6 }]}>
			<View
				style={{
					borderWidth: 1,
					borderColor: colors.border,
					borderRadius: 12,
				}}
			>
				<ShimmerBlock
					style={[
						styles.cardIconWrap,
						{ backgroundColor: colors.cardLight },
					]}
				/>
			</View>
			<View style={styles.cardBody}>
				<ShimmerBlock
					style={{
						height: 15,
						width: 80,
						borderRadius: 4,
						backgroundColor: colors.cardLight,
						marginBottom: 6,
					}}
				/>
				<ShimmerBlock
					style={{
						height: 12,
						width: 110,
						borderRadius: 4,
						backgroundColor: colors.cardLight,
					}}
				/>
			</View>
			<ShimmerBlock
				style={{
					height: 32,
					width: 58,
					borderRadius: 10,
					backgroundColor: colors.cardLight,
				}}
			/>
		</View>
	)
}

// ─────────────────────────────────────────────
// Разделитель секций
// ─────────────────────────────────────────────
const SectionLabel = ({ label }: { label: string }) => {
	const { colors } = useAppTheme()
	const styles = useMemo(() => makeStyles(colors), [colors])
	return (
		<View style={styles.sectionLabelRow}>
			<View style={styles.sectionLabelLine} />
			<Text style={styles.sectionLabelText}>{label}</Text>
			<View style={styles.sectionLabelLine} />
		</View>
	)
}

function layoutRecoveryCallouts(
	items: RecoveryCalloutItem[],
	side: 'front' | 'back',
	stageW: number,
	stageH: number,
	svgBox: { x: number; y: number; w: number; h: number },
) {
	if (svgBox.w <= 0 || svgBox.h <= 0) return []

	const anchors = side === 'front' ? FRONT_CALLOUT_SVG : BACK_CALLOUT_SVG
	const badgeW = 44
	const labelEdgeX = side === 'front' ? stageW - 4 : 4

	const active = items
		.filter(i => i.status === 'recovering' || i.status === 'needs_rest')
		.map(i => {
			const a = anchors[i.name] ?? { x: 300, y: 400 }
			const p = svgPointToStage(
				a.x,
				a.y,
				svgBox.x,
				svgBox.y,
				svgBox.w,
				svgBox.h,
			)
			return { ...i, ax: p.x, ay: p.y }
		})
		.sort((a, b) => a.ay - b.ay)

	if (active.length === 0) return []

	const minGap = 28
	const labels = active.map(p => ({ ...p, ly: p.ay }))
	for (let i = 1; i < labels.length; i++) {
		if (labels[i].ly - labels[i - 1].ly < minGap) {
			labels[i].ly = labels[i - 1].ly + minGap
		}
	}
	const overflow = labels[labels.length - 1].ly - (stageH - 14)
	if (overflow > 0) {
		for (const l of labels) l.ly -= overflow
	}
	if (labels[0].ly < 14) {
		const shift = 14 - labels[0].ly
		for (const l of labels) l.ly += shift
	}

	return labels.map(l => {
		const lx =
			side === 'front' ? labelEdgeX - badgeW / 2 : labelEdgeX + badgeW / 2
		const elbowX =
			side === 'front'
				? Math.min(l.ax + 14, lx - 14)
				: Math.max(l.ax - 14, lx + 14)
		return {
			id: l.id,
			color: l.color,
			pct: l.recovery,
			ax: l.ax,
			ay: l.ay,
			lx,
			ly: l.ly,
			elbowX,
			points: `${l.ax},${l.ay} ${elbowX},${l.ay} ${elbowX},${l.ly} ${lx},${l.ly}`,
		}
	})
}

type RecoveryBodyMapProps = {
	side: 'front' | 'back'
	muscleColors: { [key: string]: string }
	callouts: RecoveryCalloutItem[]
}

const RecoveryBodyMap = ({
	side,
	muscleColors,
	callouts,
}: RecoveryBodyMapProps) => {
	const { colors } = useAppTheme()
	const styles = useMemo(() => makeStyles(colors), [colors])
	const [stage, setStage] = useState({ w: 0, h: 440 })
	const [svgSize, setSvgSize] = useState({ w: 0, h: 0 })

	const onStageLayout = (e: LayoutChangeEvent) => {
		const { width: w, height: h } = e.nativeEvent.layout
		if (w !== stage.w || h !== stage.h) setStage({ w, h })
	}

	const onSvgLayout = (e: LayoutChangeEvent) => {
		const { width: w, height: h } = e.nativeEvent.layout
		if (w !== svgSize.w || h !== svgSize.h) setSvgSize({ w, h })
	}

	const svgBox = useMemo(
		() => ({
			x: (stage.w - svgSize.w) / 2,
			y: (stage.h - svgSize.h) / 2,
			w: svgSize.w,
			h: svgSize.h,
		}),
		[stage.w, stage.h, svgSize.w, svgSize.h],
	)

	const laidOut = useMemo(
		() =>
			stage.w > 0 && svgBox.w > 0
				? layoutRecoveryCallouts(callouts, side, stage.w, stage.h, svgBox)
				: [],
		[callouts, side, stage.w, stage.h, svgBox],
	)

	return (
		<View style={styles.bodyMapStage} onLayout={onStageLayout}>
			{/* Full-size body SVG — same as before callouts (default 450×600) */}
			<View style={styles.bodyMapSvgWrap} pointerEvents='none'>
				<View onLayout={onSvgLayout}>
					{side === 'front' ? (
						<ManFrontSvg muscleColors={muscleColors} />
					) : (
						<ManBackSvg muscleColors={muscleColors} />
					)}
				</View>
			</View>

			{laidOut.length > 0 ? (
				<>
					<Svg
						width={stage.w}
						height={stage.h}
						style={StyleSheet.absoluteFill}
						pointerEvents='none'
					>
						{laidOut.map(c => (
							<Fragment key={`line-${c.id}`}>
								<Polyline
									points={c.points}
									fill='none'
									stroke={c.color}
									strokeWidth={1.5}
									strokeLinecap='round'
									strokeLinejoin='round'
									opacity={0.9}
								/>
								<Circle cx={c.ax} cy={c.ay} r={3.5} fill={c.color} />
							</Fragment>
						))}
					</Svg>
					{laidOut.map(c => (
						<View
							key={`badge-${c.id}`}
							pointerEvents='none'
							style={[
								styles.calloutBadge,
								{
									left: c.lx - 22,
									top: c.ly - 11,
									borderColor: c.color,
									backgroundColor: colors.card,
								},
							]}
						>
							<Text style={[styles.calloutBadgeText, { color: c.color }]}>
								{c.pct}%
							</Text>
						</View>
					))}
				</>
			) : null}
		</View>
	)
}

// ─────────────────────────────────────────────
// Дата последней тренировки (с переводом)
// ─────────────────────────────────────────────
const MuscleCardDate = ({ lastTrained }: { lastTrained: string }) => {
	const { colors } = useAppTheme()
	const styles = useMemo(() => makeStyles(colors), [colors])
	const { t } = useLanguage()
	const noDataLabel = t('recovery', 'noData')
	const isEmpty =
		!lastTrained ||
		lastTrained === noDataLabel ||
		lastTrained === 'Нет данных' ||
		lastTrained === 'No data'
	return (
		<Text style={styles.cardDate} numberOfLines={1}>
			{isEmpty
				? noDataLabel
				: `${t('recovery', 'lastTrained')} ${lastTrained}`}
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
	liveStats: {
		status: string
		recovery: number
		lastTrained: string
		recoveryHours: number
	}
	allFrontImages: string[]
	allBackImages: string[]
	onPress: () => void
}

const MuscleCard = ({
	muscle,
	side,
	isSelected,
	liveStats,
	allFrontImages,
	allBackImages,
	onPress,
}: MuscleCardProps) => {
	const { colors } = useAppTheme()
	const styles = useMemo(() => makeStyles(colors), [colors])
	const STATUS_COLORS = statusColors(colors)
	const STATUS_BG = statusBg(colors)
	const liveColor =
		STATUS_COLORS[liveStats.status as keyof typeof STATUS_COLORS] ??
		STATUS_COLORS.not_trained
	const liveBg =
		STATUS_BG[liveStats.status as keyof typeof STATUS_BG] ??
		STATUS_BG.not_trained

	const allImages = side === 'front' ? allFrontImages : allBackImages
	const svgColors: { [key: string]: string } = {}
	allImages.forEach(key => {
		svgColors[key] = colors.track
	})
	muscle.muscleImages.forEach(key => {
		svgColors[key] = liveColor
	})

	const { t, language } = useLanguage()
	const muscleName = translateGroupName(muscle.name, language ?? 'ru')

	const getTimeLeft = () => {
		if (liveStats.recovery >= 95) return t('recovery', 'fullyRecovered')
		const totalHours = hoursUntilRecoveryTarget(
			liveStats.recovery,
			liveStats.recoveryHours,
			95,
		)
		if (totalHours <= 0) return t('recovery', 'fullyRecovered')

		const h = t('recovery', 'hoursShort')
		const m = t('recovery', 'minutesShort')
		const d = t('recovery', 'daysShort')

		if (totalHours < 1) {
			const mins = Math.max(1, Math.round(totalHours * 60))
			return `${mins} ${m}`
		}
		const rounded = Math.round(totalHours)
		if (rounded < 24) return `${rounded} ${h}`

		const days = Math.floor(rounded / 24)
		const hours = rounded % 24
		if (hours > 0) return `${days} ${d} ${hours} ${h}`
		return `${days} ${d}`
	}

	return (
		<TouchableOpacity
			style={[
				styles.muscleCard,
				isSelected && { borderColor: liveColor, backgroundColor: liveBg },
			]}
			activeOpacity={0.7}
			onPress={onPress}
		>
			<View
				style={{
					borderWidth: 1,
					borderColor: colors.border,
					borderRadius: 12,
				}}
			>
				<View style={[styles.cardIconWrap, { backgroundColor: colors.card }]}>
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
				<Text
					style={[styles.cardTimeLeft, { color: liveColor }]}
					numberOfLines={1}
				>
					{liveStats.recovery < 95
						? `${t('recovery', 'timeLeft')}: ${getTimeLeft()}`
						: t('recovery', 'fullyRecovered')}
				</Text>
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
	const { colors } = useAppTheme()
	const styles = useMemo(() => makeStyles(colors), [colors])
	const STATUS_COLORS = useMemo(() => statusColors(colors), [colors])
	const STATUS_BG = useMemo(() => statusBg(colors), [colors])
	const [muscleSide, setMuscleSide] = useState<string | null>(null)
	const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)
	const [recoverySettings, setRecoverySettings] = useState<RecoverySettings>(
		DEFAULT_RECOVERY_SETTINGS,
	)
	const { t, language } = useLanguage()
	const { user } = useAuth()

	const { recoveryData, refreshRecoveryWithRecalc } = useDatabase()

	const hasData = recoveryData.length > 0

	// Stale-while-revalidate: если данные уже есть — обновляем тихо без скелетонов
	useFocusEffect(
		useCallback(() => {
			let cancelled = false
			void (async () => {
				if (!hasData) setLoading(true)
				const settings = await loadRecoverySettings()
				if (!cancelled) setRecoverySettings(settings)
				await refreshRecoveryWithRecalc()
				if (!cancelled && !hasData) setLoading(false)
			})()
			return () => {
				cancelled = true
			}
		}, [hasData, refreshRecoveryWithRecalc]),
	)

	// Убираем скелетон как только данные появились — плавно
	useEffect(() => {
		if (hasData && loading) {
			const timer = setTimeout(() => setLoading(false), 300)
			return () => clearTimeout(timer)
		}
	}, [hasData, loading])

	const bodyStatsSummary = useMemo(() => {
		if (!user) return null
		const parts: string[] = []
		if (user.heightCm != null && user.heightCm > 0)
			parts.push(`${user.heightCm} ${t('bodyProfile', 'cm')}`)
		if (user.weightKg != null && user.weightKg > 0)
			parts.push(`${user.weightKg} ${t('bodyProfile', 'kg')}`)
		if (user.age != null && user.age > 0)
			parts.push(`${user.age} ${t('bodyProfile', 'years')}`)
		return parts.length > 0 ? parts.join(' · ') : null
	}, [user, t])

	const getMuscleGroupStats = useCallback(
		(
			muscleImages: string[],
			muscleName: string,
		): {
			status: string
			recovery: number
			lastTrained: string
			recoveryHours: number
		} => {
			const recoveryHours = getRecoveryHoursForGroup(
				muscleName,
				recoverySettings,
			)
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
				return {
					status: 'not_trained',
					recovery: 0,
					lastTrained: t('recovery', 'noData'),
					recoveryHours,
				}

			const avgRecovery = Math.round(
				matched.reduce((sum, r) => sum + (r.recovery ?? 0), 0) / matched.length,
			)
			// Цвет группы = по среднему %, а не «любая красная → вся красная»
			const status = statusFromRecoveryPct(avgRecovery)

			const lastDates = matched
				.map(r => r.last_trained)
				.filter(Boolean) as string[]
			const lastTrained =
				lastDates.length > 0
					? formatRecoveryLastTrained(
							lastDates.sort().reverse()[0],
							language ?? 'ru',
							t('exercises', 'today'),
							t('exercises', 'yesterday'),
						)
					: t('recovery', 'noData')

			return { status, recovery: avgRecovery, lastTrained, recoveryHours }
		},
		[recoveryData, recoverySettings, t, language],
	)

	const openMuscleHistory = useCallback(
		(recoveryGroupName: string) => {
			const muscleGroup =
				RECOVERY_TO_HISTORY_FILTER[recoveryGroupName] ?? recoveryGroupName
			router.push({
				pathname: '/(tabs)/history',
				params: { muscleGroup },
			})
		},
		[],
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
			if (hex.length !== 6) return baseColor
			const r = parseInt(hex.substring(0, 2), 16)
			const g = parseInt(hex.substring(2, 4), 16)
			const b = parseInt(hex.substring(4, 6), 16)
			return `rgba(${r}, ${g}, ${b}, ${opacity})`
		},
		[STATUS_COLORS],
	)

	const getFrontMuscleColors = useCallback(() => {
		const muscleColors: { [key: string]: string } = {}
		// Цвет как у карточек: по среднему % группы, не по worst-case мышце
		MUSCLE_FRONT_CONFIG.forEach(muscle => {
			const stats = getMuscleGroupStats(muscle.muscleImages, muscle.name)
			let opacity = 0.7
			if (selectedMuscle && muscleSide === 'front')
				opacity = selectedMuscle === muscle.id ? 0.9 : 0.2
			const color = getColorByStatus(stats.status, opacity)
			muscle.muscleImages.forEach(imageKey => {
				muscleColors[imageKey] = color
			})
		})
		return muscleColors
	}, [
		getMuscleGroupStats,
		selectedMuscle,
		muscleSide,
		getColorByStatus,
	])

	const getBackMuscleColors = useCallback(() => {
		const muscleColors: { [key: string]: string } = {}
		MUSCLE_BACK_CONFIG.forEach(muscle => {
			const stats = getMuscleGroupStats(muscle.muscleImages, muscle.name)
			let opacity = 0.7
			if (selectedMuscle && muscleSide === 'back')
				opacity = selectedMuscle === muscle.id ? 0.9 : 0.2
			const color = getColorByStatus(stats.status, opacity)
			muscle.muscleImages.forEach(imageKey => {
				muscleColors[imageKey] = color
			})
		})
		return muscleColors
	}, [
		getMuscleGroupStats,
		selectedMuscle,
		muscleSide,
		getColorByStatus,
	])

	const frontCallouts = useMemo<RecoveryCalloutItem[]>(
		() =>
			frontDataWithStats.map(m => ({
				id: `front-${m.id}`,
				name: m.name,
				recovery: m.stats.recovery,
				status: m.stats.status,
				color:
					STATUS_COLORS[m.stats.status as keyof typeof STATUS_COLORS] ??
					STATUS_COLORS.not_trained,
			})),
		[frontDataWithStats, STATUS_COLORS],
	)

	const backCallouts = useMemo<RecoveryCalloutItem[]>(
		() =>
			backDataWithStats.map(m => ({
				id: `back-${m.id}`,
				name: m.name,
				recovery: m.stats.recovery,
				status: m.stats.status,
				color:
					STATUS_COLORS[m.stats.status as keyof typeof STATUS_COLORS] ??
					STATUS_COLORS.not_trained,
			})),
		[backDataWithStats, STATUS_COLORS],
	)

	const handleMuscleSelect = (muscleId: string, type: string) => {
		setMuscleSide(type)
		setSelectedMuscle(selectedMuscle === muscleId ? null : muscleId)
	}

	return (
		<SafeAreaView style={styles.container} edges={['top']}>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 120 }}
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
								backgroundColor: colors.cardLight,
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
									{
										recoveryData.filter(
											r => statusFromRecoveryPct(r.recovery ?? 0) === 'recovered',
										).length
									}{' '}
									{t('recovery', 'ready')}
								</Text>
							</View>
						</FadeIn>
					)}
				</View>

				{user ? (
					<TouchableOpacity
						style={styles.bodyStatsCard}
						onPress={() =>
							router.push('/(auth)/(routes)/edit-body-profile')
						}
						activeOpacity={0.7}
					>
						<View style={{ flex: 1 }}>
							<Text style={styles.bodyStatsTitle}>
								{t('recovery', 'bodyStatsCard')}
							</Text>
							<Text style={styles.bodyStatsSubtitle}>
								{bodyStatsSummary ?? t('recovery', 'bodyStatsEmpty')}
							</Text>
						</View>
						<Text style={styles.bodyStatsEdit}>
							{t('recovery', 'bodyStatsEdit')}
						</Text>
					</TouchableOpacity>
				) : null}

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
										r => statusFromRecoveryPct(r.recovery ?? 0) === status,
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
										<RecoveryBodyMap
											side='back'
											muscleColors={getBackMuscleColors()}
											callouts={backCallouts}
										/>
									</View>
									<View style={styles.svgDivider} />
									<View style={styles.svgHalf}>
										<RecoveryBodyMap
											side='front'
											muscleColors={getFrontMuscleColors()}
											callouts={frontCallouts}
										/>
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
										onPress={() => openMuscleHistory(m.name)}
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
										onPress={() => openMuscleHistory(m.name)}
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

function makeStyles(C: AppColors) {
	return StyleSheet.create({
	container: { flex: 1, backgroundColor: C.background },
	cardSvgContainer: { width: 180, height: 480 },
	header: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 8,
		paddingTop: 20,
		paddingBottom: 8,
	},
	title: { fontSize: 24, fontWeight: 'bold', color: C.text },
	subtitle: { fontSize: 14, color: C.textSecondary, marginTop: 4 },
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
	pillText: { fontSize: 13, fontWeight: '600', color: C.primary },

	bodyStatsCard: {
		flexDirection: 'row',
		alignItems: 'center',
		marginHorizontal: 8,
		marginTop: 12,
		padding: 14,
		backgroundColor: C.card,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: C.border,
		gap: 12,
	},
	bodyStatsTitle: { fontSize: 15, fontWeight: '600', color: C.text },
	bodyStatsSubtitle: {
		fontSize: 13,
		color: C.textSecondary,
		marginTop: 4,
	},
	bodyStatsEdit: { fontSize: 14, fontWeight: '600', color: C.primary },

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
		color: C.textSecondary,
		marginTop: 2,
		fontWeight: '500',
	},

	// Layout
	modelSection: { marginTop: 20, paddingHorizontal: 8, gap: 12 },

	// Diagram card
	diagramCard: {
		backgroundColor: C.card,
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: C.border,
		alignItems: 'center',
	},
	diagramTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: C.text,
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
	bodyMapStage: {
		width: '100%',
		height: 440,
		position: 'relative',
		overflow: 'visible',
	},
	bodyMapSvgWrap: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center',
	},
	calloutBadge: {
		position: 'absolute',
		minWidth: 44,
		height: 22,
		paddingHorizontal: 6,
		borderRadius: 11,
		borderWidth: 1.5,
		alignItems: 'center',
		justifyContent: 'center',
	},
	calloutBadgeText: {
		fontSize: 11,
		fontWeight: '700',
		letterSpacing: 0.2,
	},
	svgLabel: {
		fontSize: 11,
		color: C.textSecondary,
		fontWeight: '600',
		letterSpacing: 0.8,
		textTransform: 'uppercase',
		marginBottom: 8,
	},
	svgDivider: { width: 1, backgroundColor: C.border, marginVertical: 20 },

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
		backgroundColor: C.cardLight,
		borderRadius: 20,
		paddingHorizontal: 10,
		paddingVertical: 5,
	},
	legendDot: { width: 8, height: 8, borderRadius: 4 },
	legendText: { fontSize: 11, color: C.textSecondary, fontWeight: '500' },

	// Reset button
	resetBtn: {
		marginTop: 10,
		paddingVertical: 10,
		paddingHorizontal: 20,
		backgroundColor: C.cardLight,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: 'rgba(52, 199, 89, 0.3)',
	},
	resetBtnText: { color: C.primary, fontSize: 14, fontWeight: '600' },

	// Lists card
	listsCard: { gap: 4 },

	// Section label
	sectionLabelRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		marginVertical: 12,
	},
	sectionLabelLine: { flex: 1, height: 1, backgroundColor: C.border },
	sectionLabelText: {
		fontSize: 11,
		color: C.textSecondary,
		fontWeight: '700',
		letterSpacing: 1.2,
		textTransform: 'uppercase',
	},

	// Muscle card
	muscleCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: C.card,
		borderRadius: 14,
		padding: 12,
		borderWidth: 1,
		borderColor: C.border,
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
	cardName: { fontSize: 15, fontWeight: '600', color: C.text },
	cardDate: { fontSize: 12, color: C.textSecondary },
	cardTimeLeft: { fontSize: 11, fontWeight: '500' },
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
		backgroundColor: C.background,
	},
	loadingSpinner: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: C.background,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 20,
	},
	loadingText: { fontSize: 16, color: C.textSecondary },
	skeletonText: { backgroundColor: C.cardLight, borderRadius: 4 },
	skeletonModel: { backgroundColor: C.cardLight, borderRadius: 12 },
})
}

