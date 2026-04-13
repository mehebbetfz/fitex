import { useLanguage } from '@/contexts/language-context'
import type { User } from '@/app/contexts/auth-context'
import { Ionicons } from '@expo/vector-icons'
import React, { useMemo, useState } from 'react'
import {
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'

const C = {
	bg: '#0A0A0A',
	card: '#1C1C1E',
	border: '#3A3A3C',
	text: '#FFF',
	sub: '#8E8E93',
	primary: '#34C759',
} as const

type Opt = { id: string; label: string }

function ChipRow({
	label,
	options,
	value,
	onChange,
}: {
	label: string
	options: Opt[]
	value: string
	onChange: (v: string) => void
}) {
	return (
		<View style={s.field}>
			<Text style={s.label}>{label}</Text>
			<View style={s.chips}>
				{options.map(o => {
					const active = value === o.id
					return (
						<TouchableOpacity
							key={o.id}
							style={[s.chip, active && s.chipOn]}
							onPress={() => onChange(o.id)}
							activeOpacity={0.7}
						>
							<Text style={[s.chipText, active && s.chipTextOn]}>{o.label}</Text>
						</TouchableOpacity>
					)
				})}
			</View>
		</View>
	)
}

export function buildPayloadFromState(st: {
	height: string
	weight: string
	age: string
	sex: string
	fitnessGoal: string
	activityLevel: string
}) {
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

export function useBodyStatsInitial(user: User | null) {
	return useMemo(
		() => ({
			height: user?.heightCm != null ? String(user.heightCm) : '',
			weight: user?.weightKg != null ? String(user.weightKg) : '',
			age: user?.age != null ? String(user.age) : '',
			sex: user?.sex ?? 'unspecified',
			fitnessGoal: user?.fitnessGoal ?? 'unspecified',
			activityLevel: user?.activityLevel ?? 'unspecified',
		}),
		[user],
	)
}

export function BodyStatsFormSections({
	state,
	setState,
}: {
	state: ReturnType<typeof useBodyStatsInitial>
	setState: React.Dispatch<React.SetStateAction<ReturnType<typeof useBodyStatsInitial>>>
}) {
	const { t } = useLanguage()

	const sexOpts: Opt[] = useMemo(
		() => [
			{ id: 'male', label: t('bodyProfile', 'sexMale') },
			{ id: 'female', label: t('bodyProfile', 'sexFemale') },
			{ id: 'other', label: t('bodyProfile', 'sexOther') },
			{ id: 'unspecified', label: t('bodyProfile', 'sexUnspecified') },
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

	return (
		<>
			<View style={s.row2}>
				<View style={s.half}>
					<Text style={s.label}>{t('bodyProfile', 'height')} ({t('bodyProfile', 'cm')})</Text>
					<TextInput
						style={s.input}
						keyboardType='decimal-pad'
						placeholder='175'
						placeholderTextColor={C.sub}
						value={state.height}
						onChangeText={v => setState(p => ({ ...p, height: v }))}
					/>
				</View>
				<View style={s.half}>
					<Text style={s.label}>{t('bodyProfile', 'weight')} ({t('bodyProfile', 'kg')})</Text>
					<TextInput
						style={s.input}
						keyboardType='decimal-pad'
						placeholder='70'
						placeholderTextColor={C.sub}
						value={state.weight}
						onChangeText={v => setState(p => ({ ...p, weight: v }))}
					/>
				</View>
			</View>
			<View style={s.field}>
				<Text style={s.label}>{t('bodyProfile', 'age')} ({t('bodyProfile', 'years')})</Text>
				<TextInput
					style={s.input}
					keyboardType='number-pad'
					placeholder='25'
					placeholderTextColor={C.sub}
					value={state.age}
					onChangeText={v => setState(p => ({ ...p, age: v.replace(/\D/g, '') }))}
				/>
			</View>
			<ChipRow
				label={t('bodyProfile', 'sex')}
				options={sexOpts}
				value={state.sex}
				onChange={v => setState(p => ({ ...p, sex: v }))}
			/>
			<ChipRow
				label={t('bodyProfile', 'goal')}
				options={goalOpts}
				value={state.fitnessGoal}
				onChange={v => setState(p => ({ ...p, fitnessGoal: v }))}
			/>
			<ChipRow
				label={t('bodyProfile', 'activity')}
				options={actOpts}
				value={state.activityLevel}
				onChange={v => setState(p => ({ ...p, activityLevel: v }))}
			/>
		</>
	)
}

const s = StyleSheet.create({
	field: { marginBottom: 18 },
	row2: { flexDirection: 'row', gap: 12, marginBottom: 18 },
	half: { flex: 1 },
	label: {
		fontSize: 13,
		color: C.sub,
		marginBottom: 8,
		fontWeight: '600',
	},
	input: {
		backgroundColor: C.card,
		borderWidth: 1,
		borderColor: C.border,
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
		fontSize: 17,
		color: C.text,
	},
	chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
	chip: {
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 20,
		backgroundColor: C.card,
		borderWidth: 1,
		borderColor: C.border,
	},
	chipOn: {
		borderColor: C.primary,
		backgroundColor: 'rgba(52,199,89,0.12)',
	},
	chipText: { fontSize: 13, color: C.sub },
	chipTextOn: { color: C.primary, fontWeight: '600' },
})

export const bodyStatsStyles = s
export { C as bodyStatsColors }
