import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type UserDocument = User & Document

@Schema({ timestamps: true })
export class User {
	@Prop({ required: true, unique: true })
	email: string

	@Prop()
	firstName?: string

	@Prop()
	lastName?: string

	@Prop()
	avatarUrl?: string

	@Prop({ enum: ['apple', 'google'], required: true })
	provider: string

	@Prop({ required: true })
	providerId: string

	@Prop({ default: false })
	isPremium: boolean

	@Prop()
	premiumExpiresAt?: Date

	@Prop({ type: Object, default: {} })
	settings: Record<string, any>
}

export const UserSchema = SchemaFactory.createForClass(User)