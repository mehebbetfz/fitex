import { BadRequestException, ConflictException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Subscription, SubscriptionDocument } from 'src/models/subscription.schema'
import { User, UserDocument } from 'src/models/user.schema'
import { IapService } from '../iap/iap.service'

@Injectable()
export class SubscriptionService {
	constructor(
		@InjectModel(Subscription.name) private subModel: Model<SubscriptionDocument>,
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		private iapService: IapService,
	) {}

	async verifyAndActivate(userId: string, receipt: string, platform: 'ios' | 'android') {
		const verification = await this.iapService.verifyReceipt(receipt, platform)
		if (!verification.valid) {
			throw new BadRequestException(
				'errorMessage' in verification ? verification.errorMessage : 'Invalid receipt',
			)
		}

		const expirationDate = verification.expirationDate
		if (!expirationDate || expirationDate.getTime() <= Date.now()) {
			throw new BadRequestException('Subscription has expired')
		}

		const stableId =
			platform === 'ios'
				? verification.originalTransactionId || verification.transactionId
				: verification.transactionId

		const other = await this.subModel.findOne({
			platform,
			subscriptionGroupId: stableId,
			userId: { $ne: new Types.ObjectId(userId) },
		})
		if (other) {
			throw new ConflictException(
				'This subscription is already linked to another Fitex account. Sign in with that account or use Restore on the account that purchased it.',
			)
		}

		let doc = await this.subModel.findOne({
			userId: new Types.ObjectId(userId),
			platform,
			subscriptionGroupId: stableId,
		})

		if (!doc) {
			doc = await this.subModel.findOne({
				userId: new Types.ObjectId(userId),
				platform,
				transactionId: verification.transactionId,
			})
		}

		if (!doc && platform === 'ios' && verification.originalTransactionId) {
			doc = await this.subModel.findOne({
				userId: new Types.ObjectId(userId),
				platform,
				transactionId: verification.originalTransactionId,
			})
		}

		if (doc) {
			doc.productId = verification.productId
			doc.transactionId = verification.transactionId
			doc.subscriptionGroupId = stableId
			doc.purchaseDate = verification.purchaseDate
			doc.expirationDate = expirationDate
			doc.status = 'active'
			await doc.save()
		} else {
			await new this.subModel({
				userId: new Types.ObjectId(userId),
				productId: verification.productId,
				transactionId: verification.transactionId,
				subscriptionGroupId: stableId,
				purchaseDate: verification.purchaseDate,
				expirationDate,
				platform,
				status: 'active',
			}).save()
		}

		await this.userModel.findByIdAndUpdate(userId, {
			isPremium: true,
			premiumExpiresAt: expirationDate,
		})

		return {
			success: true,
			isPremium: true,
			premiumExpiresAt: expirationDate.toISOString(),
			productId: verification.productId,
		}
	}

	async getUserSubscriptions(userId: string) {
		return this.subModel.find({ userId }).sort({ createdAt: -1 })
	}

	async startTrial(userId: string, trialStartedAt: string, trialEndsAt: string) {
		const user = await this.userModel.findById(userId)
		if (!user) throw new BadRequestException('User not found')

		if (user.trialStartedAt) {
			return {
				success: true,
				trialStartedAt: user.trialStartedAt,
				trialEndsAt: user.trialEndsAt,
				alreadyStarted: true,
			}
		}

		const started = new Date(trialStartedAt)
		const ends = new Date(trialEndsAt)

		await this.userModel.findByIdAndUpdate(userId, {
			trialStartedAt: started,
			trialEndsAt: ends,
			isNewUser: false,
		})

		return { success: true, trialStartedAt: started, trialEndsAt: ends }
	}

	async dismissTrialPaywall(userId: string) {
		const user = await this.userModel.findById(userId)
		if (!user) throw new BadRequestException('User not found')

		await this.userModel.findByIdAndUpdate(userId, {
			isNewUser: false,
		})

		return { success: true }
	}

	/**
	 * App Store Server Notifications v2 — after JWS verification.
	 * Only updates users who already have a Subscription row from /subscription/verify.
	 */
	async applyIosSubscriptionFromStoreServer(
		originalTransactionId: string,
		payload: {
			transactionId?: string
			productId?: string
			expiresMs?: number
			notificationType: string
		},
	): Promise<void> {
		const sub = await this.subModel.findOne({
			platform: 'ios',
			subscriptionGroupId: originalTransactionId,
		})
		if (!sub) {
			return
		}

		const now = Date.now()
		const expiresMs = payload.expiresMs

		if (payload.transactionId) {
			sub.transactionId = String(payload.transactionId)
		}
		if (payload.productId) {
			sub.productId = payload.productId
		}
		if (expiresMs) {
			sub.expirationDate = new Date(expiresMs)
		}

		const isActive = !!(expiresMs && expiresMs > now)
		sub.status = isActive ? 'active' : 'expired'
		await sub.save()

		const uid = sub.userId.toString()
		if (isActive && expiresMs) {
			await this.userModel.findByIdAndUpdate(uid, {
				isPremium: true,
				premiumExpiresAt: new Date(expiresMs),
			})
		} else {
			await this.userModel.findByIdAndUpdate(uid, {
				isPremium: false,
				premiumExpiresAt: null,
			})
		}
	}

	/**
	 * Google Play Real-time developer notifications (Pub/Sub push).
	 * Prefer expiry from Play Developer API when GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is set.
	 */
	async applyAndroidSubscriptionFromPlay(
		purchaseToken: string,
		_packageName: string,
		notificationType: number,
		subscriptionId: string | undefined,
		expiryTimeIso: string | null | undefined,
	): Promise<void> {
		const sub = await this.subModel.findOne({
			platform: 'android',
			subscriptionGroupId: purchaseToken,
		})
		if (!sub) {
			return
		}

		const now = Date.now()
		let expiresMs: number | undefined
		if (expiryTimeIso) {
			expiresMs = new Date(expiryTimeIso).getTime()
		}

		if (subscriptionId) {
			sub.productId = subscriptionId
		}
		if (expiresMs !== undefined) {
			sub.expirationDate = new Date(expiresMs)
		}

		const hardRevoke = notificationType === 12 || notificationType === 13

		let isActive = false
		if (expiresMs !== undefined) {
			isActive = expiresMs > now
		} else if (hardRevoke) {
			isActive = false
		} else {
			return
		}

		sub.status = isActive ? 'active' : 'expired'
		await sub.save()

		const uid = sub.userId.toString()
		if (isActive && expiresMs !== undefined) {
			await this.userModel.findByIdAndUpdate(uid, {
				isPremium: true,
				premiumExpiresAt: new Date(expiresMs),
			})
		} else {
			await this.userModel.findByIdAndUpdate(uid, {
				isPremium: false,
				premiumExpiresAt: null,
			})
		}
	}
}
