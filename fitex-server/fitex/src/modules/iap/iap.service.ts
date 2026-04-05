import { Injectable } from '@nestjs/common'
import * as iap from 'in-app-purchase'

@Injectable()
export class IapService {
	constructor() {
		// Настройка iap для iOS и Android
		iap.config({
			applePassword: process.env.APPLE_SHARED_SECRET,
			googlePublicKeyStrategy: 'v2', // для Google Play
		})
	}

	async verifyReceipt(receipt: string, platform: 'ios' | 'android'): Promise<{
		valid: boolean
		transactionId: string
		productId: string
		purchaseDate: string
		expirationDate?: string
	}> {
		try {
			const options = {
				platform,
				receiptData: receipt,
			}
			const response = await iap.setup()
				.then(() => iap.validate(receipt, options))

			if (response.valid) {
				const purchaseData = iap.getPurchaseData(response)[0]
				return {
					valid: true,
					transactionId: purchaseData.transactionId,
					productId: purchaseData.productId,
					purchaseDate: purchaseData.purchaseDate,
					expirationDate: purchaseData.expirationDate,
				}
			}
			return { valid: false, transactionId: '', productId: '', purchaseDate: '' }
		} catch (error) {
			console.error('IAP verification error', error)
			return { valid: false, transactionId: '', productId: '', purchaseDate: '' }
		}
	}
}