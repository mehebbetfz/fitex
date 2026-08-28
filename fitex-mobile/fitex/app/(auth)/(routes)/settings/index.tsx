import { useDatabase } from '@/app/contexts/database-context'
import { hasActivePremium, useAuth } from '@/app/contexts/auth-context'
import AppBottomSheet from '@/components/ui/app-bottom-sheet'
import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import type { AppColors, ThemePreference } from '@/constants/app-theme'
import { LANGUAGE_CODES, LANGUAGE_FLAGS, LANGUAGE_NAMES, Language } from '@/locales'
import { translateGroupName } from '@/constants/exercise-i18n'
import {
	exportAllDataToCsv,
	exportWorkoutsToCsv,
} from '@/services/export'
import { syncRecoveryReadyNotifications } from '@/services/recovery-notifications'
import {
	DEFAULT_APP_SETTINGS,
	formatTime,
	loadAppNotificationSettings,
	saveAppNotificationSettings,
	scheduleWorkoutReminders,
	toggleRecoveryNotifications,
	toggleWorkoutReminders,
	type AppNotificationSettings,
} from '@/services/notifications'
import {
	DEFAULT_REST_SETTINGS,
	REST_DURATION_OPTIONS,
	formatRestSeconds,
	loadRestSettings,
	saveRestSettings,
	type RestSettings,
} from '@/services/rest-settings'
import {
	DEFAULT_RECOVERY_SETTINGS,
	RECOVERY_DURATION_OPTIONS,
	RECOVERY_MUSCLE_GROUPS,
	formatRecoveryHours,
	loadRecoverySettings,
	saveRecoverySettings,
	type RecoverySettings,
} from '@/services/recovery-settings'
import { recalculateAllRecovery } from '@/scripts/database'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

function makeStyles(C: AppColors) {
	return StyleSheet.create({
		safe: { flex: 1, backgroundColor: C.background },
		header: {
			flexDirection: 'row',
			alignItems: 'center',
			paddingHorizontal: 8,
			paddingTop: 8,
			paddingBottom: 12,
			gap: 4,
		},
		backBtn: {
			width: 40,
			height: 40,
			alignItems: 'center',
			justifyContent: 'center',
		},
		title: { fontSize: 22, fontWeight: '800', color: C.text },
		subtitle: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
		scroll: { paddingBottom: 40 },
		section: { marginTop: 20, paddingHorizontal: 12 },
		sectionTitle: {
			fontSize: 13,
			fontWeight: '700',
			color: C.textSecondary,
			textTransform: 'uppercase',
			letterSpacing: 0.6,
			marginBottom: 10,
			marginLeft: 4,
		},
		settingsItem: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: C.card,
			borderRadius: 14,
			padding: 14,
			marginBottom: 8,
			borderWidth: 1,
			borderColor: C.border,
		},
		settingsIcon: {
			width: 44,
			height: 44,
			borderRadius: 22,
			alignItems: 'center',
			justifyContent: 'center',
			marginRight: 12,
		},
		settingsContent: { flex: 1, marginRight: 8 },
		settingsTitle: { fontSize: 16, fontWeight: '600', color: C.text },
		settingsSubtitle: {
			fontSize: 12,
			color: C.textSecondary,
			marginTop: 2,
		},
		langCheckBox: {
			width: 24,
			height: 24,
			borderRadius: 12,
			borderWidth: 2,
			borderColor: C.border,
			alignItems: 'center',
			justifyContent: 'center',
		},
		langCheckBoxSelected: {
			backgroundColor: C.primary,
			borderColor: C.primary,
		},
		langOption: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingVertical: 16,
			paddingHorizontal: 4,
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderBottomColor: C.border,
		},
		langOptionLast: {
			borderBottomWidth: 0,
		},
		langOptionText: {
			fontSize: 17,
			fontWeight: '500',
			color: C.text,
		},
		langOptionTextSelected: {
			color: C.primary,
			fontWeight: '600',
		},
		chipRow: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			gap: 8,
			paddingHorizontal: 4,
			marginBottom: 8,
		},
		chip: {
			paddingHorizontal: 12,
			paddingVertical: 8,
			borderRadius: 999,
			borderWidth: 1,
			borderColor: C.border,
			backgroundColor: C.card,
		},
		chipOn: {
			borderColor: C.primary,
			backgroundColor: `${C.primary}22`,
		},
		chipText: {
			color: C.textSecondary,
			fontWeight: '600',
			fontSize: 13,
		},
		chipTextOn: {
			color: C.primary,
		},
	})
}

function makePickerStyles(C: AppColors) {
	return StyleSheet.create({
		overlay: {
			flex: 1,
			backgroundColor: C.overlay,
			justifyContent: 'center',
			alignItems: 'center',
			padding: 24,
		},
		container: {
			backgroundColor: C.card,
			borderRadius: 20,
			padding: 20,
			width: 300,
		},
		title: {
			fontSize: 18,
			fontWeight: '700',
			color: C.text,
			textAlign: 'center',
			marginBottom: 16,
		},
		pickers: { flexDirection: 'row', gap: 16, height: 180 },
		pickerCol: { flex: 1 },
		pickerLabel: {
			fontSize: 12,
			color: C.textSecondary,
			textAlign: 'center',
			marginBottom: 8,
		},
		scroll: { flex: 1 },
		option: {
			paddingVertical: 8,
			borderRadius: 8,
			alignItems: 'center',
		},
		optionSelected: { backgroundColor: 'rgba(52,199,89,0.2)' },
		optionText: { fontSize: 18, color: C.textSecondary },
		optionTextSelected: { color: C.primary, fontWeight: '700' },
		actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
		cancelBtn: {
			flex: 1,
			paddingVertical: 12,
			borderRadius: 12,
			borderWidth: 1,
			borderColor: C.border,
			alignItems: 'center',
		},
		saveBtn: {
			flex: 1,
			paddingVertical: 12,
			borderRadius: 12,
			backgroundColor: C.primary,
			alignItems: 'center',
		},
		cancelText: { color: C.textSecondary, fontWeight: '600' },
		saveText: { color: '#fff', fontWeight: '700' },
	})
}

interface SettingsItemProps {
	icon: keyof typeof Ionicons.glyphMap
	title: string
	subtitle?: string
	onPress?: () => void
	showChevron?: boolean
	rightElement?: React.ReactNode
	iconColor?: string
	colors: AppColors
	styles: ReturnType<typeof makeStyles>
}

function SettingsItem({
	icon,
	title,
	subtitle,
	onPress,
	showChevron = true,
	rightElement,
	iconColor,
	colors,
	styles,
}: SettingsItemProps) {
	const tint = iconColor ?? colors.primary
	return (
		<TouchableOpacity
			style={styles.settingsItem}
			onPress={onPress}
			disabled={!onPress}
			activeOpacity={0.7}
		>
			<View style={[styles.settingsIcon, { backgroundColor: `${tint}20` }]}>
				<Ionicons name={icon} size={24} color={tint} />
			</View>
			<View style={styles.settingsContent}>
				<Text style={styles.settingsTitle}>{title}</Text>
				{subtitle ? (
					<Text style={styles.settingsSubtitle}>{subtitle}</Text>
				) : null}
			</View>
			{rightElement}
			{showChevron && !rightElement ? (
				<Ionicons name='chevron-forward' size={20} color={colors.textSecondary} />
			) : null}
		</TouchableOpacity>
	)
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 15, 30, 45]

const THEME_OPTIONS: {
	id: ThemePreference
	icon: keyof typeof Ionicons.glyphMap
	titleKey: 'themeDark' | 'themeLight' | 'themeSystem'
}[] = [
	{ id: 'dark', icon: 'moon-outline', titleKey: 'themeDark' },
	{ id: 'light', icon: 'sunny-outline', titleKey: 'themeLight' },
	{ id: 'system', icon: 'phone-portrait-outline', titleKey: 'themeSystem' },
]

function TimePickerModal({
	visible,
	hour,
	minute,
	onConfirm,
	onClose,
}: {
	visible: boolean
	hour: number
	minute: number
	onConfirm: (h: number, m: number) => void
	onClose: () => void
}) {
	const [selectedHour, setSelectedHour] = useState(hour)
	const [selectedMinute, setSelectedMinute] = useState(minute)
	const { t } = useLanguage()
	const { colors } = useAppTheme()
	const pickerStyles = useMemo(() => makePickerStyles(colors), [colors])

	useEffect(() => {
		if (visible) {
			setSelectedHour(hour)
			setSelectedMinute(minute)
		}
	}, [visible, hour, minute])

	return (
		<AppBottomSheet
			visible={visible}
			onClose={onClose}
			title={t('settings', 'notifTimeLabel')}
			showHandle={false}
			maxHeight={360}
		>
			<View style={pickerStyles.pickers}>
				<View style={pickerStyles.pickerCol}>
					<Text style={pickerStyles.pickerLabel}>{t('profile', 'hours')}</Text>
					<ScrollView style={pickerStyles.scroll} showsVerticalScrollIndicator={false}>
						{HOURS.map(h => (
							<TouchableOpacity
								key={h}
								style={[
									pickerStyles.option,
									selectedHour === h && pickerStyles.optionSelected,
								]}
								onPress={() => setSelectedHour(h)}
							>
								<Text
									style={[
										pickerStyles.optionText,
										selectedHour === h && pickerStyles.optionTextSelected,
									]}
								>
									{String(h).padStart(2, '0')}
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>
				<View style={pickerStyles.pickerCol}>
					<Text style={pickerStyles.pickerLabel}>{t('profile', 'minutes')}</Text>
					<ScrollView style={pickerStyles.scroll} showsVerticalScrollIndicator={false}>
						{MINUTES.map(m => (
							<TouchableOpacity
								key={m}
								style={[
									pickerStyles.option,
									selectedMinute === m && pickerStyles.optionSelected,
								]}
								onPress={() => setSelectedMinute(m)}
							>
								<Text
									style={[
										pickerStyles.optionText,
										selectedMinute === m && pickerStyles.optionTextSelected,
									]}
								>
									{m.toString().padStart(2, '0')}
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>
			</View>
			<View style={pickerStyles.actions}>
				<TouchableOpacity style={pickerStyles.cancelBtn} onPress={onClose}>
					<Text style={pickerStyles.cancelText}>{t('common', 'cancel')}</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={pickerStyles.saveBtn}
					onPress={() => onConfirm(selectedHour, selectedMinute)}
				>
					<Text style={pickerStyles.saveText}>{t('common', 'save')}</Text>
				</TouchableOpacity>
			</View>
		</AppBottomSheet>
	)
}

export default function SettingsScreen() {
	const { t, language, setLanguage } = useLanguage()
	const { colors, preference, setPreference } = useAppTheme()
	const styles = useMemo(() => makeStyles(colors), [colors])
	const { user } = useAuth()
	const {
		syncWithServer,
		workouts,
		bodyMeasurements,
		personalRecords,
		isLoading: dbLoading,
	} = useDatabase()
	const premium = user ? hasActivePremium(user) : false

	const [notif, setNotif] = useState<AppNotificationSettings>(DEFAULT_APP_SETTINGS)
	const [rest, setRest] = useState<RestSettings>(DEFAULT_REST_SETTINGS)
	const [recoveryHours, setRecoveryHours] = useState<RecoverySettings>(
		DEFAULT_RECOVERY_SETTINGS,
	)
	const [togglingWorkout, setTogglingWorkout] = useState(false)
	const [togglingRecovery, setTogglingRecovery] = useState(false)
	const [showTimePicker, setShowTimePicker] = useState(false)
	const [showLanguageModal, setShowLanguageModal] = useState(false)
	const [syncing, setSyncing] = useState(false)
	const [exporting, setExporting] = useState(false)

	useEffect(() => {
		loadAppNotificationSettings().then(setNotif)
		loadRestSettings().then(setRest)
		loadRecoverySettings().then(setRecoveryHours)
	}, [])

	const updateRest = async (partial: Partial<RestSettings>) => {
		const next = await saveRestSettings(partial)
		setRest(next)
	}

	const updateRecoveryHours = async (group: string, hours: number) => {
		const next = await saveRecoverySettings({ [group]: hours })
		setRecoveryHours(next)
		await recalculateAllRecovery(next)
		if (notif.recoveryReady) {
			void syncRecoveryReadyNotifications()
		}
	}

	const workoutCopy = useCallback(
		() => ({
			title: t('settings', 'workoutReminderTitle'),
			body: t('settings', 'workoutReminderBody'),
		}),
		[t],
	)

	const handleToggleWorkout = async (enabled: boolean) => {
		setTogglingWorkout(true)
		try {
			const ok = await toggleWorkoutReminders(
				enabled,
				notif.hour,
				notif.minute,
				workoutCopy(),
			)
			if (ok) setNotif(prev => ({ ...prev, workoutReminders: enabled }))
			else if (enabled)
				Alert.alert(
					t('settings', 'permissionsTitle'),
					t('settings', 'notifPermission'),
				)
		} catch {
			Alert.alert(t('common', 'error'), t('settings', 'notifError'))
		} finally {
			setTogglingWorkout(false)
		}
	}

	const handleToggleRecovery = async (enabled: boolean) => {
		setTogglingRecovery(true)
		try {
			const ok = await toggleRecoveryNotifications(enabled)
			if (ok) {
				setNotif(prev => ({ ...prev, recoveryReady: enabled }))
				if (enabled) await syncRecoveryReadyNotifications()
			} else if (enabled) {
				Alert.alert(
					t('settings', 'permissionsTitle'),
					t('settings', 'notifPermission'),
				)
			}
		} catch {
			Alert.alert(t('common', 'error'), t('settings', 'notifError'))
		} finally {
			setTogglingRecovery(false)
		}
	}

	const handleTimeConfirm = async (hour: number, minute: number) => {
		setShowTimePicker(false)
		const updated = { ...notif, hour, minute }
		setNotif(updated)
		await saveAppNotificationSettings(updated)
		if (updated.workoutReminders) {
			await scheduleWorkoutReminders(hour, minute, workoutCopy())
		}
	}

	const handleSync = async () => {
		if (!premium) {
			router.push('/(auth)/trial-paywall' as any)
			return
		}
		setSyncing(true)
		try {
			await syncWithServer(premium)
		} catch (error) {
			Alert.alert(t('common', 'error'), t('profile', 'syncError') + error)
		} finally {
			setSyncing(false)
		}
	}

	const handleExportAll = async () => {
		setExporting(true)
		try {
			await exportAllDataToCsv(workouts, bodyMeasurements, personalRecords)
		} catch {
			Alert.alert(t('common', 'error'), t('settings', 'exportError'))
		} finally {
			setExporting(false)
		}
	}

	const handleExportWorkouts = async () => {
		setExporting(true)
		try {
			await exportWorkoutsToCsv(workouts)
		} catch {
			Alert.alert(t('common', 'error'), t('settings', 'exportError'))
		} finally {
			setExporting(false)
		}
	}

	const handleLanguageChange = async (lang: Language) => {
		setShowLanguageModal(false)
		await setLanguage(lang)
		const settings = await loadAppNotificationSettings()
		if (settings.workoutReminders) {
			await scheduleWorkoutReminders(settings.hour, settings.minute, {
				title: t('settings', 'workoutReminderTitle'),
				body: t('settings', 'workoutReminderBody'),
			})
		}
		if (settings.recoveryReady) {
			setTimeout(() => {
				void syncRecoveryReadyNotifications()
			}, 100)
		}
	}

	const itemProps = { colors, styles }

	return (
		<SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
			<TimePickerModal
				visible={showTimePicker}
				hour={notif.hour}
				minute={notif.minute}
				onConfirm={handleTimeConfirm}
				onClose={() => setShowTimePicker(false)}
			/>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backBtn}
					hitSlop={12}
				>
					<Ionicons name='chevron-back' size={26} color={colors.text} />
				</TouchableOpacity>
				<View style={{ flex: 1 }}>
					<Text style={styles.title}>{t('settings', 'title')}</Text>
					<Text style={styles.subtitle}>{t('settings', 'subtitle')}</Text>
				</View>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scroll}
			>
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{t('settings', 'appearance')}</Text>
					{THEME_OPTIONS.map(opt => {
						const selected = preference === opt.id
						return (
							<SettingsItem
								key={opt.id}
								{...itemProps}
								icon={opt.icon}
								title={t('settings', opt.titleKey)}
								onPress={() => void setPreference(opt.id)}
								showChevron={false}
								iconColor={selected ? colors.primary : colors.textSecondary}
								rightElement={
									<View
										style={[
											styles.langCheckBox,
											selected && styles.langCheckBoxSelected,
										]}
									>
										{selected ? (
											<Ionicons name='checkmark' size={16} color='#fff' />
										) : null}
									</View>
								}
							/>
						)
					})}
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{t('settings', 'notifications')}</Text>
					<SettingsItem
						{...itemProps}
						icon='notifications-outline'
						title={t('settings', 'workoutReminder')}
						subtitle={
							notif.workoutReminders
								? `${t('settings', 'workoutReminderSubtitle')} · ${formatTime(notif.hour, notif.minute)}`
								: t('settings', 'notifDisabled')
						}
						onPress={() => {}}
						showChevron={false}
						rightElement={
							togglingWorkout ? (
								<ActivityIndicator size='small' color={colors.primary} />
							) : (
								<Switch
									value={notif.workoutReminders}
									onValueChange={handleToggleWorkout}
									trackColor={{
										false: colors.border,
										true: `${colors.primary}80`,
									}}
									thumbColor={
										notif.workoutReminders
											? colors.primary
											: colors.textSecondary
									}
								/>
							)
						}
					/>
					{notif.workoutReminders ? (
						<SettingsItem
							{...itemProps}
							icon='time-outline'
							title={t('settings', 'notifTimeLabel')}
							subtitle={formatTime(notif.hour, notif.minute)}
							onPress={() => setShowTimePicker(true)}
							iconColor={colors.accent}
						/>
					) : null}
					<SettingsItem
						{...itemProps}
						icon='body-outline'
						title={t('settings', 'recoveryReady')}
						subtitle={t('settings', 'recoveryReadySubtitle')}
						onPress={() => {}}
						showChevron={false}
						iconColor={colors.info}
						rightElement={
							togglingRecovery ? (
								<ActivityIndicator size='small' color={colors.primary} />
							) : (
								<Switch
									value={notif.recoveryReady}
									onValueChange={handleToggleRecovery}
									trackColor={{
										false: colors.border,
										true: `${colors.primary}80`,
									}}
									thumbColor={
										notif.recoveryReady
											? colors.primary
											: colors.textSecondary
									}
								/>
							)
						}
					/>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{t('settings', 'restSection')}</Text>
					<SettingsItem
						{...itemProps}
						icon='timer-outline'
						title={t('settings', 'restEnabledDefault')}
						subtitle={t('settings', 'restEnabledDefaultSubtitle')}
						onPress={() => {}}
						showChevron={false}
						rightElement={
							<Switch
								value={rest.enabledByDefault}
								onValueChange={v => void updateRest({ enabledByDefault: v })}
								trackColor={{
									false: colors.border,
									true: `${colors.primary}80`,
								}}
								thumbColor={
									rest.enabledByDefault ? colors.primary : colors.textSecondary
								}
							/>
						}
					/>
					<Text style={[styles.settingsSubtitle, { marginLeft: 4, marginBottom: 8 }]}>
						{t('settings', 'restBetweenSets')} · {formatRestSeconds(rest.betweenSetsSec)}
					</Text>
					<Text style={[styles.settingsSubtitle, { marginLeft: 4, marginBottom: 6 }]}>
						{t('settings', 'restBetweenSetsSubtitle')}
					</Text>
					<View style={styles.chipRow}>
						{REST_DURATION_OPTIONS.map(sec => {
							const on = rest.betweenSetsSec === sec
							return (
								<TouchableOpacity
									key={`sets-${sec}`}
									style={[styles.chip, on && styles.chipOn]}
									onPress={() => void updateRest({ betweenSetsSec: sec })}
								>
									<Text style={[styles.chipText, on && styles.chipTextOn]}>
										{formatRestSeconds(sec)}
									</Text>
								</TouchableOpacity>
							)
						})}
					</View>
					<Text style={[styles.settingsSubtitle, { marginLeft: 4, marginTop: 8, marginBottom: 8 }]}>
						{t('settings', 'restBetweenExercises')} ·{' '}
						{formatRestSeconds(rest.betweenExercisesSec)}
					</Text>
					<Text style={[styles.settingsSubtitle, { marginLeft: 4, marginBottom: 6 }]}>
						{t('settings', 'restBetweenExercisesSubtitle')}
					</Text>
					<View style={styles.chipRow}>
						{REST_DURATION_OPTIONS.map(sec => {
							const on = rest.betweenExercisesSec === sec
							return (
								<TouchableOpacity
									key={`ex-${sec}`}
									style={[styles.chip, on && styles.chipOn]}
									onPress={() => void updateRest({ betweenExercisesSec: sec })}
								>
									<Text style={[styles.chipText, on && styles.chipTextOn]}>
										{formatRestSeconds(sec)}
									</Text>
								</TouchableOpacity>
							)
						})}
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>
						{t('settings', 'recoveryDurationSection')}
					</Text>
					<Text style={[styles.settingsSubtitle, { marginLeft: 4, marginBottom: 12 }]}>
						{t('settings', 'recoveryDurationSubtitle')}
					</Text>
					{RECOVERY_MUSCLE_GROUPS.map(group => {
						const current = recoveryHours.hoursByGroup[group] ?? 72
						return (
							<View key={group} style={{ marginBottom: 12 }}>
								<Text
									style={[styles.settingsSubtitle, { marginLeft: 4, marginBottom: 8 }]}
								>
									{translateGroupName(group, language ?? 'ru')} ·{' '}
									{formatRecoveryHours(current)}
								</Text>
								<View style={styles.chipRow}>
									{RECOVERY_DURATION_OPTIONS.map(hours => {
										const on = current === hours
										return (
											<TouchableOpacity
												key={`${group}-${hours}`}
												style={[styles.chip, on && styles.chipOn]}
												onPress={() => void updateRecoveryHours(group, hours)}
											>
												<Text style={[styles.chipText, on && styles.chipTextOn]}>
													{formatRecoveryHours(hours)}
												</Text>
											</TouchableOpacity>
										)
									})}
								</View>
							</View>
						)
					})}
				</View>

				{premium ? (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{t('settings', 'cloud')}</Text>
						<SettingsItem
							{...itemProps}
							icon='cloud-upload-outline'
							title={t('settings', 'syncData')}
							subtitle={t('settings', 'syncSubtitle')}
							onPress={handleSync}
							showChevron={false}
							rightElement={
								syncing || dbLoading ? (
									<ActivityIndicator size='small' color={colors.primary} />
								) : null
							}
						/>
						<SettingsItem
							{...itemProps}
							icon='stats-chart-outline'
							title={t('sync', 'statsTitle')}
							subtitle={t('sync', 'lastSync')}
							onPress={() => router.push('/(auth)/(routes)/sync-stats')}
						/>
					</View>
				) : null}

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{t('settings', 'export')}</Text>
					<SettingsItem
						{...itemProps}
						icon='download-outline'
						title={t('settings', 'exportAll')}
						subtitle={t('settings', 'exportAllSubtitle')}
						onPress={handleExportAll}
						showChevron={false}
						iconColor={colors.info}
						rightElement={
							exporting ? (
								<ActivityIndicator size='small' color={colors.info} />
							) : null
						}
					/>
					<SettingsItem
						{...itemProps}
						icon='barbell-outline'
						title={t('settings', 'exportWorkouts')}
						subtitle={`${workouts.length} ${t('profile', 'recordsLabel')}`}
						onPress={handleExportWorkouts}
						showChevron={false}
						iconColor={colors.info}
					/>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{t('settings', 'language')}</Text>
					<SettingsItem
						{...itemProps}
						icon='language-outline'
						title={LANGUAGE_NAMES[language ?? 'ru']}
						onPress={() => setShowLanguageModal(true)}
						iconColor={colors.primary}
					/>
				</View>
			</ScrollView>

			<AppBottomSheet
				visible={showLanguageModal}
				onClose={() => setShowLanguageModal(false)}
				title={t('settings', 'language')}
				maxHeight={520}
				scroll
			>
				{LANGUAGE_CODES.map((lang, index, arr) => {
					const selected = lang === language
					return (
						<TouchableOpacity
							key={lang}
							style={[
								styles.langOption,
								index === arr.length - 1 && styles.langOptionLast,
							]}
							onPress={() => void handleLanguageChange(lang)}
							activeOpacity={0.7}
						>
							<Text style={{ fontSize: 18, marginRight: 10 }}>
								{LANGUAGE_FLAGS[lang]}
							</Text>
							<Text
								style={[
									styles.langOptionText,
									selected && styles.langOptionTextSelected,
									{ flex: 1 },
								]}
							>
								{LANGUAGE_NAMES[lang]}
							</Text>
							{selected ? (
								<Ionicons name='checkmark' size={20} color={colors.primary} />
							) : null}
						</TouchableOpacity>
					)
				})}
			</AppBottomSheet>
		</SafeAreaView>
	)
}
