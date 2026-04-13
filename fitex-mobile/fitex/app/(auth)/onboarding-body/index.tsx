import { Redirect } from 'expo-router'

/** Вход в флоу — первое «окно» (вес) */
export default function OnboardingBodyIndex() {
	return <Redirect href='/(auth)/onboarding-body/weight' />
}
