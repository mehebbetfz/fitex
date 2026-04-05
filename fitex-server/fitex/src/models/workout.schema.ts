// src/models/workout.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type WorkoutDocument = Workout & Document

@Schema({ timestamps: true })
export class Workout {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	userId: Types.ObjectId

	@Prop({ index: true })
	localId: number               // SQLite id с клиента

	@Prop({ required: true })
	date: string

	@Prop()
	time: string

	@Prop()
	duration: number

	@Prop()
	type: string

	@Prop()
	muscle_groups: string

	@Prop()
	exercises_count: number

	@Prop()
	sets_count: number

	@Prop()
	volume: number

	@Prop()
	notes?: string

	@Prop()
	rating?: number

	@Prop({ type: Array, default: [] })
	exercises: Array<{
		name: string
		muscle_group: string
		volume: number
		one_rep_max?: number
		notes?: string
		order_index: number
		sets: Array<{
			set_number: number
			weight: number
			reps: number
			completed: boolean
		}>
	}>

	@Prop({ default: false })
	isDeleted: boolean

	@Prop()
	deleted_at?: string

	@Prop()
	updated_at_client?: string
}

export const WorkoutSchema = SchemaFactory.createForClass(Workout)