// app/components/sync-banner.tsx
import { useSyncContext } from '@/app/contexts/sync-context'
import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const PHASE_COLOR: Record<string, string> = {
	idle: 'transparent',
	connecting: '#FF9500',
	uploading: '#34C759',
	downloading: '#007AFF',
	done: '#34C759',
	error: '#FF3B30',
}

/**
 * Тонкий баннер, который выезжает сверху во время синхронизации.
 * Добавь один раз в корневой layout, СНАРУЖИ любых ScrollView.
 *
 * Пример:
 *   <SafeAreaProvider>
 *     <SyncBanner />          ← здесь
 *     <RootLayoutContent />
 *   </SafeAreaProvider>
 */
export default function SyncBanner() {
	const { sync } = useSyncContext()
	const { top } = useSafeAreaInsets()

	const slideY = useRef(new Animated.Value(-80)).current
	const progressAnim = useRef(new Animated.Value(0)).current
	const pulse = useRef(new Animated.Value(1)).current

	const isVisible = sync.phase !== 'idle'
	const isFinished = sync.phase === 'done' || sync.phase === 'error'
	const accentColor = PHASE_COLOR[sync.phase] ?? '#34C759'

	// Slide in / out
	useEffect(() => {
		Animated.spring(slideY, {
			toValue: isVisible ? 0 : -(top + 60),
			useNativeDriver: true,
			tension: 65,
			friction: 11,
		}).start()
	}, [isVisible])

	// Progress bar fill
	useEffect(() => {
		Animated.timing(progressAnim, {
			toValue: sync.progress / 100,
			duration: 380,
			useNativeDriver: false,
		}).start()
	}, [sync.progress])

	// Pulsing dot while actively syncing
	useEffect(() => {
		if (isFinished || !isVisible) {
			pulse.setValue(1)
			return
		}
		const loop = Animated.loop(
			Animated.sequence([
				Animated.timing(pulse, { toValue: 0.25, duration: 550, useNativeDriver: true }),
				Animated.timing(pulse, { toValue: 1, duration: 550, useNativeDriver: true }),
			]),
		)
		loop.start()
		return () => loop.stop()
	}, [isFinished, isVisible])

	return (
		<Animated.View
			style={[
				styles.wrapper,
				{ paddingTop: top, transform: [{ translateY: slideY }] },
			]}
			pointerEvents='none'
		>
			{/* Thin progress line at the bottom edge of the banner */}
			<Animated.View
				style={[
					styles.progressBar,
					{
						backgroundColor: accentColor,
						width: progressAnim.interpolate({
							inputRange: [0, 1],
							outputRange: ['0%', '100%'],
						}),
					},
				]}
			/>

			<View style={styles.row}>
				{/* Status dot */}
				<Animated.View
					style={[styles.dot, { backgroundColor: accentColor, opacity: pulse }]}
				/>

				<Text style={styles.label} numberOfLines={1}>
					{sync.message}
				</Text>

				{sync.phase === 'done' && (
					<Text style={[styles.badge, { color: accentColor }]}>✓</Text>
				)}
				{sync.phase === 'error' && (
					<Text style={[styles.badge, { color: accentColor }]}>✕</Text>
				)}
			</View>
		</Animated.View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		zIndex: 9999,
		backgroundColor: '#1C1C1E',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: 'rgba(255,255,255,0.1)',
		overflow: 'hidden',
		// Subtle shadow so it floats above content
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.35,
		shadowRadius: 6,
		elevation: 8,
	},
	progressBar: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		height: 2,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 10,
		gap: 8,
	},
	dot: {
		width: 7,
		height: 7,
		borderRadius: 3.5,
		flexShrink: 0,
	},
	label: {
		flex: 1,
		fontSize: 13,
		fontWeight: '500',
		color: '#FFFFFF',
		letterSpacing: 0.1,
	},
	badge: {
		fontSize: 14,
		fontWeight: '700',
		flexShrink: 0,
	},
})