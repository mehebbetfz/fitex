export const BODY_PROFILE_STEPS = [
	'weight',
	'height',
	'age',
	'sex',
	'goal',
	'activity',
] as const

export type BodyProfileStep = (typeof BODY_PROFILE_STEPS)[number]

export function isBodyProfileStep(s: string): s is BodyProfileStep {
	return (BODY_PROFILE_STEPS as readonly string[]).includes(s)
}
