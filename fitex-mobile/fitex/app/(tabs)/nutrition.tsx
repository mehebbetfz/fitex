import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import type { AppColors } from '@/constants/app-theme'
import { ErrorBoundary } from '@/components/error-boundary'
import {
	analyzeMealPhoto,
	deleteFoodEntry,
	fetchNutritionDay,
	localTodayKey,
	type FoodEntry,
	type NutritionDay,
	updateFoodEntry,
	updateNutritionTargets,
} from '@/services/nutrition'
import { isMealPhotoSupported, pickMealJpeg } from '@/services/meal-photo-pick'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Animated,
	Image,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

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

function NutritionSkeleton() {
	const { colors: T } = useAppTheme()
	const styles = useMemo(() => makeNutritionStyles(T), [T])
	const SKELETON = T.skeleton
	return (
		<View>
			<View style={styles.calorieBlock}>
				<ShimmerBlock
					style={{
						height: 44,
						width: 120,
						borderRadius: 10,
						backgroundColor: SKELETON,
					}}
				/>
				<ShimmerBlock
					style={{
						height: 14,
						width: 90,
						borderRadius: 6,
						backgroundColor: SKELETON,
						marginTop: 10,
					}}
				/>
				<ShimmerBlock
					style={{
						marginTop: 18,
						width: '100%',
						height: 8,
						borderRadius: 4,
						backgroundColor: SKELETON,
					}}
				/>
				<ShimmerBlock
					style={{
						height: 12,
						width: 140,
						borderRadius: 5,
						backgroundColor: SKELETON,
						marginTop: 12,
					}}
				/>
			</View>

			<View style={styles.macros}>
				{[0, 1, 2].map(i => (
					<View key={i} style={styles.macroCol}>
						<ShimmerBlock
							style={{
								height: 12,
								width: 48,
								borderRadius: 4,
								backgroundColor: SKELETON,
								marginBottom: 8,
							}}
						/>
						<ShimmerBlock
							style={{
								height: 6,
								width: '100%',
								borderRadius: 3,
								backgroundColor: SKELETON,
							}}
						/>
						<ShimmerBlock
							style={{
								height: 13,
								width: 56,
								borderRadius: 4,
								backgroundColor: SKELETON,
								marginTop: 8,
							}}
						/>
					</View>
				))}
			</View>

			<View style={styles.mealsHead}>
				<ShimmerBlock
					style={{
						height: 18,
						width: 88,
						borderRadius: 6,
						backgroundColor: SKELETON,
					}}
				/>
				<ShimmerBlock
					style={{
						height: 14,
						width: 24,
						borderRadius: 5,
						backgroundColor: SKELETON,
					}}
				/>
			</View>

			{[0, 1, 2].map(i => (
				<View key={i} style={styles.mealRow}>
					<ShimmerBlock
						style={{
							width: 52,
							height: 52,
							borderRadius: 12,
							backgroundColor: SKELETON,
							marginRight: 14,
						}}
					/>
					<View style={[styles.mealMeta, { gap: 8 }]}>
						<ShimmerBlock
							style={{
								height: 15,
								width: '72%',
								borderRadius: 5,
								backgroundColor: SKELETON,
							}}
						/>
						<ShimmerBlock
							style={{
								height: 12,
								width: '48%',
								borderRadius: 4,
								backgroundColor: SKELETON,
							}}
						/>
					</View>
					<ShimmerBlock
						style={{
							height: 16,
							width: 36,
							borderRadius: 5,
							backgroundColor: SKELETON,
						}}
					/>
				</View>
			))}
		</View>
	)
}

function n(v: unknown, fallback = 0) {
	const x = Number(v)
	return Number.isFinite(x) ? x : fallback
}

function MacroBar({
	label,
	current,
	target,
	color,
	unit,
	styles,
}: {
	label: string
	current: number
	target: number
	color: string
	unit: string
	styles: ReturnType<typeof makeNutritionStyles>
}) {
	const safeTarget = Math.max(1, n(target, 1))
	const pct = Math.min(1, Math.max(0, n(current) / safeTarget))
	return (
		<View style={styles.macroCol}>
			<Text style={styles.macroLabel}>{label}</Text>
			<View style={styles.macroTrack}>
				<View
					style={[
						styles.macroFill,
						{ width: `${pct * 100}%`, backgroundColor: color },
					]}
				/>
			</View>
			<Text style={styles.macroValue}>
				{Math.round(n(current))}
				<Text style={styles.macroTarget}>
					{' '}
					/ {Math.round(n(target))}
					{unit}
				</Text>
			</Text>
		</View>
	)
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
	}
}

function NutritionTabInner() {
	const { t, language } = useLanguage()
	const { colors: T } = useAppTheme()
	const styles = useMemo(() => makeNutritionStyles(T), [T])
	const locale =
		language === 'az' ? 'az-AZ' : language === 'en' ? 'en-US' : 'ru-RU'

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

	const load = useCallback(async () => {
		setLoadError(null)
		try {
			const data = await fetchNutritionDay()
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

	const progress = useMemo(() => {
		if (!day || n(day.targets.calories) <= 0) return 0
		return Math.min(1, Math.max(0, n(day.totals.calories) / n(day.targets.calories)))
	}, [day])

	const pickAndAnalyze = async (from: 'camera' | 'library') => {
		setPickSourceOpen(false)
		try {
			const picked = await pickMealJpeg(from)
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

			setAnalyzing(true)
			try {
				await analyzeMealPhoto(picked.uri)
				await load()
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e)
				Alert.alert(t('nutrition', 'analyzeError'), msg)
			} finally {
				setAnalyzing(false)
			}
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e)
			Alert.alert(t('nutrition', 'analyzeError'), msg)
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
			.slice(0, 6)
	}, [day])

	const view = day ?? emptyDay()
	const photoSupported = useMemo(() => {
		try {
			return isMealPhotoSupported()
		} catch {
			return false
		}
	}, [])

	return (
		<SafeAreaView style={styles.safe} edges={['top']}>
			<ScrollView
				contentContainerStyle={styles.scroll}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.header}>
					<Text style={styles.kicker}>{t('nutrition', 'today')}</Text>
					<Text style={styles.date}>{formatTodayTitle(locale)}</Text>
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

						<View style={styles.calorieBlock}>
							<Text style={styles.remainNum}>
								{remaining >= 0 ? remaining : Math.abs(remaining)}
							</Text>
							<Text style={styles.remainLabel}>
								{remaining >= 0
									? t('nutrition', 'leftKcal')
									: t('nutrition', 'overKcal')}
							</Text>
							<View style={styles.calorieTrack}>
								<View
									style={[
										styles.calorieFill,
										{ width: `${progress * 100}%` },
									]}
								/>
							</View>
							<Text style={styles.goalHint}>
								{Math.round(n(view.totals.calories))} /{' '}
								{Math.round(n(view.targets.calories))}{' '}
								{t('nutrition', 'kcal')}
							</Text>
						</View>

						{!view.targets.complete ? (
							<Text style={styles.profileHint}>
								{t('nutrition', 'incompleteProfile')}
							</Text>
						) : null}

						<View style={styles.macros}>
							<MacroBar
								styles={styles}
								label={t('nutrition', 'protein')}
								current={view.totals.proteinG}
								target={view.targets.proteinG}
								color='#FF6B6B'
								unit={t('nutrition', 'g')}
							/>
							<MacroBar
								styles={styles}
								label={t('nutrition', 'carbs')}
								current={view.totals.carbsG}
								target={view.targets.carbsG}
								color='#5AC8FA'
								unit={t('nutrition', 'g')}
							/>
							<MacroBar
								styles={styles}
								label={t('nutrition', 'fat')}
								current={view.totals.fatG}
								target={view.targets.fatG}
								color='#FFD60A'
								unit={t('nutrition', 'g')}
							/>
						</View>

						{vitaminRows.length > 0 ? (
							<View style={styles.vitamins}>
								<Text style={styles.sectionTitle}>
									{t('nutrition', 'vitamins')}
								</Text>
								<View style={styles.vitRow}>
									{vitaminRows.map(([key, val]) => (
										<View key={key} style={styles.vitChip}>
											<Text style={styles.vitKey}>
												{key.replace(/_/g, ' ')}
											</Text>
											<Text style={styles.vitVal}>
												{Math.round(val * 10) / 10}
											</Text>
										</View>
									))}
								</View>
							</View>
						) : null}

						<View style={styles.mealsHead}>
							<Text style={styles.sectionTitle}>{t('nutrition', 'meals')}</Text>
							<Text style={styles.mealCount}>{view.entries.length}</Text>
						</View>

						{view.entries.length === 0 ? (
							<View style={styles.empty}>
								<Ionicons
									name='restaurant-outline'
									size={36}
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
							view.entries.map(entry => (
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
												size={22}
												color={T.textSecondary}
											/>
										</View>
									)}
									<View style={styles.mealMeta}>
										<Text style={styles.mealName} numberOfLines={1}>
											{entry.name}
										</Text>
										<Text style={styles.mealMacros}>
											{Math.round(n(entry.proteinG))}P ·{' '}
											{Math.round(n(entry.carbsG))}C ·{' '}
											{Math.round(n(entry.fatG))}F
										</Text>
									</View>
									<Text style={styles.mealCal}>
										{Math.round(n(entry.calories))}
									</Text>
								</TouchableOpacity>
							))
						)}
					</FadeIn>
				)}
			</ScrollView>

			<View
				style={[styles.photoFabWrap, { bottom: 16 }]}
				pointerEvents='box-none'
			>
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
						onPress={() => setPickSourceOpen(true)}
						activeOpacity={0.85}
						disabled={analyzing}
						accessibilityLabel={t('nutrition', 'addMeal')}
					>
						<Ionicons name='camera' size={26} color='#000' />
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
						<Text style={styles.sheetTitle}>{t('nutrition', 'addMeal')}</Text>
						<Text style={styles.pickHint}>{t('nutrition', 'addMealHint')}</Text>
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
						<TouchableOpacity
							onPress={() => setPickSourceOpen(false)}
							style={{ marginTop: 8 }}
						>
							<Text style={styles.cancelText}>{t('common', 'cancel')}</Text>
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

			<Modal
				visible={!!editEntry}
				transparent
				animationType='slide'
				onRequestClose={() => setEditEntry(null)}
			>
				<View style={styles.sheetBackdrop}>
					<View style={styles.sheet}>
						<Text style={styles.sheetTitle}>{t('nutrition', 'editMeal')}</Text>
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
								<Text style={styles.saveBtnText}>{t('nutrition', 'save')}</Text>
							)}
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.deleteBtn}
							onPress={() => editEntry && confirmDelete(editEntry)}
						>
							<Text style={styles.deleteBtnText}>{t('nutrition', 'delete')}</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => setEditEntry(null)}>
							<Text style={styles.cancelText}>{t('common', 'cancel')}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			<Modal
				visible={targetsOpen}
				transparent
				animationType='slide'
				onRequestClose={() => setTargetsOpen(false)}
			>
				<View style={styles.sheetBackdrop}>
					<TouchableOpacity
						style={StyleSheet.absoluteFill}
						activeOpacity={1}
						onPress={() => setTargetsOpen(false)}
					/>
					<View style={styles.sheet}>
						<Text style={styles.sheetTitle}>{t('nutrition', 'limitsTitle')}</Text>
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
					</View>
				</View>
			</Modal>
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
	scroll: { paddingHorizontal: 22, paddingBottom: 120 },
	header: { marginTop: 8, marginBottom: 8 },
	kicker: {
		fontSize: 34,
		fontWeight: '700',
		color: T.text,
		letterSpacing: -0.6,
	},
	date: {
		marginTop: 4,
		fontSize: 15,
		color: T.textSecondary,
		textTransform: 'capitalize',
	},
	errorBox: {
		marginTop: 12,
		padding: 12,
		borderRadius: 12,
		backgroundColor: 'rgba(255,59,48,0.12)',
	},
	errorText: { color: T.error, fontWeight: '600', fontSize: 14 },
	errorHint: { color: T.textSecondary, fontSize: 12, marginTop: 4 },
	calorieBlock: {
		alignItems: 'center',
		marginTop: 28,
		marginBottom: 12,
	},
	limitsHint: {
		fontSize: 13,
		color: T.textSecondary,
		marginBottom: 14,
		lineHeight: 18,
	},
	resetTargetsText: {
		color: T.info,
		fontSize: 15,
		fontWeight: '500',
	},
	remainNum: {
		fontSize: 44,
		fontWeight: '700',
		color: T.text,
		letterSpacing: -1,
	},
	remainLabel: {
		fontSize: 13,
		color: T.textSecondary,
		marginTop: 4,
		textAlign: 'center',
	},
	calorieTrack: {
		marginTop: 18,
		width: '100%',
		height: 8,
		borderRadius: 4,
		backgroundColor: T.track,
		overflow: 'hidden',
	},
	calorieFill: {
		height: '100%',
		borderRadius: 4,
		backgroundColor: T.primary,
	},
	goalHint: {
		marginTop: 10,
		fontSize: 12,
		color: T.textTertiary,
		textAlign: 'center',
	},
	profileHint: {
		textAlign: 'center',
		color: T.warning,
		fontSize: 13,
		marginBottom: 12,
		paddingHorizontal: 12,
	},
	macros: {
		flexDirection: 'row',
		marginTop: 20,
		marginBottom: 8,
	},
	macroCol: { flex: 1, marginHorizontal: 7 },
	macroLabel: {
		fontSize: 12,
		color: T.textSecondary,
		marginBottom: 8,
		fontWeight: '500',
	},
	macroTrack: {
		height: 6,
		borderRadius: 3,
		backgroundColor: T.track,
		overflow: 'hidden',
	},
	macroFill: { height: '100%', borderRadius: 3 },
	macroValue: {
		marginTop: 8,
		fontSize: 13,
		color: T.text,
		fontWeight: '600',
	},
	macroTarget: { color: T.textTertiary, fontWeight: '400' },
	vitamins: { marginTop: 28 },
	vitRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
	vitChip: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 10,
		backgroundColor: T.track,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: 'rgba(255,255,255,0.08)',
		marginRight: 8,
		marginBottom: 8,
	},
	vitKey: { fontSize: 11, color: T.textSecondary, textTransform: 'capitalize' },
	vitVal: { fontSize: 14, color: T.text, fontWeight: '600', marginTop: 2 },
	mealsHead: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 32,
		marginBottom: 14,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: T.text,
		letterSpacing: -0.2,
	},
	mealCount: { fontSize: 14, color: T.textTertiary },
	empty: {
		alignItems: 'center',
		paddingVertical: 36,
	},
	emptyTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: T.text,
		marginTop: 8,
	},
	emptyBody: {
		fontSize: 14,
		color: T.textSecondary,
		textAlign: 'center',
		lineHeight: 20,
		maxWidth: 260,
		marginTop: 8,
	},
	mealRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: 'rgba(255,255,255,0.06)',
	},
	thumb: {
		width: 52,
		height: 52,
		borderRadius: 12,
		backgroundColor: T.cardLight,
		marginRight: 14,
	},
	thumbFallback: { alignItems: 'center', justifyContent: 'center' },
	mealMeta: { flex: 1 },
	mealName: { fontSize: 16, fontWeight: '600', color: T.text },
	mealMacros: { marginTop: 4, fontSize: 12, color: T.textSecondary },
	mealCal: { fontSize: 16, fontWeight: '600', color: T.text, marginLeft: 8 },
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.72)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	overlayText: {
		color: T.text,
		fontSize: 16,
		fontWeight: '500',
		marginTop: 16,
	},
	sheetBackdrop: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.55)',
		justifyContent: 'flex-end',
	},
	sheet: {
		backgroundColor: T.modalSurface,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 22,
		paddingBottom: 36,
	},
	sheetTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: T.text,
		marginBottom: 12,
	},
	pickHint: {
		fontSize: 14,
		color: T.textSecondary,
		marginBottom: 16,
		lineHeight: 20,
	},
	pickOption: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: T.cardLight,
		borderRadius: 14,
		paddingVertical: 14,
		paddingHorizontal: 14,
		marginBottom: 10,
	},
	pickOptionIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: 'rgba(52,199,89,0.12)',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	pickOptionText: {
		flex: 1,
		fontSize: 16,
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
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: T.border,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.18,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 3 },
		elevation: 4,
	},
	photoFab: {
		width: 58,
		height: 58,
		borderRadius: 29,
		backgroundColor: T.primary,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.28,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 4 },
		elevation: 6,
	},
	updateBox: {
		marginTop: 18,
		padding: 16,
		borderRadius: 14,
		backgroundColor: 'rgba(255,149,0,0.12)',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: 'rgba(255,149,0,0.3)',
	},
	updateTitle: {
		color: T.warning,
		fontSize: 15,
		fontWeight: '700',
		marginBottom: 6,
	},
	updateBody: {
		color: T.textSecondary,
		fontSize: 13,
		lineHeight: 19,
	},
	input: {
		backgroundColor: T.border,
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
		color: T.text,
		fontSize: 16,
		marginBottom: 10,
	},
	inputRow: { flexDirection: 'row' },
	inputHalf: { flex: 1, marginHorizontal: 5 },
	saveBtn: {
		marginTop: 8,
		backgroundColor: T.primary,
		borderRadius: 14,
		paddingVertical: 14,
		alignItems: 'center',
	},
	saveBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
	deleteBtn: { alignItems: 'center', paddingVertical: 8 },
	deleteBtnText: { color: T.error, fontSize: 15, fontWeight: '500' },
	cancelText: {
		textAlign: 'center',
		color: T.textSecondary,
		paddingVertical: 8,
		fontSize: 15,
	},
})
}

