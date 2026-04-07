import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { User, UserDocument } from 'src/models/user.schema'

const TIER_THRESHOLDS = [
	{ name: 'elite',    min: 25000 },
	{ name: 'platinum', min: 10000 },
	{ name: 'gold',     min: 4000  },
	{ name: 'silver',   min: 1500  },
	{ name: 'bronze',   min: 500   },
	{ name: 'beginner', min: 0     },
]

function getTierName(score: number): string {
	for (const t of TIER_THRESHOLDS) {
		if (score >= t.min) return t.name
	}
	return 'beginner'
}

@Injectable()
export class LeaderboardService {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
	) {}

	async getLeaderboard(currentUserId: string, limit = 100) {
		const users = await this.userModel
			.find({ showOnLeaderboard: { $ne: false }, totalWorkouts: { $gt: 0 } })
			.select('firstName lastName avatarUrl totalScore totalWorkouts totalVolume totalSets streakDays prCount isPremium')
			.sort({ totalScore: -1 })
			.limit(limit)
			.lean()

		const currentUid = currentUserId

		const entries = users.map((u, idx) => ({
			rank:           idx + 1,
			userId:         (u._id as Types.ObjectId).toString(),
			firstName:      u.firstName ?? '',
			lastName:       u.lastName ?? '',
			avatarUrl:      u.avatarUrl ?? null,
			totalScore:     u.totalScore ?? 0,
			totalWorkouts:  u.totalWorkouts ?? 0,
			totalVolume:    u.totalVolume ?? 0,
			streakDays:     u.streakDays ?? 0,
			tierName:       getTierName(u.totalScore ?? 0),
			isPremium:      u.isPremium ?? false,
			isCurrentUser:  (u._id as Types.ObjectId).toString() === currentUid,
		}))

		// Find current user's rank even if outside top-N
		const currentEntry = entries.find(e => e.isCurrentUser)
		let myRank: typeof entries[0] | null = null
		if (!currentEntry) {
			const me = await this.userModel
				.findById(currentUserId)
				.select('firstName lastName avatarUrl totalScore totalWorkouts totalVolume totalSets streakDays prCount isPremium')
				.lean()
			if (me) {
				const aboveCount = await this.userModel.countDocuments({
					showOnLeaderboard: { $ne: false },
					totalScore: { $gt: me.totalScore ?? 0 },
				})
				myRank = {
					rank:          aboveCount + 1,
					userId:        (me._id as Types.ObjectId).toString(),
					firstName:     me.firstName ?? '',
					lastName:      me.lastName ?? '',
					avatarUrl:     me.avatarUrl ?? null,
					totalScore:    me.totalScore ?? 0,
					totalWorkouts: me.totalWorkouts ?? 0,
					totalVolume:   me.totalVolume ?? 0,
					streakDays:    me.streakDays ?? 0,
					tierName:      getTierName(me.totalScore ?? 0),
					isPremium:     me.isPremium ?? false,
					isCurrentUser: true,
				}
			}
		}

		return { entries, myRank: currentEntry ?? myRank }
	}
}
