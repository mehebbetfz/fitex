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

	@Prop({ enum: ['apple', 'google', 'demo', 'email'], required: true })
	provider: string

	@Prop({ required: true })
	providerId: string

	@Prop({ default: false })
	isPremium: boolean

	@Prop()
	premiumExpiresAt?: Date

	@Prop()
	trialStartedAt?: Date

	@Prop()
	trialEndsAt?: Date

	@Prop({ default: true })
	isNewUser: boolean

	@Prop({ type: Object, default: {} })
	settings: Record<string, any>

	// Email/password auth
	@Prop()
	passwordHash?: string

	@Prop({ default: false })
	isEmailVerified: boolean

	@Prop()
	emailVerificationToken?: string

	@Prop()
	emailVerificationExpires?: Date

	@Prop()
	passwordResetToken?: string

	@Prop()
	passwordResetExpires?: Date

	// Leaderboard stats (updated on sync)
	@Prop({ default: 0 })
	totalScore: number

	@Prop({ default: 0 })
	totalWorkouts: number

	@Prop({ default: 0 })
	totalVolume: number

	@Prop({ default: 0 })
	totalSets: number

	@Prop({ default: 0 })
	streakDays: number

	@Prop({ default: 0 })
	prCount: number

	@Prop({ default: true })
	showOnLeaderboard: boolean

	/** Анкета тела: рост см, вес кг, возраст, пол, цель, активность */
	@Prop()
	heightCm?: number

	@Prop()
	weightKg?: number

	@Prop()
	age?: number

	@Prop()
	sex?: string

	@Prop()
	fitnessGoal?: string

	@Prop()
	activityLevel?: string

	/** Пользователь прошёл экран первичного ввода данных (или нажал «Пропустить») */
	@Prop({ default: false })
	bodyStatsCompleted?: boolean
}

export const UserSchema = SchemaFactory.createForClass(User)