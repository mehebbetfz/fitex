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

	// Язык — до логина и дальше по всему флоу
	if (!language) {
		return <Redirect href='/(auth)/language-select' />
	}

	if (!user) {
		return <Redirect href='/(auth)/login' />
	}

	// Только явное false — иначе старый кэш без поля вечно кидает на онбординг
	if (user.bodyStatsCompleted === false) {
		return <Redirect href='/(auth)/onboarding-body' />
	}

	// Trial paywall только для новых пользователей без активного Premium
	if (!hasActivePremium(user) && user.isNewUser === true) {
		return <Redirect href='/(auth)/trial-paywall' />
	}

	return <Redirect href='/(tabs)' />
}
