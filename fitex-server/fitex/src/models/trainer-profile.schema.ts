import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type TrainerProfileDocument = TrainerProfile & Document

@Schema({ timestamps: true })
export class TrainerProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId

  @Prop({ required: true })
  displayName: string

  @Prop({ default: '' })
  bio: string

  @Prop([String])
  specialties: string[]

  @Prop()
  avatarUrl: string

  @Prop({ default: 0 })
  yearsExperience: number

  @Prop([String])
  certifications: string[]

  @Prop({ default: 0 })
  studentsCount: number

  @Prop({ default: 0 })
  rating: number

  @Prop({ default: 0 })
  reviewsCount: number

  @Prop({
    type: [
      {
        imageUrl: String,
        beforeImageUrl: String,
        description: String,
        type: { type: String, enum: ['own', 'student'] },
        studentName: String,
        durationWeeks: Number,
      },
    ],
    default: [],
  })
  results: Array<{
    imageUrl: string
    beforeImageUrl?: string
    description: string
    type: 'own' | 'student'
    studentName?: string
    durationWeeks?: number
  }>

  @Prop({ default: false })
  isVerified: boolean

  @Prop({ default: true })
  isActive: boolean
}

export const TrainerProfileSchema = SchemaFactory.createForClass(TrainerProfile)
TrainerProfileSchema.index({ specialties: 1 })
TrainerProfileSchema.index({ rating: -1 })
