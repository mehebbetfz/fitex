import { getReactNativeIap } from './iap-runtime'

/**
 * Base64 App Store receipt for legacy verify (Apple / in-app-purchase).
 * Do not use purchase.purchaseToken on iOS — it is a JWS, not the receipt blob.
 */
export async function getIosAppStoreReceiptForVerify(): Promise<string | undefined> {
	const iap = getReactNativeIap()
	if (!iap) return undefined

	const { getReceiptIOS, requestReceiptRefreshIOS } = iap
	try {
		const r = await getReceiptIOS()
		if (r) return r
	} catch {
		/* empty */
	}
	try {
		return await requestReceiptRefreshIOS()
	} catch {
		return undefined
	}
}
