import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Subscription, SubscriptionSchema } from 'src/models/subscription.schema'
import { User, UserSchema } from 'src/models/user.schema'
import { IapModule } from '../iap/iap.module'
import { UserModule } from '../user/user.module'
import { AppleStoreWebhookService } from './apple-store-webhook.service'
import { GooglePlayRtdnService } from './google-play-rtdn.service'
import { SubscriptionController } from './subscription.controller'
import { SubscriptionService } from './subscription.service'
import { SubscriptionWebhookController } from './subscription-webhook.controller'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Subscription.name, schema: SubscriptionSchema },
			{ name: User.name, schema: UserSchema },
		]),
		UserModule,
		IapModule,
	],
	controllers: [SubscriptionController, SubscriptionWebhookController],
	providers: [SubscriptionService, AppleStoreWebhookService, GooglePlayRtdnService],
})
export class SubscriptionModule { }