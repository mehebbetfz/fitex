import type { ProductSubscription } from 'react-native-iap'

/** Цена из StoreKit / Play Billing (локаль витрины аккаунта Apple / Google). */
export function getStorefrontPrice(product: ProductSubscription | undefined): string {
	if (!product) return '—'
	const p = product as ProductSubscription & {
		localizedPrice?: string
		priceString?: string
	}
	return p.displayPrice ?? p.localizedPrice ?? p.priceString ?? '—'
}
