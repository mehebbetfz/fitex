import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { LeaderboardService } from './leaderboard.service'

/** В последний день месяца (UTC) фиксируем топ-3 месячного рейтинга */
@Injectable()
export class LeaderboardMonthlyCron {
	private readonly log = new Logger(LeaderboardMonthlyCron.name)

	constructor(private readonly leaderboard: LeaderboardService) {}

	@Cron('55 23 * * *', { timeZone: 'UTC' })
	async handleMonthEnd() {
		const now = new Date()
		if (!this.isLastDayOfUtcMonth(now)) return
		try {
			await this.leaderboard.awardMonthlyPodiumIfNeeded()
			this.log.log(`Monthly podium check OK (${now.toISOString().slice(0, 10)})`)
		} catch (e) {
			this.log.error(e)
		}
	}

	private isLastDayOfUtcMonth(d: Date): boolean {
		const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1))
		return next.getUTCDate() === 1
	}
}
