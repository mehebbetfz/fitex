import { Stack } from 'expo-router'
import React from 'react'
import { OnboardingBodyProvider } from './onboarding-body-context'

export default function OnboardingBodyLayout() {
	return (
		<OnboardingBodyProvider>
			<Stack
				screenOptions={{
					headerShown: false,
					animation: 'slide_from_right',
					gestureEnabled: true,
					fullScreenGestureEnabled: true,
				}}
			/>
		</OnboardingBodyProvider>
	)
}
