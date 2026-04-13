import type { BodyStatsState } from '@/components/body-stats-form'
import { intRangeString, normalizeSexId } from '@/components/body-stats-form'
import { WheelPicker } from '@/components/wheel-picker'
import {
	BODY_PROFILE_STEPS,
	type BodyProfileStep,
} from '@/constants/body-profile-wizard'
import { useLanguage } from '@/contexts/language-context'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useMemo } from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const BG = '#0A0A0A'
const PRIMARY = '#34C759'
const PRIMARY_SOFT = 'rgba(52, 199, 89, 0.14)'

export type BodyProfileWizardVariant = 'onboarding' | 'edit'

type Props = {
	variant: BodyProfileWizardVariant
	step: BodyProfileStep
	state: BodyStatsState
	setState: React.Dispatch<React.SetStateAction<BodyStatsState>>
	loading: boolean
	onPrimary: () => void
	canFooterBack: boolean
	onFooterBack: () => void
	showSkip?: boolean
	onSkip?: () => void
}

function StepProgressDots({ current, total }: { current: number; total: number }) {
	return (
		<View style={styles.dotsRow}>
			{Array.from({ length: total }, (_, i) => (
				<View
					key={i}
					style={[
						styles.dot,
						i === current ? styles.dotActive : styles.dotIdle,
					]}
				/>
			))}
		</View>
	)
}

export function BodyProfileWizardStep({
	variant,
	step,
	state,
	setState,
	loading,
	onPrimary,
	canFooterBack,
	onFooterBack,
	showSkip,
	onSkip,
}: Props) {
	const { t } = useLanguage()

	const heightValues = useMemo(() => intRangeString(100, 250), [])
	const weightValues = useMemo(() => intRangeString(30, 300), [])
	const ageValues = useMemo(() => intRangeString(13, 120), [])

	const sexOpts = useMemo(
		() =>
			[
				{ id: 'male', label: t('bodyProfile', 'sexMale') },
				{ id: 'female', label: t('bodyProfile', 'sexFemale') },
			] as const,
		[t],
	)

	const goalOpts = useMemo(
		() =>
			[
				{ id: 'lose_weight', label: t('bodyProfile', 'goalLose') },
				{ id: 'gain_muscle', label: t('bodyProfile', 'goalGain') },
				{ id: 'maintain', label: t('bodyProfile', 'goalMaintain') },
				{ id: 'health', label: t('bodyProfile', 'goalHealth') },
				{ id: 'unspecified', label: t('bodyProfile', 'goalUnspecified') },
			] as const,
		[t],
	)
	const actOpts = useMemo(
		() =>
			[
				{ id: 'sedentary', label: t('bodyProfile', 'actSedentary') },
				{ id: 'light', label: t('bodyProfile', 'actLight') },
				{ id: 'moderate', label: t('bodyProfile', 'actModerate') },
				{ id: 'active', label: t('bodyProfile', 'actActive') },
				{ id: 'very_active', label: t('bodyProfile', 'actVery') },
				{ id: 'unspecified', label: t('bodyProfile', 'actUnspecified') },
			] as const,
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

	const safeWeight = weightValues.includes(state.weight) ? state.weight : '70'
	const safeHeight = heightValues.includes(state.height) ? state.height : '175'
	const safeAge = ageValues.includes(state.age) ? state.age : '25'
	const sexNorm = normalizeSexId(state.sex)
	const safeSex = sexIds.includes(sexNorm) ? sexNorm : 'male'
	const safeGoal = goalIds.includes(state.fitnessGoal) ? state.fitnessGoal : 'unspecified'
	const safeAct = actIds.includes(state.activityLevel) ? state.activityLevel : 'unspecified'

	const stepIndex = BODY_PROFILE_STEPS.indexOf(step)
	const totalSteps = BODY_PROFILE_STEPS.length
	const stepProgressText = t('bodyProfile', 'stepProgress')
		.replace('{current}', String(stepIndex + 1))
		.replace('{total}', String(totalSteps))

	const titleForStep = (s: BodyProfileStep) => {
		switch (s) {
			case 'weight':
				return t('bodyProfile', 'weight')
			case 'height':
				return t('bodyProfile', 'height')
			case 'age':
				return t('bodyProfile', 'age')
			case 'sex':
				return t('bodyProfile', 'sex')
			case 'goal':
				return t('bodyProfile', 'goal')
			default:
				return t('bodyProfile', 'activity')
		}
	}

	const isLast = stepIndex >= totalSteps - 1

	const picker = (() => {
		switch (step) {
			case 'weight':
				return (
					<WheelPicker
						syncKey={0}
						values={weightValues}
						selectedValue={safeWeight}
						onValueChange={v => setState(p => ({ ...p, weight: v }))}
						formatLabel={val => `${val} ${t('bodyProfile', 'kg')}`}
					/>
				)
			case 'height':
				return (
					<WheelPicker
						syncKey={0}
						values={heightValues}
						selectedValue={safeHeight}
						onValueChange={v => setState(p => ({ ...p, height: v }))}
						formatLabel={val => `${val} ${t('bodyProfile', 'cm')}`}
					/>
				)
			case 'age':
				return (
					<WheelPicker
						syncKey={0}
						values={ageValues}
						selectedValue={safeAge}
						onValueChange={v => setState(p => ({ ...p, age: v }))}
						formatLabel={val => `${val} ${t('bodyProfile', 'years')}`}
					/>
				)
			case 'sex':
				return (
					<WheelPicker
						syncKey={0}
						values={sexIds}
						selectedValue={safeSex}
						onValueChange={v => setState(p => ({ ...p, sex: v }))}
						formatLabel={id => sexLabel[id] ?? id}
					/>
				)
			case 'goal':
				return (
					<WheelPicker
						syncKey={0}
						values={goalIds}
						selectedValue={safeGoal}
						onValueChange={v => setState(p => ({ ...p, fitnessGoal: v }))}
						formatLabel={id => goalLabel[id] ?? id}
					/>
				)
			case 'activity':
				return (
					<WheelPicker
						syncKey={0}
						values={actIds}
						selectedValue={safeAct}
						onValueChange={v => setState(p => ({ ...p, activityLevel: v }))}
						formatLabel={id => actLabel[id] ?? id}
					/>
				)
		}
	})()

	return (
		<View style={styles.root}>
			<LinearGradient
				colors={['#17171A', '#0D0D0F', BG]}
				locations={[0, 0.38, 1]}
				style={StyleSheet.absoluteFill}
			/>
			<LinearGradient
				colors={['rgba(52,199,89,0.07)', 'transparent']}
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 0.35 }}
				style={StyleSheet.absoluteFill}
				pointerEvents='none'
			/>
			<View style={styles.layer}>
				{variant === 'onboarding' ? (
					<View style={styles.top}>
						<Text style={styles.introTitle}>{t('bodyProfile', 'onboardingTitle')}</Text>
						<Text style={styles.introSub}>{t('bodyProfile', 'onboardingSubtitle')}</Text>
						<Text style={styles.stepMeta}>{stepProgressText}</Text>
						<StepProgressDots current={stepIndex} total={totalSteps} />
					</View>
				) : (
					<View style={styles.topEdit}>
						<Text style={styles.stepMeta}>{stepProgressText}</Text>
						<StepProgressDots current={stepIndex} total={totalSteps} />
					</View>
				)}

				<View style={styles.centerBlock}>
					<Text style={styles.stepTitle}>{titleForStep(step)}</Text>
					{picker}
				</View>

				<View style={styles.footer}>
					<View style={styles.footerRow}>
						{canFooterBack ? (
							<TouchableOpacity
								style={styles.backBtn}
								onPress={onFooterBack}
								disabled={loading}
								activeOpacity={0.85}
							>
								<Text style={styles.backText}>{t('bodyProfile', 'back')}</Text>
							</TouchableOpacity>
						) : null}
						<TouchableOpacity
							style={[
								styles.cta,
								styles.ctaGrow,
								loading && styles.ctaDisabled,
							]}
							onPress={onPrimary}
							disabled={loading}
							activeOpacity={0.88}
						>
							{loading ? (
								<ActivityIndicator color='#fff' />
							) : (
								<Text style={styles.ctaText}>
									{isLast ? t('bodyProfile', 'save') : t('bodyProfile', 'next')}
								</Text>
							)}
						</TouchableOpacity>
					</View>

					{showSkip && onSkip ? (
						<TouchableOpacity
							style={styles.skip}
							onPress={() => void onSkip()}
							disabled={loading}
						>
							<Text style={styles.skipText}>{t('bodyProfile', 'skip')}</Text>
						</TouchableOpacity>
					) : null}
				</View>
			</View>
		</View>
	)
}

export const bodyProfileWizardStyles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: BG,
	},
	layer: {
		flex: 1,
		zIndex: 1,
	},
	top: {
		paddingHorizontal: 22,
		paddingTop: 10,
		paddingBottom: 14,
	},
	topEdit: {
		paddingHorizontal: 22,
		paddingTop: 6,
		paddingBottom: 12,
	},
	introTitle: {
		fontSize: 24,
		fontWeight: '700',
		color: '#fff',
		textAlign: 'center',
		marginBottom: 8,
		letterSpacing: 0.3,
	},
	introSub: {
		fontSize: 15,
		color: '#8E8E93',
		textAlign: 'center',
		lineHeight: 22,
		marginBottom: 12,
	},
	stepMeta: {
		fontSize: 12,
		color: '#636366',
		textAlign: 'center',
		fontWeight: '600',
		letterSpacing: 0.8,
		textTransform: 'uppercase',
		marginBottom: 10,
	},
	dotsRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 7,
		marginTop: 2,
	},
	dot: {
		height: 6,
		borderRadius: 3,
	},
	dotIdle: {
		width: 6,
		backgroundColor: 'rgba(255,255,255,0.12)',
	},
	dotActive: {
		width: 22,
		backgroundColor: PRIMARY,
	},
	centerBlock: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: 16,
		minHeight: 300,
	},
	stepTitle: {
		fontSize: 30,
		fontWeight: '700',
		color: '#fff',
		textAlign: 'center',
		marginBottom: 22,
		letterSpacing: 0.4,
	},
	footer: {
		paddingHorizontal: 20,
		paddingBottom: 28,
		paddingTop: 8,
	},
	footerRow: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'stretch',
		gap: 12,
	},
	backBtn: {
		minWidth: 104,
		paddingVertical: 15,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 14,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.14)',
		backgroundColor: 'rgba(255,255,255,0.04)',
	},
	backText: { fontSize: 16, color: '#AEAEB2', fontWeight: '600' },
	cta: {
		backgroundColor: PRIMARY,
		paddingVertical: 17,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 56,
	},
	/** Рядом с «Назад» или на всю ширину, если «Назад» нет */
	ctaGrow: {
		flex: 1,
	},
	ctaDisabled: { opacity: 0.65 },
	ctaText: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
	skip: {
		paddingVertical: 18,
		alignItems: 'center',
	},
	skipText: { fontSize: 15, color: '#8E8E93', fontWeight: '500' },
})

const styles = bodyProfileWizardStyles
