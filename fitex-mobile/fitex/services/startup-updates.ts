import * as Updates from 'expo-updates'
import { Platform } from 'react-native'

/**
 * Раньше OTA применялся ДО скрытия splash → при битом апдейте казалось,
 * что приложение «выкидывает» сразу после сплэша.
 * Обновления оставляем OtaUpdateGate (после UI).
 */
export async function applyPendingEASUpdateBeforeUI(): Promise<void> {
	if (__DEV__) return
	if (Platform.OS === 'web') return
	if (!Updates.isEnabled) return
	// no-op: не блокируем и не reload'им на старте
}
