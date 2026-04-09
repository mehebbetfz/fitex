import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
	Environment,
	NotificationTypeV2,
	SignedDataVerifier,
} from '@apple/app-store-server-library'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { SubscriptionService } from './subscription.service'

function loadAppleRootCertificates(certsDir: string): Buffer[] {
	const names = ['AppleRootCA-G3.cer', 'AppleIncRootCertificate.cer']
	const buffers: Buffer[] = []
	for (const name of names) {
		const p = join(certsDir, name)
		if (existsSync(p)) {
			buffers.push(readFileSync(p))
		}
	}
	return buffers
}

@Injectable()
export class AppleStoreWebhookService {
	private readonly log = new Logger(AppleStoreWebhookService.name)

	constructor(
		private readonly config: ConfigService,
		private readonly subscriptionService: SubscriptionService,
	) {}

	async handleSignedPayload(signedPayload: string): Promise<void> {
		const bundleId =
			this.config.get<string>('APPLE_BUNDLE_ID') || 'com.farzaliyev.fitex'
		const ascAppIdRaw = this.config.get<string>('APPLE_ASC_APP_ID') || '6759683173'
		const ascAppId = parseInt(ascAppIdRaw, 10)
		const certsDir =
			this.config.get<string>('APPLE_ROOT_CA_DIR') ||
			join(process.cwd(), 'certs')
		const roots = loadAppleRootCertificates(certsDir)
		if (!roots.length) {
			this.log.error(
				`No Apple root certificates in ${certsDir}. Add AppleRootCA-G3.cer and AppleIncRootCertificate.cer`,
			)
			throw new Error('Apple root CA certificates not configured')
		}

		const enableOnlineChecks =
			this.config.get<string>('APPLE_JWS_ONLINE_CHECKS') !== 'false'

		let verifier: SignedDataVerifier
		let decoded: Awaited<ReturnType<SignedDataVerifier['verifyAndDecodeNotification']>>

		try {
			verifier = new SignedDataVerifier(
				roots,
				enableOnlineChecks,
				Environment.PRODUCTION,
				bundleId,
				ascAppId,
			)
			decoded = await verifier.verifyAndDecodeNotification(signedPayload)
		} catch {
			try {
				verifier = new SignedDataVerifier(
					roots,
					enableOnlineChecks,
					Environment.SANDBOX,
					bundleId,
					undefined,
				)
				decoded = await verifier.verifyAndDecodeNotification(signedPayload)
			} catch (second) {
				this.log.warn('Apple notification verify failed (production + sandbox)', second)
				throw second
			}
		}

		const notificationType = String(decoded.notificationType || '')
		if (notificationType === NotificationTypeV2.TEST) {
			this.log.log('App Store test notification OK')
			return
		}

		const data = decoded.data
		if (!data?.signedTransactionInfo) {
			this.log.debug(`Apple notification without signedTransactionInfo: ${notificationType}`)
			return
		}

		const tx = await verifier.verifyAndDecodeTransaction(data.signedTransactionInfo)
		const originalTransactionId = tx.originalTransactionId
		if (!originalTransactionId) {
			this.log.warn('Apple transaction without originalTransactionId')
			return
		}

		await this.subscriptionService.applyIosSubscriptionFromStoreServer(
			originalTransactionId,
			{
				transactionId: tx.transactionId,
				productId: tx.productId,
				expiresMs: tx.expiresDate,
				notificationType,
			},
		)
	}
}
