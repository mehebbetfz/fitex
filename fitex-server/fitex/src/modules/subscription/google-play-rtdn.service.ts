import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { google } from 'googleapis'
import { SubscriptionService } from './subscription.service'

export interface PubSubPushBody {
	message?: {
		data?: string
		messageId?: string
	}
	subscription?: string
}

@Injectable()
export class GooglePlayRtdnService {
	private readonly log = new Logger(GooglePlayRtdnService.name)

	constructor(
		private readonly config: ConfigService,
		private readonly subscriptionService: SubscriptionService,
	) {}

	async handlePubSubPush(body: PubSubPushBody): Promise<void> {
		const b64 = body.message?.data
		if (!b64) {
			this.log.warn('RTDN: empty Pub/Sub message.data')
			return
		}

		let inner: {
			version?: string
			packageName?: string
			eventTimeMillis?: string
			subscriptionNotification?: {
				version?: string
				notificationType?: number
				purchaseToken?: string
				subscriptionId?: string
			}
		}

		try {
			const json = Buffer.from(b64, 'base64').toString('utf8')
			inner = JSON.parse(json)
		} catch (e) {
			this.log.warn('RTDN: invalid base64 JSON', e)
			return
		}

		const sub = inner.subscriptionNotification
		const packageName = inner.packageName
		if (!sub?.purchaseToken || !packageName) {
			this.log.debug('RTDN: not a subscription notification, skipping')
			return
		}

		const notificationType = sub.notificationType ?? -1
		let expiryIso: string | null | undefined

		const saJson = this.config.get<string>('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON')
		if (saJson) {
			try {
				expiryIso = await this.fetchSubscriptionExpiryIso(packageName, sub.purchaseToken, saJson)
			} catch (e) {
				this.log.warn('RTDN: Play API get subscription failed, using notification type only', e)
			}
		}

		await this.subscriptionService.applyAndroidSubscriptionFromPlay(
			sub.purchaseToken,
			packageName,
			notificationType,
			sub.subscriptionId,
			expiryIso,
		)
	}

	private async fetchSubscriptionExpiryIso(
		packageName: string,
		token: string,
		serviceAccountJson: string,
	): Promise<string | null | undefined> {
		const credentials = JSON.parse(serviceAccountJson) as Record<string, unknown>
		const auth = new google.auth.GoogleAuth({
			credentials,
			scopes: ['https://www.googleapis.com/auth/androidpublisher'],
		})
		const androidpublisher = google.androidpublisher({ version: 'v3', auth })
		const res = await androidpublisher.purchases.subscriptionsv2.get({
			packageName,
			token,
		})
		const lineItems = res.data.lineItems || []
		let latest = 0
		let latestIso: string | undefined
		for (const li of lineItems) {
			if (li.expiryTime) {
				const t = new Date(li.expiryTime).getTime()
				if (t > latest) {
					latest = t
					latestIso = li.expiryTime
				}
			}
		}
		return latestIso
	}
}
