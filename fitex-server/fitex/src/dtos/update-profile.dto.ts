import { Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsOptional, Max, Min } from 'class-validator'

export class UpdateProfileDto {
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
	@IsIn(['male', 'female', 'other', 'unspecified'])
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
}
