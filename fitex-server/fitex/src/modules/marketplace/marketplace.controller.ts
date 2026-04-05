import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard'
import { MarketplaceService } from './marketplace.service'

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  // ─── Public routes ──────────────────────────────────────────────────────────

  @Get('trainers')
  getTrainers(
    @Query('specialty') specialty?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
  ) {
    return this.marketplaceService.getTrainers({ specialty, search, limit })
  }

  @Get('trainers/:id')
  getTrainer(@Param('id') id: string) {
    return this.marketplaceService.getTrainerById(id)
  }

  @Get('plans')
  getPlans(
    @Query('type') type?: string,
    @Query('difficulty') difficulty?: string,
    @Query('trainerId') trainerId?: string,
    @Query('search') search?: string,
  ) {
    return this.marketplaceService.getPlans({ type, difficulty, trainerId, search })
  }

  @Get('plans/:id')
  getPlan(@Param('id') id: string) {
    return this.marketplaceService.getPlanById(id)
  }

  // ─── Protected routes ───────────────────────────────────────────────────────

  @Get('my-plans')
  @UseGuards(JwtAuthGuard)
  getMyPlans(@Req() req: any) {
    return this.marketplaceService.getMyPurchasedPlans(req.user.userId)
  }

  @Get('trainer-profile/me')
  @UseGuards(JwtAuthGuard)
  getMyTrainerProfile(@Req() req: any) {
    return this.marketplaceService.getMyTrainerProfile(req.user.userId)
  }

  @Post('trainer-profile')
  @UseGuards(JwtAuthGuard)
  createTrainerProfile(@Body() dto: any, @Req() req: any) {
    return this.marketplaceService.createTrainerProfile(req.user.userId, dto)
  }

  @Put('trainer-profile')
  @UseGuards(JwtAuthGuard)
  updateTrainerProfile(@Body() dto: any, @Req() req: any) {
    return this.marketplaceService.updateTrainerProfile(req.user.userId, dto)
  }

  @Post('plans')
  @UseGuards(JwtAuthGuard)
  createPlan(@Body() dto: any, @Req() req: any) {
    return this.marketplaceService.createPlan(req.user.userId, dto)
  }

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  purchasePlan(@Body() dto: { planId: string; transactionId: string }, @Req() req: any) {
    return this.marketplaceService.purchasePlan(req.user.userId, dto.planId, dto.transactionId)
  }
}
