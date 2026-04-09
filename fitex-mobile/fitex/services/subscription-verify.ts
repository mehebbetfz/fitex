import { api } from '@/services/api'
import { Platform } from 'react-native'
import type { Purchase } from 'react-native-iap'
import { finishTransaction, getAvailablePurchases } from 'react-native-iap'

import { getIosAppStoreReceiptForVerify } from './iap-receipt'

const PREMIUM_IDS = new Set(['premium_monthly', 'premium_yearly'])

export type VerifyOk = {
	ok: true
	premiumExpiresAt?: string
}

export type VerifyFail = { ok: false; message: string }

export async function verifySubscriptionOnServer(purchase: Purchase): Promise<VerifyOk | VerifyFail> {
	const receipt =
		Platform.OS === 'ios' ? await getIosAppStoreReceiptForVerify() : purchase.purchaseToken ?? undefined

	if (!receipt) {
		return { ok: false, message: 'noReceipt' }
	}

	try {
		const response = await api.post('/subscription/verify', {
			receipt,
			productId: purchase.productId,
			platform: Platform.OS,
			transactionId: purchase.transactionId,
		})

		if (response.data?.success) {
			await finishTransaction({ purchase, isConsumable: false })
			return { ok: true, premiumExpiresAt: response.data.premiumExpiresAt }
		}

		const msg =
			typeof response.data?.message === 'string' ? response.data.message : 'verify failed'
		return { ok: false, message: msg }
	} catch (err: unknown) {
		const msg =
			(err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
			?? (err as { message?: string })?.message
			?? 'network'
		return { ok: false, message: msg }
	}
}

/**
 * When the store says the item is already owned, sync entitlement using current receipt / active purchases.
 */
export async function syncAlreadyOwnedSubscription(): Promise<VerifyOk | VerifyFail> {
	const purchases = await getAvailablePurchases({ onlyIncludeActiveItemsIOS: true })

	const active = (Array.isArray(purchases) ? purchases : []).filter(p =>
		PREMIUM_IDS.has(p.productId),
	)
	if (!active.length) {
		return { ok: false, message: 'noActiveSubscription' }
	}

	active.sort((a, b) => {
		const ta = Number(a.transactionId) || 0
		const tb = Number(b.transactionId) || 0
		return tb - ta
	})

	return verifySubscriptionOnServer(active[0])
}
