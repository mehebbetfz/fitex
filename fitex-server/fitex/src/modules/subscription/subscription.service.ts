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
}
