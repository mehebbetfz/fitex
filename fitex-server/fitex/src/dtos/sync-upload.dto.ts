// src/dtos/sync-upload.dto.ts
import { IsArray, IsOptional } from 'class-validator'

export class WorkoutSyncDto {
	id: number
	date: string
	time?: string
	duration?: number
	type?: string
	muscle_groups?: string
	exercises_count?: number
	sets_count?: number
	volume?: number
	notes?: string
	rating?: number
	deleted_at?: string
	updated_at_client?: string
	synced?: number
	created_at?: string
}

export class BodyMeasurementSyncDto {
	id: number
	name: string
	value: number
	unit: string
	date: string
	trend?: string
	goal?: number
	deleted_at?: string
	synced?: number
	created_at?: string
}

export class PersonalRecordSyncDto {
	id: number
	exercise: string
	weight: string
	date: string
	trend?: string
	category?: string
	notes?: string
	previous_record?: string
	improvement?: string
	deleted_at?: string
	synced?: number
	created_at?: string
}

export class SyncUploadDto {
	@IsOptional()
	@IsArray()
	workouts?: WorkoutSyncDto[]

	@IsOptional()
	@IsArray()
	bodyMeasurements?: BodyMeasurementSyncDto[]

	@IsOptional()
	@IsArray()
	personalRecords?: PersonalRecordSyncDto[]
}