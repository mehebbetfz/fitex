import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { premiumGrantFields } from 'src/common/premium-grant'
import { User, UserDocument } from 'src/models/user.schema'

@Injectable()
export class UserService {
	constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

	async findByProvider(provider: string, providerId: string): Promise<UserDocument | null> {
		return this.userModel.findOne({ provider, providerId })
	}

	async createUser(data: Partial<User>): Promise<UserDocument> {
		const user = new this.userModel(data)
		return user.save()
	}

	async findById(id: string): Promise<UserDocument | null> {
		return this.userModel.findById(id)
	}

	async updateUser(id: string, updates: Partial<User>): Promise<UserDocument | null> {
		return this.userModel.findByIdAndUpdate(id, updates, { new: true })
	}

	async setPremiumStatus(userId: string, isPremium: boolean, expiresAt?: Date): Promise<void> {
		if (isPremium) {
			await this.userModel.findByIdAndUpdate(userId, {
				$set: premiumGrantFields(expiresAt ?? null),
			})
			return
		}
		await this.userModel.findByIdAndUpdate(userId, {
			isPremium: false,
			premiumExpiresAt: expiresAt,
		})
	}
}