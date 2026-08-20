import { STATS_HISTORY_THEME as T } from '@/constants/stats-history-theme'
import { useLanguage } from '@/contexts/language-context'
import {
	analyzeMealPhoto,
	deleteFoodEntry,
	fetchNutritionDay,
	localTodayKey,
	type FoodEntry,
	type NutritionDay,
	updateFoodEntry,
} from '@/services/nutrition'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
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
	const pct = target > 0 ? Math.min(1, current / target) : 0
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
				{Math.round(current)}
				<Text style={styles.macroTarget}>
					{' '}
					/ {Math.round(target)}
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

export default function NutritionTab() {
	const { t, language } = useLanguage()
	const locale = language === 'az' ? 'az-AZ' : language === 'en' ? 'en-US' : 'ru-RU'

	const [day, setDay] = useState<NutritionDay | null>(null)
	const [loading, setLoading] = useState(true)
	const [analyzing, setAnalyzing] = useState(false)
	const [editEntry, setEditEntry] = useState<FoodEntry | null>(null)
	const [editName, setEditName] = useState('')
	const [editCal, setEditCal] = useState('')
	const [editP, setEditP] = useState('')
	const [editC, setEditC] = useState('')
	const [editF, setEditF] = useState('')
	const [saving, setSaving] = useState(false)

	const load = useCallback(
		async (silent = false) => {
			if (!silent) setLoading(true)
			try {
				const data = await fetchNutritionDay()
				setDay(data)
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e)
				if (!silent) Alert.alert(t('nutrition', 'loadError'), msg)
			} finally {
				setLoading(false)
			}
		},
		[t],
	)

	useFocusEffect(
		useCallback(() => {
			void load(true)
		}, [load]),
	)

	const remaining = useMemo(() => {
		if (!day) return 0
		return Math.round(day.targets.calories - day.totals.calories)
	}, [day])

	const progress = useMemo(() => {
		if (!day || day.targets.calories <= 0) return 0
		return Math.min(1, day.totals.calories / day.targets.calories)
	}, [day])

	const pickAndAnalyze = async (from: 'camera' | 'library') => {
		const perm =
			from === 'camera'
				? await ImagePicker.requestCameraPermissionsAsync()
				: await ImagePicker.requestMediaLibraryPermissionsAsync()
		if (!perm.granted) {
			Alert.alert(t('nutrition', 'permissionTitle'), t('nutrition', 'permissionBody'))
			return
		}

		const result =
			from === 'camera'
				? await ImagePicker.launchCameraAsync({
						mediaTypes: ImagePicker.MediaTypeOptions.Images,
						quality: 0.85,
					})
				: await ImagePicker.launchImageLibraryAsync({
						mediaTypes: ImagePicker.MediaTypeOptions.Images,
						quality: 0.85,
					})

		if (result.canceled || !result.assets?.[0]?.uri) return

		setAnalyzing(true)
		try {
			let uri = result.assets[0].uri
			try {
				const manip = await import('expo-image-manipulator')
				const processed = await manip.manipulateAsync(
					uri,
					[{ resize: { width: 1280 } }],
					{ compress: 0.8, format: manip.SaveFormat.JPEG },
				)
				uri = processed.uri
			} catch {
				/* keep original */
			}
			await analyzeMealPhoto(uri)
			await load(true)
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e)
			Alert.alert(t('nutrition', 'analyzeError'), msg)
		} finally {
			setAnalyzing(false)
		}
	}

	const openAdd = () => {
		Alert.alert(t('nutrition', 'addMeal'), t('nutrition', 'addMealHint'), [
			{ text: t('nutrition', 'camera'), onPress: () => void pickAndAnalyze('camera') },
			{ text: t('nutrition', 'gallery'), onPress: () => void pickAndAnalyze('library') },
			{ text: t('common', 'cancel'), style: 'cancel' },
		])
	}

	const openEdit = (entry: FoodEntry) => {
		setEditEntry(entry)
		setEditName(entry.name)
		setEditCal(String(Math.round(entry.calories)))
		setEditP(String(entry.proteinG))
		setEditC(String(entry.carbsG))
		setEditF(String(entry.fatG))
	}

	const saveEdit = async () => {
		if (!editEntry) return
		setSaving(true)
		try {
			await updateFoodEntry(editEntry.id, {
				name: editName.trim() || editEntry.name,
				calories: Number(editCal) || 0,
				proteinG: Number(editP) || 0,
				carbsG: Number(editC) || 0,
				fatG: Number(editF) || 0,
			})
			setEditEntry(null)
			await load(true)
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
						await load(true)
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
			for (const [k, v] of Object.entries(e.vitamins || {})) {
				sum[k] = (sum[k] || 0) + (Number(v) || 0)
			}
		}
		return Object.entries(sum)
			.filter(([, v]) => v > 0)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 6)
	}, [day])

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

				{loading && !day ? (
					<View style={styles.centerBlock}>
						<ActivityIndicator color={T.primary} />
					</View>
				) : (
					<>
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
								{Math.round(day?.totals.calories ?? 0)} /{' '}
								{Math.round(day?.targets.calories ?? 0)}{' '}
								{t('nutrition', 'kcal')}
							</Text>
						</View>

						{!day?.targets.complete ? (
							<Text style={styles.profileHint}>
								{t('nutrition', 'incompleteProfile')}
							</Text>
						) : null}

						<View style={styles.macros}>
							<MacroBar
								label={t('nutrition', 'protein')}
								current={day?.totals.proteinG ?? 0}
								target={day?.targets.proteinG ?? 1}
								color='#FF6B6B'
								unit={t('nutrition', 'g')}
							/>
							<MacroBar
								label={t('nutrition', 'carbs')}
								current={day?.totals.carbsG ?? 0}
								target={day?.targets.carbsG ?? 1}
								color='#5AC8FA'
								unit={t('nutrition', 'g')}
							/>
							<MacroBar
								label={t('nutrition', 'fat')}
								current={day?.totals.fatG ?? 0}
								target={day?.targets.fatG ?? 1}
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
							<Text style={styles.mealCount}>
								{day?.entries.length ?? 0}
							</Text>
						</View>

						{(day?.entries.length ?? 0) === 0 ? (
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
							day!.entries.map(entry => (
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
											{Math.round(entry.proteinG)}P ·{' '}
											{Math.round(entry.carbsG)}C ·{' '}
											{Math.round(entry.fatG)}F
										</Text>
									</View>
									<Text style={styles.mealCal}>
										{Math.round(entry.calories)}
									</Text>
								</TouchableOpacity>
							))
						)}
					</>
				)}
			</ScrollView>

			<TouchableOpacity
				style={styles.fab}
				onPress={openAdd}
				activeOpacity={0.85}
				disabled={analyzing}
			>
				<Ionicons name='camera' size={28} color='#000' />
			</TouchableOpacity>

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
		gap: 14,
		marginTop: 20,
		marginBottom: 8,
	},
	macroCol: { flex: 1 },
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
	vitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
	vitChip: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 10,
		backgroundColor: 'rgba(255,255,255,0.04)',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: 'rgba(255,255,255,0.08)',
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
		gap: 8,
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
	},
	mealRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: 'rgba(255,255,255,0.06)',
		gap: 14,
	},
	thumb: {
		width: 52,
		height: 52,
		borderRadius: 12,
		backgroundColor: T.surfaceMuted,
	},
	thumbFallback: { alignItems: 'center', justifyContent: 'center' },
	mealMeta: { flex: 1 },
	mealName: { fontSize: 16, fontWeight: '600', color: '#FFF' },
	mealMacros: { marginTop: 4, fontSize: 12, color: T.textSecondary },
	mealCal: { fontSize: 16, fontWeight: '600', color: '#FFF' },
	fab: {
		position: 'absolute',
		right: 22,
		bottom: 28,
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: T.primary,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: T.primary,
		shadowOpacity: 0.35,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 4 },
		elevation: 6,
	},
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.72)',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 16,
	},
	overlayText: { color: '#FFF', fontSize: 16, fontWeight: '500' },
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
		gap: 12,
	},
	sheetTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#FFF',
		marginBottom: 4,
	},
	input: {
		backgroundColor: 'rgba(255,255,255,0.06)',
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
		color: '#FFF',
		fontSize: 16,
	},
	inputRow: { flexDirection: 'row', gap: 10 },
	inputHalf: { flex: 1 },
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
