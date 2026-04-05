import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Subscription, SubscriptionDocument } from 'src/models/subscription.schema'
import { User, UserDocument } from 'src/models/user.schema'
import { IapService } from '../iap/iap.service'

@Injectable()
export class SubscriptionService {
	constructor(
		@InjectModel(Subscription.name) private subModel: Model<SubscriptionDocument>,
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		private iapService: IapService,
	) { }

	async verifyAndActivate(userId: string, receipt: string, platform: 'ios' | 'android') {
		const verification = await this.iapService.verifyReceipt(receipt, platform)
		if (!verification.valid) {
			throw new BadRequestException('Invalid receipt')
		}

		const transactionId = verification.transactionId
		const productId = verification.productId
		const purchaseDate = new Date(verification.purchaseDate)
		const expirationDate = verification.expirationDate ? new Date(verification.expirationDate) : null

		// Проверяем, не активирована ли уже эта транзакция
		const existing = await this.subModel.findOne({ transactionId })
		if (existing) {
			throw new BadRequestException('Receipt already used')
		}

		const subscription = new this.subModel({
			userId,
			productId,
			transactionId,
			purchaseDate,
			expirationDate,
			platform,
			status: 'active',
		})
		await subscription.save()

		await this.userModel.findByIdAndUpdate(userId, {
			isPremium: true,
			premiumExpiresAt: expirationDate,
		})

		return { success: true }
	}

	async getUserSubscriptions(userId: string) {
		return this.subModel.find({ userId }).sort({ createdAt: -1 })
	}
}