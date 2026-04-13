// app/_layout.tsx
import { SyncProvider } from '@/app/contexts/sync-context'
import OtaUpdateGate from '@/components/ota-update-gate'
import SyncBanner from '@/components/sync-banner'
import { LanguageProvider } from '@/contexts/language-context'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider, useAuth } from './contexts/auth-context'
import { DatabaseProvider } from './contexts/database-context'
import { SyncInitializer } from './contexts/sync-initializer'

SplashScreen.preventAutoHideAsync()

function RootLayoutContent() {
	const { isLoading: authLoading } = useAuth()

	useEffect(() => {
		async function prepare() {
			try {
				await new Promise(resolve => setTimeout(resolve, 1500))
			} catch (e) {
				console.warn('Ошибка подготовки приложения', e)
			} finally {
				await SplashScreen.hideAsync()
			}
		}
		prepare()
	}, [])

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name='index' />
			<Stack.Screen name='(auth)' />
			<Stack.Screen name='(tabs)' />
			<Stack.Screen name='(routes)' />
			<Stack.Screen name='(public)' />
			<Stack.Screen
				name='workout'
				options={{
					presentation: 'modal',
					animation: 'slide_from_bottom',
				}}
			/>
		</Stack>
	)
}

export default function RootLayout() {
	return (
		<LanguageProvider>
		<AuthProvider>
			<DatabaseProvider>
				{/*
				 * SyncProvider должен быть ВЫШЕ SafeAreaProvider,
				 * чтобы SyncBanner мог читать insets изнутри SafeAreaProvider.
				 */}
				<SyncProvider>
					{/* SyncInitializer теперь получает useSyncContext через SyncProvider */}
					<SyncInitializer />

					<SafeAreaProvider>
						{/*
						 * SyncBanner — абсолютный оверлей поверх всего.
						 * position: 'absolute' + zIndex: 9999, pointerEvents: 'none',
						 * не блокирует тапы.
						 */}
						<SyncBanner />
						<OtaUpdateGate />
						<RootLayoutContent />
					</SafeAreaProvider>
				</SyncProvider>
			</DatabaseProvider>
		</AuthProvider>
		</LanguageProvider>
	)
}
