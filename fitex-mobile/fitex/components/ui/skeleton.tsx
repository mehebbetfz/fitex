import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

const DEFAULT_BG = 'rgba(255,255,255,0.08)'

export function useShimmer() {
	const anim = useRef(new Animated.Value(0)).current
	useEffect(() => {
		const loop = Animated.loop(
			Animated.sequence([
				Animated.timing(anim, {
					toValue: 1,
					duration: 750,
					useNativeDriver: true,
				}),
				Animated.timing(anim, {
					toValue: 0,
					duration: 750,
					useNativeDriver: true,
				}),
			]),
		)
		loop.start()
		return () => loop.stop()
	}, [anim])
	return anim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] })
}

export function ShimmerBlock({
	style,
	color = DEFAULT_BG,
}: {
	style?: StyleProp<ViewStyle>
	color?: string
}) {
	const opacity = useShimmer()
	return (
		<Animated.View style={[{ backgroundColor: color, opacity }, style]} />
	)
}

/** Generic full-page list placeholder */
export function PageListSkeleton({
	rows = 6,
	pad = 16,
	rowHeight = 72,
	color = DEFAULT_BG,
}: {
	rows?: number
	pad?: number
	rowHeight?: number
	color?: string
}) {
	return (
		<View style={{ padding: pad, gap: 12 }}>
			{Array.from({ length: rows }).map((_, i) => (
				<View
					key={i}
					style={[
						styles.rowCard,
						{ height: rowHeight, borderColor: color },
					]}
				>
					<ShimmerBlock
						color={color}
						style={{ width: 44, height: 44, borderRadius: 22 }}
					/>
					<View style={{ flex: 1, gap: 8 }}>
						<ShimmerBlock
							color={color}
							style={{ height: 14, width: '62%', borderRadius: 6 }}
						/>
						<ShimmerBlock
							color={color}
							style={{ height: 12, width: '40%', borderRadius: 5 }}
						/>
					</View>
					<ShimmerBlock
						color={color}
						style={{ height: 16, width: 40, borderRadius: 5 }}
					/>
				</View>
			))}
		</View>
	)
}

/** Podium / top section + list (leaderboard-style) */
export function LeaderboardSkeleton({ color = DEFAULT_BG }: { color?: string }) {
	return (
		<View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
			<View style={styles.podium}>
				{[0.72, 1, 0.72].map((scale, i) => (
					<View key={i} style={[styles.podiumCol, { transform: [{ scale }] }]}>
						<ShimmerBlock
							color={color}
							style={{ width: 56, height: 56, borderRadius: 28, marginBottom: 10 }}
						/>
						<ShimmerBlock
							color={color}
							style={{ height: 12, width: 64, borderRadius: 5, marginBottom: 6 }}
						/>
						<ShimmerBlock
							color={color}
							style={{ height: 10, width: 40, borderRadius: 4 }}
						/>
					</View>
				))}
			</View>
			<PageListSkeleton rows={8} pad={0} color={color} />
		</View>
	)
}

/** Card grid / marketplace */
export function CardGridSkeleton({
	cards = 4,
	color = DEFAULT_BG,
}: {
	cards?: number
	color?: string
}) {
	return (
		<View style={{ padding: 16, gap: 12 }}>
			{Array.from({ length: cards }).map((_, i) => (
				<View key={i} style={[styles.blockCard, { borderColor: color }]}>
					<ShimmerBlock
						color={color}
						style={{ height: 18, width: '55%', borderRadius: 6, marginBottom: 10 }}
					/>
					<ShimmerBlock
						color={color}
						style={{ height: 12, width: '80%', borderRadius: 5, marginBottom: 8 }}
					/>
					<ShimmerBlock
						color={color}
						style={{ height: 12, width: '45%', borderRadius: 5 }}
					/>
				</View>
			))}
		</View>
	)
}

/** Membership / pass card */
export function PassCardSkeleton({ color = DEFAULT_BG }: { color?: string }) {
	return (
		<View style={{ padding: 16, gap: 16 }}>
			<ShimmerBlock
				color={color}
				style={{ height: 180, borderRadius: 20, width: '100%' }}
			/>
			<ShimmerBlock
				color={color}
				style={{ height: 16, width: 140, borderRadius: 6 }}
			/>
			{Array.from({ length: 4 }).map((_, i) => (
				<ShimmerBlock
					key={i}
					color={color}
					style={{ height: 52, borderRadius: 12, width: '100%' }}
				/>
			))}
		</View>
	)
}

/** Detail page (workout details, athlete profile) */
export function DetailPageSkeleton({ color = DEFAULT_BG }: { color?: string }) {
	return (
		<View style={{ padding: 16, gap: 14 }}>
			<ShimmerBlock
				color={color}
				style={{ height: 28, width: '70%', borderRadius: 8 }}
			/>
			<ShimmerBlock
				color={color}
				style={{ height: 14, width: '45%', borderRadius: 5 }}
			/>
			<View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
				{[0, 1, 2].map(i => (
					<ShimmerBlock
						key={i}
						color={color}
						style={{ flex: 1, height: 72, borderRadius: 14 }}
					/>
				))}
			</View>
			<ShimmerBlock
				color={color}
				style={{ height: 160, borderRadius: 16, marginTop: 8 }}
			/>
			{Array.from({ length: 4 }).map((_, i) => (
				<ShimmerBlock
					key={i}
					color={color}
					style={{ height: 64, borderRadius: 12 }}
				/>
			))}
		</View>
	)
}

/** Achievements / stats strip + rows */
export function AchievementsSkeleton({ color = DEFAULT_BG }: { color?: string }) {
	return (
		<View style={{ padding: 16, gap: 12 }}>
			<View style={{ flexDirection: 'row', gap: 10 }}>
				{[0, 1, 2].map(i => (
					<ShimmerBlock
						key={i}
						color={color}
						style={{ flex: 1, height: 64, borderRadius: 14 }}
					/>
				))}
			</View>
			{Array.from({ length: 6 }).map((_, i) => (
				<View key={i} style={[styles.rowCard, { borderColor: color }]}>
					<ShimmerBlock
						color={color}
						style={{ width: 48, height: 48, borderRadius: 12 }}
					/>
					<View style={{ flex: 1, gap: 8 }}>
						<ShimmerBlock
							color={color}
							style={{ height: 14, width: '70%', borderRadius: 6 }}
						/>
						<ShimmerBlock
							color={color}
							style={{ height: 10, width: '100%', borderRadius: 4 }}
						/>
					</View>
				</View>
			))}
		</View>
	)
}

/** Subscription / paywall plans */
export function PlansSkeleton({ color = DEFAULT_BG }: { color?: string }) {
	return (
		<View style={{ padding: 20, gap: 14, alignItems: 'center' }}>
			<ShimmerBlock
				color={color}
				style={{ height: 28, width: '60%', borderRadius: 8 }}
			/>
			<ShimmerBlock
				color={color}
				style={{ height: 14, width: '80%', borderRadius: 5, marginBottom: 8 }}
			/>
			{[0, 1].map(i => (
				<ShimmerBlock
					key={i}
					color={color}
					style={{ height: 120, width: '100%', borderRadius: 18 }}
				/>
			))}
			<ShimmerBlock
				color={color}
				style={{ height: 52, width: '100%', borderRadius: 14, marginTop: 8 }}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	rowCard: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		padding: 14,
		borderRadius: 16,
		borderWidth: StyleSheet.hairlineWidth,
		backgroundColor: 'rgba(255,255,255,0.03)',
	},
	blockCard: {
		padding: 16,
		borderRadius: 16,
		borderWidth: StyleSheet.hairlineWidth,
		backgroundColor: 'rgba(255,255,255,0.03)',
	},
	podium: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		justifyContent: 'center',
		gap: 16,
		paddingVertical: 24,
		marginBottom: 8,
	},
	podiumCol: {
		alignItems: 'center',
	},
})
