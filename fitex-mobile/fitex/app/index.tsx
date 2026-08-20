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

	// Только явное false — иначе старый кэш без поля вечно кидает на онбординг
	if (user && user.bodyStatsCompleted === false) {
		return <Redirect href='/(auth)/onboarding-body' />
	}

	// Trial paywall только для новых пользователей без активного Premium
	if (user && !hasActivePremium(user) && user.isNewUser === true) {
		return <Redirect href='/(auth)/trial-paywall' />
	}

	if (user) {
		return <Redirect href='/(tabs)' />
	}

	return <Redirect href='/(auth)/login' />
}
