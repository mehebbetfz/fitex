import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type SubscriptionDocument = Subscription & Document

@Schema({ timestamps: true })
export class Subscription {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	userId: Types.ObjectId

	@Prop({ required: true })
	productId: string

	@Prop({ required: true })
	transactionId: string

	/** Stable id: Apple original_transaction_id, Google purchase token (renewals update transactionId). */
	@Prop()
	subscriptionGroupId?: string

	@Prop({ required: true })
	purchaseDate: Date

	@Prop()
	expirationDate?: Date

	@Prop({ enum: ['active', 'expired', 'cancelled'], default: 'active' })
	status: string

	@Prop({ enum: ['ios', 'android'] })
	platform: string
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription)