import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs'
import { PlatformPressable } from '@react-navigation/elements'
import * as Haptics from 'expo-haptics'
import React from 'react'
import { Platform } from 'react-native'

/** Таб в нижней панели: лёгкий haptic при нажатии (iOS / Android). */
export const HapticTab = React.forwardRef<typeof PlatformPressable, BottomTabBarButtonProps>(
	function HapticTab(props, ref) {
		return (
			<PlatformPressable
				ref={ref}
				{...props}
				onPressIn={ev => {
					if (Platform.OS !== 'web') {
						void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
					}
					props.onPressIn?.(ev)
				}}
			/>
		)
	},
)
