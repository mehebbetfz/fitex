import { BodyProfileWizardStep } from '@/components/body-profile-wizard-step'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
	BODY_PROFILE_STEPS,
	type BodyProfileStep,
	isBodyProfileStep,
} from '@/constants/body-profile-wizard'
import { useOnboardingBody } from './onboarding-body-context'

const BG = '#0A0A0A'

function stepParam(raw: string | string[] | undefined): string | undefined {
	if (raw == null) return undefined
	return Array.isArray(raw) ? raw[0] : raw
}

export default function OnboardingBodyStepScreen() {
	const router = useRouter()
	const raw = stepParam(useLocalSearchParams().step)
	const { state, setState, loading, submitSkip, submitSave } = useOnboardingBody()

	if (!raw || !isBodyProfileStep(raw)) {
		return <Redirect href='/(auth)/onboarding-body/weight' />
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
		<SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
			<BodyProfileWizardStep
				variant='onboarding'
				step={step}
				state={state}
				setState={setState}
				loading={loading}
				onPrimary={goNext}
				canFooterBack={canFooterBack}
				onFooterBack={() => router.back()}
				showSkip
				onSkip={submitSkip}
			/>
		</SafeAreaView>
	)
}
