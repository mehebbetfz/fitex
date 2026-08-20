// app/_layout.tsx
import { SyncProvider } from '@/app/contexts/sync-context'
import { ErrorBoundary } from '@/components/error-boundary'
import OtaUpdateGate from '@/components/ota-update-gate'
import SyncBanner from '@/components/sync-banner'
import { LanguageProvider } from '@/contexts/language-context'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from './contexts/auth-context'
import { DatabaseProvider } from './contexts/database-context'
import { SyncInitializer } from './contexts/sync-initializer'

SplashScreen.preventAutoHideAsync().catch(() => {})

function RootLayoutContent() {
	useEffect(() => {
		// Не ждём OTA и не reload — иначе при битом апдейте «закрывается» после splash
		const t = setTimeout(() => {
			SplashScreen.hideAsync().catch(() => {})
		}, 400)
		return () => clearTimeout(t)
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
		<ErrorBoundary>
			<LanguageProvider>
				<AuthProvider>
					<DatabaseProvider>
						<SyncProvider>
							<SyncInitializer />
							<SafeAreaProvider>
								<SyncBanner />
								<OtaUpdateGate />
								<RootLayoutContent />
							</SafeAreaProvider>
						</SyncProvider>
					</DatabaseProvider>
				</AuthProvider>
			</LanguageProvider>
		</ErrorBoundary>
	)
}
