import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type GymVisitDocument = GymVisit & Document

@Schema({ timestamps: true })
export class GymVisit {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'GymPartner', required: true })
  gymId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Membership', required: true })
  membershipId: Types.ObjectId

  @Prop({ required: true })
  checkInTime: Date

  @Prop()
  terminalId: string
}

export const GymVisitSchema = SchemaFactory.createForClass(GymVisit)
GymVisitSchema.index({ userId: 1, checkInTime: -1 })
GymVisitSchema.index({ gymId: 1, checkInTime: -1 })
