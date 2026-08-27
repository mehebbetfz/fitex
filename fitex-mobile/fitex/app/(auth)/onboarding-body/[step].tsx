import { BodyProfileWizardStep } from '@/components/body-profile-wizard-step'
import {
	BODY_PROFILE_STEPS,
	type BodyProfileStep,
	isBodyProfileStep,
} from '@/constants/body-profile-wizard'
import { useAppTheme } from '@/contexts/theme-context'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useOnboardingBody } from './onboarding-body-context'

function stepParam(raw: string | string[] | undefined): string | undefined {
	if (raw == null) return undefined
	return Array.isArray(raw) ? raw[0] : raw
}

export default function OnboardingBodyStepScreen() {
	const router = useRouter()
	const { colors: C } = useAppTheme()
	const raw = stepParam(useLocalSearchParams().step)
	const { state, setState, loading, submitSave } = useOnboardingBody()

	if (!raw || !isBodyProfileStep(raw)) {
		return <Redirect href='/(auth)/onboarding-body/age' />
	}

	const step: BodyProfileStep = raw
	const stepIndex = BODY_PROFILE_STEPS.indexOf(step)
	const canFooterBack = stepIndex > 0

	const goNext = () => {
		if (stepIndex >= BODY_PROFILE_STEPS.length - 1) {
			void submitSave()
			return
		}
		const next = BODY_PROFILE_STEPS[stepIndex + 1]
		router.push(`/(auth)/onboarding-body/${next}`)
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
			<BodyProfileWizardStep
				variant='onboarding'
				step={step}
				state={state}
				setState={setState}
				loading={loading}
				onPrimary={goNext}
				canFooterBack={canFooterBack}
				onFooterBack={() => router.back()}
			/>
		</SafeAreaView>
	)
}
