// src/models/personal-record.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type PersonalRecordDocument = PersonalRecord & Document

@Schema({ timestamps: true })
export class PersonalRecord {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	userId: Types.ObjectId

	@Prop({ index: true })
	localId: number

	@Prop({ required: true })
	exercise: string

	@Prop({ required: true })
	weight: string

	@Prop({ required: true })
	date: string

	@Prop()
	trend: string

	@Prop()
	category: string

	@Prop()
	notes?: string

	@Prop()
	previous_record?: string

	@Prop()
	improvement?: string

	@Prop({ default: false })
	isDeleted: boolean

	@Prop()
	deleted_at?: string

	@Prop()
	updated_at_client?: string
}

export const PersonalRecordSchema = SchemaFactory.createForClass(PersonalRecord)