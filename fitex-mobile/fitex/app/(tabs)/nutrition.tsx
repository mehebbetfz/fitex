import { STATS_HISTORY_THEME as T } from '@/constants/stats-history-theme'
import { useLanguage } from '@/contexts/language-context'
import { ErrorBoundary } from '@/components/error-boundary'
import {
	analyzeMealPhoto,
	deleteFoodEntry,
	fetchNutritionDay,
	localTodayKey,
	type FoodEntry,
	type NutritionDay,
	updateFoodEntry,
} from '@/services/nutrition'
import { isMealPhotoSupported, pickMealJpeg } from '@/services/meal-photo-pick'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
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
}: {
	label: string
	current: number
	target: number
	color: string
	unit: string
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
				) : (
				<View style={styles.pickRow}>
					<TouchableOpacity
						style={styles.pickBtn}
						onPress={() => void pickAndAnalyze('camera')}
						activeOpacity={0.8}
						disabled={analyzing}
					>
						<Ionicons name='camera-outline' size={20} color='#000' />
						<Text style={styles.pickBtnText}>{t('nutrition', 'camera')}</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.pickBtn, styles.pickBtnAlt]}
						onPress={() => void pickAndAnalyze('library')}
						activeOpacity={0.8}
						disabled={analyzing}
					>
						<Ionicons name='image-outline' size={20} color='#FFF' />
						<Text style={[styles.pickBtnText, styles.pickBtnTextAlt]}>
							{t('nutrition', 'gallery')}
						</Text>
					</TouchableOpacity>
				</View>
				)}

				{loading && !day ? (
					<View style={styles.centerBlock}>
						<ActivityIndicator color={T.primary} />
					</View>
				) : (
					<>
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
									? t('nutrition', 'left')
									: t('nutrition', 'over')}
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
								label={t('nutrition', 'protein')}
								current={view.totals.proteinG}
								target={view.targets.proteinG}
								color='#FF6B6B'
								unit={t('nutrition', 'g')}
							/>
							<MacroBar
								label={t('nutrition', 'carbs')}
								current={view.totals.carbsG}
								target={view.targets.carbsG}
								color='#5AC8FA'
								unit={t('nutrition', 'g')}
							/>
							<MacroBar
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
					</>
				)}
			</ScrollView>

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

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: '#0A0A0A' },
	scroll: { paddingHorizontal: 22, paddingBottom: 120 },
	header: { marginTop: 8, marginBottom: 8 },
	kicker: {
		fontSize: 34,
		fontWeight: '700',
		color: '#FFF',
		letterSpacing: -0.6,
	},
	date: {
		marginTop: 4,
		fontSize: 15,
		color: T.textSecondary,
		textTransform: 'capitalize',
	},
	centerBlock: { paddingVertical: 80, alignItems: 'center' },
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
	remainNum: {
		fontSize: 52,
		fontWeight: '700',
		color: '#FFF',
		letterSpacing: -1,
	},
	remainLabel: {
		fontSize: 14,
		color: T.textSecondary,
		marginTop: 2,
	},
	calorieTrack: {
		marginTop: 18,
		width: '100%',
		height: 8,
		borderRadius: 4,
		backgroundColor: 'rgba(255,255,255,0.08)',
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
		backgroundColor: 'rgba(255,255,255,0.08)',
		overflow: 'hidden',
	},
	macroFill: { height: '100%', borderRadius: 3 },
	macroValue: {
		marginTop: 8,
		fontSize: 13,
		color: '#FFF',
		fontWeight: '600',
	},
	macroTarget: { color: T.textTertiary, fontWeight: '400' },
	vitamins: { marginTop: 28 },
	vitRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
	vitChip: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 10,
		backgroundColor: 'rgba(255,255,255,0.04)',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: 'rgba(255,255,255,0.08)',
		marginRight: 8,
		marginBottom: 8,
	},
	vitKey: { fontSize: 11, color: T.textSecondary, textTransform: 'capitalize' },
	vitVal: { fontSize: 14, color: '#FFF', fontWeight: '600', marginTop: 2 },
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
		color: '#FFF',
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
		color: '#FFF',
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
		backgroundColor: T.surfaceMuted,
		marginRight: 14,
	},
	thumbFallback: { alignItems: 'center', justifyContent: 'center' },
	mealMeta: { flex: 1 },
	mealName: { fontSize: 16, fontWeight: '600', color: '#FFF' },
	mealMacros: { marginTop: 4, fontSize: 12, color: T.textSecondary },
	mealCal: { fontSize: 16, fontWeight: '600', color: '#FFF', marginLeft: 8 },
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.72)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	overlayText: {
		color: '#FFF',
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
		backgroundColor: '#161616',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 22,
		paddingBottom: 36,
	},
	sheetTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#FFF',
		marginBottom: 12,
	},
	pickRow: {
		flexDirection: 'row',
		marginTop: 18,
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
		color: T.textMuted,
		fontSize: 13,
		lineHeight: 19,
	},
	pickBtn: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: T.primary,
		borderRadius: 14,
		paddingVertical: 14,
		marginRight: 10,
	},
	pickBtnAlt: {
		backgroundColor: 'rgba(255,255,255,0.08)',
		marginRight: 0,
	},
	pickBtnText: {
		color: '#000',
		fontSize: 15,
		fontWeight: '600',
		marginLeft: 8,
	},
	pickBtnTextAlt: { color: '#FFF' },
	input: {
		backgroundColor: 'rgba(255,255,255,0.06)',
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
		color: '#FFF',
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
