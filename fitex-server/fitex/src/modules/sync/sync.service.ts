// src/sync/sync.service.ts
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AnyBulkWriteOperation, Model, Types } from 'mongoose'
import { SyncUploadDto } from 'src/dtos/sync-upload.dto'
import { BodyMeasurement, BodyMeasurementDocument } from 'src/models/body-measurement.schema'
import { PersonalRecord, PersonalRecordDocument } from 'src/models/personal-record.schema'
import { User, UserDocument } from 'src/models/user.schema'
import { Workout, WorkoutDocument } from 'src/models/workout.schema'

@Injectable()
export class SyncService {
	constructor(
		@InjectModel(Workout.name) private workoutModel: Model<WorkoutDocument>,
		@InjectModel(BodyMeasurement.name) private measurementModel: Model<BodyMeasurementDocument>,
		@InjectModel(PersonalRecord.name) private recordModel: Model<PersonalRecordDocument>,
		@InjectModel(User.name) private userModel: Model<UserDocument>,
	) { }

	private computeStreak(dates: string[]): number {
		if (!dates.length) return 0
		const sorted = [...new Set(dates.map(d => d.split('T')[0]))].sort().reverse()
		let streak = 0
		let prev = new Date()
		prev.setHours(0, 0, 0, 0)
		for (const ds of sorted) {
			const d = new Date(ds)
			d.setHours(0, 0, 0, 0)
			const diff = Math.round((prev.getTime() - d.getTime()) / 86400000)
			if (diff <= 1) { streak++; prev = d } else break
		}
		return streak
	}

	private async recalcUserStats(userId: string) {
		const uid = new Types.ObjectId(userId)
		const [workouts, records] = await Promise.all([
			this.workoutModel.find({ userId: uid, isDeleted: { $ne: true } }).lean(),
			this.recordModel.find({ userId: uid, isDeleted: { $ne: true } }).lean(),
		])

		const totalWorkouts  = workouts.length
		const totalVolume    = workouts.reduce((s, w) => s + (w.volume ?? 0), 0)
		const totalSets      = workouts.reduce((s, w) => s + (w.sets_count ?? 0), 0)
		const avgDuration    = totalWorkouts > 0 ? workouts.reduce((s, w) => s + (w.duration ?? 0), 0) / totalWorkouts : 0
		const streakDays     = this.computeStreak(workouts.map(w => w.date))
		const prCount        = records.length

		const workoutPts    = totalWorkouts * 10
		const setPts        = totalSets
		const volumePts     = Math.floor(totalVolume / 200)
		const streakPts     = streakDays * 15
		const prPts         = prCount * 50
		const durationBonus = avgDuration > 60 ? 200 : avgDuration > 45 ? 100 : avgDuration > 30 ? 50 : 0
		const totalScore    = workoutPts + setPts + volumePts + streakPts + prPts + durationBonus

		await this.userModel.findByIdAndUpdate(uid, {
			totalScore, totalWorkouts, totalVolume, totalSets, streakDays, prCount,
		})
	}

	private buildOps<T>(items: any[], userId: string): AnyBulkWriteOperation<T>[] {
		const userObjectId = new Types.ObjectId(userId)

		return items.map(item => {
			const isDeleted = !!item.deleted_at

			return {
				updateOne: {
					filter: { userId: userObjectId, localId: item.id } as any,
					update: {
						$set: {
							...item,
							userId: userObjectId,
							localId: item.id,
							isDeleted,
						},
					},
					upsert: true,
				},
			}
		})
	}

	async upload(userId: string, dto: SyncUploadDto) {
		console.log('=== SYNC UPLOAD ===')
		console.log('userId:', userId)
		console.log('workouts:', dto.workouts?.length ?? 0)
		console.log('bodyMeasurements:', dto.bodyMeasurements?.length ?? 0)
		console.log('personalRecords:', dto.personalRecords?.length ?? 0)

		const tasks: Promise<any>[] = []

		if (dto.workouts?.length) {
			tasks.push(
				this.workoutModel.bulkWrite(
					this.buildOps<WorkoutDocument>(dto.workouts, userId)
				)
			)
		}

		if (dto.bodyMeasurements?.length) {
			tasks.push(
				this.measurementModel.bulkWrite(
					this.buildOps<BodyMeasurementDocument>(dto.bodyMeasurements, userId)
				)
			)
		}

		if (dto.personalRecords?.length) {
			tasks.push(
				this.recordModel.bulkWrite(
					this.buildOps<PersonalRecordDocument>(dto.personalRecords, userId)
				)
			)
		}

		await Promise.all(tasks)

		// Recalculate leaderboard stats in background (non-blocking)
		this.recalcUserStats(userId).catch(() => {})

		return {
			success: true,
			synced: {
				workouts: dto.workouts?.length ?? 0,
				bodyMeasurements: dto.bodyMeasurements?.length ?? 0,
				personalRecords: dto.personalRecords?.length ?? 0,
			},
		}
	}

	async download(userId: string) {
		const userObjectId = new Types.ObjectId(userId)

		const [workouts, bodyMeasurements, personalRecords] = await Promise.all([
			this.workoutModel.find({ userId: userObjectId }).lean(),
			this.measurementModel.find({ userId: userObjectId }).lean(),
			this.recordModel.find({ userId: userObjectId }).lean(),
		])

		// Возвращаем в snake_case — клиент получит то что ожидает
		return { workouts, bodyMeasurements, personalRecords }
	}
}