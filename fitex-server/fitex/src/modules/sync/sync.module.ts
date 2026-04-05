import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'src/models/user.schema'
import { Workout, WorkoutSchema } from 'src/models/workout.schema'
import { UserModule } from '../user/user.module'
import { UserService } from '../user/user.service'
import { WorkoutModule } from '../workout/workout.module'
import { SyncController } from './sync.controller'
import { SyncService } from './sync.service'
import { BodyMeasurement, BodyMeasurementSchema } from 'src/models/body-measurement.schema'
import { PersonalRecord, PersonalRecordSchema } from 'src/models/personal-record.schema'


@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Workout.name, schema: WorkoutSchema },
			{ name: User.name, schema: UserSchema },
			{ name: BodyMeasurement.name, schema: BodyMeasurementSchema },
			{ name: PersonalRecord.name, schema: PersonalRecordSchema },
		]),
		UserModule,
		WorkoutModule,
	],
	controllers: [SyncController],
	providers: [SyncService, UserService],
})
export class SyncModule { }