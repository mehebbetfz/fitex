// app/index.tsx
import { useLanguage } from '@/contexts/language-context'
import { Redirect } from 'expo-router'
import { hasActivePremium, useAuth } from './contexts/auth-context'

export default function Index() {
	const { user, isLoading: authLoading } = useAuth()
	const { language, isLoading: langLoading } = useLanguage()

	if (authLoading || langLoading) {
		return null
	}

	if (user && !language) {
		return <Redirect href='/(auth)/language-select' />
	}

	// Первичный ввод роста / веса / возраста и др. (можно пропустить)
	if (user && user.bodyStatsCompleted !== true) {
		return <Redirect href='/(auth)/onboarding-body' />
	}

	// Trial paywall только для новых пользователей без активного Premium (не по trialStartedAt — иначе Premium без триала попадал на paywall)
	if (user && !hasActivePremium(user) && user.isNewUser === true) {
		return <Redirect href='/(auth)/trial-paywall' />
	}

	if (user) {
		return <Redirect href='/(tabs)' />
	}

	return <Redirect href='/(auth)/login' />
}
