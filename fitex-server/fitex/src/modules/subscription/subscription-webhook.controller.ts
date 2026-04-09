import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { AppleStoreWebhookService } from './apple-store-webhook.service'
import { GooglePlayRtdnService, PubSubPushBody } from './google-play-rtdn.service'

/**
 * Public HTTPS endpoints for store subscription lifecycle (no JWT).
 * Configure in App Store Connect and Google Cloud Pub/Sub push subscription.
 */
@Controller('webhooks')
export class SubscriptionWebhookController {
	constructor(
		private readonly appleStoreWebhook: AppleStoreWebhookService,
		private readonly googlePlayRtdn: GooglePlayRtdnService,
	) {}

	/** App Store Server Notifications v2 — Production & Sandbox URL in App Store Connect */
	@Post('apple')
	@HttpCode(200)
	async appleAppStore(@Body() body: { signedPayload?: string }) {
		if (!body?.signedPayload) {
			return { ok: false, reason: 'missing signedPayload' }
		}
		await this.appleStoreWebhook.handleSignedPayload(body.signedPayload)
		return { received: true }
	}

	/** Google Play RTDN — point Pub/Sub push subscription to this URL */
	@Post('google-rtdn')
	@HttpCode(200)
	async googleRtdn(@Body() body: PubSubPushBody) {
		await this.googlePlayRtdn.handlePubSubPush(body)
		return { received: true }
	}
}
