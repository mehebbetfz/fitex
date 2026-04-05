import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Workout, WorkoutDocument } from 'src/models/workout.schema'

@Injectable()
export class WorkoutService {
	constructor(@InjectModel(Workout.name) private workoutModel: Model<WorkoutDocument>) { }

	async findByUser(userId: string): Promise<WorkoutDocument[]> {
		return this.workoutModel.find({ userId }).sort({ date: -1 }).lean()
	}

	async create(workoutData: Partial<Workout>): Promise<WorkoutDocument> {
		const workout = new this.workoutModel(workoutData)
		return workout.save()
	}

	async updateMany(userId: string, workouts: Partial<Workout>[]): Promise<void> {
		// Удаляем все старые и вставляем новые (для простоты синхронизации)
		await this.workoutModel.deleteMany({ userId })
		await this.workoutModel.insertMany(workouts.map(w => ({ ...w, userId })))
	}

	async deleteAll(userId: string): Promise<void> {
		await this.workoutModel.deleteMany({ userId })
	}
}