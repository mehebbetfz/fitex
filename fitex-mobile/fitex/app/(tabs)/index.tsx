import { useLanguage } from '@/contexts/language-context'
import { translateUnit, translateExerciseName } from '@/constants/exercise-i18n'
import * as db from '@/scripts/database'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	Alert,
	Animated,
	Dimensions,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { LineChart } from 'react-native-chart-kit'
import { SafeAreaView } from 'react-native-safe-area-context'

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

interface BodyMeasurement {
	id: string
	name: string
	current: number
	previous: number
	unit: string
	trend: 'up' | 'down' | 'stable'
}

interface ProgressStat {
	id: string
	title: string
	value: string
	subtitle: string
	icon: string
	trend: 'positive' | 'negative' | 'neutral'
}

const screenWidth = Dimensions.get('window').width

const DEFAULT_MEASUREMENTS = [
	{ name: 'Вес', unit: 'кг' },
	{ name: 'Грудь', unit: 'см' },
	{ name: 'Талия', unit: 'см' },
	{ name: 'Бедра', unit: 'см' },
	{ name: 'Бицепс', unit: 'см' },
	{ name: 'Шея', unit: 'см' },
]

const MEASUREMENT_ICONS: Record<string, string> = {
	Вес: 'scale',
	Грудь: 'body',
	Талия: 'body',
	Бедра: 'body',
	Бицепс: 'body',
	Шея: 'body',
	Икры: 'body',
	Плечо: 'body',
	Жир: 'water',
	Мышцы: 'body',
}

// ── Вынесено за компонент ──
type TFn = (section: string, key: string) => string

const calculateMuscleGrowth = (
	measurements: BodyMeasurement[],
	t: TFn,
): {
	value: string
	subtitle: string
	trend: 'positive' | 'negative' | 'neutral'
} => {
	if (measurements.length === 0)
		return { value: `0 ${t('records', 'kg')}`, subtitle: t('common', 'noData'), trend: 'neutral' }
	const muscleMeasurements = measurements.filter(m =>
		['Грудь', 'Бицепс', 'Бедра', 'Шея'].includes(m.name),
	)
	if (muscleMeasurements.length === 0)
		return { value: `0 ${t('records', 'kg')}`, subtitle: t('progress', 'noMeasurements'), trend: 'neutral' }
	const totalChange = muscleMeasurements.reduce(
		(sum, m) => sum + (m.trend === 'up' ? 0.5 : m.trend === 'down' ? -0.5 : 0),
		0,
	)
	const avgChange = totalChange / muscleMeasurements.length
	if (avgChange > 0)
		return {
			value: `+${avgChange.toFixed(1)} ${t('records', 'kg')}`,
			subtitle: t('progress', 'muscleGrowth'),
			trend: 'positive',
		}
	if (avgChange < 0)
		return {
			value: `${avgChange.toFixed(1)} ${t('records', 'kg')}`,
			subtitle: t('progress', 'massDecrease'),
			trend: 'negative',
		}
	return { value: `0 ${t('records', 'kg')}`, subtitle: t('progress', 'noChange'), trend: 'neutral' }
}

const calculateStrengthProgress = async (t: TFn): Promise<{
	value: string
	subtitle: string
	trend: 'positive' | 'negative' | 'neutral'
}> => {
	try {
		const records = await db.getPersonalRecords()
		if (records.length === 0)
			return { value: '0%', subtitle: t('progress', 'noRecords'), trend: 'neutral' }
		const strengthRecords = records.filter(r => r.category === 'strength')
		if (strengthRecords.length === 0)
			return { value: '0%', subtitle: t('progress', 'noStrengthRecords'), trend: 'neutral' }
		const positiveTrends = strengthRecords.filter(r => r.trend === 'up').length
		const totalRecords = strengthRecords.length
		const progressPercent = Math.round((positiveTrends / totalRecords) * 100)
		if (progressPercent > 50)
			return {
				value: `+${progressPercent}%`,
				subtitle: `${t('progress', 'improved')} ${positiveTrends}/${totalRecords}`,
				trend: 'positive',
			}
		if (progressPercent < 30)
			return {
				value: `${progressPercent}%`,
				subtitle: `${t('progress', 'decreased')} ${positiveTrends}/${totalRecords}`,
				trend: 'negative',
			}
		return {
			value: `${progressPercent}%`,
			subtitle: `${t('progress', 'stable')} ${positiveTrends}/${totalRecords}`,
			trend: 'neutral',
		}
	} catch {
		return { value: '0%', subtitle: t('common', 'unknownError'), trend: 'neutral' }
	}
}

const calculateEnduranceProgress = (
	workouts: any[],
	t: TFn,
): {
	value: string
	subtitle: string
	trend: 'positive' | 'negative' | 'neutral'
} => {
	if (workouts.length === 0)
		return { value: '0%', subtitle: t('progress', 'noWorkouts'), trend: 'neutral' }
	const recentWorkouts = workouts.slice(0, 10)
	const avgDuration =
		recentWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) /
		recentWorkouts.length
	if (recentWorkouts.length >= 2) {
		const firstWorkout = recentWorkouts[recentWorkouts.length - 1]
		const lastWorkout = recentWorkouts[0]
		const durationChange =
			((lastWorkout.duration - firstWorkout.duration) / firstWorkout.duration) *
			100
		if (durationChange > 10)
			return {
				value: `+${Math.round(durationChange)}%`,
				subtitle: t('progress', 'enduranceGrowth'),
				trend: 'positive',
			}
		if (durationChange < -10)
			return {
				value: `${Math.round(durationChange)}%`,
				subtitle: t('progress', 'enduranceDecrease'),
				trend: 'negative',
			}
		return {
			value: `${Math.round(durationChange)}%`,
			subtitle: t('progress', 'enduranceStable'),
			trend: 'neutral',
		}
	}
	return {
		value: `${Math.round(avgDuration)} ${t('history', 'min')}`,
		subtitle: t('progress', 'avgDuration'),
		trend: avgDuration > 60 ? 'positive' : 'neutral',
	}
}

// ─────────────────────────────────────────────
// Shimmer — мерцающая анимация для скелетонов
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
// FadeIn — плавное появление контента
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
	return <Animated.View style={{ opacity: anim }}>{children}</Animated.View>
}

// ─────────────────────────────────────────────
// Скелетоны с shimmer-анимацией и задержкой 500ms
// ─────────────────────────────────────────────
const DelayedSkeleton = ({
	children,
	delay = 500,
}: {
	children: React.ReactNode
	delay?: number
}) => {
	const [show, setShow] = useState(false)

	useEffect(() => {
		const timer = setTimeout(() => setShow(true), delay)
		return () => clearTimeout(timer)
	}, [delay])

	if (!show) return null
	return <>{children}</>
}

const ChartSkeleton = () => (
	<DelayedSkeleton>
		<View style={styles.skeletonContainer}>
			<View style={styles.skeletonMetricSelector}>
				{[80, 65, 75, 55].map((w, i) => (
					<ShimmerBlock
						key={i}
						style={[styles.skeletonMetricButton, { width: w }]}
					/>
				))}
			</View>
			<ShimmerBlock style={styles.skeletonCurrentValue} />
			<ShimmerBlock style={styles.skeletonChart} />
		</View>
	</DelayedSkeleton>
)

const MeasurementSkeleton = () => (
	<DelayedSkeleton>
		<View style={[styles.measurementGridItem, { marginBottom: 6 }]}>
			<View style={styles.measurementGridLeft}>
				<ShimmerBlock style={styles.skeletonIcon} />
				<ShimmerBlock style={[styles.skeletonText, { width: 70 }]} />
			</View>
			<View style={styles.measurementGridRight}>
				<ShimmerBlock style={styles.skeletonValue} />
				<ShimmerBlock style={styles.skeletonTrend} />
			</View>
		</View>
	</DelayedSkeleton>
)

const RecordSkeleton = () => (
	<DelayedSkeleton>
		<View style={[styles.recordCard, { marginBottom: 6 }]}>
			<ShimmerBlock style={styles.skeletonIcon} />
			<View style={styles.recordBody}>
				<ShimmerBlock style={[styles.skeletonText, { width: '60%' }]} />
				<ShimmerBlock
					style={[
						styles.skeletonText,
						{ width: '40%', height: 12, marginTop: 6 },
					]}
				/>
			</View>
			<View style={styles.recordRight}>
				<ShimmerBlock style={[styles.skeletonValue, { width: 50 }]} />
				<ShimmerBlock
					style={[styles.skeletonTrend, { width: 20, marginTop: 4 }]}
				/>
			</View>
		</View>
	</DelayedSkeleton>
)

// ─────────────────────────────────────────────
// Основной компонент
// ─────────────────────────────────────────────
export default function StatisticsTab() {
	const router = useRouter()
	const { t, language } = useLanguage()
	const [selectedMetric, setSelectedMetric] = useState('Вес')

	const getMeasurementDisplayName = (name: string) => {
		const MAP: Record<string, string> = {
			'Вес': t('measurements', 'weightLabel'),
			'Грудь': t('measurements', 'chestLabel'),
			'Талия': t('measurements', 'waistLabel'),
			'Бедра': t('measurements', 'hipsLabel'),
			'Бицепс': t('measurements', 'bicepsLabel'),
			'Шея': t('measurements', 'neckLabel'),
			'Икры': t('measurements', 'calfLabel'),
			'Плечо': t('measurements', 'bicepsLabel'),
			'Жир': t('measurements', 'bodyFatLabel'),
			'Мышцы': t('measurements', 'thighLabel'),
		}
		return MAP[name] || name
	}

	const [measurementHistoryMap, setMeasurementHistoryMap] = useState<
		Record<string, { month: string; value: number }[]>
	>({})
	const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>(
		[],
	)
	const [progressStats, setProgressStats] = useState<ProgressStat[]>([])
	const [personalRecords, setPersonalRecords] = useState<any[]>([])

	const [loading, setLoading] = useState({
		measurements: true,
		stats: true,
		records: true,
		weight: true,
	})

	const [measurementModalVisible, setMeasurementModalVisible] = useState(false)
	const [currentMeasurements, setCurrentMeasurements] = useState<
		Array<{ name: string; value: string; unit: string }>
	>(DEFAULT_MEASUREMENTS.map(m => ({ ...m, value: '' })))

	const handleRedirectToRecordsHistory = useCallback(() => {
		router.push({ pathname: '/(routes)/records-history' })
	}, [router])

	const handleRedirectToMeasurementsHistory = useCallback(() => {
		router.push({ pathname: '/(routes)/measurements-history' })
	}, [router])

	// ── silent=true — stale-while-revalidate, не показывает скелетоны ──
	const loadAllData = useCallback(
		async ({ silent = false }: { silent?: boolean } = {}) => {
			try {
				if (!silent) {
					setLoading({
						measurements: true,
						stats: true,
						records: true,
						weight: true,
					})
				}

				const measurements = await db.getBodyMeasurements()

				const groupedMeasurements = new Map()
				measurements.forEach(m => {
					if (
						!groupedMeasurements.has(m.name) ||
						new Date(m.date) > new Date(groupedMeasurements.get(m.name).date)
					) {
						groupedMeasurements.set(m.name, m)
					}
				})

				const latestMeasurements = Array.from(groupedMeasurements.values())
					.sort(
						(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
					)
					.slice(0, 10)

				const formattedMeasurements = latestMeasurements.map((m, index) => {
					let trend: 'up' | 'down' | 'stable' = 'stable'
					if (m.trend === 'up' || m.trend === 'down' || m.trend === 'stable')
						trend = m.trend
					return {
						id: m.id?.toString() || index.toString(),
						name: m.name,
						current: m.value,
						previous: m.value,
						unit: m.unit,
						trend,
					}
				})
				setBodyMeasurements(formattedMeasurements)
				if (!silent) setLoading(prev => ({ ...prev, measurements: false }))

			const months = Array.from({ length: 12 }, (_, i) =>
				new Intl.DateTimeFormat(language, { month: 'short' }).format(new Date(2024, i, 1))
			)
				const allByName = new Map<string, any[]>()
				measurements.forEach(m => {
					if (!allByName.has(m.name)) allByName.set(m.name, [])
					allByName.get(m.name)!.push(m)
				})

				const measurementMap: Record<
					string,
					{ month: string; value: number }[]
				> = {}
				allByName.forEach((entries, name) => {
					const sorted = entries
						.sort(
							(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
						)
						.slice(-6)
						.map(m => ({
							month: months[new Date(m.date).getMonth()],
							value: m.value,
						}))
					measurementMap[name] = sorted
				})
				setMeasurementHistoryMap(measurementMap)
				if (!silent) setLoading(prev => ({ ...prev, weight: false }))

				const records = await db.getPersonalRecords()
				const formattedRecords = records.map((r, index) => {
					let trend: 'up' | 'down' | 'stable' = 'stable'
					if (r.trend === 'up' || r.trend === 'down' || r.trend === 'stable')
						trend = r.trend
					return {
						id: r.id?.toString() || index.toString(),
						exercise: r.exercise,
						weight: r.weight,
						date: db.formatDate(r.date) || r.date,
						trend,
					}
				})
				setPersonalRecords(formattedRecords.slice(0, 6))
				if (!silent) setLoading(prev => ({ ...prev, records: false }))

				const stats = await db.getWorkoutStats()
				const allWorkouts = await db.getWorkouts()
				const muscleGrowth = calculateMuscleGrowth(formattedMeasurements, t)
				const strengthProgress = await calculateStrengthProgress(t)
				const enduranceProgress = calculateEnduranceProgress(allWorkouts, t)
				const totalVolume = stats.total_volume
					? `${(stats.total_volume / 1000).toFixed(1)} т`
					: '0 т'

			setProgressStats([
				{
					id: '1',
					title: t('progress', 'totalVolume'),
					value: totalVolume,
					subtitle: t('records', 'volume'),
					icon: 'scale',
					trend: 'positive',
				},
				{
					id: '2',
					title: t('recovery', 'muscleStatus'),
					value: muscleGrowth.value,
					subtitle: muscleGrowth.subtitle,
					icon: 'fitness',
					trend: muscleGrowth.trend,
				},
				{
					id: '3',
					title: t('records', 'catStrength'),
					value: strengthProgress.value,
					subtitle: strengthProgress.subtitle,
					icon: 'barbell',
					trend: strengthProgress.trend,
				},
				{
					id: '4',
					title: t('records', 'catEndurance'),
					value: enduranceProgress.value,
					subtitle: enduranceProgress.subtitle,
					icon: 'speedometer',
					trend: enduranceProgress.trend,
				},
			])
				if (!silent) setLoading(prev => ({ ...prev, stats: false }))
			} catch (error) {
				console.error('Error loading statistics data:', error)
				setLoading({
					measurements: false,
					stats: false,
					records: false,
					weight: false,
				})
			}
		},
		[],
	)

	const checkMeasurementReminder = useCallback(async () => {
		try {
			const lastReminderDate = await AsyncStorage.getItem(
				'lastMeasurementReminder',
			)
			const lastMeasurementDate = await AsyncStorage.getItem(
				'lastMeasurementDate',
			)
			const today = new Date().toISOString().split('T')[0]
			const isSunday = new Date().getDay() === 0
			if (
				isSunday &&
				lastMeasurementDate !== today &&
				lastReminderDate !== today
			) {
				setMeasurementModalVisible(true)
				await AsyncStorage.setItem('lastMeasurementReminder', today)
			}
		} catch (error) {
			console.error('Error checking measurement reminder:', error)
		}
	}, [])

	const handleSaveMeasurements = useCallback(async () => {
			try {
				const today = new Date().toISOString().split('T')[0]
				for (const measurement of currentMeasurements) {
					if (measurement.value.trim()) {
						const previousMeasurements = await db.getBodyMeasurements()
						const previousForType = previousMeasurements
							.filter(m => m.name === measurement.name)
							.sort(
								(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
							)[0]

						let trend: 'up' | 'down' | 'stable' = 'stable'
						if (previousForType) {
							const currentValue = parseFloat(measurement.value)
							if (currentValue > previousForType.value) trend = 'up'
							else if (currentValue < previousForType.value) trend = 'down'
						}
						await db.addBodyMeasurement({
							name: measurement.name,
							value: parseFloat(measurement.value),
							unit: measurement.unit,
							date: today,
							trend,
						})
					}
				}
				await AsyncStorage.setItem('lastMeasurementDate', today)
				setMeasurementModalVisible(false)
				setCurrentMeasurements(
					DEFAULT_MEASUREMENTS.map(m => ({ ...m, value: '' })),
				)
				Alert.alert(t('common', 'ok'), t('progress', 'savedSuccess'))
				await loadAllData()
			} catch (error) {
				console.error('Error saving measurements:', error)
				Alert.alert(t('common', 'error'), t('progress', 'saveError'))
			}
	}, [currentMeasurements, loadAllData])

	const handleSkipMeasurements = useCallback(async () => {
		const today = new Date().toISOString().split('T')[0]
		await AsyncStorage.setItem('lastMeasurementReminder', today)
		setMeasurementModalVisible(false)
	}, [])

	useEffect(() => {
		const keys = Object.keys(measurementHistoryMap)
		if (keys.length > 0 && !measurementHistoryMap[selectedMetric]) {
			setSelectedMetric(keys[0])
		}
	}, [measurementHistoryMap, selectedMetric])

	// ── Stale-while-revalidate: повторные визиты — данные сразу, обновление в фоне ──
	const hasData = bodyMeasurements.length > 0 || personalRecords.length > 0

	useFocusEffect(
		useCallback(() => {
			if (hasData) {
				loadAllData({ silent: true })
			} else {
				loadAllData({ silent: false })
			}
			checkMeasurementReminder()
		}, [loadAllData, checkMeasurementReminder, hasData]),
	)

	const calculateCurrentValue = () => {
		const data = measurementHistoryMap[selectedMetric]
		if (!data || data.length === 0) return '—'
		const unit =
			bodyMeasurements.find(m => m.name === selectedMetric)?.unit ?? ''
		return `${data[data.length - 1].value} ${unit}`
	}

	const calculateValueChange = () => {
		const data = measurementHistoryMap[selectedMetric]
		if (!data || data.length < 2) return '—'
		const change = data[data.length - 1].value - data[0].value
		const unit =
			bodyMeasurements.find(m => m.name === selectedMetric)?.unit ?? ''
		return `${change > 0 ? '+' : ''}${change.toFixed(1)} ${unit}`
	}

	const isPositiveChange = () => {
		const data = measurementHistoryMap[selectedMetric]
		if (!data || data.length < 2) return true
		const negativeMetrics = ['Вес', 'Талия', 'Жир']
		const change = data[data.length - 1].value - data[0].value
		return negativeMetrics.includes(selectedMetric) ? change <= 0 : change >= 0
	}

	const renderChart = () => {
		const data = measurementHistoryMap[selectedMetric]
		if (!data || data.length === 0) {
		return (
			<View style={styles.emptyChart}>
				<Ionicons name='stats-chart' size={48} color='#8E8E93' />
				<Text style={styles.emptyChartText}>{t('progress', 'noDataChart')}</Text>
				<Text style={styles.emptyChartSubtext}>
					{t('progress', 'addMeasurementsFor')} «{getMeasurementDisplayName(selectedMetric)}»
				</Text>
			</View>
		)
	}
	const rawUnit = bodyMeasurements.find(m => m.name === selectedMetric)?.unit ?? ''
	const unit = translateUnit(rawUnit, language)
	return (
		<LineChart
			data={{
				labels: data.map(d => d.month),
				datasets: [{ data: data.map(d => d.value) }],
			}}
			width={screenWidth - 32}
			height={240}
			chartConfig={{
				backgroundGradientFrom: '#1C1C1E',
				backgroundGradientTo: '#1C1C1E',
				color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
				labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
				strokeWidth: 2,
				propsForDots: { r: '4', strokeWidth: '2', stroke: '#1aff92' },
				decimalPlaces: 1,
			}}
			bezier
			yAxisSuffix={` ${unit}`}
			style={{ paddingTop: 20, paddingBottom: 5, borderRadius: 16 }}
		/>
	)
}

	const metricKeys = Object.keys(measurementHistoryMap)

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.header}>
					<View style={{ flex: 1 }}>
						<Text style={styles.greeting}>{t('progress', 'title')}</Text>
						<Text style={styles.subtitle}>{t('progress', 'subtitle')}</Text>
					</View>
					<View style={styles.headerIcons}>
						<TouchableOpacity
							style={styles.headerIconBtn}
							onPress={() => router.push('/(auth)/(routes)/leaderboard')}
							activeOpacity={0.7}
						>
							<Ionicons name='podium-outline' size={22} color='#8E8E93' />
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.headerIconBtn}
							onPress={() => router.push('/(auth)/(routes)/achievements')}
							activeOpacity={0.7}
						>
							<Ionicons name='ribbon-outline' size={22} color='#8E8E93' />
						</TouchableOpacity>
					</View>
				</View>

				{/* ── Аналитика ── */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>{t('progress', 'analytics')}</Text>
					</View>

					{loading.weight ? (
						<ChartSkeleton />
					) : metricKeys.length === 0 ? (
						<View style={styles.emptyContainer}>
							<Text style={styles.emptyText}>{t('progress', 'noChartData')}</Text>
						</View>
					) : (
						<FadeIn show={!loading.weight}>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.metricSelectorContainer}
								style={styles.metricSelectorScroll}
							>
								{metricKeys.map(name => (
									<TouchableOpacity
										key={name}
										style={[
											styles.metricButton,
											selectedMetric === name && styles.activeMetricButton,
										]}
										onPress={() => setSelectedMetric(name)}
									>
										<Text
											style={[
												styles.metricText,
												selectedMetric === name && styles.activeMetricText,
											]}
										>
					{getMeasurementDisplayName(name)}
									</Text>
								</TouchableOpacity>
							))}
						</ScrollView>

							<View style={styles.currentValueIndicator}>
								<Text style={styles.currentValueText}>
									{calculateCurrentValue()}
								</Text>
								{calculateValueChange() !== '—' && (
									<View style={styles.trendIndicator}>
										<Ionicons
											name={isPositiveChange() ? 'arrow-down' : 'arrow-up'}
											size={12}
											color={isPositiveChange() ? '#34C759' : '#FF3B30'}
										/>
										<Text
											style={[
												styles.trendText,
												{ color: isPositiveChange() ? '#34C759' : '#FF3B30' },
											]}
										>
											{calculateValueChange()}
										</Text>
									</View>
								)}
							</View>

							<View style={styles.chartWrapper}>{renderChart()}</View>
						</FadeIn>
					)}
				</View>

				{/* ── Замеры тела ── */}
				<View style={styles.section}>
					<View
						style={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
						}}
					>
						<View style={{ marginBottom: 10, marginRight: 8 }}>
							<TouchableOpacity
								onPress={() => router.push('/(routes)/quick-measurements')}
							>
								<Ionicons name='add-circle-outline' size={26} color='#34C759' />
							</TouchableOpacity>
						</View>
						<View style={styles.sectionHeader}>
							<Text style={styles.sectionTitle}>{t('progress', 'bodyMeasurements')}</Text>
							{!loading.measurements && (
								<TouchableOpacity onPress={handleRedirectToMeasurementsHistory}>
									<Text style={styles.seeAll}>{t('common', 'history')}</Text>
								</TouchableOpacity>
							)}
						</View>
					</View>
					<View style={styles.measurementsGrid}>
						{loading.measurements ? (
							<>
								<MeasurementSkeleton />
								<MeasurementSkeleton />
								<MeasurementSkeleton />
								<MeasurementSkeleton />
							</>
						) : bodyMeasurements.length === 0 ? (
							<View style={styles.emptyContainer}>
								<Text style={styles.emptyText}>{t('progress', 'noMeasurements')}</Text>
							</View>
						) : (
							<FadeIn show={!loading.measurements}>
								{bodyMeasurements.map(item => (
									<View
										key={item.id}
										style={[styles.measurementGridItem, { marginBottom: 6 }]}
									>
										<View style={styles.measurementGridLeft}>
											<View style={styles.measurementIconWrap}>
												<Ionicons
													name={(MEASUREMENT_ICONS[item.name] ?? 'body') as any}
													size={16}
													color='#34C759'
												/>
											</View>
											<Text style={styles.measurementName}>{getMeasurementDisplayName(item.name)}</Text>
										</View>
										<View style={styles.measurementGridRight}>
											<Text style={styles.measurementValue}>
												{item.current}
												<Text style={styles.measurementUnit}> {translateUnit(item.unit, language)}</Text>
											</Text>
											<Ionicons
												name={
													item.trend === 'up'
														? 'trending-up'
														: item.trend === 'down'
															? 'trending-down'
															: 'remove'
												}
												size={14}
												color={
													item.trend === 'up'
														? '#34C759'
														: item.trend === 'down'
															? '#FF3B30'
															: '#8E8E93'
												}
											/>
										</View>
									</View>
								))}
							</FadeIn>
						)}
					</View>
				</View>

				{/* ── Личные рекорды ── */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>{t('progress', 'personalRecords')}</Text>
						{!loading.records && (
							<TouchableOpacity onPress={handleRedirectToRecordsHistory}>
								<Text style={styles.seeAll}>{t('progress', 'allRecords')}</Text>
							</TouchableOpacity>
						)}
					</View>
					<View style={styles.recordsGrid}>
						{loading.records ? (
							<>
								<RecordSkeleton />
								<RecordSkeleton />
								<RecordSkeleton />
							</>
						) : personalRecords.length === 0 ? (
							<View style={styles.emptyContainer}>
								<Text style={styles.emptyText}>{t('progress', 'noRecords')}</Text>
							</View>
						) : (
							<FadeIn show={!loading.records}>
								{personalRecords.map(record => (
									<View
										key={record.id}
										style={[styles.recordCard, { marginBottom: 6 }]}
									>
										<View style={styles.recordIconWrap}>
											<Ionicons name='barbell' size={16} color='#34C759' />
										</View>
								<View style={styles.recordBody}>
										<Text style={styles.recordExercise} numberOfLines={1}>
											{translateExerciseName(record.exercise, language)}
										</Text>
											<Text style={styles.recordDate}>{record.date}</Text>
										</View>
										<View style={styles.recordRight}>
											<Text style={styles.recordWeight}>{record.weight}</Text>
											<Ionicons
												name={
													record.trend === 'up'
														? 'trending-up'
														: record.trend === 'down'
															? 'trending-down'
															: 'remove'
												}
												size={13}
												color={
													record.trend === 'up'
														? '#34C759'
														: record.trend === 'down'
															? '#FF3B30'
															: '#8E8E93'
												}
											/>
										</View>
									</View>
								))}
							</FadeIn>
						)}
					</View>
				</View>
			</ScrollView>

			{/* Модальное окно */}
			<Modal
				animationType='slide'
				transparent={true}
				visible={measurementModalVisible}
				onRequestClose={() => setMeasurementModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
					<View style={styles.modalHeader}>
						<Text style={styles.modalTitle}>{t('progress', 'weeklyReminder')}</Text>
						<Text style={styles.modalSubtitle}>{t('progress', 'weeklyReminderSubtitle')}</Text>
					</View>
					<ScrollView style={styles.measurementsInputContainer}>
						{currentMeasurements.map((measurement, index) => (
							<View key={index} style={styles.measurementInputRow}>
						<Text style={styles.measurementLabel}>
							{getMeasurementDisplayName(measurement.name)} ({translateUnit(measurement.unit, language)})
						</Text>
								<TextInput
									style={styles.measurementInput}
									value={measurement.value}
									onChangeText={text => {
										setCurrentMeasurements(prev =>
											prev.map((m, i) =>
												i === index ? { ...m, value: text } : m,
											),
										)
									}}
									placeholder={t('progress', 'enterValue')}
									placeholderTextColor='#8E8E93'
									keyboardType='numeric'
								/>
							</View>
						))}
					</ScrollView>
					<View style={styles.modalButtons}>
						<TouchableOpacity
							style={[styles.modalButton, styles.skipButton]}
							onPress={handleSkipMeasurements}
						>
							<Text style={styles.skipButtonText}>{t('common', 'skip')}</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.modalButton, styles.saveButton]}
							onPress={handleSaveMeasurements}
						>
							<Text style={styles.saveButtonText}>{t('common', 'save')}</Text>
						</TouchableOpacity>
					</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#121212', paddingBottom: -40 },
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingTop: 20,
		paddingBottom: 10,
	},
	headerIcons: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	headerIconBtn: {
		width: 38,
		height: 38,
		borderRadius: 12,
		backgroundColor: '#1C1C1E',
		alignItems: 'center',
		justifyContent: 'center',
	},
	greeting: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
	subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
	section: { marginTop: 24, paddingHorizontal: 10 },
	sectionHeader: {
		flexDirection: 'row',
		flexGrow: 1,
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10,
	},
	sectionTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
	seeAll: { fontSize: 14, color: '#34C759', fontWeight: '600' },
	metricSelectorScroll: { marginBottom: 12 },
	metricSelectorContainer: { flexDirection: 'row', gap: 8, paddingRight: 16 },
	metricButton: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: '#1E1E1E',
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	activeMetricButton: { backgroundColor: '#34C759', borderColor: '#34C759' },
	metricText: { fontSize: 13, fontWeight: '600', color: '#8E8E93' },
	activeMetricText: { color: '#FFFFFF' },
	chartWrapper: {
		backgroundColor: '#1C1C1E',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	currentValueIndicator: {
		backgroundColor: '#1C1C1E',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 12,
		marginBottom: 10,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	currentValueText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
	trendIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
	trendText: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
	emptyChart: { alignItems: 'center', justifyContent: 'center', padding: 32 },
	emptyChartText: { fontSize: 16, color: '#FFFFFF', marginTop: 12 },
	emptyChartSubtext: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
	measurementsGrid: { gap: 0 },
	measurementGridItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderWidth: 1,
		borderColor: '#2C2C2E',
	},
	measurementGridLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
	measurementGridRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	measurementIconWrap: {
		width: 30,
		height: 30,
		borderRadius: 8,
		backgroundColor: 'rgba(52, 199, 89, 0.1)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	measurementName: { fontSize: 14, fontWeight: '500', color: '#FFFFFF' },
	measurementValue: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
	measurementUnit: { fontSize: 12, fontWeight: '400', color: '#8E8E93' },
	measurementGridTop: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 6,
	},
	measurementTrendBadge: {
		width: 28,
		height: 28,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	measurementHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	recordsGrid: { gap: 0, marginBottom: 10 },
	recordCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderWidth: 1,
		borderColor: '#2C2C2E',
		gap: 10,
	},
	recordIconWrap: {
		width: 30,
		height: 30,
		borderRadius: 8,
		backgroundColor: 'rgba(52, 199, 89, 0.1)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	recordBody: { flex: 1, gap: 2 },
	recordExercise: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
	recordDate: { fontSize: 11, color: '#8E8E93' },
	recordRight: { alignItems: 'flex-end', gap: 3 },
	recordWeight: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
	recordHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	recordWeightBadge: {
		backgroundColor: '#34C759',
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 12,
		marginLeft: 8,
	},
	recordFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	trendBadge: {
		width: 28,
		height: 28,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
	},
	emptyContainer: { width: '100%', alignItems: 'center', padding: 20 },
	emptyText: { color: '#8E8E93', fontSize: 14 },
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.8)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	modalContent: {
		backgroundColor: '#1E1E1E',
		borderRadius: 20,
		padding: 20,
		width: '100%',
		maxHeight: '80%',
	},
	modalHeader: { marginBottom: 20 },
	modalTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#FFFFFF',
		marginBottom: 8,
	},
	modalSubtitle: { fontSize: 16, color: '#B0B0B0' },
	measurementsInputContainer: { maxHeight: 300, marginBottom: 20 },
	measurementInputRow: { marginBottom: 16 },
	measurementLabel: { fontSize: 16, color: '#FFFFFF', marginBottom: 8 },
	measurementInput: {
		backgroundColor: '#2C2C2E',
		borderRadius: 8,
		padding: 12,
		color: '#FFFFFF',
		fontSize: 16,
	},
	modalButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 20,
	},
	modalButton: {
		flex: 1,
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	skipButton: {
		backgroundColor: 'transparent',
		marginRight: 8,
		borderWidth: 1,
		borderColor: '#8E8E93',
	},
	saveButton: { backgroundColor: '#34C759', marginLeft: 8 },
	skipButtonText: { color: '#8E8E93', fontSize: 16, fontWeight: '600' },
	saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
	// Skeleton
	skeletonContainer: {
		backgroundColor: COLORS.card,
		borderRadius: 16,
		padding: 16,
		marginBottom: 16,
	},
	skeletonMetricSelector: { flexDirection: 'row', gap: 8, marginBottom: 12 },
	skeletonMetricButton: {
		height: 36,
		backgroundColor: COLORS.cardLight,
		borderRadius: 20,
	},
	skeletonCurrentValue: {
		height: 60,
		backgroundColor: COLORS.cardLight,
		borderRadius: 12,
		marginBottom: 12,
	},
	skeletonChart: {
		height: 240,
		backgroundColor: COLORS.cardLight,
		borderRadius: 16,
	},
	skeletonIcon: {
		width: 30,
		height: 30,
		borderRadius: 8,
		backgroundColor: COLORS.cardLight,
	},
	skeletonText: {
		height: 16,
		width: 80,
		backgroundColor: COLORS.cardLight,
		borderRadius: 4,
	},
	skeletonValue: {
		height: 20,
		width: 60,
		backgroundColor: COLORS.cardLight,
		borderRadius: 4,
	},
	skeletonTrend: {
		height: 20,
		width: 30,
		backgroundColor: COLORS.cardLight,
		borderRadius: 4,
	},
	// Unused legacy
	loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
	fullPageLoader: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#121212',
	},
})
