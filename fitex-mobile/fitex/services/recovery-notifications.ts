import { translateGroupName } from '@/constants/exercise-i18n'
import { Language, translations } from '@/locales'
import { getRecoveryData } from '@/scripts/database'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
	loadAppNotificationSettings,
	rescheduleRecoveryNotifications,
} from '@/services/notifications'

const LANGUAGE_KEY = 'app_language'

async function resolveLanguage(): Promise<Language> {
	try {
		const saved = await AsyncStorage.getItem(LANGUAGE_KEY)
		if (saved === 'ru' || saved === 'en' || saved === 'az') return saved
	} catch {
		// ignore
	}
	return 'ru'
}

/** Call after workout / recovery recalc to refresh scheduled recovery alerts. */
export async function syncRecoveryReadyNotifications(): Promise<void> {
	try {
		const settings = await loadAppNotificationSettings()
		if (!settings.recoveryReady) {
			const { cancelRecoveryNotifications } = await import(
				'@/services/notifications'
			)
			await cancelRecoveryNotifications()
			return
		}

		const [rows, lang] = await Promise.all([
			getRecoveryData(),
			resolveLanguage(),
		])
		const dict = translations[lang]
		const title = dict.settings.recoveryNotifTitle
		const bodyTpl = dict.settings.recoveryNotifBody

		await rescheduleRecoveryNotifications(
			rows,
			group => translateGroupName(group, lang),
			{
				title,
				bodyForGroup: name => bodyTpl.replace('{group}', name),
			},
		)
	} catch (e) {
		console.warn('syncRecoveryReadyNotifications failed', e)
	}
}
