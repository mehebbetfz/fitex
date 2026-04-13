import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard'
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

	@Get('profile/:userId')
	async getAthleteProfile(@Req() req: any, @Param('userId') userId: string) {
		return this.service.getAthleteProfile(req.user.userId, userId)
	}
}
