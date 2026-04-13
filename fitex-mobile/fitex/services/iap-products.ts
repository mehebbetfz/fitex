import type { ProductSubscription } from 'react-native-iap'

import { getReactNativeIap } from './iap-runtime'

/** Must match App Store Connect / Play Console product IDs */
export const PREMIUM_SUB_SKUS = ['premium_monthly', 'premium_yearly'] as const

function sortYearlyFirst(products: ProductSubscription[]): ProductSubscription[] {
	return [...products].sort((a, b) => {
		if (a.id === 'premium_yearly') return -1
		if (b.id === 'premium_yearly') return 1
		return 0
	})
}

/**
 * Loads auto-renewable subscription products. Retries a few times (StoreKit can
 * return empty briefly) and falls back to type "all" if "subs" returns nothing.
 */
export async function fetchPremiumSubscriptions(): Promise<ProductSubscription[]> {
	const iap = getReactNativeIap()
	if (!iap) {
		console.warn('[IAP] Unavailable in Expo Go — use a dev build (expo run / EAS)')
		return []
	}

	const { fetchProducts } = iap
	const skus = [...PREMIUM_SUB_SKUS]
	const want = new Set(skus)

	const pick = (items: unknown[] | null | undefined): ProductSubscription[] =>
		(items ?? [])
			.filter((p): p is ProductSubscription => {
				if (!p || typeof p !== 'object') return false
				const id = (p as { id?: string }).id
				return typeof id === 'string' && want.has(id)
			})
			.map(p => p as ProductSubscription)

	for (let attempt = 0; attempt < 3; attempt++) {
		if (attempt > 0) await new Promise(r => setTimeout(r, 1000))
		try {
			const items = await fetchProducts({ skus, type: 'subs' })
			const out = pick(items as unknown[])
			if (out.length) {
				console.log('[IAP] fetchProducts(subs) ok, count=', out.length)
				return sortYearlyFirst(out)
			}
			console.warn('[IAP] fetchProducts(subs) empty, attempt', attempt + 1)
		} catch (e) {
			console.warn('[IAP] fetchProducts(subs) error, attempt', attempt + 1, e)
		}
	}

	try {
		const items = await fetchProducts({ skus, type: 'all' })
		const out = pick(items as unknown[])
		if (out.length) {
			console.log('[IAP] fetchProducts(all) fallback ok, count=', out.length)
			return sortYearlyFirst(out)
		}
		console.warn('[IAP] fetchProducts(all) empty')
	} catch (e) {
		console.warn('[IAP] fetchProducts(all) error', e)
	}

	return []
}
