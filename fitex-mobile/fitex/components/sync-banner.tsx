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
 * Тонкий баннер сверху. Анимации только через native driver,
 * чтобы не нагружать JS-поток во время синка.
 */
export default function SyncBanner() {
	const { sync } = useSyncContext()
	const { top } = useSafeAreaInsets()

	const slideY = useRef(new Animated.Value(-80)).current
	const pulse = useRef(new Animated.Value(1)).current
	const barPulse = useRef(new Animated.Value(0.35)).current

	const isVisible = sync.phase !== 'idle'
	const isFinished = sync.phase === 'done' || sync.phase === 'error'
	const accentColor = PHASE_COLOR[sync.phase] ?? '#34C759'

	useEffect(() => {
		Animated.spring(slideY, {
			toValue: isVisible ? 0 : -(top + 60),
			useNativeDriver: true,
			tension: 65,
			friction: 11,
		}).start()
	}, [isVisible, slideY, top])

	useEffect(() => {
		if (isFinished || !isVisible) {
			pulse.setValue(1)
			barPulse.setValue(1)
			return
		}
		const dotLoop = Animated.loop(
			Animated.sequence([
				Animated.timing(pulse, {
					toValue: 0.25,
					duration: 550,
					useNativeDriver: true,
				}),
				Animated.timing(pulse, {
					toValue: 1,
					duration: 550,
					useNativeDriver: true,
				}),
			]),
		)
		const barLoop = Animated.loop(
			Animated.sequence([
				Animated.timing(barPulse, {
					toValue: 1,
					duration: 900,
					useNativeDriver: true,
				}),
				Animated.timing(barPulse, {
					toValue: 0.35,
					duration: 900,
					useNativeDriver: true,
				}),
			]),
		)
		dotLoop.start()
		barLoop.start()
		return () => {
			dotLoop.stop()
			barLoop.stop()
		}
	}, [isFinished, isVisible, pulse, barPulse])

	return (
		<Animated.View
			style={[
				styles.wrapper,
				{ paddingTop: top, transform: [{ translateY: slideY }] },
			]}
			pointerEvents='none'
		>
			<Animated.View
				style={[
					styles.progressBar,
					{
						backgroundColor: accentColor,
						opacity: isFinished ? 1 : barPulse,
						transform: [{ scaleX: isFinished ? 1 : 1 }],
					},
				]}
			/>

			<View style={styles.row}>
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
		right: 0,
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
