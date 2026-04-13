import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { PersonalRecord, PersonalRecordDocument } from 'src/models/personal-record.schema'
import { PodiumMonthAward, PodiumMonthAwardDocument } from 'src/models/podium-month-award.schema'
import { User, UserDocument } from 'src/models/user.schema'
import { Workout, WorkoutDocument } from 'src/models/workout.schema'
import { utcYearMonth } from 'src/modules/leaderboard/leaderboard-scoring'

const TIER_THRESHOLDS = [
	{ name: 'elite', min: 25000 },
	{ name: 'platinum', min: 10000 },
	{ name: 'gold', min: 4000 },
	{ name: 'silver', min: 1500 },
	{ name: 'bronze', min: 500 },
	{ name: 'beginner', min: 0 },
]

export function getTierName(score: number): string {
	for (const t of TIER_THRESHOLDS) {
		if (score >= t.min) return t.name
	}
	return 'beginner'
}

function parseRecordWeight(weight: string): number {
	const n = parseFloat(String(weight).replace(/[^\d.,-]/g, '').replace(',', '.'))
	return Number.isFinite(n) ? n : 0
}

function rankAboveFilter(monthScore: number, lifeScore: number, myId: Types.ObjectId) {
	return {
		showOnLeaderboard: { $ne: false },
		totalWorkouts: { $gt: 0 },
		$or: [
			{ monthlyScore: { $gt: monthScore } },
			{ monthlyScore: monthScore, totalScore: { $gt: lifeScore } },
			{ monthlyScore: monthScore, totalScore: lifeScore, _id: { $lt: myId } },
		],
	}
}

@Injectable()
export class LeaderboardService implements OnModuleInit {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		@InjectModel(PodiumMonthAward.name) private podiumMonthModel: Model<PodiumMonthAwardDocument>,
		@InjectModel(PersonalRecord.name) private recordModel: Model<PersonalRecordDocument>,
		@InjectModel(Workout.name) private workoutModel: Model<WorkoutDocument>,
	) {}

	async onModuleInit() {
		await this.userModel.collection.updateMany(
			{ monthlyWorkouts: { $exists: false } },
			{
				$set: {
					monthlyScore: 0,
					monthlyWorkouts: 0,
					monthlyVolume: 0,
					monthlySets: 0,
					monthlyStreakDays: 0,
					podiumFirst: 0,
					podiumSecond: 0,
					podiumThird: 0,
				},
			},
		).catch(() => undefined)
	}

	async getLeaderboard(currentUserId: string, limit = 100) {
		const users = await this.userModel
			.find({ showOnLeaderboard: { $ne: false }, totalWorkouts: { $gt: 0 } })
			.select(
				'firstName lastName avatarUrl totalScore totalWorkouts totalVolume totalSets streakDays prCount isPremium monthlyScore monthlyWorkouts monthlyVolume monthlySets monthlyStreakDays',
			)
			.sort({ monthlyScore: -1, totalScore: -1, _id: 1 })
			.limit(limit)
			.lean()

		const currentUid = currentUserId

		const entries = users.map((u, idx) => {
			const ms = u.monthlyScore ?? 0
			const mw = u.monthlyWorkouts ?? 0
			const mv = u.monthlyVolume ?? 0
			const mst = u.monthlyStreakDays ?? 0
			return {
				rank: idx + 1,
				userId: (u._id as Types.ObjectId).toString(),
				firstName: u.firstName ?? '',
				lastName: u.lastName ?? '',
				avatarUrl: u.avatarUrl ?? null,
				totalScore: ms,
				totalWorkouts: mw,
				totalVolume: mv,
				streakDays: mst,
				tierName: getTierName(ms),
				isPremium: u.isPremium ?? false,
				isCurrentUser: (u._id as Types.ObjectId).toString() === currentUid,
			}
		})

		const currentEntry = entries.find(e => e.isCurrentUser)
		let myRank: (typeof entries)[0] | null = null
		if (!currentEntry) {
			const me = await this.userModel
				.findById(currentUserId)
				.select(
					'firstName lastName avatarUrl totalScore totalWorkouts totalVolume totalSets streakDays prCount isPremium monthlyScore monthlyWorkouts monthlyVolume monthlyStreakDays',
				)
				.lean()
			if (me && (me.totalWorkouts ?? 0) > 0) {
				const ms = me.monthlyScore ?? 0
				const life = me.totalScore ?? 0
				const aboveCount = await this.userModel.countDocuments(
					rankAboveFilter(ms, life, me._id as Types.ObjectId),
				)
				myRank = {
					rank: aboveCount + 1,
					userId: (me._id as Types.ObjectId).toString(),
					firstName: me.firstName ?? '',
					lastName: me.lastName ?? '',
					avatarUrl: me.avatarUrl ?? null,
					totalScore: ms,
					totalWorkouts: me.monthlyWorkouts ?? 0,
					totalVolume: me.monthlyVolume ?? 0,
					streakDays: me.monthlyStreakDays ?? 0,
					tierName: getTierName(ms),
					isPremium: me.isPremium ?? false,
					isCurrentUser: true,
				}
			}
		}

		return { entries, myRank: currentEntry ?? myRank }
	}

	async awardMonthlyPodiumIfNeeded(): Promise<void> {
		const closingMonth = utcYearMonth()
		let slot = await this.podiumMonthModel.findOne({ monthKey: closingMonth }).lean()
		if (slot?.podiumApplied) return

		const top = await this.userModel
			.find({ showOnLeaderboard: { $ne: false }, monthlyWorkouts: { $gt: 0 } })
			.sort({ monthlyScore: -1, totalScore: -1, _id: 1 })
			.limit(3)
			.select('_id')
			.lean()

		const first = top[0]?._id ? String(top[0]._id) : undefined
		const second = top[1]?._id ? String(top[1]._id) : undefined
		const third = top[2]?._id ? String(top[2]._id) : undefined

		if (!slot) {
			try {
				await this.podiumMonthModel.create({
					monthKey: closingMonth,
					podiumApplied: false,
				})
			} catch (e: any) {
				if (e?.code !== 11000) throw e
			}
			slot = await this.podiumMonthModel.findOne({ monthKey: closingMonth }).lean()
		}

		const claim = await this.podiumMonthModel.updateOne(
			{ monthKey: closingMonth, podiumApplied: false },
			{
				$set: {
					podiumApplied: true,
					firstUserId: first,
					secondUserId: second,
					thirdUserId: third,
				},
			},
		)
		if (claim.modifiedCount === 0) return

		if (first) await this.userModel.findByIdAndUpdate(first, { $inc: { podiumFirst: 1 } })
		if (second) await this.userModel.findByIdAndUpdate(second, { $inc: { podiumSecond: 1 } })
		if (third) await this.userModel.findByIdAndUpdate(third, { $inc: { podiumThird: 1 } })
	}

	async getAthleteProfile(viewerId: string, athleteUserId: string) {
		if (!Types.ObjectId.isValid(athleteUserId)) {
			throw new NotFoundException('User not found')
		}
		const oid = new Types.ObjectId(athleteUserId)
		const u = await this.userModel
			.findById(oid)
			.select(
				'firstName lastName avatarUrl isPremium showOnLeaderboard totalScore totalWorkouts totalVolume totalSets streakDays prCount monthlyScore monthlyWorkouts monthlyVolume monthlySets monthlyStreakDays podiumFirst podiumSecond podiumThird socialInstagram socialTelegram socialYoutube socialTiktok socialStrava socialWebsite',
			)
			.lean()

		if (!u || u.showOnLeaderboard === false) {
			throw new NotFoundException('User not found')
		}

		const durAgg = await this.workoutModel.aggregate<{ avg: number }>([
			{
				$match: {
					userId: oid,
					isDeleted: { $ne: true },
					duration: { $exists: true, $gt: 0 },
				},
			},
			{ $group: { _id: null, avg: { $avg: '$duration' } } },
		])
		const avgDuration = durAgg[0]?.avg != null ? Math.round(durAgg[0].avg * 10) / 10 : 0

		const ms = u.monthlyScore ?? 0
		const life = u.totalScore ?? 0
		const aboveCount = await this.userModel.countDocuments(rankAboveFilter(ms, life, oid))
		const monthlyRank = aboveCount + 1

		const rawRecords = await this.recordModel
			.find({ userId: oid, isDeleted: { $ne: true } })
			.sort({ date: -1 })
			.limit(200)
			.select('exercise weight date')
			.lean()

		const bestByExercise = new Map<string, { exercise: string; weight: string; date: string }>()
		for (const r of rawRecords) {
			const ex = r.exercise ?? ''
			if (!ex) continue
			const w = parseRecordWeight(r.weight ?? '0')
			const prev = bestByExercise.get(ex)
			const prevW = prev ? parseRecordWeight(prev.weight) : -1
			if (!prev || w > prevW) {
				bestByExercise.set(ex, {
					exercise: ex,
					weight: r.weight ?? '',
					date: r.date ?? '',
				})
			}
		}
		const topRecords = [...bestByExercise.values()]
			.sort((a, b) => parseRecordWeight(b.weight) - parseRecordWeight(a.weight))
			.slice(0, 8)

		return {
			userId: athleteUserId,
			firstName: u.firstName ?? '',
			lastName: u.lastName ?? '',
			avatarUrl: u.avatarUrl ?? null,
			isPremium: u.isPremium ?? false,
			isViewer: viewerId === athleteUserId,
			monthly: {
				score: ms,
				workouts: u.monthlyWorkouts ?? 0,
				volume: u.monthlyVolume ?? 0,
				streakDays: u.monthlyStreakDays ?? 0,
				tierName: getTierName(ms),
				rank: monthlyRank,
			},
			lifetime: {
				score: u.totalScore ?? 0,
				workouts: u.totalWorkouts ?? 0,
				volume: u.totalVolume ?? 0,
				sets: u.totalSets ?? 0,
				streakDays: u.streakDays ?? 0,
				prCount: u.prCount ?? 0,
				avgDuration,
				tierName: getTierName(u.totalScore ?? 0),
			},
			social: {
				instagram: u.socialInstagram?.trim() || null,
				telegram: u.socialTelegram?.trim() || null,
				youtube: u.socialYoutube?.trim() || null,
				tiktok: u.socialTiktok?.trim() || null,
				strava: u.socialStrava?.trim() || null,
				website: u.socialWebsite?.trim() || null,
			},
			podium: {
				first: u.podiumFirst ?? 0,
				second: u.podiumSecond ?? 0,
				third: u.podiumThird ?? 0,
			},
			topRecords,
		}
	}
}
