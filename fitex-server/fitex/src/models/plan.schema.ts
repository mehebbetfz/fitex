import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type PlanDocument = Plan & Document

@Schema({ timestamps: true })
export class Plan {
  @Prop({ type: Types.ObjectId, ref: 'TrainerProfile', required: true })
  trainerId: Types.ObjectId

  @Prop({ required: true })
  title: string

  @Prop({ default: '' })
  description: string

  @Prop({ required: true, enum: ['workout', 'nutrition', 'combo'] })
  type: string

  @Prop({ required: true, min: 0 })
  price: number

  @Prop({ default: 'RUB' })
  currency: string

  @Prop({ default: 4 })
  durationWeeks: number

  @Prop({ enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' })
  difficulty: string

  @Prop()
  previewImageUrl: string

  @Prop([String])
  tags: string[]

  @Prop({ default: 0 })
  purchasesCount: number

  @Prop({ default: 0 })
  rating: number

  @Prop({ default: 0 })
  reviewsCount: number

  @Prop({ type: Object, default: {} })
  content: Record<string, any>

  @Prop({ default: true })
  isActive: boolean
}

export const PlanSchema = SchemaFactory.createForClass(Plan)
PlanSchema.index({ trainerId: 1 })
PlanSchema.index({ type: 1, difficulty: 1 })
PlanSchema.index({ rating: -1 })
