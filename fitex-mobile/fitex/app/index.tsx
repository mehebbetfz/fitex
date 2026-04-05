// app/index.tsx
import { useLanguage } from '@/contexts/language-context'
import { Redirect } from 'expo-router'
import { useAuth } from './contexts/auth-context'

export default function Index() {
	const { user, isLoading: authLoading } = useAuth()
	const { language, isLoading: langLoading } = useLanguage()

	if (authLoading || langLoading) {
		return null
	}

	if (user && !language) {
		return <Redirect href='/(auth)/language-select' />
	}

	if (user) {
		return <Redirect href='/(tabs)' />
	}

	return <Redirect href='/(auth)/login' />
}
