import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Workout, WorkoutSchema } from 'src/models/workout.schema'
import { WorkoutService } from './workout.service'

@Module({
	imports: [MongooseModule.forFeature([{ name: Workout.name, schema: WorkoutSchema }])],
	providers: [WorkoutService],
	exports: [WorkoutService, MongooseModule],
})
export class WorkoutModule { }