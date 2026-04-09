import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard'
import { SubscriptionService } from './subscription.service'

@Controller('subscription')
export class SubscriptionController {
	constructor(private subService: SubscriptionService) { }

	@Post('verify')
	@UseGuards(JwtAuthGuard)
	async verify(@Req() req, @Body('receipt') receipt: string, @Body('platform') platform: 'ios' | 'android') {
		const userId = req.user.userId
		return this.subService.verifyAndActivate(userId, receipt, platform)
	}

	@Post('start-trial')
	@UseGuards(JwtAuthGuard)
	async startTrial(
		@Req() req,
		@Body('trialStartedAt') trialStartedAt: string,
		@Body('trialEndsAt') trialEndsAt: string,
	) {
		const userId = req.user.userId
		return this.subService.startTrial(userId, trialStartedAt, trialEndsAt)
	}

	@Post('dismiss-trial-paywall')
	@UseGuards(JwtAuthGuard)
	async dismissTrialPaywall(@Req() req) {
		const userId = req.user.userId
		return this.subService.dismissTrialPaywall(userId)
	}

	@Get('my')
	@UseGuards(JwtAuthGuard)
	async mySubscriptions(@Req() req) {
		return this.subService.getUserSubscriptions(req.user.userId)
	}
}