import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
	OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { User, UserDocument } from 'src/models/user.schema'
import type { GrantPremiumDto } from 'src/dtos/admin.dto'

function addDays(from: Date, days: number): Date {
	return new Date(from.getTime() + days * 24 * 60 * 60 * 1000)
}

@Injectable()
export class AdminService implements OnModuleInit {
	private readonly log = new Logger(AdminService.name)

	constructor(
		@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
		private readonly config: ConfigService,
	) {}

	async onModuleInit() {
		const raw = this.config.get<string>('ADMIN_EMAILS') || ''
		const emails = raw
			.split(',')
			.map(e => e.trim().toLowerCase())
			.filter(Boolean)
		if (!emails.length) return
		const res = await this.userModel.updateMany(
			{ email: { $in: emails } },
			{ $set: { role: 'admin' } },
		)
		if (res.modifiedCount > 0) {
			this.log.log(
				`Promoted ${res.modifiedCount} user(s) to admin via ADMIN_EMAILS`,
			)
		}
	}

	async searchUsers(q: string, limit = 30) {
		const query = (q || '').trim()
		const lim = Math.min(100, Math.max(1, limit))
		const filter: Record<string, unknown> = {}
		if (query) {
			const rx = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
			filter.$or = [
				{ email: rx },
				{ firstName: rx },
				{ lastName: rx },
			]
		}
		const users = await this.userModel
			.find(filter)
			.sort({ updatedAt: -1 })
			.limit(lim)
			.select(
				'email firstName lastName isPremium premiumExpiresAt role provider createdAt',
			)
			.lean()

		return users.map(u => this.toAdminUser(u))
	}

	async getUser(id: string) {
		if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid id')
		const u = await this.userModel.findById(id).lean()
		if (!u) throw new NotFoundException('User not found')
		return this.toAdminUser(u)
	}

	async grantPremium(targetUserId: string, dto: GrantPremiumDto) {
		if (!Types.ObjectId.isValid(targetUserId)) {
			throw new BadRequestException('Invalid id')
		}
		const user = await this.userModel.findById(targetUserId)
		if (!user) throw new NotFoundException('User not found')

		const duration = dto.duration
		const customDays = dto.customDays

		if (duration === 'revoke') {
			await this.userModel.updateOne(
				{ _id: user._id },
				{ $set: { isPremium: false }, $unset: { premiumExpiresAt: 1 } },
			)
			const fresh = await this.userModel.findById(user._id).lean()
			return this.toAdminUser(fresh!)
		}

		if (duration === 'lifetime') {
			user.isPremium = true
			user.premiumExpiresAt = undefined
			await this.userModel.updateOne(
				{ _id: user._id },
				{ $set: { isPremium: true }, $unset: { premiumExpiresAt: 1 } },
			)
			const fresh = await this.userModel.findById(user._id).lean()
			return this.toAdminUser(fresh!)
		}

		let days: number | null = null
		if (typeof customDays === 'number' && customDays > 0) {
			days = customDays
		} else if (duration) {
			const map: Record<string, number> = {
				'7d': 7,
				'30d': 30,
				'90d': 90,
				'180d': 180,
				'365d': 365,
			}
			days = map[duration] ?? null
		}

		if (days == null) {
			throw new BadRequestException(
				'Provide duration (7d|30d|90d|180d|365d|lifetime|revoke) or customDays',
			)
		}

		const base =
			user.premiumExpiresAt && user.premiumExpiresAt > new Date()
				? user.premiumExpiresAt
				: new Date()
		const expires = addDays(base, days)
		user.isPremium = true
		user.premiumExpiresAt = expires
		await user.save()
		return this.toAdminUser(user.toObject())
	}

	async setRole(targetUserId: string, role: 'user' | 'admin', actorId: string) {
		if (!Types.ObjectId.isValid(targetUserId)) {
			throw new BadRequestException('Invalid id')
		}
		if (targetUserId === actorId && role !== 'admin') {
			throw new BadRequestException('Cannot demote yourself')
		}
		const user = await this.userModel.findByIdAndUpdate(
			targetUserId,
			{ $set: { role } },
			{ new: true },
		)
		if (!user) throw new NotFoundException('User not found')
		return this.toAdminUser(user.toObject())
	}

	private toAdminUser(u: any) {
		const expires = u.premiumExpiresAt ? new Date(u.premiumExpiresAt) : null
		const active =
			!!u.isPremium && (!expires || expires.getTime() > Date.now())
		return {
			id: String(u._id),
			email: u.email,
			firstName: u.firstName ?? null,
			lastName: u.lastName ?? null,
			role: u.role || 'user',
			provider: u.provider,
			isPremium: !!u.isPremium,
			premiumActive: active,
			premiumExpiresAt: expires ? expires.toISOString() : null,
			premiumLifetime: !!u.isPremium && !expires,
			createdAt: u.createdAt ?? null,
		}
	}
}
