import Constants, { ExecutionEnvironment } from 'expo-constants'

/**
 * В Expo Go нет нативных Nitro-модулей → react-native-iap падает при import.
 * В development / production сборке (expo run / EAS) IAP доступен.
 */
export const isStoreClientExpoGo =
	Constants.executionEnvironment === ExecutionEnvironment.StoreClient

export type ReactNativeIap = typeof import('react-native-iap')

let cached: ReactNativeIap | null | undefined

/** Не вызывать require в Expo Go — иначе краш NitroModules. */
export function getReactNativeIap(): ReactNativeIap | null {
	if (isStoreClientExpoGo) return null
	if (cached !== undefined) return cached
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		cached = require('react-native-iap') as ReactNativeIap
	} catch {
		cached = null
	}
	return cached
}
