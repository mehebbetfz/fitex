import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Subscription } from 'rxjs'
import { SubscriptionSchema } from 'src/models/subscription.schema'
import { User, UserSchema } from 'src/models/user.schema'
import { IapModule } from '../iap/iap.module'
import { UserModule } from '../user/user.module'
import { SubscriptionController } from './subscription.controller'
import { SubscriptionService } from './subscription.service'


@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Subscription.name, schema: SubscriptionSchema },
			{ name: User.name, schema: UserSchema },
		]),
		UserModule,
		IapModule,
	],
	controllers: [SubscriptionController],
	providers: [SubscriptionService],
})
export class SubscriptionModule { }