import { useDatabase } from '@/app/contexts/database-context'
import { useLanguage } from '@/contexts/language-context'
import { Language, LANGUAGE_FLAGS, LANGUAGE_NAMES } from '@/locales'
import {
	exportAllDataToCsv,
	exportWorkoutsToCsv,
} from '@/services/export'
import {
	DEFAULT_SETTINGS,
	formatTime,
	loadNotificationSettings,
	NotificationSettings,
	toggleWorkoutReminders,
} from '@/services/notifications'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Animated,
	Modal,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { hasActivePremium, useAuth } from '../contexts/auth-context'

const COLORS = {
	primary: '#34C759',
	background: '#121212',
	card: '#1C1C1E',
	cardLight: '#2C2C2E',
	border: '#2C2C2E',
	text: '#FFFFFF',
	textSecondary: '#8E8E93',
	accent: '#FF9500',
	error: '#FF3B30',
} as const

/** До окончания текущего периода подписки (сервер: premiumExpiresAt). */
function formatNextBillingRelative(
	expiresAt: string,
	lang: Language | null,
): string | null {
	const exp = new Date(expiresAt).getTime()
	if (!Number.isFinite(exp) || exp <= Date.now()) return null
	const ms = exp - Date.now()
	const days = Math.floor(ms / 86400000)
	const hours = Math.floor((ms % 86400000) / 3600000)
	const minutes = Math.floor((ms % 3600000) / 60000)
	const locale = lang === 'en' ? 'en' : lang === 'az' ? 'az' : 'ru'
	try {
		const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
		if (days >= 1) return rtf.format(days, 'day')
		if (hours >= 1) return rtf.format(hours, 'hour')
		return rtf.format(Math.max(1, minutes), 'minute')
	} catch {
		return null
	}
}

// ─────────────────────────────────────────────
// Shimmer (identical to RecoveryTab)
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
// FadeIn (identical to RecoveryTab)
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
// Skeleton blocks
// ─────────────────────────────────────────────
const HeaderSkeleton = () => (
	<View style={styles.header}>
		<View style={{ flex: 1, gap: 10, paddingRight: 12 }}>
			<ShimmerBlock
				style={{
					height: 28,
					width: '58%',
					maxWidth: 220,
					borderRadius: 8,
					backgroundColor: COLORS.cardLight,
				}}
			/>
			<ShimmerBlock
				style={{
					height: 15,
					width: '82%',
					maxWidth: 280,
					borderRadius: 5,
					backgroundColor: COLORS.cardLight,
				}}
			/>
		</View>
		<ShimmerBlock
			style={{
				height: 34,
				width: 88,
				borderRadius: 20,
				backgroundColor: COLORS.cardLight,
			}}
		/>
	</View>
)

const UserCardSkeleton = () => (
	<View style={[styles.userCard, { borderColor: COLORS.border }]}>
		<ShimmerBlock
			style={{
				width: 70,
				height: 70,
				borderRadius: 35,
				backgroundColor: COLORS.cardLight,
				marginRight: 16,
			}}
		/>
		<View style={{ flex: 1, gap: 10 }}>
			<ShimmerBlock
				style={{
					height: 18,
					width: 130,
					borderRadius: 6,
					backgroundColor: COLORS.cardLight,
				}}
			/>
			<ShimmerBlock
				style={{
					height: 13,
					width: 180,
					borderRadius: 4,
					backgroundColor: COLORS.cardLight,
				}}
			/>
			<ShimmerBlock
				style={{
					height: 12,
					width: '65%',
					borderRadius: 4,
					backgroundColor: COLORS.cardLight,
					marginTop: 2,
				}}
			/>
		</View>
	</View>
)

const PremiumBlockSkeleton = () => (
	<View style={[styles.premiumStatusBlock, { borderColor: COLORS.border }]}>
		<View
			style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
		>
			<ShimmerBlock
				style={{
					width: 24,
					height: 24,
					borderRadius: 12,
					backgroundColor: COLORS.cardLight,
				}}
			/>
			<ShimmerBlock
				style={{
					height: 16,
					width: 120,
					borderRadius: 5,
					backgroundColor: COLORS.cardLight,
					marginLeft: 10,
				}}
			/>
		</View>
		<View style={{ paddingLeft: 34, gap: 10 }}>
			<ShimmerBlock
				style={{
					height: 13,
					width: '80%',
					borderRadius: 4,
					backgroundColor: COLORS.cardLight,
				}}
			/>
			<ShimmerBlock
				style={{
					height: 12,
					width: '62%',
					borderRadius: 4,
					backgroundColor: COLORS.cardLight,
				}}
			/>
			<ShimmerBlock
				style={{
					height: 38,
					width: 140,
					borderRadius: 30,
					backgroundColor: COLORS.cardLight,
				}}
			/>
		</View>
	</View>
)

const SettingsItemSkeleton = () => (
	<View style={[styles.settingsItem, { marginBottom: 8 }]}>
		<ShimmerBlock
			style={{
				width: 44,
				height: 44,
				borderRadius: 22,
				backgroundColor: COLORS.cardLight,
				marginRight: 12,
			}}
		/>
		<View style={{ flex: 1, gap: 8 }}>
			<ShimmerBlock
				style={{
					height: 14,
					width: 150,
					borderRadius: 4,
					backgroundColor: COLORS.cardLight,
				}}
			/>
			<ShimmerBlock
				style={{
					height: 11,
					width: 110,
					borderRadius: 4,
					backgroundColor: COLORS.cardLight,
				}}
			/>
		</View>
		<ShimmerBlock
			style={{
				width: 20,
				height: 20,
				borderRadius: 4,
				backgroundColor: COLORS.cardLight,
			}}
		/>
	</View>
)

/** Заголовок секции + N строк в стиле SettingsItem */
const SettingsSectionSkeleton = ({ rows = 2 }: { rows?: number }) => (
	<View style={styles.section}>
		<ShimmerBlock
			style={{
				height: 18,
				width: 140,
				borderRadius: 5,
				backgroundColor: COLORS.cardLight,
				marginBottom: 12,
				marginLeft: 8,
			}}
		/>
		{Array.from({ length: rows }, (_, i) => (
			<SettingsItemSkeleton key={i} />
		))}
	</View>
)

// ─────────────────────────────────────────────
// SettingsItem (unchanged from original)
// ─────────────────────────────────────────────
interface SettingsItemProps {
	icon: keyof typeof Ionicons.glyphMap
	title: string
	subtitle?: string
	onPress?: () => void
	showChevron?: boolean
	rightElement?: React.ReactNode
	iconColor?: string
}

const SettingsItem: React.FC<SettingsItemProps> = ({
	icon,
	title,
	subtitle,
	onPress,
	showChevron = true,
	rightElement,
	iconColor = COLORS.primary,
}) => (
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
			{subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
		</View>
		{rightElement}
		{showChevron && !rightElement && (
			<Ionicons name='chevron-forward' size={20} color={COLORS.textSecondary} />
		)}
	</TouchableOpacity>
)

// ─────────────────────────────────────────────
// Time picker modal
// ─────────────────────────────────────────────
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 15, 30, 45]

const TimePickerModal = ({
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
}) => {
	const [selectedHour, setSelectedHour] = useState(hour)
	const [selectedMinute, setSelectedMinute] = useState(minute)
	const { t } = useLanguage()

	return (
		<Modal transparent animationType='fade' visible={visible} onRequestClose={onClose}>
			<TouchableOpacity
				style={pickerStyles.overlay}
				activeOpacity={1}
				onPress={onClose}
			>
				<TouchableOpacity activeOpacity={1} onPress={() => {}}>
					<View style={pickerStyles.container}>
						<Text style={pickerStyles.title}>{t('profile', 'reminderTime')}</Text>
						<View style={pickerStyles.pickers}>
							<View style={pickerStyles.pickerCol}>
								<Text style={pickerStyles.pickerLabel}>{t('profile', 'hours')}</Text>
								<ScrollView style={pickerStyles.scroll} showsVerticalScrollIndicator={false}>
									{HOURS.map(h => (
										<TouchableOpacity
											key={h}
											style={[pickerStyles.option, selectedHour === h && pickerStyles.optionSelected]}
											onPress={() => setSelectedHour(h)}
										>
											<Text style={[pickerStyles.optionText, selectedHour === h && pickerStyles.optionTextSelected]}>
												{String(h).padStart(2, '0')}
											</Text>
										</TouchableOpacity>
									))}
								</ScrollView>
							</View>
							<Text style={pickerStyles.colon}>:</Text>
							<View style={pickerStyles.pickerCol}>
								<Text style={pickerStyles.pickerLabel}>{t('profile', 'minutes')}</Text>
								<ScrollView style={pickerStyles.scroll} showsVerticalScrollIndicator={false}>
									{MINUTES.map(m => (
										<TouchableOpacity
											key={m}
											style={[pickerStyles.option, selectedMinute === m && pickerStyles.optionSelected]}
											onPress={() => setSelectedMinute(m)}
										>
											<Text style={[pickerStyles.optionText, selectedMinute === m && pickerStyles.optionTextSelected]}>
												{String(m).padStart(2, '0')}
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
								style={pickerStyles.confirmBtn}
								onPress={() => onConfirm(selectedHour, selectedMinute)}
							>
								<Text style={pickerStyles.confirmText}>{t('common', 'save')}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</TouchableOpacity>
			</TouchableOpacity>
		</Modal>
	)
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function ProfileScreen() {
	const { user, signOut } = useAuth()
	const { t, language, setLanguage } = useLanguage()
	const {
		syncWithServer,
		isLoading: dbLoading,
		workouts,
		bodyMeasurements,
		personalRecords,
	} = useDatabase()
	const [syncing, setSyncing] = useState(false)
	const [signingOut, setSigningOut] = useState(false)
	const [loading, setLoading] = useState(true)

	// Уведомления
	const [notifSettings, setNotifSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
	const [togglingNotif, setTogglingNotif] = useState(false)
	const [showTimePicker, setShowTimePicker] = useState(false)

	// Экспорт
	const [exporting, setExporting] = useState(false)

	const premium = user ? hasActivePremium(user) : false

	const nextBillingRelative = useMemo(() => {
		if (!premium || !user?.premiumExpiresAt) return null
		return formatNextBillingRelative(user.premiumExpiresAt, language)
	}, [premium, user?.premiumExpiresAt, language])

	useEffect(() => {
		loadNotificationSettings().then(setNotifSettings)
	}, [])

	// Simulate auth data resolving — remove the delay if useAuth already guards
	useEffect(() => {
		if (user !== undefined) {
			const timer = setTimeout(() => setLoading(false), 300)
			return () => clearTimeout(timer)
		}
	}, [user])

	const handleSync = async () => {
		if (!premium) {
			router.push('/(auth)/subscription')
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

	const handleToggleNotifications = async (enabled: boolean) => {
		setTogglingNotif(true)
		try {
			const success = await toggleWorkoutReminders(
				enabled,
				notifSettings.hour,
				notifSettings.minute,
			)
			if (success) {
				setNotifSettings(prev => ({ ...prev, enabled }))
			} else if (enabled) {
				Alert.alert(t('profile', 'permissionsTitle'), t('profile', 'notifPermission'))
			}
		} catch (e) {
			Alert.alert(t('common', 'error'), t('profile', 'notifError'))
		} finally {
			setTogglingNotif(false)
		}
	}

	const handleTimeConfirm = async (hour: number, minute: number) => {
		setShowTimePicker(false)
		const updated = { ...notifSettings, hour, minute }
		setNotifSettings(updated)
		if (notifSettings.enabled) {
			await toggleWorkoutReminders(true, hour, minute)
		} else {
			const { saveNotificationSettings } = await import('@/services/notifications')
			await saveNotificationSettings(updated)
		}
	}

	const handleExportAll = async () => {
		setExporting(true)
		try {
			await exportAllDataToCsv(workouts, bodyMeasurements, personalRecords)
		} catch (e) {
			Alert.alert(t('common', 'error'), t('profile', 'exportError'))
		} finally {
			setExporting(false)
		}
	}

	const handleExportWorkouts = async () => {
		setExporting(true)
		try {
			await exportWorkoutsToCsv(workouts)
		} catch (e) {
			Alert.alert(t('common', 'error'), t('profile', 'exportError'))
		} finally {
			setExporting(false)
		}
	}

	const handleLanguageChange = async (lang: Language) => {
		await setLanguage(lang)
	}

	const handleSignOut = () => {
		Alert.alert(t('profile', 'signOutTitle'), t('profile', 'signOutConfirm'), [
			{ text: t('common', 'cancel'), style: 'cancel' },
			{
				text: t('profile', 'signOut'),
				style: 'destructive',
				onPress: async () => {
					setSigningOut(true)
					try {
						await signOut()
						router.replace('/(auth)/login')
					} catch (err) {
						Alert.alert(t('common', 'error'), t('profile', 'syncError'))
					} finally {
						setSigningOut(false)
					}
				},
			},
		])
	}

	const handleUpgrade = () => router.push('/(auth)/trial-paywall' as any)
	const displayNameLine = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
	const userInitial =
		user?.firstName?.[0] || user?.lastName?.[0] || user?.email?.[0] || '?'

	return (
		<SafeAreaView style={styles.container} edges={['top']}>
			<TimePickerModal
				visible={showTimePicker}
				hour={notifSettings.hour}
				minute={notifSettings.minute}
				onConfirm={handleTimeConfirm}
				onClose={() => setShowTimePicker(false)}
			/>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				{/* Header — при загрузке весь блок шиммер */}
				{loading ? (
					<HeaderSkeleton />
				) : (
					<View style={styles.header}>
						<View>
							<Text style={styles.title}>{t('profile', 'title')}</Text>
							<Text style={styles.subtitle}>{t('profile', 'subtitle')}</Text>
						</View>
						<FadeIn show={!loading}>
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									backgroundColor: premium
										? 'rgba(52,199,89,0.1)'
										: 'rgba(142,142,147,0.1)',
									borderRadius: 20,
									paddingHorizontal: 12,
									paddingVertical: 6,
									borderWidth: 1,
									borderColor: premium
										? 'rgba(52,199,89,0.2)'
										: 'rgba(142,142,147,0.2)',
									gap: 6,
								}}
							>
								<View
									style={{
										width: 7,
										height: 7,
										borderRadius: 3.5,
										backgroundColor: premium
											? COLORS.primary
											: COLORS.textSecondary,
									}}
								/>
								<Text
									style={{
										fontSize: 13,
										fontWeight: '600',
										color: premium
											? COLORS.primary
											: COLORS.textSecondary,
									}}
								>
									{premium ? t('profile', 'premium') : t('profile', 'basic')}
								</Text>
							</View>
						</FadeIn>
					</View>
				)}

				{/* User card */}
				{loading ? (
					<UserCardSkeleton />
				) : (
					<FadeIn show={!loading}>
						<View style={styles.userCard}>
							<View style={styles.avatarContainer}>
								<Text style={styles.avatarText}>{userInitial}</Text>
							</View>
							<View style={styles.userInfo}>
								<Text style={styles.userName}>
									{displayNameLine || t('profile', 'defaultUser')}
								</Text>
								<Text style={styles.userEmail}>{user?.email || '—'}</Text>
							</View>
						</View>
					</FadeIn>
				)}

				{/* Имя и фамилия (сервер → лидерборд и весь клиент) */}
				{!loading && (
					<FadeIn show={!loading}>
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>{t('profile', 'displayNameSection')}</Text>
							<SettingsItem
								icon='create-outline'
								title={t('profile', 'displayNameEntry')}
								subtitle={t('profile', 'displayNameSubtitle')}
								onPress={() => router.push('/(auth)/(routes)/edit-name')}
								iconColor={COLORS.primary}
							/>
						</View>
					</FadeIn>
				)}

				{/* Premium status block */}
				{loading ? (
					<PremiumBlockSkeleton />
				) : (
					<FadeIn show={!loading}>
						<View style={styles.premiumStatusBlock}>
						<View style={styles.premiumStatusHeader}>
							<Ionicons
								name={premium ? 'diamond' : 'diamond-outline'}
								size={24}
								color={
									premium ? COLORS.primary : COLORS.textSecondary
								}
							/>
							<Text style={styles.premiumStatusTitle}>{t('profile', 'premiumStatus')}</Text>
						</View>
						<View style={styles.premiumStatusBody}>
							<Text style={styles.premiumStatusText}>
								{premium
									? t('profile', 'premiumActive')
									: t('profile', 'freePlan')}
							</Text>
							{nextBillingRelative ? (
								<Text style={styles.premiumRenewal}>
									{t('profile', 'nextBillingLabel')}: {nextBillingRelative}
								</Text>
							) : null}
							{!premium && (
								<TouchableOpacity
									style={styles.upgradeButton}
									onPress={handleUpgrade}
								>
									<Text style={styles.upgradeButtonText}>{t('profile', 'buyPremium')}</Text>
									<Ionicons
										name='arrow-forward'
										size={18}
										color={COLORS.primary}
									/>
								</TouchableOpacity>
							)}
						</View>
						</View>
					</FadeIn>
				)}

				{/* Sync section (premium only) */}
				{loading ? (
					<SettingsSectionSkeleton rows={2} />
				) : premium ? (
					<FadeIn show={!loading}>
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>{t('profile', 'cloud')}</Text>
							<SettingsItem
								icon='cloud-upload-outline'
								title={t('profile', 'syncData')}
								subtitle={t('profile', 'syncSubtitle')}
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
					</FadeIn>
				) : null}

			{/* Rating + social (marketplace / gym-pass hidden) */}
			{loading ? (
				<SettingsSectionSkeleton rows={2} />
			) : (
				<FadeIn show={!loading}>
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{t('profile', 'ratingSocialSection')}</Text>
						<SettingsItem
							icon='trophy-outline'
							title={t('profile', 'ratingEntry')}
							subtitle={t('profile', 'ratingEntrySubtitle')}
							onPress={() => router.push('/(auth)/(routes)/rating')}
							iconColor='#FFD700'
						/>
						<SettingsItem
							icon='share-social-outline'
							title={t('profile', 'socialLinksEntry')}
							subtitle={t('profile', 'socialLinksSubtitle')}
							onPress={() => router.push('/(auth)/(routes)/edit-social')}
							iconColor='#5AC8FA'
						/>
					</View>
				</FadeIn>
			)}

			{/* Notifications section */}
			{loading ? (
				<SettingsSectionSkeleton rows={2} />
			) : (
				<FadeIn show={!loading}>
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{t('profile', 'notifications')}</Text>
							<SettingsItem
								icon='notifications-outline'
								title={t('profile', 'reminder')}
								subtitle={
									notifSettings.enabled
										? `${t('profile', 'reminderSchedule')} ${formatTime(notifSettings.hour, notifSettings.minute)}`
										: t('profile', 'notifDisabled')
								}
								onPress={() => {}}
								showChevron={false}
								rightElement={
									togglingNotif ? (
										<ActivityIndicator size='small' color={COLORS.primary} />
									) : (
										<Switch
											value={notifSettings.enabled}
											onValueChange={handleToggleNotifications}
											trackColor={{ false: COLORS.border, true: `${COLORS.primary}80` }}
											thumbColor={notifSettings.enabled ? COLORS.primary : COLORS.textSecondary}
										/>
									)
								}
							/>
							{notifSettings.enabled && (
								<SettingsItem
									icon='time-outline'
									title={t('profile', 'notifTimeLabel')}
									subtitle={formatTime(notifSettings.hour, notifSettings.minute)}
									onPress={() => setShowTimePicker(true)}
									iconColor={COLORS.accent}
								/>
							)}
						</View>
					</FadeIn>
			)}

				{/* Export section */}
				{loading ? (
					<SettingsSectionSkeleton rows={2} />
				) : (
					<FadeIn show={!loading}>
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>{t('profile', 'export')}</Text>
							<SettingsItem
								icon='download-outline'
								title={t('profile', 'exportAll')}
								subtitle={t('profile', 'exportAllSubtitle')}
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
								title={t('profile', 'exportWorkouts')}
								subtitle={`${workouts.length} ${t('profile', 'recordsLabel')}`}
								onPress={handleExportWorkouts}
								showChevron={false}
								iconColor='#5AC8FA'
							/>
						</View>
					</FadeIn>
			)}

				{/* Language section */}
				{loading ? (
					<SettingsSectionSkeleton rows={3} />
				) : (
					<FadeIn show={!loading}>
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>{t('profile', 'language')}</Text>
							{(['ru', 'en', 'az'] as Language[]).map(lang => {
								const selected = lang === language
								return (
									<SettingsItem
										key={lang}
										icon='language-outline'
										title={`${LANGUAGE_FLAGS[lang]} ${LANGUAGE_NAMES[lang]}`}
										onPress={() => handleLanguageChange(lang)}
										showChevron={false}
										iconColor={selected ? COLORS.primary : COLORS.textSecondary}
										rightElement={
											<View
												style={[
													styles.langCheckBox,
													selected && styles.langCheckBoxSelected,
												]}
											>
												{selected ? (
													<Ionicons name='checkmark' size={16} color={COLORS.text} />
												) : null}
											</View>
										}
									/>
								)
							})}
						</View>
					</FadeIn>
			)}

				{/* Sign out */}
				{loading ? (
					<SettingsSectionSkeleton rows={1} />
				) : (
					<FadeIn show={!loading}>
						<Text style={styles.sectionTitle}>{t('profile', 'signOutSection')}</Text>
						<SettingsItem
							icon='log-out-outline'
							title={t('profile', 'signOut')}
							subtitle={t('profile', 'signOutSubtitle')}
							onPress={handleSignOut}
							iconColor={COLORS.error}
							showChevron={false}
							rightElement={
								signingOut ? (
									<ActivityIndicator size='small' color={COLORS.error} />
								) : null
							}
						/>
					</FadeIn>
				)}
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: COLORS.background },
	scrollContent: { paddingBottom: 40 },
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingTop: 20,
		paddingBottom: 16,
	},
	title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
	subtitle: { fontSize: 15, color: COLORS.textSecondary, marginTop: 4 },
	userCard: {
		flexDirection: 'row',
		backgroundColor: COLORS.card,
		borderRadius: 20,
		padding: 20,
		marginHorizontal: 10,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
		alignItems: 'center',
	},
	avatarContainer: {
		width: 70,
		height: 70,
		borderRadius: 35,
		backgroundColor: COLORS.primary,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 16,
	},
	avatarText: { fontSize: 30, fontWeight: 'bold', color: COLORS.text },
	userInfo: { flex: 1 },
	userName: { fontSize: 20, fontWeight: '600', color: COLORS.text },
	userEmail: { fontSize: 15, color: COLORS.textSecondary, marginTop: 2 },
	premiumStatusBlock: {
		backgroundColor: COLORS.card,
		borderRadius: 20,
		padding: 20,
		marginHorizontal: 10,
		marginBottom: 15,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	premiumStatusHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	premiumStatusTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: COLORS.text,
		marginLeft: 10,
	},
	premiumStatusBody: { paddingLeft: 34 },
	premiumStatusText: {
		fontSize: 15,
		color: COLORS.textSecondary,
		marginBottom: 12,
	},
	premiumRenewal: {
		marginTop: -6,
		marginBottom: 12,
		fontSize: 13,
		color: COLORS.textSecondary,
		lineHeight: 18,
	},
	upgradeButton: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'flex-start',
		backgroundColor: 'rgba(52, 199, 89, 0.15)',
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 30,
		gap: 8,
	},
	upgradeButtonText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
	section: { marginTop: 10 },
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: COLORS.text,
		marginBottom: 12,
		marginLeft: 8,
	},
	settingsItem: {
		flexDirection: 'row',
		backgroundColor: COLORS.card,
		borderRadius: 16,
		padding: 16,
		marginBottom: 8,
		marginHorizontal: 10,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	settingsIcon: {
		width: 44,
		height: 44,
		borderRadius: 22,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	settingsContent: { flex: 1 },
	settingsTitle: { fontSize: 16, fontWeight: '500', color: COLORS.text },
	settingsSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
	langCheckBox: {
		width: 26,
		height: 26,
		borderRadius: 7,
		borderWidth: 2,
		borderColor: COLORS.border,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
	},
	langCheckBoxSelected: {
		borderColor: COLORS.primary,
		backgroundColor: COLORS.primary,
	},
})

const pickerStyles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.7)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	container: {
		backgroundColor: '#1C1C1E',
		borderRadius: 20,
		padding: 24,
		width: 300,
		borderWidth: 1,
		borderColor: '#2C2C2E',
	},
	title: {
		fontSize: 18,
		fontWeight: '600',
		color: '#FFFFFF',
		textAlign: 'center',
		marginBottom: 20,
	},
	pickers: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 20,
	},
	pickerCol: {
		alignItems: 'center',
		width: 90,
	},
	pickerLabel: {
		fontSize: 12,
		color: '#8E8E93',
		marginBottom: 8,
	},
	scroll: {
		height: 160,
	},
	option: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 10,
		marginBottom: 4,
	},
	optionSelected: {
		backgroundColor: 'rgba(52,199,89,0.2)',
	},
	optionText: {
		fontSize: 20,
		color: '#8E8E93',
		textAlign: 'center',
		fontWeight: '500',
	},
	optionTextSelected: {
		color: '#34C759',
		fontWeight: '700',
	},
	colon: {
		fontSize: 28,
		color: '#FFFFFF',
		fontWeight: '700',
		marginHorizontal: 8,
		marginTop: 20,
	},
	actions: {
		flexDirection: 'row',
		gap: 12,
	},
	cancelBtn: {
		flex: 1,
		paddingVertical: 14,
		borderRadius: 12,
		backgroundColor: '#2C2C2E',
		alignItems: 'center',
	},
	cancelText: {
		color: '#8E8E93',
		fontSize: 16,
		fontWeight: '600',
	},
	confirmBtn: {
		flex: 1,
		paddingVertical: 14,
		borderRadius: 12,
		backgroundColor: 'rgba(52,199,89,0.2)',
		borderWidth: 1,
		borderColor: 'rgba(52,199,89,0.4)',
		alignItems: 'center',
	},
	confirmText: {
		color: '#34C759',
		fontSize: 16,
		fontWeight: '600',
	},
})
