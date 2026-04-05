import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

const STORAGE_KEY_ENABLED = 'notification_reminder_enabled'
const STORAGE_KEY_HOUR = 'notification_reminder_hour'
const STORAGE_KEY_MINUTE = 'notification_reminder_minute'
const STORAGE_KEY_IDS = 'notification_reminder_ids'

// Показывать уведомления даже когда приложение открыто
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
})

export interface NotificationSettings {
	enabled: boolean
	hour: number
	minute: number
}

export const DEFAULT_SETTINGS: NotificationSettings = {
	enabled: false,
	hour: 9,
	minute: 0,
}

export const loadNotificationSettings = async (): Promise<NotificationSettings> => {
	try {
		const [enabled, hour, minute] = await Promise.all([
			AsyncStorage.getItem(STORAGE_KEY_ENABLED),
			AsyncStorage.getItem(STORAGE_KEY_HOUR),
			AsyncStorage.getItem(STORAGE_KEY_MINUTE),
		])
		return {
			enabled: enabled === 'true',
			hour: hour !== null ? parseInt(hour, 10) : DEFAULT_SETTINGS.hour,
			minute: minute !== null ? parseInt(minute, 10) : DEFAULT_SETTINGS.minute,
		}
	} catch {
		return DEFAULT_SETTINGS
	}
}

export const saveNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
	await Promise.all([
		AsyncStorage.setItem(STORAGE_KEY_ENABLED, String(settings.enabled)),
		AsyncStorage.setItem(STORAGE_KEY_HOUR, String(settings.hour)),
		AsyncStorage.setItem(STORAGE_KEY_MINUTE, String(settings.minute)),
	])
}

export const requestNotificationPermissions = async (): Promise<boolean> => {
	if (Platform.OS === 'web') return false

	const { status: existing } = await Notifications.getPermissionsAsync()
	if (existing === 'granted') return true

	const { status } = await Notifications.requestPermissionsAsync()
	return status === 'granted'
}

// Дни недели: 2=Пн, 3=Вт, 4=Ср, 5=Чт, 6=Пт (рабочие дни)
const WEEKDAYS = [2, 3, 4, 5, 6]

export const scheduleWorkoutReminders = async (hour: number, minute: number): Promise<void> => {
	await cancelWorkoutReminders()

	const ids: string[] = []
	for (const weekday of WEEKDAYS) {
		const id = await Notifications.scheduleNotificationAsync({
			content: {
				title: '💪 Время тренировки!',
				body: 'Не забудь про сегодняшнюю тренировку — ты уже так близко к цели!',
				sound: true,
				data: { type: 'workout_reminder' },
			},
			trigger: {
				type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
				weekday,
				hour,
				minute,
				repeats: true,
			},
		})
		ids.push(id)
	}

	await AsyncStorage.setItem(STORAGE_KEY_IDS, JSON.stringify(ids))
}

export const cancelWorkoutReminders = async (): Promise<void> => {
	try {
		const stored = await AsyncStorage.getItem(STORAGE_KEY_IDS)
		if (stored) {
			const ids: string[] = JSON.parse(stored)
			await Promise.all(ids.map(id => Notifications.cancelScheduledNotificationAsync(id)))
		}
		await AsyncStorage.removeItem(STORAGE_KEY_IDS)
	} catch {
		// Если не получилось — отменяем все
		await Notifications.cancelAllScheduledNotificationsAsync()
	}
}

export const toggleWorkoutReminders = async (
	enabled: boolean,
	hour: number,
	minute: number,
): Promise<boolean> => {
	if (enabled) {
		const granted = await requestNotificationPermissions()
		if (!granted) return false
		await scheduleWorkoutReminders(hour, minute)
	} else {
		await cancelWorkoutReminders()
	}
	await saveNotificationSettings({ enabled, hour, minute })
	return true
}

export const formatTime = (hour: number, minute: number): string => {
	return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}
