import * as Updates from 'expo-updates'
import { Platform } from 'react-native'

const CHECK_MS = 6_000
const FETCH_MS = 10_000

function raceTimeout<T>(promise: Promise<T>, ms: number): Promise<T | 'timeout'> {
	return new Promise(resolve => {
		const t = setTimeout(() => resolve('timeout'), ms)
		promise.then(
			v => {
				clearTimeout(t)
				resolve(v)
			},
			() => {
				clearTimeout(t)
				resolve('timeout')
			},
		)
	})
}

/**
 * Перед первым кадром UI: если на канале есть более новый OTA, скачиваем и перезапускаем.
 * Иначе после установки из стора первый запуск показывает встроенный бандл, а обновление — только со 2-го.
 */
export async function applyPendingEASUpdateBeforeUI(): Promise<void> {
	if (__DEV__) return
	if (Platform.OS === 'web') return
	if (!Updates.isEnabled) return

	try {
		const check = await raceTimeout(Updates.checkForUpdateAsync(), CHECK_MS)
		if (check === 'timeout') return
		if (!check.isAvailable) return

		const fetched = await raceTimeout(Updates.fetchUpdateAsync(), FETCH_MS)
		if (fetched === 'timeout') return
		if (fetched.isNew) {
			await Updates.reloadAsync()
		}
	} catch (e) {
		console.warn('[Updates] startup apply failed', e)
	}
}
