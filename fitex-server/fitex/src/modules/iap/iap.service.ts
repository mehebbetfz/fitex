import { Injectable } from '@nestjs/common'
import * as iap from 'in-app-purchase'

/** Product IDs must match App Store Connect / Play Console and the mobile app. */
const PREMIUM_SUBSCRIPTION_IDS = new Set(['premium_monthly', 'premium_yearly'])

export type VerifiedSubscription = {
	valid: true
	transactionId: string
	/** Apple subscription family id; absent on Google (we use purchase token as stable id). */
	originalTransactionId?: string
	productId: string
	purchaseDate: Date
	expirationDate: Date | null
}

export type VerifyFailure = {
	valid: false
	errorMessage: string
}

@Injectable()
export class IapService {
	constructor() {
		iap.config({
			applePassword: process.env.APPLE_SHARED_SECRET,
			googlePublicKeyStrategy: 'v2',
		})
	}

	async verifyReceipt(receipt: string, platform: 'ios' | 'android'): Promise<VerifiedSubscription | VerifyFailure> {
		try {
			await iap.setup()

			// Single-argument validate: service is inferred from receipt (see node-in-app-purchase).
			const response = await iap.validate(receipt)

			if (!iap.isValidated(response)) {
				return { valid: false, errorMessage: 'Receipt validation failed' }
			}

			const list = iap.getPurchaseData(response, { ignoreExpired: true }) || []
			const premium = list.filter((p: { productId: string }) => PREMIUM_SUBSCRIPTION_IDS.has(p.productId))
			if (!premium.length) {
				return { valid: false, errorMessage: 'No active Fitex Premium subscription in this receipt' }
			}

			const best = premium.reduce((a: { expirationDate?: number }, b: { expirationDate?: number }) => {
				const ae = a.expirationDate || 0
				const be = b.expirationDate || 0
				return be >= ae ? b : a
			})

			const expMs = typeof best.expirationDate === 'number' ? best.expirationDate : 0
			if (!expMs || expMs <= Date.now()) {
				return { valid: false, errorMessage: 'Subscription has expired' }
			}

			const purchaseMs = Number(best.purchaseDate)
			const purchaseDate = Number.isFinite(purchaseMs) ? new Date(purchaseMs) : new Date()

			return {
				valid: true,
				transactionId: String(best.transactionId),
				originalTransactionId:
					platform === 'ios' && best.originalTransactionId != null
						? String(best.originalTransactionId)
						: undefined,
				productId: String(best.productId),
				purchaseDate,
				expirationDate: new Date(expMs),
			}
		} catch (error) {
			console.error('IAP verification error', error)
			return { valid: false, errorMessage: 'Receipt verification error' }
		}
	}
}
