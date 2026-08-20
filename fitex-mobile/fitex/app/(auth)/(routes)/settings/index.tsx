import { useDatabase } from '@/app/contexts/database-context'
import { hasActivePremium, useAuth } from '@/app/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { Language, LANGUAGE_FLAGS, LANGUAGE_NAMES } from '@/locales'
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
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Modal,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const COLORS = {
	primary: '#34C759',
	background: '#121212',
	card: '#1C1C1E',
	border: '#2C2C2E',
	text: '#FFFFFF',
	textSecondary: '#8E8E93',
	accent: '#FF9500',
	error: '#FF3B30',
} as const

interface SettingsItemProps {
	icon: keyof typeof Ionicons.glyphMap
	title: string
	subtitle?: string
	onPress?: () => void
	showChevron?: boolean
	rightElement?: React.ReactNode
	iconColor?: string
}

function SettingsItem({
	icon,
	title,
	subtitle,
	onPress,
	showChevron = true,
	rightElement,
	iconColor = COLORS.primary,
}: SettingsItemProps) {
	return (
		<TouchableOpacity
			style={styles.settingsItem}
			onPress={onPress}
			disabled={!onPress}
			activeOpacity={0.7}
		>
			<View style={[styles.settingsIcon, { backgroundColor: `${iconColor}20` }]}>
				<Ionicons name={icon} size={24} color={iconColor} />
			</View>
			<View style={styles.settingsContent}>
				<Text style={styles.settingsTitle}>{title}</Text>
				{subtitle ? (
					<Text style={styles.settingsSubtitle}>{subtitle}</Text>
				) : null}
			</View>
			{rightElement}
			{showChevron && !rightElement ? (
				<Ionicons
					name='chevron-forward'
					size={20}
					color={COLORS.textSecondary}
				/>
			) : null}
		</TouchableOpacity>
	)
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 15, 30, 45]

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

	useEffect(() => {
		if (visible) {
			setSelectedHour(hour)
			setSelectedMinute(minute)
		}
	}, [visible, hour, minute])

	return (
		<Modal
			transparent
			animationType='fade'
			visible={visible}
			onRequestClose={onClose}
		>
			<TouchableOpacity
				style={pickerStyles.overlay}
				activeOpacity={1}
				onPress={onClose}
			>
				<TouchableOpacity activeOpacity={1} onPress={() => {}}>
					<View style={pickerStyles.container}>
						<Text style={pickerStyles.title}>
							{t('settings', 'notifTimeLabel')}
						</Text>
						<View style={pickerStyles.pickers}>
							<View style={pickerStyles.pickerCol}>
								<Text style={pickerStyles.pickerLabel}>
									{t('profile', 'hours')}
								</Text>
								<ScrollView
									style={pickerStyles.scroll}
									showsVerticalScrollIndicator={false}
								>
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
													selectedHour === h &&
														pickerStyles.optionTextSelected,
												]}
											>
												{String(h).padStart(2, '0')}
											</Text>
										</TouchableOpacity>
									))}
								</ScrollView>
							</View>
							<View style={pickerStyles.pickerCol}>
								<Text style={pickerStyles.pickerLabel}>
									{t('profile', 'minutes')}
								</Text>
								<ScrollView
									style={pickerStyles.scroll}
									showsVerticalScrollIndicator={false}
								>
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
													selectedMinute === m &&
														pickerStyles.optionTextSelected,
												]}
											>
												{String(m).padStart(2, '0')}
											</Text>
										</TouchableOpacity>
									))}
								</ScrollView>
							</View>
						</View>
						<View style={pickerStyles.actions}>
							<TouchableOpacity
								style={pickerStyles.cancelBtn}
								onPress={onClose}
							>
								<Text style={pickerStyles.cancelText}>
									{t('common', 'cancel')}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={pickerStyles.saveBtn}
								onPress={() => onConfirm(selectedHour, selectedMinute)}
							>
								<Text style={pickerStyles.saveText}>{t('common', 'save')}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</TouchableOpacity>
			</TouchableOpacity>
		</Modal>
	)
}

export default function SettingsScreen() {
	const { t, language, setLanguage } = useLanguage()
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
	const [togglingWorkout, setTogglingWorkout] = useState(false)
	const [togglingRecovery, setTogglingRecovery] = useState(false)
	const [showTimePicker, setShowTimePicker] = useState(false)
	const [syncing, setSyncing] = useState(false)
	const [exporting, setExporting] = useState(false)

	useEffect(() => {
		loadAppNotificationSettings().then(setNotif)
	}, [])

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
		await setLanguage(lang)
		const settings = await loadAppNotificationSettings()
		if (settings.workoutReminders) {
			await scheduleWorkoutReminders(
				settings.hour,
				settings.minute,
				{
					title: t('settings', 'workoutReminderTitle'),
					body: t('settings', 'workoutReminderBody'),
				},
			)
		}
		if (settings.recoveryReady) {
			// next tick so t() uses new language after setState
			setTimeout(() => {
				void syncRecoveryReadyNotifications()
			}, 100)
		}
	}

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
					<Ionicons name='chevron-back' size={26} color={COLORS.text} />
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
					<Text style={styles.sectionTitle}>
						{t('settings', 'notifications')}
					</Text>
					<SettingsItem
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
								<ActivityIndicator size='small' color={COLORS.primary} />
							) : (
								<Switch
									value={notif.workoutReminders}
									onValueChange={handleToggleWorkout}
									trackColor={{
										false: COLORS.border,
										true: `${COLORS.primary}80`,
									}}
									thumbColor={
										notif.workoutReminders
											? COLORS.primary
											: COLORS.textSecondary
									}
								/>
							)
						}
					/>
					{notif.workoutReminders ? (
						<SettingsItem
							icon='time-outline'
							title={t('settings', 'notifTimeLabel')}
							subtitle={formatTime(notif.hour, notif.minute)}
							onPress={() => setShowTimePicker(true)}
							iconColor={COLORS.accent}
						/>
					) : null}
					<SettingsItem
						icon='body-outline'
						title={t('settings', 'recoveryReady')}
						subtitle={t('settings', 'recoveryReadySubtitle')}
						onPress={() => {}}
						showChevron={false}
						iconColor='#5AC8FA'
						rightElement={
							togglingRecovery ? (
								<ActivityIndicator size='small' color={COLORS.primary} />
							) : (
								<Switch
									value={notif.recoveryReady}
									onValueChange={handleToggleRecovery}
									trackColor={{
										false: COLORS.border,
										true: `${COLORS.primary}80`,
									}}
									thumbColor={
										notif.recoveryReady
											? COLORS.primary
											: COLORS.textSecondary
									}
								/>
							)
						}
					/>
				</View>

				{premium ? (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{t('settings', 'cloud')}</Text>
						<SettingsItem
							icon='cloud-upload-outline'
							title={t('settings', 'syncData')}
							subtitle={t('settings', 'syncSubtitle')}
							onPress={handleSync}
							showChevron={false}
							rightElement={
								syncing || dbLoading ? (
									<ActivityIndicator size='small' color={COLORS.primary} />
								) : null
							}
						/>
						<SettingsItem
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
						icon='download-outline'
						title={t('settings', 'exportAll')}
						subtitle={t('settings', 'exportAllSubtitle')}
						onPress={handleExportAll}
						showChevron={false}
						iconColor='#5AC8FA'
						rightElement={
							exporting ? (
								<ActivityIndicator size='small' color='#5AC8FA' />
							) : null
						}
					/>
					<SettingsItem
						icon='barbell-outline'
						title={t('settings', 'exportWorkouts')}
						subtitle={`${workouts.length} ${t('profile', 'recordsLabel')}`}
						onPress={handleExportWorkouts}
						showChevron={false}
						iconColor='#5AC8FA'
					/>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{t('settings', 'language')}</Text>
					{(['ru', 'en', 'az'] as Language[]).map(lang => {
						const selected = lang === language
						return (
							<SettingsItem
								key={lang}
								icon='language-outline'
								title={`${LANGUAGE_FLAGS[lang]} ${LANGUAGE_NAMES[lang]}`}
								onPress={() => handleLanguageChange(lang)}
								showChevron={false}
								iconColor={
									selected ? COLORS.primary : COLORS.textSecondary
								}
								rightElement={
									<View
										style={[
											styles.langCheckBox,
											selected && styles.langCheckBoxSelected,
										]}
									>
										{selected ? (
											<Ionicons
												name='checkmark'
												size={16}
												color={COLORS.text}
											/>
										) : null}
									</View>
								}
							/>
						)
					})}
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: COLORS.background },
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
	title: { fontSize: 22, fontWeight: '800', color: COLORS.text },
	subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
	scroll: { paddingBottom: 40 },
	section: { marginTop: 20, paddingHorizontal: 12 },
	sectionTitle: {
		fontSize: 13,
		fontWeight: '700',
		color: COLORS.textSecondary,
		textTransform: 'uppercase',
		letterSpacing: 0.6,
		marginBottom: 10,
		marginLeft: 4,
	},
	settingsItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.card,
		borderRadius: 14,
		padding: 14,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: COLORS.border,
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
	settingsTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
	settingsSubtitle: {
		fontSize: 12,
		color: COLORS.textSecondary,
		marginTop: 2,
	},
	langCheckBox: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: COLORS.border,
		alignItems: 'center',
		justifyContent: 'center',
	},
	langCheckBoxSelected: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
})

const pickerStyles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.7)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
	},
	container: {
		backgroundColor: COLORS.card,
		borderRadius: 20,
		padding: 20,
		width: 300,
	},
	title: {
		fontSize: 18,
		fontWeight: '700',
		color: COLORS.text,
		textAlign: 'center',
		marginBottom: 16,
	},
	pickers: { flexDirection: 'row', gap: 16, height: 180 },
	pickerCol: { flex: 1 },
	pickerLabel: {
		fontSize: 12,
		color: COLORS.textSecondary,
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
	optionText: { fontSize: 18, color: COLORS.textSecondary },
	optionTextSelected: { color: COLORS.primary, fontWeight: '700' },
	actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
	cancelBtn: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: COLORS.border,
		alignItems: 'center',
	},
	saveBtn: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 12,
		backgroundColor: COLORS.primary,
		alignItems: 'center',
	},
	cancelText: { color: COLORS.textSecondary, fontWeight: '600' },
	saveText: { color: '#fff', fontWeight: '700' },
})
