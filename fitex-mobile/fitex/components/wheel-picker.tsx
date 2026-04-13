import React, { useCallback, useEffect, useRef } from 'react'
import {
	NativeScrollEvent,
	NativeSyntheticEvent,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native'

const ITEM_HEIGHT = 54
const VISIBLE_ROWS = 5
export const WHEEL_PICKER_LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS

type Props = {
	values: readonly string[]
	selectedValue: string
	onValueChange: (v: string) => void
	formatLabel: (v: string) => string
	/** Remount or bump when parent step changes so scroll syncs */
	syncKey?: string | number
}

export function WheelPicker({
	values,
	selectedValue,
	onValueChange,
	formatLabel,
	syncKey = 0,
}: Props) {
	const pad = (WHEEL_PICKER_LIST_HEIGHT - ITEM_HEIGHT) / 2
	const scrollRef = useRef<ScrollView>(null)

	const indexOfValue = useCallback(
		(v: string) => {
			const i = values.indexOf(v)
			return i >= 0 ? i : 0
		},
		[values],
	)

	const scrollToIndex = useCallback(
		(i: number, animated: boolean) => {
			const y = Math.max(0, Math.min(i, values.length - 1)) * ITEM_HEIGHT
			scrollRef.current?.scrollTo({ y, animated })
		},
		[values.length],
	)

	useEffect(() => {
		const i = indexOfValue(selectedValue)
		requestAnimationFrame(() => scrollToIndex(i, false))
		// eslint-disable-next-line react-hooks/exhaustive-deps -- sync only on syncKey / mount
	}, [syncKey])

	const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
		const y = e.nativeEvent.contentOffset.y
		let i = Math.round(y / ITEM_HEIGHT)
		i = Math.max(0, Math.min(values.length - 1, i))
		onValueChange(values[i])
	}

	return (
		<View style={styles.card} key={String(syncKey)}>
			<View style={styles.cardInner}>
				<ScrollView
					ref={scrollRef}
					showsVerticalScrollIndicator={false}
					snapToInterval={ITEM_HEIGHT}
					decelerationRate='fast'
					snapToAlignment='start'
					bounces={false}
					nestedScrollEnabled
					contentContainerStyle={{ paddingTop: pad, paddingBottom: pad }}
					style={styles.list}
					onMomentumScrollEnd={onMomentumScrollEnd}
				>
					{values.map((item, i) => (
						<View key={`${item}-${i}`} style={styles.item}>
							<Text style={styles.itemText} numberOfLines={1}>
								{formatLabel(item)}
							</Text>
						</View>
					))}
				</ScrollView>
				<View pointerEvents='none' style={styles.selectionOverlay}>
					<View style={styles.selectionFrame} />
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 22,
		overflow: 'hidden',
		backgroundColor: '#141416',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.06)',
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 10 },
				shadowOpacity: 0.35,
				shadowRadius: 20,
			},
			android: { elevation: 8 },
		}),
	},
	cardInner: {
		position: 'relative',
		height: WHEEL_PICKER_LIST_HEIGHT,
	},
	list: { flexGrow: 0, height: WHEEL_PICKER_LIST_HEIGHT },
	item: {
		height: ITEM_HEIGHT,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 12,
	},
	itemText: {
		fontSize: 22,
		fontWeight: '600',
		color: '#FFF',
		textAlign: 'center',
		letterSpacing: 0.2,
	},
	selectionOverlay: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		paddingHorizontal: 18,
	},
	selectionFrame: {
		height: ITEM_HEIGHT,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: 'rgba(52, 199, 89, 0.5)',
		backgroundColor: 'rgba(52, 199, 89, 0.08)',
	},
})
