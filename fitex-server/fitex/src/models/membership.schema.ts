import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type MembershipDocument = Membership & Document

@Schema({ timestamps: true })
export class Membership {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'GymPartner', default: null })
  gymId: Types.ObjectId | null

  @Prop({
    required: true,
    enum: ['day', 'month', 'quarter', 'year', 'all_access'],
  })
  planType: string

  @Prop({ required: true })
  startDate: Date

  @Prop({ required: true })
  endDate: Date

  @Prop({
    default: 'active',
    enum: ['active', 'expired', 'cancelled'],
  })
  status: string

  @Prop({ required: true, min: 0 })
  price: number

  @Prop({ default: 'RUB' })
  currency: string

  @Prop()
  transactionId: string

  @Prop({ default: 0 })
  visitsCount: number

  @Prop({ required: true, unique: true })
  accessToken: string
}

export const MembershipSchema = SchemaFactory.createForClass(Membership)
MembershipSchema.index({ userId: 1, status: 1 })
MembershipSchema.index({ accessToken: 1 }, { unique: true })
MembershipSchema.index({ endDate: 1 })
