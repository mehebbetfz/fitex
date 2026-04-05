import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { GymPartner, GymPartnerSchema } from 'src/models/gym-partner.schema'
import { GymVisit, GymVisitSchema } from 'src/models/gym-visit.schema'
import { Membership, MembershipSchema } from 'src/models/membership.schema'
import { GymPassController } from './gym-pass.controller'
import { GymPassService } from './gym-pass.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GymPartner.name, schema: GymPartnerSchema },
      { name: Membership.name, schema: MembershipSchema },
      { name: GymVisit.name, schema: GymVisitSchema },
    ]),
  ],
  controllers: [GymPassController],
  providers: [GymPassService],
  exports: [GymPassService],
})
export class GymPassModule {}
