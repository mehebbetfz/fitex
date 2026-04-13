import { useLanguage } from '@/contexts/language-context'
import type { User } from '@/app/contexts/auth-context'
import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { WheelPicker } from '@/components/wheel-picker'

const C = {
	bg: '#0A0A0A',
	card: '#1C1C1E',
	border: '#3A3A3C',
	text: '#FFF',
	sub: '#8E8E93',
	primary: '#34C759',
} as const

export type BodyStatsState = {
	height: string
	weight: string
	age: string
	sex: string
	fitnessGoal: string
	activityLevel: string
}

export function intRangeString(min: number, max: number) {
	return Array.from({ length: max - min + 1 }, (_, i) => String(min + i))
}

function normalizeIntString(raw: string, fallback: string, min: number, max: number) {
	const n = parseFloat(String(raw).replace(',', '.'))
	if (!Number.isFinite(n)) return fallback
	const r = Math.round(n)
	return String(Math.min(max, Math.max(min, r)))
}

/** Только male / female для API и пикера */
export function normalizeSexId(raw: string | undefined | null): 'male' | 'female' {
	return raw === 'female' ? 'female' : 'male'
}

/** Ensures numeric fields are valid picker values; use for onboarding initial state */
export function mergeBodyStatsWithDefaults(initial: BodyStatsState): BodyStatsState {
	return {
		height: normalizeIntString(initial.height, '175', 100, 250),
		weight: normalizeIntString(initial.weight, '70', 30, 300),
		age: normalizeIntString(initial.age, '25', 13, 120),
		sex: normalizeSexId(initial.sex),
		fitnessGoal: initial.fitnessGoal || 'unspecified',
		activityLevel: initial.activityLevel || 'unspecified',
	}
}

export function buildPayloadFromState(st: BodyStatsState) {
	const heightCm = parseFloat(st.height.replace(',', '.'))
	const weightKg = parseFloat(st.weight.replace(',', '.'))
	const age = parseInt(st.age, 10)
	if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 250) return null
	if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 300) return null
	if (!Number.isFinite(age) || age < 13 || age > 120) return null
	return {
		heightCm,
		weightKg,
		age,
		sex: st.sex,
		fitnessGoal: st.fitnessGoal,
		activityLevel: st.activityLevel,
		bodyStatsCompleted: true as const,
	}
}

export function useBodyStatsInitial(user: User | null): BodyStatsState {
	return useMemo(
		() => ({
			height: user?.heightCm != null ? String(Math.round(user.heightCm)) : '',
			weight: user?.weightKg != null ? String(Math.round(user.weightKg)) : '',
			age: user?.age != null ? String(user.age) : '',
			sex: normalizeSexId(user?.sex),
			fitnessGoal: user?.fitnessGoal ?? 'unspecified',
			activityLevel: user?.activityLevel ?? 'unspecified',
		}),
		[user],
	)
}

type Opt = { id: string; label: string }

export function BodyStatsFormSections({
	state,
	setState,
}: {
	state: BodyStatsState
	setState: React.Dispatch<React.SetStateAction<BodyStatsState>>
}) {
	const { t } = useLanguage()

	const heightValues = useMemo(() => intRangeString(100, 250), [])
	const weightValues = useMemo(() => intRangeString(30, 300), [])
	const ageValues = useMemo(() => intRangeString(13, 120), [])

	const sexOpts: Opt[] = useMemo(
		() => [
			{ id: 'male', label: t('bodyProfile', 'sexMale') },
			{ id: 'female', label: t('bodyProfile', 'sexFemale') },
		],
		[t],
	)
	const goalOpts: Opt[] = useMemo(
		() => [
			{ id: 'lose_weight', label: t('bodyProfile', 'goalLose') },
			{ id: 'gain_muscle', label: t('bodyProfile', 'goalGain') },
			{ id: 'maintain', label: t('bodyProfile', 'goalMaintain') },
			{ id: 'health', label: t('bodyProfile', 'goalHealth') },
			{ id: 'unspecified', label: t('bodyProfile', 'goalUnspecified') },
		],
		[t],
	)
	const actOpts: Opt[] = useMemo(
		() => [
			{ id: 'sedentary', label: t('bodyProfile', 'actSedentary') },
			{ id: 'light', label: t('bodyProfile', 'actLight') },
			{ id: 'moderate', label: t('bodyProfile', 'actModerate') },
			{ id: 'active', label: t('bodyProfile', 'actActive') },
			{ id: 'very_active', label: t('bodyProfile', 'actVery') },
			{ id: 'unspecified', label: t('bodyProfile', 'actUnspecified') },
		],
		[t],
	)

	const sexIds = useMemo(() => sexOpts.map(o => o.id), [sexOpts])
	const goalIds = useMemo(() => goalOpts.map(o => o.id), [goalOpts])
	const actIds = useMemo(() => actOpts.map(o => o.id), [actOpts])

	const sexLabel = useMemo(
		() => Object.fromEntries(sexOpts.map(o => [o.id, o.label])) as Record<string, string>,
		[sexOpts],
	)
	const goalLabel = useMemo(
		() => Object.fromEntries(goalOpts.map(o => [o.id, o.label])) as Record<string, string>,
		[goalOpts],
	)
	const actLabel = useMemo(
		() => Object.fromEntries(actOpts.map(o => [o.id, o.label])) as Record<string, string>,
		[actOpts],
	)

	const safeHeight = heightValues.includes(state.height) ? state.height : '175'
	const safeWeight = weightValues.includes(state.weight) ? state.weight : '70'
	const safeAge = ageValues.includes(state.age) ? state.age : '25'
	const safeSex = sexIds.includes(state.sex) ? state.sex : 'male'
	const safeGoal = goalIds.includes(state.fitnessGoal) ? state.fitnessGoal : 'unspecified'
	const safeAct = actIds.includes(state.activityLevel) ? state.activityLevel : 'unspecified'

	return (
		<>
			<View style={s.field}>
				<Text style={s.wheelSectionTitle}>{t('bodyProfile', 'weight')}</Text>
				<WheelPicker
					syncKey='weight'
					values={weightValues}
					selectedValue={safeWeight}
					onValueChange={v => setState(p => ({ ...p, weight: v }))}
					formatLabel={val => `${val} ${t('bodyProfile', 'kg')}`}
				/>
			</View>
			<View style={s.field}>
				<Text style={s.wheelSectionTitle}>{t('bodyProfile', 'height')}</Text>
				<WheelPicker
					syncKey='height'
					values={heightValues}
					selectedValue={safeHeight}
					onValueChange={v => setState(p => ({ ...p, height: v }))}
					formatLabel={val => `${val} ${t('bodyProfile', 'cm')}`}
				/>
			</View>
			<View style={s.field}>
				<Text style={s.wheelSectionTitle}>{t('bodyProfile', 'age')}</Text>
				<WheelPicker
					syncKey='age'
					values={ageValues}
					selectedValue={safeAge}
					onValueChange={v => setState(p => ({ ...p, age: v }))}
					formatLabel={val => `${val} ${t('bodyProfile', 'years')}`}
				/>
			</View>
			<View style={s.field}>
				<Text style={s.wheelSectionTitle}>{t('bodyProfile', 'sex')}</Text>
				<WheelPicker
					syncKey='sex'
					values={sexIds}
					selectedValue={safeSex}
					onValueChange={v => setState(p => ({ ...p, sex: v }))}
					formatLabel={id => sexLabel[id] ?? id}
				/>
			</View>
			<View style={s.field}>
				<Text style={s.wheelSectionTitle}>{t('bodyProfile', 'goal')}</Text>
				<WheelPicker
					syncKey='goal'
					values={goalIds}
					selectedValue={safeGoal}
					onValueChange={v => setState(p => ({ ...p, fitnessGoal: v }))}
					formatLabel={id => goalLabel[id] ?? id}
				/>
			</View>
			<View style={[s.field, { marginBottom: 8 }]}>
				<Text style={s.wheelSectionTitle}>{t('bodyProfile', 'activity')}</Text>
				<WheelPicker
					syncKey='activity'
					values={actIds}
					selectedValue={safeAct}
					onValueChange={v => setState(p => ({ ...p, activityLevel: v }))}
					formatLabel={id => actLabel[id] ?? id}
				/>
			</View>
		</>
	)
}

const s = StyleSheet.create({
	field: { marginBottom: 8 },
	wheelSectionTitle: {
		fontSize: 15,
		color: C.sub,
		marginBottom: 4,
		fontWeight: '600',
		textAlign: 'center',
	},
})

export const bodyStatsStyles = s
export { C as bodyStatsColors }
