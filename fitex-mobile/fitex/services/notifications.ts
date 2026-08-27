import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import type { RecoveryData } from '@/scripts/database'
import {
	getRecoveryHoursForGroup,
	loadRecoverySettings,
} from '@/services/recovery-settings'

const KEY_WORKOUT_ENABLED = 'notification_reminder_enabled'
const KEY_WORKOUT_HOUR = 'notification_reminder_hour'
const KEY_WORKOUT_MINUTE = 'notification_reminder_minute'
const KEY_WORKOUT_IDS = 'notification_reminder_ids'
const KEY_RECOVERY_ENABLED = 'notification_recovery_enabled'
const KEY_RECOVERY_IDS = 'notification_recovery_ids'

const ANDROID_CHANNEL_ID = 'fitex-default'

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
})

/** @deprecated use AppNotificationSettings */
export interface NotificationSettings {
	enabled: boolean
	hour: number
	minute: number
}

export interface AppNotificationSettings {
	workoutReminders: boolean
	hour: number
	minute: number
	recoveryReady: boolean
}

export const DEFAULT_SETTINGS: NotificationSettings = {
	enabled: false,
	hour: 9,
	minute: 0,
}

export const DEFAULT_APP_SETTINGS: AppNotificationSettings = {
	workoutReminders: false,
	hour: 9,
	minute: 0,
	recoveryReady: true,
}

export async function ensureAndroidChannel(): Promise<void> {
	if (Platform.OS !== 'android') return
	await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
		name: 'Fitex',
		importance: Notifications.AndroidImportance.DEFAULT,
		vibrationPattern: [0, 250, 250, 250],
		lightColor: '#34C759',
	})
}

export const loadNotificationSettings = async (): Promise<NotificationSettings> => {
	const app = await loadAppNotificationSettings()
	return {
		enabled: app.workoutReminders,
		hour: app.hour,
		minute: app.minute,
	}
}

export const loadAppNotificationSettings =
	async (): Promise<AppNotificationSettings> => {
		try {
			const [enabled, hour, minute, recovery] = await Promise.all([
				AsyncStorage.getItem(KEY_WORKOUT_ENABLED),
				AsyncStorage.getItem(KEY_WORKOUT_HOUR),
				AsyncStorage.getItem(KEY_WORKOUT_MINUTE),
				AsyncStorage.getItem(KEY_RECOVERY_ENABLED),
			])
			return {
				workoutReminders: enabled === 'true',
				hour: hour !== null ? parseInt(hour, 10) : DEFAULT_APP_SETTINGS.hour,
				minute:
					minute !== null ? parseInt(minute, 10) : DEFAULT_APP_SETTINGS.minute,
				recoveryReady:
					recovery === null
						? DEFAULT_APP_SETTINGS.recoveryReady
						: recovery === 'true',
			}
		} catch {
			return { ...DEFAULT_APP_SETTINGS }
		}
	}

export const saveNotificationSettings = async (
	settings: NotificationSettings,
): Promise<void> => {
	const app = await loadAppNotificationSettings()
	await saveAppNotificationSettings({
		...app,
		workoutReminders: settings.enabled,
		hour: settings.hour,
		minute: settings.minute,
	})
}

export const saveAppNotificationSettings = async (
	settings: AppNotificationSettings,
): Promise<void> => {
	await Promise.all([
		AsyncStorage.setItem(KEY_WORKOUT_ENABLED, String(settings.workoutReminders)),
		AsyncStorage.setItem(KEY_WORKOUT_HOUR, String(settings.hour)),
		AsyncStorage.setItem(KEY_WORKOUT_MINUTE, String(settings.minute)),
		AsyncStorage.setItem(KEY_RECOVERY_ENABLED, String(settings.recoveryReady)),
	])
}

export const requestNotificationPermissions = async (): Promise<boolean> => {
	if (Platform.OS === 'web') return false
	await ensureAndroidChannel()

	const { status: existing } = await Notifications.getPermissionsAsync()
	if (existing === 'granted') return true

	const { status } = await Notifications.requestPermissionsAsync()
	return status === 'granted'
}

const WEEKDAYS = [2, 3, 4, 5, 6]

export type WorkoutReminderCopy = { title: string; body: string }

export const scheduleWorkoutReminders = async (
	hour: number,
	minute: number,
	copy?: WorkoutReminderCopy,
): Promise<void> => {
	await cancelWorkoutReminders()
	await ensureAndroidChannel()

	const title = copy?.title ?? 'Fitex'
	const body = copy?.body ?? 'Time to train!'

	const ids: string[] = []
	for (const weekday of WEEKDAYS) {
		const id = await Notifications.scheduleNotificationAsync({
			content: {
				title,
				body,
				sound: true,
				data: { type: 'workout_reminder' },
				...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
			},
			trigger: {
				type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
				weekday,
				hour,
				minute,
			} as Notifications.WeeklyTriggerInput,
		})
		ids.push(id)
	}

	await AsyncStorage.setItem(KEY_WORKOUT_IDS, JSON.stringify(ids))
}

export const cancelWorkoutReminders = async (): Promise<void> => {
	try {
		const stored = await AsyncStorage.getItem(KEY_WORKOUT_IDS)
		if (stored) {
			const ids: string[] = JSON.parse(stored)
			await Promise.all(
				ids.map(id => Notifications.cancelScheduledNotificationAsync(id)),
			)
		}
		await AsyncStorage.removeItem(KEY_WORKOUT_IDS)
	} catch {
		// leave other notifications intact
	}
}

export const toggleWorkoutReminders = async (
	enabled: boolean,
	hour: number,
	minute: number,
	copy?: WorkoutReminderCopy,
): Promise<boolean> => {
	const app = await loadAppNotificationSettings()
	if (enabled) {
		const granted = await requestNotificationPermissions()
		if (!granted) return false
		await scheduleWorkoutReminders(hour, minute, copy)
	} else {
		await cancelWorkoutReminders()
	}
	await saveAppNotificationSettings({
		...app,
		workoutReminders: enabled,
		hour,
		minute,
	})
	return true
}

/** Hours until recovery >= 95 given fatigue, last_trained and group recovery window. */
export function hoursUntilRecovered(
	fatigue: number,
	lastTrainedDate: string | null,
	recoveryHours: number = 72,
): number | null {
	if (!lastTrainedDate) return null
	const last = new Date(lastTrainedDate).getTime()
	if (!Number.isFinite(last)) return null

	const hoursElapsed = Math.max(0, (Date.now() - last) / 3_600_000)
	const severity = Math.max(0, Math.min(100, fatigue || 0))
	const hoursNeeded = Math.max(
		12,
		recoveryHours * (0.75 + 0.75 * (severity / 100)),
	)
	const recoveryPct = Math.min(100, (hoursElapsed / hoursNeeded) * 100)
	if (recoveryPct >= 95) return 0

	return Math.max(0, hoursNeeded * 0.95 - hoursElapsed)
}

/**
 * Per group_name: when the slowest muscle in the group reaches recovered.
 * Skips groups already fully recovered.
 */
export async function computeGroupReadyTimes(
	rows: RecoveryData[],
): Promise<{ groupName: string; readyAt: Date }[]> {
	const settings = await loadRecoverySettings()
	const byGroup = new Map<string, number>() // group -> max ready timestamp ms

	for (const row of rows) {
		const group = (row.group_name || row.muscle_name || '').trim()
		if (!group) continue
		const hours = getRecoveryHoursForGroup(group, settings)
		const hoursLeft = hoursUntilRecovered(
			row.fatigue ?? 0,
			row.last_trained,
			hours,
		)
		if (hoursLeft == null) continue
		if (hoursLeft <= 0) continue // already recovered
		const readyMs = Date.now() + hoursLeft * 3_600_000
		const prev = byGroup.get(group) ?? 0
		if (readyMs > prev) byGroup.set(group, readyMs)
	}

	return [...byGroup.entries()].map(([groupName, ms]) => ({
		groupName,
		readyAt: new Date(ms),
	}))
}

export type RecoveryNotifCopy = {
	title: string
	bodyForGroup: (groupDisplayName: string) => string
}

export const cancelRecoveryNotifications = async (): Promise<void> => {
	try {
		const stored = await AsyncStorage.getItem(KEY_RECOVERY_IDS)
		if (stored) {
			const ids: string[] = JSON.parse(stored)
			await Promise.all(
				ids.map(id => Notifications.cancelScheduledNotificationAsync(id)),
			)
		}
		await AsyncStorage.removeItem(KEY_RECOVERY_IDS)
	} catch {
		// ignore
	}
}

export const scheduleRecoveryNotifications = async (
	groups: { groupName: string; displayName: string; readyAt: Date }[],
	copy: RecoveryNotifCopy,
): Promise<void> => {
	await cancelRecoveryNotifications()
	await ensureAndroidChannel()

	const now = Date.now()
	const ids: string[] = []

	for (const g of groups) {
		const when = g.readyAt.getTime()
		// Skip if more than ~10 days out or already past (add 30s buffer)
		if (when <= now + 30_000) continue
		if (when > now + 10 * 24 * 3_600_000) continue

		const id = await Notifications.scheduleNotificationAsync({
			content: {
				title: copy.title,
				body: copy.bodyForGroup(g.displayName),
				sound: true,
				data: { type: 'recovery_ready', group: g.groupName },
				...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
			},
			trigger: {
				type: Notifications.SchedulableTriggerInputTypes.DATE,
				date: g.readyAt,
			},
		})
		ids.push(id)
	}

	await AsyncStorage.setItem(KEY_RECOVERY_IDS, JSON.stringify(ids))
}

export const toggleRecoveryNotifications = async (
	enabled: boolean,
): Promise<boolean> => {
	const app = await loadAppNotificationSettings()
	if (enabled) {
		const granted = await requestNotificationPermissions()
		if (!granted) return false
	} else {
		await cancelRecoveryNotifications()
	}
	await saveAppNotificationSettings({ ...app, recoveryReady: enabled })
	return true
}

/**
 * Re-read recovery rows and (re)schedule group-ready notifications if enabled.
 */
export const rescheduleRecoveryNotifications = async (
	rows: RecoveryData[],
	displayName: (groupName: string) => string,
	copy: RecoveryNotifCopy,
): Promise<void> => {
	if (Platform.OS === 'web') return
	const settings = await loadAppNotificationSettings()
	if (!settings.recoveryReady) {
		await cancelRecoveryNotifications()
		return
	}
	const granted = await requestNotificationPermissions()
	if (!granted) return

	const times = await computeGroupReadyTimes(rows)
	await scheduleRecoveryNotifications(
		times.map(t => ({
			groupName: t.groupName,
			displayName: displayName(t.groupName),
			readyAt: t.readyAt,
		})),
		copy,
	)
}

export const formatTime = (hour: number, minute: number): string => {
	return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}
