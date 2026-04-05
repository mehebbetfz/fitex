import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type GymPartnerDocument = GymPartner & Document

@Schema({ timestamps: true })
export class GymPartner {
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  address: string

  @Prop()
  city: string

  @Prop()
  latitude: number

  @Prop()
  longitude: number

  @Prop()
  phone: string

  @Prop([String])
  photos: string[]

  @Prop({ type: Object, default: {} })
  workingHours: Record<string, { open: string; close: string }>

  // pool, sauna, cardio, weights, parking, showers, crossfit, boxing
  @Prop([String])
  amenities: string[]

  @Prop({ required: true, unique: true })
  nfcTerminalId: string

  @Prop({
    type: [
      {
        planType: { type: String, enum: ['day', 'month', 'quarter', 'year', 'all_access'] },
        price: Number,
        currency: { type: String, default: 'RUB' },
      },
    ],
    default: [],
  })
  membershipPrices: Array<{
    planType: string
    price: number
    currency: string
  }>

  @Prop({ default: true })
  isActive: boolean
}

export const GymPartnerSchema = SchemaFactory.createForClass(GymPartner)
GymPartnerSchema.index({ city: 1 })
GymPartnerSchema.index({ nfcTerminalId: 1 }, { unique: true })
