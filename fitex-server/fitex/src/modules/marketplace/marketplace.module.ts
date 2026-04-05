import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Plan, PlanSchema } from 'src/models/plan.schema'
import { PlanPurchase, PlanPurchaseSchema } from 'src/models/plan-purchase.schema'
import { TrainerProfile, TrainerProfileSchema } from 'src/models/trainer-profile.schema'
import { MarketplaceController } from './marketplace.controller'
import { MarketplaceService } from './marketplace.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrainerProfile.name, schema: TrainerProfileSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: PlanPurchase.name, schema: PlanPurchaseSchema },
    ]),
  ],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
