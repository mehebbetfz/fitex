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

	@Get('my')
	@UseGuards(JwtAuthGuard)
	async mySubscriptions(@Req() req) {
		return this.subService.getUserSubscriptions(req.user.userId)
	}
}