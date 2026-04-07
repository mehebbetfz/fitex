import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './modules/auth/auth.module'
import { GymPassModule } from './modules/gym-pass/gym-pass.module'
import { IapModule } from './modules/iap/iap.module'
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module'
import { MarketplaceModule } from './modules/marketplace/marketplace.module'
import { SubscriptionModule } from './modules/subscription/subscription.module'
import { SyncModule } from './modules/sync/sync.module'
import { UserModule } from './modules/user/user.module'
import { WorkoutModule } from './modules/workout/workout.module'
import configuration from './strategies/configuration'


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get('MONGODB_URI'),
      }),
    }),
    AuthModule,
    UserModule,
    SubscriptionModule,
    WorkoutModule,
    SyncModule,
    IapModule,
    MarketplaceModule,
    GymPassModule,
    LeaderboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }