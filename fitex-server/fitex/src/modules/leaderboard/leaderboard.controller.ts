import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/strategies/jwt-auth.guard'
import { LeaderboardService } from './leaderboard.service'

@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
	constructor(private readonly service: LeaderboardService) {}

	@Get()
	async getLeaderboard(
		@Req() req: any,
		@Query('limit') limit?: string,
	) {
		const l = Math.min(Number(limit) || 100, 200)
		return this.service.getLeaderboard(req.user.userId, l)
	}
}
