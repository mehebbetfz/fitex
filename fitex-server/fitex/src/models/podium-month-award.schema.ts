import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type PodiumMonthAwardDocument = PodiumMonthAward & Document

/** Одна запись на calendar month YYYY-MM — подиум зафиксирован, повторно не начисляем */
@Schema({ timestamps: true })
export class PodiumMonthAward {
	@Prop({ required: true, unique: true, index: true })
	monthKey: string

	@Prop()
	firstUserId?: string

	@Prop()
	secondUserId?: string

	@Prop()
	thirdUserId?: string

	@Prop({ default: false })
	podiumApplied: boolean
}

export const PodiumMonthAwardSchema = SchemaFactory.createForClass(PodiumMonthAward)
