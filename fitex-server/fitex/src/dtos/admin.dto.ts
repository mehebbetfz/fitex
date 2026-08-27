import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

/** Preset durations for admin-granted Premium */
export const PREMIUM_DURATION_PRESETS = [
	'7d',
	'30d',
	'90d',
	'180d',
	'365d',
	'lifetime',
	'revoke',
] as const

export type PremiumDurationPreset = (typeof PREMIUM_DURATION_PRESETS)[number]

export class GrantPremiumDto {
	@IsOptional()
	@IsIn([...PREMIUM_DURATION_PRESETS])
	duration?: PremiumDurationPreset

	/** Custom length in days (1–3650). Ignored if duration is set (except with custom only). */
	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(3650)
	customDays?: number
}

export class SetUserRoleDto {
	@IsString()
	@IsIn(['user', 'admin'])
	role: 'user' | 'admin'
}

/** Add or set meal-photo AI credits for a user. */
export class AdjustMealPhotosDto {
	/** Add this many credits (can be negative to subtract). */
	@IsOptional()
	@IsInt()
	@Min(-10000)
	@Max(10000)
	add?: number

	/** Set absolute remaining credits. */
	@IsOptional()
	@IsInt()
	@Min(0)
	@Max(100000)
	set?: number
}
