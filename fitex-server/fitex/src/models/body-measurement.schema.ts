// src/models/body-measurement.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type BodyMeasurementDocument = BodyMeasurement & Document

@Schema({ timestamps: true })
export class BodyMeasurement {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	userId: Types.ObjectId

	@Prop({ index: true })
	localId: number

	@Prop({ required: true })
	name: string

	@Prop({ required: true })
	value: number

	@Prop({ required: true })
	unit: string

	@Prop({ required: true })
	date: string

	@Prop()
	trend: string

	@Prop()
	goal?: number

	@Prop({ default: false })
	isDeleted: boolean

	@Prop()
	deleted_at?: string

	@Prop()
	updated_at_client?: string
}

export const BodyMeasurementSchema = SchemaFactory.createForClass(BodyMeasurement)