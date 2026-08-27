/** Full AI meal-photo allowance granted with each Premium purchase / renewal. */
export const PREMIUM_MEAL_PHOTO_LIMIT = 240

/** UTC calendar month key for meal-photo quota windows (YYYY-MM). */
export function utcMealPhotoMonthKey(d = new Date()): string {
	return d.toISOString().slice(0, 7)
}

/**
 * Fields to set when Premium is purchased / renewed / granted.
 * Resets the user's stored meal-photo allowance to a full 240.
 */
export function premiumGrantFields(premiumExpiresAt?: Date | null) {
	const fields: Record<string, unknown> = {
		isPremium: true,
		mealPhotoRemaining: PREMIUM_MEAL_PHOTO_LIMIT,
		mealPhotoUsed: 0,
		mealPhotoMonthKey: utcMealPhotoMonthKey(),
	}
	if (premiumExpiresAt !== undefined) {
		fields.premiumExpiresAt = premiumExpiresAt
	}
	return fields
}
