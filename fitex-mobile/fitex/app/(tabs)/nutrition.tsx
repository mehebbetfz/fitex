import { dateLocaleFor } from '@/locales'
﻿import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import type { AppColors } from '@/constants/app-theme'
import { ErrorBoundary } from '@/components/error-boundary'
import {
	analyzeMealPhoto,
	deleteFoodEntry,
	fetchNutritionDay,
	localTodayKey,
	type FoodEntry,
	type MealAnalysisItem,
	type NutritionDay,
	type PhotoQuota,
	updateFoodEntry,
	updateNutritionTargets,
} from '@/services/nutrition'
import { isMealPhotoSupported, pickMealJpeg } from '@/services/meal-photo-pick'
import MealCameraModal from '@/components/meal-camera-modal'
import SheetModalHeader from '@/components/ui/sheet-modal-header'
import {
	formatVitaminValue,
	parseVitaminKey,
	VITAMIN_ACCENTS,
} from '@/utils/nutrition-labels'
import { hasActivePremium, useAuth } from '@/app/contexts/auth-context'
import {
	PremiumGateModal,
	markPremiumNudgeShown,
} from '@/app/components/premium-gate'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
	ActivityIndicator,
	Alert,
	Animated,
	Image,
	Keyboard,
	KeyboardAvoidingView,
	Modal,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import Svg, { Circle } from 'react-native-svg'
const PORTION_SCALES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

function scaleMacro(value: number, scale: number) {
	if (scale === 1) return value
	return Math.round(value * scale * 10) / 10
}

function scaleKcal(value: number, scale: number) {
	if (scale === 1) return Math.round(value)
	return Math.round(value * scale)
}


const MACRO_COLORS = {
	protein: '#FF6B6B',
	carbs: '#0A84FF',
	fat: '#FFD60A',
} as const

const softCardShadow = Platform.select({
	ios: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.07,
		shadowRadius: 14,
	},
	android: { elevation: 3 },
	default: {},
})

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
	}, [anim])
	return anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] })
}

const ShimmerBlock = ({ style }: { style: object }) => {
	const opacity = useShimmer()
	return <Animated.View style={[style, { opacity }]} />
}

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
	}, [show, anim])
	return <Animated.View style={{ opacity: anim }}>{children}</Animated.View>
}

const VIT_LABEL_KEYS: Record<string, string> = {
	vitaminC: 'vitVitaminC',
	vitaminA: 'vitVitaminA',
	vitaminD: 'vitVitaminD',
	vitaminB12: 'vitVitaminB12',
	vitaminB6: 'vitVitaminB6',
	vitaminE: 'vitVitaminE',
	vitaminK: 'vitVitaminK',
	iron: 'vitIron',
	calcium: 'vitCalcium',
	magnesium: 'vitMagnesium',
	potassium: 'vitPotassium',
	zinc: 'vitZinc',
	sodium: 'vitSodium',
	fiber: 'vitFiber',
	folate: 'vitFolate',
	phosphorus: 'vitPhosphorus',
	selenium: 'vitSelenium',
}

function vitaminDisplay(
	rawKey: string,
	t: (ns: 'nutrition', key: string) => string,
) {
	const { id, unit } = parseVitaminKey(rawKey)
	const labelKey = VIT_LABEL_KEYS[id]
	const label = labelKey
		? t('nutrition', labelKey)
		: id.charAt(0).toUpperCase() + id.slice(1)
	const unitLabel =
		unit === 'mg'
			? t('nutrition', 'mg')
			: unit === 'ug'
				? t('nutrition', 'ug')
				: unit === 'g'
					? t('nutrition', 'g')
					: ''
	return {
		label,
		unitLabel,
		accent: VITAMIN_ACCENTS[id] || '#34C759',
	}
}

function NutritionSkeleton() {
	const { colors: T } = useAppTheme()
	const styles = useMemo(() => makeNutritionStyles(T), [T])
	const SKELETON = T.skeleton
	return (
		<View>
			<View style={styles.calorieCard}>
				<View style={{ flex: 1, gap: 10 }}>
					<ShimmerBlock
						style={{ height: 36, width: 120, borderRadius: 10, backgroundColor: SKELETON }}
					/>
					<ShimmerBlock
						style={{ height: 14, width: 90, borderRadius: 6, backgroundColor: SKELETON }}
					/>
				</View>
				<ShimmerBlock
					style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: SKELETON }}
				/>
			</View>

			<View style={styles.macroRow}>
				{[0, 1, 2].map(i => (
					<View key={i} style={styles.macroCard}>
						<ShimmerBlock
							style={{
								width: 72,
								height: 72,
								borderRadius: 36,
								backgroundColor: SKELETON,
							}}
						/>
						<ShimmerBlock
							style={{
								height: 22,
								width: 44,
								borderRadius: 8,
								backgroundColor: SKELETON,
								marginTop: 10,
							}}
						/>
						<ShimmerBlock
							style={{
								height: 12,
								width: '80%',
								borderRadius: 5,
								backgroundColor: SKELETON,
								marginTop: 6,
							}}
						/>
					</View>
				))}
			</View>

			<View style={styles.section}>
				<ShimmerBlock
					style={{
						height: 18,
						width: 110,
						borderRadius: 6,
						backgroundColor: SKELETON,
						marginBottom: 12,
						marginLeft: 8,
					}}
				/>
				{[0, 1, 2].map(i => (
					<View key={i} style={styles.mealRow}>
						<ShimmerBlock
							style={{
								width: 64,
								height: 64,
								borderRadius: 16,
								backgroundColor: SKELETON,
								marginRight: 12,
							}}
						/>
						<View style={[styles.mealMeta, { gap: 8 }]}>
							<ShimmerBlock
								style={{ height: 15, width: '75%', borderRadius: 5, backgroundColor: SKELETON }}
							/>
							<ShimmerBlock
								style={{ height: 12, width: '50%', borderRadius: 4, backgroundColor: SKELETON }}
							/>
						</View>
					</View>
				))}
			</View>
		</View>
	)
}

function n(v: unknown, fallback = 0) {
	const x = Number(v)
	return Number.isFinite(x) ? x : fallback
}

function ProgressRing({
	size = 88,
	stroke = 9,
	progress,
	trackColor,
	progressColor,
	children,
}: {
	size?: number
	stroke?: number
	progress: number
	trackColor: string
	progressColor: string
	children?: React.ReactNode
}) {
	const r = (size - stroke) / 2
	const c = 2 * Math.PI * r
	const clamped = Math.min(1, Math.max(0, progress))
	const offset = c * (1 - clamped)

	return (
		<View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
			<Svg width={size} height={size} style={{ position: 'absolute' }}>
				<Circle
					cx={size / 2}
					cy={size / 2}
					r={r}
					stroke={trackColor}
					strokeWidth={stroke}
					fill='none'
				/>
				<Circle
					cx={size / 2}
					cy={size / 2}
					r={r}
					stroke={progressColor}
					strokeWidth={stroke}
					fill='none'
					strokeDasharray={`${c} ${c}`}
					strokeDashoffset={offset}
					strokeLinecap='round'
					transform={`rotate(-90 ${size / 2} ${size / 2})`}
				/>
			</Svg>
			{children}
		</View>
	)
}

function MacroRingCard({
	eaten,
	target,
	unit,
	label,
	icon,
	color,
	over,
	trackColor,
	styles,
}: {
	eaten: number
	target: number
	unit: string
	label: string
	icon: ReactNode
	color: string
	over: boolean
	trackColor: string
	styles: ReturnType<typeof makeNutritionStyles>
}) {
	const left = target - eaten
	const progress = target > 0 ? Math.min(1, eaten / target) : 0
	const ringColor = over ? '#FF3B30' : color

	return (
		<View style={styles.macroCard}>
			<ProgressRing
				size={72}
				stroke={8}
				progress={progress}
				trackColor={trackColor}
				progressColor={ringColor}
			>
				<View style={[styles.macroRingCenter, { backgroundColor: `${color}18` }]}>
					{icon}
				</View>
			</ProgressRing>
			<Text style={styles.macroCardValue}>
				{Math.abs(Math.round(left))}
			</Text>
			<Text style={styles.macroCardLabel} numberOfLines={2}>
				{label}
			</Text>
			<Text style={styles.macroGoalHint}>
				{Math.round(eaten)} / {Math.round(target)} {unit}
			</Text>
		</View>
	)
}

function formatMealTime(iso?: string) {
	if (!iso) return ''
	try {
		const d = new Date(iso)
		if (Number.isNaN(d.getTime())) return ''
		return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
	} catch {
		return ''
	}
}

function formatTodayTitle(locale: string) {
	try {
		return new Date().toLocaleDateString(locale, {
			weekday: 'long',
			day: 'numeric',
			month: 'short',
		})
	} catch {
		return localTodayKey()
	}
}

function emptyDay(): NutritionDay {
	return {
		date: localTodayKey(),
		targets: {
			calories: 2000,
			proteinG: 120,
			carbsG: 200,
			fatG: 70,
			bmr: 0,
			tdee: 0,
			complete: false,
			custom: false,
		},
		totals: { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
		entries: [],
		photoQuota: { limit: 0, used: 0, remaining: 0 },
	}
}

function normalizeDay(raw: unknown): NutritionDay {
	const d = (raw && typeof raw === 'object' ? raw : {}) as Partial<NutritionDay>
	const targets = d.targets ?? emptyDay().targets
	const totals = d.totals ?? emptyDay().totals
	const entries = Array.isArray(d.entries) ? d.entries : []
	return {
		date: typeof d.date === 'string' ? d.date : localTodayKey(),
		targets: {
			calories: n(targets.calories, 2000),
			proteinG: n(targets.proteinG, 120),
			carbsG: n(targets.carbsG, 200),
			fatG: n(targets.fatG, 70),
			bmr: n(targets.bmr),
			tdee: n(targets.tdee),
			complete: Boolean(targets.complete),
			custom: Boolean(targets.custom),
		},
		totals: {
			calories: n(totals.calories),
			proteinG: n(totals.proteinG),
			carbsG: n(totals.carbsG),
			fatG: n(totals.fatG),
		},
		entries: entries
			.filter(e => e && typeof e === 'object')
			.map(e => ({
				id: String((e as FoodEntry).id ?? ''),
				date: String((e as FoodEntry).date ?? ''),
				name: String((e as FoodEntry).name || 'Meal'),
				photoUrl: (e as FoodEntry).photoUrl ?? null,
				calories: n((e as FoodEntry).calories),
				proteinG: n((e as FoodEntry).proteinG),
				carbsG: n((e as FoodEntry).carbsG),
				fatG: n((e as FoodEntry).fatG),
				vitamins:
					(e as FoodEntry).vitamins &&
					typeof (e as FoodEntry).vitamins === 'object' &&
					!Array.isArray((e as FoodEntry).vitamins)
						? (e as FoodEntry).vitamins
						: {},
				source: String((e as FoodEntry).source || 'unknown'),
				createdAt: (e as FoodEntry).createdAt,
			}))
			.filter(e => e.id),
		photoQuota: {
			limit: n((d.photoQuota as PhotoQuota | undefined)?.limit),
			used: n((d.photoQuota as PhotoQuota | undefined)?.used),
			remaining: n((d.photoQuota as PhotoQuota | undefined)?.remaining),
		},
	}
}

function NutritionTabInner() {
	const { t, language } = useLanguage()
	const { colors: T } = useAppTheme()
	const { user } = useAuth()
	const styles = useMemo(() => makeNutritionStyles(T), [T])
	const params = useLocalSearchParams<{ add?: string }>()
	const locale =
		dateLocaleFor(language)
	const premium = hasActivePremium(user)

	const [day, setDay] = useState<NutritionDay | null>(null)
	const [loading, setLoading] = useState(true)
	const [loadError, setLoadError] = useState<string | null>(null)
	const [analyzing, setAnalyzing] = useState(false)
	const [editEntry, setEditEntry] = useState<FoodEntry | null>(null)
	const [editName, setEditName] = useState('')
	const [editCal, setEditCal] = useState('')
	const [editP, setEditP] = useState('')
	const [editC, setEditC] = useState('')
	const [editF, setEditF] = useState('')
	const [saving, setSaving] = useState(false)
	const [targetsOpen, setTargetsOpen] = useState(false)
	const [targetCal, setTargetCal] = useState('')
	const [targetP, setTargetP] = useState('')
	const [targetC, setTargetC] = useState('')
	const [targetF, setTargetF] = useState('')
	const [savingTargets, setSavingTargets] = useState(false)
	const [pickSourceOpen, setPickSourceOpen] = useState(false)
	const [mealNote, setMealNote] = useState('')
	const [cameraOpen, setCameraOpen] = useState(false)
	const [premiumGateOpen, setPremiumGateOpen] = useState(false)
	const [keyboardPad, setKeyboardPad] = useState(0)
	const [pendingMeal, setPendingMeal] = useState<{
		entry: FoodEntry
		localUri: string
		confidence: number
		items: MealAnalysisItem[]
		portionScale: number
	} | null>(null)
	const [confirmingMeal, setConfirmingMeal] = useState(false)
	const pendingAnim = useRef(new Animated.Value(0)).current

	useEffect(() => {
		if (!pendingMeal) {
			pendingAnim.setValue(0)
			return
		}
		pendingAnim.setValue(0)
		Animated.spring(pendingAnim, {
			toValue: 1,
			friction: 8,
			tension: 68,
			useNativeDriver: true,
		}).start()
	}, [pendingMeal, pendingAnim])

	useEffect(() => {
		const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
		const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
		const onShow = Keyboard.addListener(showEvt, e => {
			setKeyboardPad(e.endCoordinates?.height ?? 0)
		})
		const onHide = Keyboard.addListener(hideEvt, () => setKeyboardPad(0))
		return () => {
			onShow.remove()
			onHide.remove()
		}
	}, [])

	const load = useCallback(async () => {
		setLoadError(null)
		try {
			const data = await fetchNutritionDay()
			// Always trust server photoQuota — never invent/sticky-merge local 240.
			setDay(normalizeDay(data))
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e)
			setLoadError(msg)
			setDay(prev => prev ?? emptyDay())
		} finally {
			setLoading(false)
		}
	}, [])

	useFocusEffect(
		useCallback(() => {
			void load()
		}, [load]),
	)

	const remaining = useMemo(() => {
		if (!day) return 0
		return Math.round(n(day.targets.calories) - n(day.totals.calories))
	}, [day])

	const pickAndAnalyze = async (from: 'camera' | 'library') => {
		setPickSourceOpen(false)
		if (!premium) {
			setPremiumGateOpen(true)
			if (user?.id) void markPremiumNudgeShown(user.id)
			return
		}
		if (photosLeft <= 0) {
			Alert.alert(t('nutrition', 'photoLimitReached'))
			return
		}
		if (from === 'camera') {
			setCameraOpen(true)
			return
		}
		try {
			const picked = await pickMealJpeg('library')
			if (!picked.ok) {
				if (picked.reason === 'permission') {
					Alert.alert(
						t('nutrition', 'permissionTitle'),
						t('nutrition', 'permissionBody'),
					)
				} else if (picked.reason === 'unsupported') {
					Alert.alert(
						t('nutrition', 'updateRequiredTitle'),
						t('nutrition', 'updateRequiredBody'),
					)
				}
				return
			}
			await runAnalyze(picked.uri)
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e)
			Alert.alert(t('nutrition', 'analyzeError'), msg)
		}
	}

	const runAnalyze = async (uri: string) => {
		setAnalyzing(true)
		const note = mealNote.trim()
		try {
			const result = await analyzeMealPhoto(uri, {
				language: language || 'ru',
				note: note || undefined,
			})
			if (result.photoQuota) {
				setDay(prev => {
					const base = prev ?? emptyDay()
					return {
						...base,
						photoQuota: {
							limit: n(result.photoQuota!.limit),
							used: n(result.photoQuota!.used),
							remaining: n(result.photoQuota!.remaining),
						},
					}
				})
			} else {
				// Old API without quota — refresh from day endpoint
				void load()
			}
			setPendingMeal({
				entry: result.entry,
				localUri: uri,
				confidence: n(result.analysis?.confidence, 0),
				items: result.analysis?.items ?? [],
				portionScale: 1,
			})
			setMealNote('')
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e)
			if (/premium/i.test(msg)) {
				setPremiumGateOpen(true)
				if (user?.id) void markPremiumNudgeShown(user.id)
			} else if (/limit/i.test(msg)) {
				Alert.alert(t('nutrition', 'photoLimitReached'))
			} else {
				Alert.alert(t('nutrition', 'analyzeError'), msg)
			}
			void load()
		} finally {
			setAnalyzing(false)
		}
	}

	const onCameraCaptured = async (uri: string) => {
		setCameraOpen(false)
		await runAnalyze(uri)
	}

	const confirmPendingMeal = async () => {
		if (!pendingMeal || confirmingMeal) return
		setConfirmingMeal(true)
		const { entry, portionScale } = pendingMeal
		try {
			if (portionScale !== 1) {
				await updateFoodEntry(entry.id, {
					calories: scaleKcal(n(entry.calories), portionScale),
					proteinG: scaleMacro(n(entry.proteinG), portionScale),
					carbsG: scaleMacro(n(entry.carbsG), portionScale),
					fatG: scaleMacro(n(entry.fatG), portionScale),
				})
			}
			setPendingMeal(null)
			await load()
		} finally {
			setConfirmingMeal(false)
		}
	}

	const discardPendingMeal = async () => {
		if (!pendingMeal || confirmingMeal) return
		const id = pendingMeal.entry.id
		setConfirmingMeal(true)
		try {
			setPendingMeal(null)
			if (id) {
				try {
					await deleteFoodEntry(id)
				} catch {
					/* keep going — still refresh */
				}
			}
			await load()
		} finally {
			setConfirmingMeal(false)
		}
	}

	const openEdit = (entry: FoodEntry) => {
		setEditEntry(entry)
		setEditName(entry.name)
		setEditCal(String(Math.round(n(entry.calories))))
		setEditP(String(n(entry.proteinG)))
		setEditC(String(n(entry.carbsG)))
		setEditF(String(n(entry.fatG)))
	}

	const openTargets = () => {
		if (!premium) {
			setPremiumGateOpen(true)
			if (user?.id) void markPremiumNudgeShown(user.id)
			return
		}
		const v = day ?? emptyDay()
		setTargetCal(String(Math.round(n(v.targets.calories))))
		setTargetP(String(Math.round(n(v.targets.proteinG))))
		setTargetC(String(Math.round(n(v.targets.carbsG))))
		setTargetF(String(Math.round(n(v.targets.fatG))))
		setTargetsOpen(true)
	}

	const saveTargets = async () => {
		setSavingTargets(true)
		try {
			const updated = await updateNutritionTargets({
				calories: n(targetCal),
				proteinG: n(targetP),
				carbsG: n(targetC),
				fatG: n(targetF),
			})
			setDay(prev =>
				prev
					? {
							...prev,
							targets: {
								...prev.targets,
								calories: n(updated.calories, prev.targets.calories),
								proteinG: n(updated.proteinG, prev.targets.proteinG),
								carbsG: n(updated.carbsG, prev.targets.carbsG),
								fatG: n(updated.fatG, prev.targets.fatG),
								custom: true,
								complete: true,
							},
						}
					: prev,
			)
			setTargetsOpen(false)
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e)
			Alert.alert(t('nutrition', 'saveError'), msg)
		} finally {
			setSavingTargets(false)
		}
	}

	const resetTargets = async () => {
		setSavingTargets(true)
		try {
			await updateNutritionTargets({ reset: true })
			setTargetsOpen(false)
			await load()
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e)
			Alert.alert(t('nutrition', 'saveError'), msg)
		} finally {
			setSavingTargets(false)
		}
	}

	const saveEdit = async () => {
		if (!editEntry) return
		setSaving(true)
		try {
			await updateFoodEntry(editEntry.id, {
				name: editName.trim() || editEntry.name,
				calories: n(editCal),
				proteinG: n(editP),
				carbsG: n(editC),
				fatG: n(editF),
			})
			setEditEntry(null)
			await load()
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e)
			Alert.alert(t('nutrition', 'saveError'), msg)
		} finally {
			setSaving(false)
		}
	}

	const confirmDelete = (entry: FoodEntry) => {
		Alert.alert(t('nutrition', 'deleteTitle'), entry.name, [
			{ text: t('common', 'cancel'), style: 'cancel' },
			{
				text: t('nutrition', 'delete'),
				style: 'destructive',
				onPress: async () => {
					try {
						await deleteFoodEntry(entry.id)
						setEditEntry(null)
						await load()
					} catch (e) {
						const msg = e instanceof Error ? e.message : String(e)
						Alert.alert(t('nutrition', 'saveError'), msg)
					}
				},
			},
		])
	}

	const vitaminRows = useMemo(() => {
		if (!day?.entries?.length) return []
		const sum: Record<string, number> = {}
		for (const e of day.entries) {
			const vitamins = e.vitamins || {}
			for (const [k, v] of Object.entries(vitamins)) {
				sum[k] = (sum[k] || 0) + n(v)
			}
		}
		return Object.entries(sum)
			.filter(([, v]) => v > 0)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10)
	}, [day])

	const view = day ?? emptyDay()
	const photoQuota = view.photoQuota ?? { limit: 0, used: 0, remaining: 0 }
	// Remaining AI meal photos this month — only from server, never invent 240.
	const photosLeft =
		premium && photoQuota.limit > 0
			? Math.max(0, Math.round(photoQuota.remaining))
			: 0
	const canSendPhoto = premium && photosLeft > 0

	const photoSupported = useMemo(() => {
		try {
			return isMealPhotoSupported()
		} catch {
			return false
		}
	}, [])

	const openPhotoFlow = useCallback(() => {
		if (!premium) {
			setPremiumGateOpen(true)
			if (user?.id) void markPremiumNudgeShown(user.id)
			return
		}
		if (photosLeft <= 0) {
			Alert.alert(t('nutrition', 'photoLimitReached'))
			return
		}
		setPickSourceOpen(true)
	}, [premium, photosLeft, t, user?.id])

	useFocusEffect(
		useCallback(() => {
			const raw = params.add
			const add = Array.isArray(raw) ? raw[0] : raw
			if (add !== '1') return
			router.setParams({ add: '' })
			const tmr = setTimeout(() => openPhotoFlow(), 120)
			return () => clearTimeout(tmr)
		}, [params.add, openPhotoFlow]),
	)

	return (
		<SafeAreaView style={styles.safe} edges={['top']}>
			<ScrollView
				contentContainerStyle={styles.scroll}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.header}>
					<View style={{ flex: 1, paddingRight: 12 }}>
						<Text style={styles.title}>{t('nutrition', 'today')}</Text>
						<Text style={styles.subtitle}>{formatTodayTitle(locale)}</Text>
					</View>
					<View
						style={[
							styles.quotaBadge,
							!canSendPhoto && styles.quotaBadgeMuted,
						]}
					>
						<Ionicons
							name='flame'
							size={15}
							color={canSendPhoto ? T.accent : T.textSecondary}
						/>
						<Text
							style={[
								styles.quotaText,
								{ color: canSendPhoto ? T.accent : T.textSecondary },
							]}
						>
							{photosLeft}
						</Text>
					</View>
				</View>

				{!photoSupported ? (
					<View style={styles.updateBox}>
						<Text style={styles.updateTitle}>
							{t('nutrition', 'updateRequiredTitle')}
						</Text>
						<Text style={styles.updateBody}>
							{t('nutrition', 'updateRequiredBody')}
						</Text>
					</View>
				) : null}

				{loading && !day ? (
					<NutritionSkeleton />
				) : (
					<FadeIn show={!loading || !!day}>
						{loadError ? (
							<TouchableOpacity onPress={() => void load()} style={styles.errorBox}>
								<Text style={styles.errorText}>
									{t('nutrition', 'loadError')}
								</Text>
								<Text style={styles.errorHint} numberOfLines={2}>
									{loadError}
								</Text>
							</TouchableOpacity>
						) : null}

						<View style={styles.calorieCard}>
							<View style={styles.calorieTextCol}>
								<Text style={styles.remainNum}>
									{remaining >= 0 ? remaining : Math.abs(remaining)}
								</Text>
								<Text style={styles.remainLabel}>
									{t('nutrition', 'calories')}
								</Text>
								<Text style={styles.goalHint}>
									{Math.round(n(view.totals.calories))} /{' '}
									{Math.round(n(view.targets.calories))}{' '}
									{t('nutrition', 'kcal')}
								</Text>
							</View>
							<ProgressRing
								size={92}
								stroke={10}
								progress={
									n(view.targets.calories) > 0
										? Math.min(1, n(view.totals.calories) / n(view.targets.calories))
										: 0
								}
								trackColor={T.track}
								progressColor={remaining < 0 ? T.error : T.primary}
							>
								<View style={styles.ringCenter}>
									<Ionicons
										name='flame'
										size={26}
										color={remaining < 0 ? T.error : T.accent}
									/>
								</View>
							</ProgressRing>
						</View>

						{!view.targets.complete ? (
							<Text style={styles.profileHint}>
								{t('nutrition', 'incompleteProfile')}
							</Text>
						) : null}

						<View style={styles.macroRow}>
							<MacroRingCard
								eaten={n(view.totals.proteinG)}
								target={n(view.targets.proteinG)}
								unit={t('nutrition', 'g')}
								label={t('nutrition', 'protein')}
								icon={
									<MaterialCommunityIcons
										name='food-steak'
										size={20}
										color={
											n(view.totals.proteinG) > n(view.targets.proteinG)
												? '#FF3B30'
												: MACRO_COLORS.protein
										}
									/>
								}
								color={MACRO_COLORS.protein}
								over={n(view.totals.proteinG) > n(view.targets.proteinG)}
								trackColor={T.track}
								styles={styles}
							/>
							<MacroRingCard
								eaten={n(view.totals.carbsG)}
								target={n(view.targets.carbsG)}
								unit={t('nutrition', 'g')}
								label={t('nutrition', 'carbs')}
								icon={
									<Ionicons
										name='flash'
										size={20}
										color={
											n(view.totals.carbsG) > n(view.targets.carbsG)
												? '#FF3B30'
												: MACRO_COLORS.carbs
										}
									/>
								}
								color={MACRO_COLORS.carbs}
								over={n(view.totals.carbsG) > n(view.targets.carbsG)}
								trackColor={T.track}
								styles={styles}
							/>
							<MacroRingCard
								eaten={n(view.totals.fatG)}
								target={n(view.targets.fatG)}
								unit={t('nutrition', 'g')}
								label={t('nutrition', 'fat')}
								icon={
									<Ionicons
										name='water'
										size={20}
										color={
											n(view.totals.fatG) > n(view.targets.fatG)
												? '#FF3B30'
												: MACRO_COLORS.fat
										}
									/>
								}
								color={MACRO_COLORS.fat}
								over={n(view.totals.fatG) > n(view.targets.fatG)}
								trackColor={T.track}
								styles={styles}
							/>
						</View>

						{vitaminRows.length > 0 ? (
							<View style={styles.section}>
								<Text style={styles.sectionTitle}>
									{t('nutrition', 'vitamins')}
								</Text>
								<View style={styles.vitGrid}>
									{vitaminRows.map(([key, val]) => {
										const { label, unitLabel, accent } = vitaminDisplay(
											key,
											t as (ns: 'nutrition', key: string) => string,
										)
										return (
											<View key={key} style={styles.vitCard}>
												<View
													style={[
														styles.vitCardInner,
														{ borderLeftColor: accent },
													]}
												>
													<Text style={styles.vitKey} numberOfLines={1}>
														{label}
													</Text>
													<Text style={styles.vitVal}>
														{formatVitaminValue(val)}
														{unitLabel ? (
															<Text style={styles.vitUnit}> {unitLabel}</Text>
														) : null}
													</Text>
												</View>
											</View>
										)
									})}
								</View>
							</View>
						) : null}

						<View style={styles.section}>
							<View style={styles.mealsHead}>
								<Text style={[styles.sectionTitle, { marginBottom: 0, marginLeft: 0 }]}>
									{t('nutrition', 'foodIntake')}
								</Text>
								<Text style={styles.mealCount}>{view.entries.length}</Text>
							</View>

							{view.entries.length === 0 ? (
								<View style={styles.empty}>
									<Ionicons
										name='restaurant-outline'
										size={32}
										color={T.textTertiary}
									/>
									<Text style={styles.emptyTitle}>
										{t('nutrition', 'emptyTitle')}
									</Text>
									<Text style={styles.emptyBody}>
										{t('nutrition', 'emptyBody')}
									</Text>
								</View>
							) : (
								view.entries.map(entry => {
									const timeLabel = formatMealTime(entry.createdAt)
									return (
										<TouchableOpacity
											key={entry.id}
											style={styles.mealRow}
											onPress={() => openEdit(entry)}
											activeOpacity={0.75}
										>
											{entry.photoUrl ? (
												<Image
													source={{ uri: entry.photoUrl }}
													style={styles.thumb}
												/>
											) : (
												<View style={[styles.thumb, styles.thumbFallback]}>
													<Ionicons
														name='fast-food-outline'
														size={24}
														color={T.textSecondary}
													/>
												</View>
											)}
											<View style={styles.mealMeta}>
												<Text style={styles.mealName} numberOfLines={2}>
													{entry.name}
												</Text>
												{timeLabel ? (
													<Text style={styles.mealTime}>{timeLabel}</Text>
												) : null}
												<View style={styles.mealStatsRow}>
													<View style={styles.mealStat}>
														<Ionicons name='flame' size={13} color={T.accent} />
														<Text style={styles.mealCal}>
															{Math.round(n(entry.calories))}
														</Text>
													</View>
													<View style={styles.mealStat}>
														<MaterialCommunityIcons
															name='food-steak'
															size={12}
															color={MACRO_COLORS.protein}
														/>
														<Text style={styles.mealMacroVal}>
															{Math.round(n(entry.proteinG))}
														</Text>
													</View>
													<View style={styles.mealStat}>
														<Ionicons
															name='flash'
															size={12}
															color={MACRO_COLORS.carbs}
														/>
														<Text style={styles.mealMacroVal}>
															{Math.round(n(entry.carbsG))}
														</Text>
													</View>
													<View style={styles.mealStat}>
														<Ionicons name='water' size={12} color='#E6B800' />
														<Text style={styles.mealMacroVal}>
															{Math.round(n(entry.fatG))}
														</Text>
													</View>
												</View>
											</View>
											<Ionicons
												name='chevron-forward'
												size={18}
												color={T.textTertiary}
											/>
										</TouchableOpacity>
									)
								})
							)}
						</View>
					</FadeIn>
				)}
			</ScrollView>

			<View
				style={[styles.photoFabWrap, { bottom: 16 }]}
				pointerEvents='box-none'
			>
				<TouchableOpacity
					style={styles.historyFab}
					onPress={() =>
						router.push({
							pathname: '/(tabs)/history',
							params: { tab: 'food' },
						})
					}
					activeOpacity={0.85}
					accessibilityLabel={t('nutrition', 'historyFab')}
				>
					<Ionicons name='time-outline' size={22} color={T.text} />
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.limitsFab}
					onPress={openTargets}
					activeOpacity={0.85}
					accessibilityLabel={
						view.targets.custom
							? t('nutrition', 'editLimitsCustom')
							: t('nutrition', 'editLimits')
					}
				>
					<Ionicons name='options-outline' size={22} color={T.text} />
				</TouchableOpacity>
				{photoSupported ? (
					<TouchableOpacity
						style={styles.photoFab}
						onPress={openPhotoFlow}
						activeOpacity={0.85}
						disabled={analyzing}
						accessibilityLabel={t('nutrition', 'addMeal')}
					>
						<Ionicons name='add' size={32} color={T.background} />
					</TouchableOpacity>
				) : null}
			</View>

			<Modal
				visible={pickSourceOpen}
				transparent
				animationType='slide'
				onRequestClose={() => setPickSourceOpen(false)}
			>
				<View style={styles.sheetBackdrop}>
					<TouchableOpacity
						style={StyleSheet.absoluteFill}
						activeOpacity={1}
						onPress={() => setPickSourceOpen(false)}
					/>
					<View style={styles.sheet}>
						<SheetModalHeader
							title={t('nutrition', 'addMeal')}
							onClose={() => setPickSourceOpen(false)}
							closeAccessibilityLabel={t('common', 'cancel')}
						/>
						<Text style={styles.pickHint}>{t('nutrition', 'addMealHint')}</Text>
						<Text style={styles.pickNoteLabel}>{t('nutrition', 'mealNote')}</Text>
						<TextInput
							style={styles.pickNoteInput}
							placeholder={t('nutrition', 'mealNotePlaceholder')}
							placeholderTextColor={T.textSecondary}
							value={mealNote}
							onChangeText={setMealNote}
							multiline
							maxLength={200}
						/>
						<TouchableOpacity
							style={styles.pickOption}
							onPress={() => void pickAndAnalyze('camera')}
							activeOpacity={0.8}
							disabled={analyzing}
						>
							<View style={styles.pickOptionIcon}>
								<Ionicons name='camera-outline' size={22} color={T.primary} />
							</View>
							<Text style={styles.pickOptionText}>{t('nutrition', 'camera')}</Text>
							<Ionicons name='chevron-forward' size={18} color={T.textSecondary} />
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.pickOption}
							onPress={() => void pickAndAnalyze('library')}
							activeOpacity={0.8}
							disabled={analyzing}
						>
							<View style={styles.pickOptionIcon}>
								<Ionicons name='image-outline' size={22} color={T.primary} />
							</View>
							<Text style={styles.pickOptionText}>{t('nutrition', 'gallery')}</Text>
							<Ionicons name='chevron-forward' size={18} color={T.textSecondary} />
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			<Modal visible={analyzing} transparent animationType='fade'>
				<View style={styles.overlay}>
					<ActivityIndicator size='large' color={T.primary} />
					<Text style={styles.overlayText}>{t('nutrition', 'analyzing')}</Text>
				</View>
			</Modal>

			<MealCameraModal
				visible={cameraOpen}
				hint={t('nutrition', 'cameraFrameHint')}
				captureLabel={t('nutrition', 'cameraCapture')}
				cancelLabel={t('common', 'cancel')}
				permissionBody={t('nutrition', 'permissionBody')}
				onCancel={() => setCameraOpen(false)}
				onCaptured={uri => void onCameraCaptured(uri)}
			/>

			<Modal
				visible={!!pendingMeal}
				transparent
				animationType='fade'
				onRequestClose={() => void discardPendingMeal()}
			>
				<View style={styles.confirmBackdrop}>
					<TouchableOpacity
						style={StyleSheet.absoluteFill}
						activeOpacity={1}
						onPress={() => void discardPendingMeal()}
						disabled={confirmingMeal}
					/>
					<Animated.View
						style={[
							styles.confirmCard,
							{
								opacity: pendingAnim,
								transform: [
									{
										translateY: pendingAnim.interpolate({
											inputRange: [0, 1],
											outputRange: [36, 0],
										}),
									},
									{
										scale: pendingAnim.interpolate({
											inputRange: [0, 1],
											outputRange: [0.94, 1],
										}),
									},
								],
							},
						]}
					>
						<SheetModalHeader
							title={t('nutrition', 'analysisResult')}
							onClose={() => void discardPendingMeal()}
							showHandle={false}
						/>

						{pendingMeal ? (
							<ScrollView
								showsVerticalScrollIndicator={false}
								bounces={false}
								contentContainerStyle={styles.confirmScroll}
							>
								<Image
									source={{
										uri: pendingMeal.entry.photoUrl || pendingMeal.localUri,
									}}
									style={styles.confirmPhoto}
								/>
								<Text style={styles.confirmName} numberOfLines={2}>
									{pendingMeal.entry.name}
								</Text>
								{pendingMeal.confidence > 0 ? (
									<Text style={styles.confirmConfidence}>
										{Math.round(pendingMeal.confidence * 100)}%
									</Text>
								) : null}

								{pendingMeal.items.length > 0 ? (
									<View style={styles.itemsBlock}>
										<Text style={styles.itemsTitle}>
											{t('nutrition', 'itemsBreakdown')}
										</Text>
										{pendingMeal.items.map((item, idx) => (
											<View key={`${item.name}-${idx}`} style={styles.itemRow}>
												<Text style={styles.itemName} numberOfLines={1}>
													{item.name}
												</Text>
												<Text style={styles.itemGrams}>
													{Math.round(item.grams * pendingMeal.portionScale)}{' '}
													{t('nutrition', 'g')}
												</Text>
											</View>
										))}
									</View>
								) : null}

								<Text style={styles.portionLabel}>
									{t('nutrition', 'portionSize')}
								</Text>
								<View style={styles.portionRow}>
									{PORTION_SCALES.map(scale => {
										const on = pendingMeal.portionScale === scale
										return (
											<TouchableOpacity
												key={scale}
												style={[
													styles.portionChip,
													on && styles.portionChipOn,
												]}
												onPress={() =>
													setPendingMeal(prev =>
														prev ? { ...prev, portionScale: scale } : prev,
													)
												}
												activeOpacity={0.8}
											>
												<Text
													style={[
														styles.portionChipText,
														on && styles.portionChipTextOn,
													]}
												>
													{scale === 1 ? '100%' : `${Math.round(scale * 100)}%`}
												</Text>
											</TouchableOpacity>
										)
									})}
								</View>

								<View style={styles.detailMacroRow}>
									<View style={styles.detailMacroCard}>
										<Text style={styles.detailMacroVal}>
											{scaleKcal(
												n(pendingMeal.entry.calories),
												pendingMeal.portionScale,
											)}
										</Text>
										<Text style={styles.detailMacroLbl}>
											{t('nutrition', 'kcal')}
										</Text>
									</View>
									<View style={styles.detailMacroCard}>
										<Text style={[styles.detailMacroVal, { color: '#FF6B6B' }]}>
											{Math.round(
												scaleMacro(
													n(pendingMeal.entry.proteinG),
													pendingMeal.portionScale,
												),
											)}
										</Text>
										<Text style={styles.detailMacroLbl}>
											{t('nutrition', 'protein')}
										</Text>
									</View>
									<View style={styles.detailMacroCard}>
										<Text style={[styles.detailMacroVal, { color: '#5AC8FA' }]}>
											{Math.round(
												scaleMacro(
													n(pendingMeal.entry.carbsG),
													pendingMeal.portionScale,
												),
											)}
										</Text>
										<Text style={styles.detailMacroLbl}>
											{t('nutrition', 'carbs')}
										</Text>
									</View>
									<View style={styles.detailMacroCard}>
										<Text style={[styles.detailMacroVal, { color: '#FFD60A' }]}>
											{Math.round(
												scaleMacro(
													n(pendingMeal.entry.fatG),
													pendingMeal.portionScale,
												),
											)}
										</Text>
										<Text style={styles.detailMacroLbl}>
											{t('nutrition', 'fat')}
										</Text>
									</View>
								</View>

								{Object.keys(pendingMeal.entry.vitamins || {}).length > 0 ? (
									<View style={styles.vitGrid}>
										{Object.entries(pendingMeal.entry.vitamins || {})
											.filter(([, v]) => n(v) > 0)
											.sort((a, b) => n(b[1]) - n(a[1]))
											.slice(0, 6)
											.map(([key, val]) => {
												const { label, unitLabel, accent } = vitaminDisplay(
													key,
													t as (ns: 'nutrition', key: string) => string,
												)
												return (
													<View key={key} style={styles.vitCard}>
														<View
															style={[
																styles.vitCardInner,
																{ borderLeftColor: accent },
															]}
														>
															<Text style={styles.vitKey} numberOfLines={1}>
																{label}
															</Text>
															<Text style={styles.vitVal}>
																{formatVitaminValue(n(val))}
																{unitLabel ? (
																	<Text style={styles.vitUnit}>
																		{' '}
																		{unitLabel}
																	</Text>
																) : null}
															</Text>
														</View>
													</View>
												)
											})}
									</View>
								) : null}
							</ScrollView>
						) : null}

						<TouchableOpacity
							style={[styles.confirmBtn, confirmingMeal && { opacity: 0.7 }]}
							onPress={() => void confirmPendingMeal()}
							disabled={confirmingMeal}
							activeOpacity={0.85}
						>
							{confirmingMeal ? (
								<ActivityIndicator color='#000' />
							) : (
								<Text style={styles.confirmBtnText}>
									{t('nutrition', 'confirmMeal')}
								</Text>
							)}
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.discardBtn}
							onPress={() => void discardPendingMeal()}
							disabled={confirmingMeal}
						>
							<Text style={styles.discardBtnText}>
								{t('nutrition', 'discardMeal')}
							</Text>
						</TouchableOpacity>
					</Animated.View>
				</View>
			</Modal>

			<Modal
				visible={!!editEntry}
				transparent
				animationType='slide'
				onRequestClose={() => setEditEntry(null)}
			>
				<KeyboardAvoidingView
					style={styles.sheetBackdrop}
					behavior={Platform.OS === 'ios' ? 'padding' : undefined}
					keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
				>
					<TouchableOpacity
						style={StyleSheet.absoluteFill}
						activeOpacity={1}
						onPress={() => {
							Keyboard.dismiss()
							setEditEntry(null)
						}}
					/>
					<ScrollView
						keyboardShouldPersistTaps='handled'
						bounces={false}
						contentContainerStyle={[
							styles.sheetScroll,
							{ paddingBottom: Math.max(12, keyboardPad) },
						]}
					>
						<View
							style={[
								styles.sheet,
								{
									paddingBottom:
										16 + (Platform.OS === 'android' ? keyboardPad : 0),
								},
							]}
						>
							<SheetModalHeader
								title={t('nutrition', 'mealDetails')}
								onClose={() => {
									Keyboard.dismiss()
									setEditEntry(null)
								}}
								closeAccessibilityLabel={t('common', 'cancel')}
							/>

							{editEntry?.photoUrl ? (
								<Image
									source={{ uri: editEntry.photoUrl }}
									style={styles.detailPhoto}
								/>
							) : (
								<View style={[styles.detailPhoto, styles.detailPhotoFallback]}>
									<Ionicons
										name='fast-food-outline'
										size={28}
										color={T.textSecondary}
									/>
								</View>
							)}

							<View style={styles.detailMacroRow}>
								<View style={styles.detailMacroCard}>
									<Text style={styles.detailMacroVal}>
										{Math.round(n(editCal))}
									</Text>
									<Text style={styles.detailMacroLbl}>
										{t('nutrition', 'kcal')}
									</Text>
								</View>
								<View style={styles.detailMacroCard}>
									<Text style={[styles.detailMacroVal, { color: '#FF6B6B' }]}>
										{Math.round(n(editP))}
									</Text>
									<Text style={styles.detailMacroLbl}>
										{t('nutrition', 'protein')}
									</Text>
								</View>
								<View style={styles.detailMacroCard}>
									<Text style={[styles.detailMacroVal, { color: '#5AC8FA' }]}>
										{Math.round(n(editC))}
									</Text>
									<Text style={styles.detailMacroLbl}>
										{t('nutrition', 'carbs')}
									</Text>
								</View>
								<View style={styles.detailMacroCard}>
									<Text style={[styles.detailMacroVal, { color: '#FFD60A' }]}>
										{Math.round(n(editF))}
									</Text>
									<Text style={styles.detailMacroLbl}>
										{t('nutrition', 'fat')}
									</Text>
								</View>
							</View>

							{editEntry &&
							Object.keys(editEntry.vitamins || {}).length > 0 ? (
								<View style={styles.detailVitamins}>
									<Text style={styles.detailSectionLabel}>
										{t('nutrition', 'vitamins')}
									</Text>
									<View style={styles.vitGrid}>
										{Object.entries(editEntry.vitamins || {})
											.filter(([, v]) => n(v) > 0)
											.sort((a, b) => n(b[1]) - n(a[1]))
											.map(([key, val]) => {
												const { label, unitLabel, accent } = vitaminDisplay(
													key,
													t as (ns: 'nutrition', key: string) => string,
												)
												return (
													<View key={key} style={styles.vitCard}>
														<View
															style={[
																styles.vitCardInner,
																{ borderLeftColor: accent },
															]}
														>
															<Text style={styles.vitKey} numberOfLines={1}>
																{label}
															</Text>
															<Text style={styles.vitVal}>
																{formatVitaminValue(n(val))}
																{unitLabel ? (
																	<Text style={styles.vitUnit}>
																		{' '}
																		{unitLabel}
																	</Text>
																) : null}
															</Text>
														</View>
													</View>
												)
											})}
									</View>
								</View>
							) : null}

							<Text style={styles.detailSectionLabel}>
								{t('nutrition', 'editMeal')}
							</Text>
							<TextInput
								style={styles.input}
								value={editName}
								onChangeText={setEditName}
								placeholder={t('nutrition', 'name')}
								placeholderTextColor={T.textTertiary}
							/>
							<View style={styles.inputRow}>
								<TextInput
									style={[styles.input, styles.inputHalf]}
									value={editCal}
									onChangeText={setEditCal}
									keyboardType='numeric'
									placeholder={t('nutrition', 'kcal')}
									placeholderTextColor={T.textTertiary}
								/>
								<TextInput
									style={[styles.input, styles.inputHalf]}
									value={editP}
									onChangeText={setEditP}
									keyboardType='numeric'
									placeholder={t('nutrition', 'protein')}
									placeholderTextColor={T.textTertiary}
								/>
							</View>
							<View style={styles.inputRow}>
								<TextInput
									style={[styles.input, styles.inputHalf]}
									value={editC}
									onChangeText={setEditC}
									keyboardType='numeric'
									placeholder={t('nutrition', 'carbs')}
									placeholderTextColor={T.textTertiary}
								/>
								<TextInput
									style={[styles.input, styles.inputHalf]}
									value={editF}
									onChangeText={setEditF}
									keyboardType='numeric'
									placeholder={t('nutrition', 'fat')}
									placeholderTextColor={T.textTertiary}
								/>
							</View>
							<TouchableOpacity
								style={styles.saveBtn}
								onPress={() => void saveEdit()}
								disabled={saving}
							>
								{saving ? (
									<ActivityIndicator color='#000' />
								) : (
									<Text style={styles.saveBtnText}>
										{t('nutrition', 'save')}
									</Text>
								)}
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.deleteBtn}
								onPress={() => editEntry && confirmDelete(editEntry)}
							>
								<Text style={styles.deleteBtnText}>
									{t('nutrition', 'delete')}
								</Text>
							</TouchableOpacity>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</Modal>

			<Modal
				visible={targetsOpen}
				transparent
				animationType='slide'
				onRequestClose={() => setTargetsOpen(false)}
			>
				<KeyboardAvoidingView
					style={styles.sheetBackdrop}
					behavior={Platform.OS === 'ios' ? 'padding' : undefined}
					keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
				>
					<TouchableOpacity
						style={styles.sheetDismissArea}
						activeOpacity={1}
						onPress={() => {
							Keyboard.dismiss()
							setTargetsOpen(false)
						}}
					/>
					<View
						style={[
							styles.sheet,
							{
								paddingBottom:
									16 + (Platform.OS === 'android' ? keyboardPad : 0),
							},
						]}
					>
						<ScrollView
							keyboardShouldPersistTaps='handled'
							bounces={false}
							showsVerticalScrollIndicator={false}
						>
							<SheetModalHeader
								title={t('nutrition', 'limitsTitle')}
								onClose={() => {
									Keyboard.dismiss()
									setTargetsOpen(false)
								}}
								closeAccessibilityLabel={t('common', 'cancel')}
							/>
							<Text style={styles.limitsHint}>{t('nutrition', 'limitsHint')}</Text>
							<View style={styles.inputRow}>
								<TextInput
									style={[styles.input, styles.inputHalf]}
									value={targetCal}
									onChangeText={setTargetCal}
									keyboardType='numeric'
									placeholder={t('nutrition', 'kcal')}
									placeholderTextColor={T.textTertiary}
								/>
								<TextInput
									style={[styles.input, styles.inputHalf]}
									value={targetP}
									onChangeText={setTargetP}
									keyboardType='numeric'
									placeholder={t('nutrition', 'protein')}
									placeholderTextColor={T.textTertiary}
								/>
							</View>
							<View style={styles.inputRow}>
								<TextInput
									style={[styles.input, styles.inputHalf]}
									value={targetC}
									onChangeText={setTargetC}
									keyboardType='numeric'
									placeholder={t('nutrition', 'carbs')}
									placeholderTextColor={T.textTertiary}
								/>
								<TextInput
									style={[styles.input, styles.inputHalf]}
									value={targetF}
									onChangeText={setTargetF}
									keyboardType='numeric'
									placeholder={t('nutrition', 'fat')}
									placeholderTextColor={T.textTertiary}
								/>
							</View>
							<TouchableOpacity
								style={styles.saveBtn}
								onPress={() => void saveTargets()}
								disabled={savingTargets}
							>
								{savingTargets ? (
									<ActivityIndicator color='#000' />
								) : (
									<Text style={styles.saveBtnText}>{t('nutrition', 'save')}</Text>
								)}
							</TouchableOpacity>
							{view.targets.custom ? (
								<TouchableOpacity
									style={styles.deleteBtn}
									onPress={() => void resetTargets()}
									disabled={savingTargets}
								>
									<Text style={styles.resetTargetsText}>
										{t('nutrition', 'resetLimits')}
									</Text>
								</TouchableOpacity>
							) : null}
						</ScrollView>
					</View>
				</KeyboardAvoidingView>
			</Modal>

			<PremiumGateModal
				visible={premiumGateOpen}
				onClose={() => setPremiumGateOpen(false)}
				featureIcon='restaurant-outline'
				featureColor='#34C759'
			/>
		</SafeAreaView>
	)
}

export default function NutritionTab() {
	return (
		<ErrorBoundary>
			<NutritionTabInner />
		</ErrorBoundary>
	)
}

function makeNutritionStyles(T: AppColors) {
	return StyleSheet.create({
	safe: { flex: 1, backgroundColor: T.background },
	scroll: { paddingHorizontal: 14, paddingBottom: 120 },
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 0,
		paddingTop: 20,
		paddingBottom: 16,
	},
	title: { fontSize: 28, fontWeight: 'bold', color: T.text },
	subtitle: {
		fontSize: 15,
		color: T.textSecondary,
		marginTop: 4,
		textTransform: 'capitalize',
	},
	quotaBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 16,
		backgroundColor: `${T.primary}1F`,
		borderWidth: 1,
		borderColor: `${T.primary}33`,
	},
	quotaBadgeMuted: {
		backgroundColor: T.card,
		borderColor: T.border,
	},
	quotaText: {
		fontSize: 14,
		fontWeight: '700',
		color: T.primary,
		fontVariant: ['tabular-nums'],
	},
	errorBox: {
		marginBottom: 12,
		padding: 14,
		borderRadius: 16,
		backgroundColor: `${T.error}1F`,
		borderWidth: 1,
		borderColor: `${T.error}40`,
	},
	errorText: { color: T.error, fontWeight: '600', fontSize: 14 },
	errorHint: { color: T.textSecondary, fontSize: 12, marginTop: 4 },
	calorieCard: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: T.card,
		borderRadius: 28,
		paddingVertical: 22,
		paddingHorizontal: 20,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: T.border,
		...softCardShadow,
	},
	calorieTextCol: {
		flex: 1,
		paddingRight: 12,
	},
	limitsHint: {
		fontSize: 13,
		color: T.textSecondary,
		marginBottom: 12,
		lineHeight: 18,
	},
	resetTargetsText: {
		color: T.info,
		fontSize: 14,
		fontWeight: '500',
	},
	remainNum: {
		fontSize: 40,
		fontWeight: '800',
		color: T.text,
		letterSpacing: -1,
	},
	remainLabel: {
		fontSize: 15,
		fontWeight: '600',
		color: T.text,
		marginTop: 2,
	},
	ringCenter: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: T.card,
		alignItems: 'center',
		justifyContent: 'center',
	},
	goalHint: {
		marginTop: 8,
		fontSize: 12,
		color: T.textTertiary,
	},
	profileHint: {
		textAlign: 'center',
		color: T.warning,
		fontSize: 13,
		marginBottom: 12,
		paddingHorizontal: 8,
	},
	macroRow: {
		flexDirection: 'row',
		gap: 10,
		marginBottom: 8,
	},
	macroCard: {
		flex: 1,
		backgroundColor: T.card,
		borderRadius: 24,
		paddingTop: 14,
		paddingBottom: 12,
		paddingHorizontal: 8,
		borderWidth: 1,
		borderColor: T.border,
		alignItems: 'center',
		minHeight: 168,
		...softCardShadow,
	},
	macroRingCenter: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
	},
	macroCardValue: {
		marginTop: 10,
		fontSize: 22,
		fontWeight: '800',
		color: T.text,
		letterSpacing: -0.5,
	},
	macroCardUnit: {
		fontSize: 13,
		fontWeight: '600',
		color: T.textSecondary,
	},
	macroCardLabel: {
		marginTop: 2,
		fontSize: 11,
		fontWeight: '500',
		color: T.textSecondary,
		textAlign: 'center',
		lineHeight: 14,
		minHeight: 28,
	},
	macroGoalHint: {
		marginTop: 2,
		fontSize: 10,
		fontWeight: '500',
		color: T.textTertiary,
		textAlign: 'center',
		fontVariant: ['tabular-nums'],
	},
	macroCardIconWrap: {
		marginTop: 10,
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	section: { marginTop: 14 },
	vitGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginTop: 4,
		marginHorizontal: -4,
	},
	vitCard: {
		width: '50%',
		paddingHorizontal: 4,
		marginBottom: 8,
	},
	vitCardInner: {
		backgroundColor: T.card,
		borderRadius: 18,
		paddingVertical: 12,
		paddingHorizontal: 12,
		borderWidth: 1,
		borderColor: T.border,
		borderLeftWidth: 3,
		...softCardShadow,
	},
	vitKey: {
		fontSize: 12,
		color: T.textSecondary,
		fontWeight: '500',
	},
	vitVal: {
		marginTop: 3,
		fontSize: 15,
		color: T.text,
		fontWeight: '700',
	},
	vitUnit: {
		fontSize: 11,
		fontWeight: '500',
		color: T.textSecondary,
	},
	mealsHead: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 12,
		paddingHorizontal: 4,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: T.text,
		marginBottom: 10,
		marginLeft: 4,
	},
	mealCount: { fontSize: 13, color: T.textTertiary, fontWeight: '600' },
	empty: {
		alignItems: 'center',
		paddingVertical: 32,
		backgroundColor: T.card,
		borderRadius: 24,
		borderWidth: 1,
		borderColor: T.border,
		marginBottom: 8,
		...softCardShadow,
	},
	emptyTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: T.text,
		marginTop: 8,
	},
	emptyBody: {
		fontSize: 13,
		color: T.textSecondary,
		textAlign: 'center',
		lineHeight: 19,
		maxWidth: 260,
		marginTop: 6,
		paddingHorizontal: 16,
	},
	mealRow: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: T.card,
		borderRadius: 22,
		padding: 12,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: T.border,
		...softCardShadow,
	},
	thumb: {
		width: 64,
		height: 64,
		borderRadius: 16,
		backgroundColor: T.cardLight,
		marginRight: 12,
	},
	thumbFallback: { alignItems: 'center', justifyContent: 'center' },
	mealMeta: { flex: 1, paddingRight: 6 },
	mealName: { fontSize: 15, fontWeight: '700', color: T.text, lineHeight: 20 },
	mealTime: { marginTop: 2, fontSize: 12, color: T.textTertiary },
	mealStatsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 10,
		marginTop: 8,
	},
	mealStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
	mealCal: { fontSize: 13, fontWeight: '700', color: T.text },
	mealMacroVal: { fontSize: 12, fontWeight: '600', color: T.textSecondary },
	overlay: {
		flex: 1,
		backgroundColor: T.overlay,
		alignItems: 'center',
		justifyContent: 'center',
	},
	overlayText: {
		color: T.text,
		fontSize: 15,
		fontWeight: '500',
		marginTop: 14,
	},
	confirmBackdrop: {
		flex: 1,
		backgroundColor: T.overlay,
		justifyContent: 'center',
		paddingHorizontal: 18,
		paddingVertical: 28,
	},
	confirmCard: {
		backgroundColor: T.modalSurface,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: T.border,
		paddingHorizontal: 14,
		paddingTop: 12,
		paddingBottom: 14,
		maxHeight: '88%',
	},
	confirmHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	confirmTitle: {
		flex: 1,
		fontSize: 18,
		fontWeight: '700',
		color: T.text,
		paddingRight: 8,
	},
	confirmScroll: {
		paddingBottom: 8,
	},
	confirmPhoto: {
		width: '100%',
		height: 160,
		borderRadius: 14,
		backgroundColor: T.cardLight,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: T.border,
	},
	confirmName: {
		fontSize: 20,
		fontWeight: '700',
		color: T.text,
		textAlign: 'center',
		marginBottom: 4,
	},
	confirmConfidence: {
		fontSize: 12,
		color: T.textSecondary,
		textAlign: 'center',
		marginBottom: 12,
		fontWeight: '600',
	},
	itemsBlock: {
		width: '100%',
		marginBottom: 12,
		gap: 6,
	},
	itemsTitle: {
		fontSize: 12,
		fontWeight: '700',
		color: T.textSecondary,
		textTransform: 'uppercase',
		letterSpacing: 0.3,
	},
	itemRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
		paddingVertical: 8,
		paddingHorizontal: 10,
		borderRadius: 10,
		backgroundColor: T.card,
		borderWidth: 1,
		borderColor: T.border,
	},
	itemName: {
		flex: 1,
		fontSize: 13,
		fontWeight: '600',
		color: T.text,
	},
	itemGrams: {
		fontSize: 13,
		fontWeight: '700',
		color: T.primary,
	},
	portionLabel: {
		fontSize: 12,
		fontWeight: '700',
		color: T.textSecondary,
		marginBottom: 8,
		textTransform: 'uppercase',
		letterSpacing: 0.3,
	},
	portionRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginBottom: 14,
	},
	portionChip: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: T.border,
		backgroundColor: T.card,
	},
	portionChipOn: {
		borderColor: T.primary,
		backgroundColor: `${T.primary}22`,
	},
	portionChipText: {
		fontSize: 12,
		fontWeight: '600',
		color: T.textSecondary,
	},
	portionChipTextOn: {
		color: T.primary,
	},
	confirmBtn: {
		marginTop: 8,
		backgroundColor: T.primary,
		borderRadius: 14,
		paddingVertical: 14,
		alignItems: 'center',
	},
	confirmBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
	discardBtn: { alignItems: 'center', paddingVertical: 10 },
	discardBtnText: { color: T.textSecondary, fontSize: 14, fontWeight: '500' },
	sheetBackdrop: {
		flex: 1,
		backgroundColor: T.overlay,
		justifyContent: 'flex-end',
	},
	sheetDismissArea: {
		flex: 1,
	},
	sheetScroll: {
		flexGrow: 1,
		justifyContent: 'flex-end',
	},
	sheet: {
		backgroundColor: T.modalSurface,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 20,
		borderTopWidth: 1,
		borderColor: T.border,
	},
	sheetHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10,
		minHeight: 36,
	},
	sheetClose: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: T.cardLight,
		alignItems: 'center',
		justifyContent: 'center',
	},
	sheetTitle: {
		flex: 1,
		fontSize: 18,
		fontWeight: '700',
		color: T.text,
		paddingRight: 8,
	},
	detailPhoto: {
		width: '100%',
		height: 120,
		borderRadius: 14,
		backgroundColor: T.cardLight,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: T.border,
	},
	detailPhotoFallback: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	detailMacroRow: {
		flexDirection: 'row',
		marginBottom: 10,
		marginHorizontal: -3,
	},
	detailMacroCard: {
		flex: 1,
		marginHorizontal: 3,
		backgroundColor: T.card,
		borderRadius: 12,
		paddingVertical: 8,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: T.border,
	},
	detailMacroVal: {
		fontSize: 14,
		fontWeight: '700',
		color: T.text,
	},
	detailMacroLbl: {
		marginTop: 2,
		fontSize: 10,
		color: T.textSecondary,
		fontWeight: '500',
	},
	detailVitamins: { marginBottom: 4 },
	detailSectionLabel: {
		fontSize: 12,
		fontWeight: '600',
		color: T.textSecondary,
		marginBottom: 6,
		marginTop: 2,
		textTransform: 'uppercase',
		letterSpacing: 0.3,
	},
	pickHint: {
		fontSize: 13,
		color: T.textSecondary,
		marginBottom: 12,
		lineHeight: 18,
	},
	pickNoteLabel: {
		fontSize: 12,
		fontWeight: '600',
		color: T.textSecondary,
		marginBottom: 6,
	},
	pickNoteInput: {
		borderWidth: 1,
		borderColor: T.border,
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 14,
		color: T.text,
		backgroundColor: T.card,
		minHeight: 44,
		marginBottom: 12,
	},
	pickOption: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: T.card,
		borderRadius: 16,
		paddingVertical: 12,
		paddingHorizontal: 12,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: T.border,
	},
	pickOptionIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: `${T.primary}1F`,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	pickOptionText: {
		flex: 1,
		fontSize: 15,
		fontWeight: '600',
		color: T.text,
	},
	photoFabWrap: {
		position: 'absolute',
		right: 18,
		alignItems: 'center',
		gap: 12,
		zIndex: 20,
	},
	limitsFab: {
		width: 46,
		height: 46,
		borderRadius: 23,
		backgroundColor: T.card,
		borderWidth: 1,
		borderColor: T.border,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.12,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 3 },
		elevation: 4,
	},
	historyFab: {
		width: 46,
		height: 46,
		borderRadius: 23,
		backgroundColor: T.card,
		borderWidth: 1,
		borderColor: T.border,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.12,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 3 },
		elevation: 4,
	},
	photoFab: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: T.text,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.22,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 6 },
		elevation: 8,
	},
	updateBox: {
		marginBottom: 12,
		padding: 14,
		borderRadius: 16,
		backgroundColor: `${T.warning}1F`,
		borderWidth: 1,
		borderColor: `${T.warning}4D`,
	},
	updateTitle: {
		color: T.warning,
		fontSize: 15,
		fontWeight: '700',
		marginBottom: 4,
	},
	updateBody: {
		color: T.textSecondary,
		fontSize: 13,
		lineHeight: 18,
	},
	input: {
		backgroundColor: T.inputBg,
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		color: T.text,
		fontSize: 15,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: T.border,
	},
	inputRow: { flexDirection: 'row', marginHorizontal: -4 },
	inputHalf: { flex: 1, marginHorizontal: 4 },
	saveBtn: {
		marginTop: 6,
		backgroundColor: T.primary,
		borderRadius: 14,
		paddingVertical: 12,
		alignItems: 'center',
	},
	saveBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
	deleteBtn: { alignItems: 'center', paddingVertical: 10 },
	deleteBtnText: { color: T.error, fontSize: 14, fontWeight: '500' },
	cancelText: {
		textAlign: 'center',
		color: T.textSecondary,
		paddingVertical: 8,
		fontSize: 14,
	},
})
}

