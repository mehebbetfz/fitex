import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard'
import { GymPassService } from './gym-pass.service'

@Controller('gym-pass')
export class GymPassController {
  constructor(private readonly gymPassService: GymPassService) {}

  // ─── Public ─────────────────────────────────────────────────────────────────

  @Get('gyms')
  getGyms(@Query('city') city?: string) {
    return this.gymPassService.getGyms(city)
  }

  @Get('gyms/:id')
  getGym(@Param('id') id: string) {
    return this.gymPassService.getGymById(id)
  }

  // NFC terminal check-in — terminal authenticates separately (API key in production)
  @Post('checkin')
  checkIn(@Body() dto: { terminalId: string; accessToken: string }) {
    return this.gymPassService.checkIn(dto.terminalId, dto.accessToken)
  }

  // ─── Protected ──────────────────────────────────────────────────────────────

  @Get('membership')
  @UseGuards(JwtAuthGuard)
  getActiveMembership(@Req() req: any) {
    return this.gymPassService.getActiveMembership(req.user.userId)
  }

  @Get('memberships')
  @UseGuards(JwtAuthGuard)
  getAllMemberships(@Req() req: any) {
    return this.gymPassService.getUserMemberships(req.user.userId)
  }

  @Post('membership')
  @UseGuards(JwtAuthGuard)
  purchaseMembership(
    @Body() dto: { gymId?: string; planType: string; transactionId?: string },
    @Req() req: any,
  ) {
    return this.gymPassService.purchaseMembership(req.user.userId, dto as any)
  }

  @Get('visits')
  @UseGuards(JwtAuthGuard)
  getVisits(@Req() req: any) {
    return this.gymPassService.getVisitHistory(req.user.userId)
  }
}
