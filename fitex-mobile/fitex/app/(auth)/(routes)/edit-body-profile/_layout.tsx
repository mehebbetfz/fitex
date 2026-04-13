import { Stack } from 'expo-router'
import React from 'react'
import { EditBodyProfileProvider } from './edit-body-profile-context'

export default function EditBodyProfileLayout() {
	return (
		<EditBodyProfileProvider>
			<Stack
				screenOptions={{
					headerShown: false,
					animation: 'slide_from_right',
					gestureEnabled: true,
					fullScreenGestureEnabled: true,
				}}
			/>
		</EditBodyProfileProvider>
	)
}
