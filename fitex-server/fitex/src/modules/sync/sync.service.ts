// src/sync/sync.service.ts
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AnyBulkWriteOperation, Model, Types } from 'mongoose'
import { SyncUploadDto } from 'src/dtos/sync-upload.dto'
import { BodyMeasurement, BodyMeasurementDocument } from 'src/models/body-measurement.schema'
import { PersonalRecord, PersonalRecordDocument } from 'src/models/personal-record.schema'
import { User, UserDocument } from 'src/models/user.schema'
import { Workout, WorkoutDocument } from 'src/models/workout.schema'
import {
	computeStatsFromWorkoutsAndRecords,
	utcYearMonth,
	workoutMonthKey,
} from 'src/modules/leaderboard/leaderboard-scoring'

@Injectable()
export class SyncService {
	constructor(
		@InjectModel(Workout.name) private workoutModel: Model<WorkoutDocument>,
		@InjectModel(BodyMeasurement.name) private measurementModel: Model<BodyMeasurementDocument>,
		@InjectModel(PersonalRecord.name) private recordModel: Model<PersonalRecordDocument>,
		@InjectModel(User.name) private userModel: Model<UserDocument>,
	) { }

	private async recalcUserStats(userId: string) {
		const uid = new Types.ObjectId(userId)
		const [workouts, records] = await Promise.all([
			this.workoutModel.find({ userId: uid, isDeleted: { $ne: true } }).lean(),
			this.recordModel.find({ userId: uid, isDeleted: { $ne: true } }).lean(),
		])

		const ym = utcYearMonth()
		const monthWorkouts = workouts.filter(w => workoutMonthKey(w.date) === ym)
		const monthRecords = records.filter(r => workoutMonthKey(r.date) === ym)

		const life = computeStatsFromWorkoutsAndRecords(workouts, records)
		const month = computeStatsFromWorkoutsAndRecords(monthWorkouts, monthRecords)

		await this.userModel.findByIdAndUpdate(uid, {
			totalScore: life.totalScore,
			totalWorkouts: life.totalWorkouts,
			totalVolume: life.totalVolume,
			totalSets: life.totalSets,
			streakDays: life.streakDays,
			prCount: life.prCount,
			monthlyScore: month.totalScore,
			monthlyWorkouts: month.totalWorkouts,
			monthlyVolume: month.totalVolume,
			monthlySets: month.totalSets,
			monthlyStreakDays: month.streakDays,
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