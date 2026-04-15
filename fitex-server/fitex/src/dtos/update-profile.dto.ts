import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator'

export class UpdateProfileDto {
	/** Отображаемое имя (лидерборд, профиль) */
	@IsOptional()
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@IsString()
	@MinLength(1)
	@MaxLength(60)
	firstName?: string

	@IsOptional()
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@IsString()
	@MaxLength(60)
	lastName?: string

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(100)
	@Max(250)
	heightCm?: number

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(30)
	@Max(300)
	weightKg?: number

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(13)
	@Max(120)
	age?: number

	@IsOptional()
	@IsIn(['male', 'female'])
	sex?: string

	@IsOptional()
	@IsIn(['lose_weight', 'gain_muscle', 'maintain', 'health', 'unspecified'])
	fitnessGoal?: string

	@IsOptional()
	@IsIn(['sedentary', 'light', 'moderate', 'active', 'very_active', 'unspecified'])
	activityLevel?: string

	@IsOptional()
	@IsBoolean()
	bodyStatsCompleted?: boolean

	@IsOptional()
	@IsString()
	@MaxLength(200)
	socialInstagram?: string

	@IsOptional()
	@IsString()
	@MaxLength(200)
	socialTelegram?: string

	@IsOptional()
	@IsString()
	@MaxLength(200)
	socialYoutube?: string

	@IsOptional()
	@IsString()
	@MaxLength(200)
	socialTiktok?: string

	@IsOptional()
	@IsString()
	@MaxLength(200)
	socialStrava?: string

	@IsOptional()
	@IsString()
	@MaxLength(200)
	socialWebsite?: string
}
