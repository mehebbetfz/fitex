import { Stack } from 'expo-router'

export default function AuthLayout() {
	// if (!user) {
	// 	return null // Redirect handled in index.tsx
	// }

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name='(tabs)' />
			<Stack.Screen name='(routes)' />
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
