export type Sex = 'male' | 'female'
export type FitnessGoal =
	| 'lose_weight'
	| 'gain_muscle'
	| 'maintain'
	| 'health'
	| 'unspecified'
export type ActivityLevel =
	| 'sedentary'
	| 'light'
	| 'moderate'
	| 'active'
	| 'very_active'
	| 'unspecified'

export interface NutritionTargets {
	calories: number
	proteinG: number
	carbsG: number
	fatG: number
	bmr: number
	tdee: number
	complete: boolean
	/** true, если пользователь задал лимиты вручную */
	custom: boolean
}

const ACTIVITY_MULT: Record<string, number> = {
	sedentary: 1.2,
	light: 1.375,
	moderate: 1.55,
	active: 1.725,
	very_active: 1.9,
	unspecified: 1.55,
}

/** Mifflin–St Jeor + goal adjustment */
export function computeNutritionTargets(input: {
	heightCm?: number | null
	weightKg?: number | null
	age?: number | null
	sex?: string | null
	fitnessGoal?: string | null
	activityLevel?: string | null
}): NutritionTargets {
	const w = Number(input.weightKg)
	const h = Number(input.heightCm)
	const a = Number(input.age)
	const sex = (input.sex || '').toLowerCase()
	const complete =
		Number.isFinite(w) &&
		w > 0 &&
		Number.isFinite(h) &&
		h > 0 &&
		Number.isFinite(a) &&
		a > 0 &&
		(sex === 'male' || sex === 'female')

	if (!complete) {
		return {
			calories: 2000,
			proteinG: 120,
			carbsG: 200,
			fatG: 65,
			bmr: 0,
			tdee: 0,
			complete: false,
			custom: false,
		}
	}

	const bmr =
		sex === 'male'
			? 10 * w + 6.25 * h - 5 * a + 5
			: 10 * w + 6.25 * h - 5 * a - 161

	const mult = ACTIVITY_MULT[input.activityLevel || 'unspecified'] ?? 1.55
	const tdee = bmr * mult

	const goal = input.fitnessGoal || 'unspecified'
	let calories = tdee
	if (goal === 'lose_weight') calories = tdee - Math.min(500, tdee * 0.18)
	else if (goal === 'gain_muscle') calories = tdee + tdee * 0.12

	calories = Math.round(Math.max(1200, calories))

	let proteinPerKg = 1.7
	if (goal === 'lose_weight') proteinPerKg = 2.1
	else if (goal === 'gain_muscle') proteinPerKg = 1.9

	const proteinG = Math.round(w * proteinPerKg)
	const fatG = Math.round((calories * 0.28) / 9)
	const carbsG = Math.max(
		0,
		Math.round((calories - proteinG * 4 - fatG * 9) / 4),
	)

	return {
		calories,
		proteinG,
		carbsG,
		fatG,
		bmr: Math.round(bmr),
		tdee: Math.round(tdee),
		complete: true,
		custom: false,
	}
}
