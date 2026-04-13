import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PersonalRecord, PersonalRecordSchema } from 'src/models/personal-record.schema'
import { PodiumMonthAward, PodiumMonthAwardSchema } from 'src/models/podium-month-award.schema'
import { User, UserSchema } from 'src/models/user.schema'
import { Workout, WorkoutSchema } from 'src/models/workout.schema'
import { LeaderboardController } from './leaderboard.controller'
import { LeaderboardMonthlyCron } from './leaderboard-monthly.cron'
import { LeaderboardService } from './leaderboard.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: PodiumMonthAward.name, schema: PodiumMonthAwardSchema },
			{ name: PersonalRecord.name, schema: PersonalRecordSchema },
			{ name: Workout.name, schema: WorkoutSchema },
		]),
	],
	controllers: [LeaderboardController],
	providers: [LeaderboardService, LeaderboardMonthlyCron],
})
export class LeaderboardModule {}
