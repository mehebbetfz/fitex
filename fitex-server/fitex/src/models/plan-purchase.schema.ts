import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type PlanPurchaseDocument = PlanPurchase & Document

@Schema({ timestamps: true })
export class PlanPurchase {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Plan', required: true })
  planId: Types.ObjectId

  @Prop()
  transactionId: string

  @Prop({ required: true, min: 0 })
  price: number

  @Prop({ default: 'RUB' })
  currency: string

  @Prop({
    default: 'completed',
    enum: ['pending', 'completed', 'refunded'],
  })
  status: string
}

export const PlanPurchaseSchema = SchemaFactory.createForClass(PlanPurchase)
PlanPurchaseSchema.index({ userId: 1 })
PlanPurchaseSchema.index({ planId: 1 })
