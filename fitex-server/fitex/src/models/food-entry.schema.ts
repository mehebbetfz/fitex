import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type FoodEntryDocument = HydratedDocument<FoodEntry>

@Schema({ timestamps: true, collection: 'food_entries' })
export class FoodEntry {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
	userId: Types.ObjectId

	/** Local calendar day YYYY-MM-DD */
	@Prop({ required: true, index: true })
	date: string

	@Prop({ required: true })
	name: string

	@Prop()
	photoUrl?: string

	@Prop({ required: true, min: 0 })
	calories: number

	@Prop({ required: true, min: 0, default: 0 })
	proteinG: number

	@Prop({ required: true, min: 0, default: 0 })
	carbsG: number

	@Prop({ required: true, min: 0, default: 0 })
	fatG: number

	/** Sparse map e.g. { vitaminC: 12, iron: 2 } in mg or µg as labeled by model */
	@Prop({ type: Object, default: {} })
	vitamins?: Record<string, number>

	@Prop({ enum: ['vision', 'manual', 'edited'], default: 'vision' })
	source: string

	@Prop({ type: Object })
	rawModelJson?: Record<string, unknown>

	@Prop({ default: false })
	isDeleted: boolean
}

export const FoodEntrySchema = SchemaFactory.createForClass(FoodEntry)
FoodEntrySchema.index({ userId: 1, date: 1, isDeleted: 1 })
