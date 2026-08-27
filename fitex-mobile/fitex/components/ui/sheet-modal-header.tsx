import type { AppColors } from '@/constants/app-theme'
import { useAppTheme } from '@/contexts/theme-context'
import { Ionicons } from '@expo/vector-icons'
import { useMemo, type ReactNode } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type LeadingAction = {
	icon: 'arrow-back'
	onPress: () => void
	accessibilityLabel?: string
}

type Props = {
	title: string
	subtitle?: string
	/** Shows a close (X) button when provided. */
	onClose?: () => void
	/** Drag handle above the title row (bottom sheets). Default true. */
	showHandle?: boolean
	/** Optional left control (e.g. back inside a multi-step sheet). */
	leading?: LeadingAction
	/** Extra node after the title (badge, etc.). */
	trailing?: ReactNode
}

/**
 * Unified bottom-sheet / modal header:
 * optional handle → title (+ subtitle) → optional close.
 */
export default function SheetModalHeader({
	title,
	subtitle,
	onClose,
	showHandle = true,
	leading,
	trailing,
}: Props) {
	const { colors: C } = useAppTheme()
	const styles = useMemo(() => makeStyles(C), [C])

	return (
		<View style={styles.wrap}>
			{showHandle ? <View style={styles.handle} /> : null}
			<View style={styles.row}>
				{leading ? (
					<TouchableOpacity
						style={styles.iconBtn}
						onPress={leading.onPress}
						hitSlop={10}
						activeOpacity={0.7}
						accessibilityLabel={leading.accessibilityLabel}
					>
						<Ionicons name={leading.icon} size={22} color={C.text} />
					</TouchableOpacity>
				) : null}
				<View style={styles.titleCol}>
					<Text style={styles.title} numberOfLines={1}>
						{title}
					</Text>
					{subtitle ? (
						<Text style={styles.subtitle} numberOfLines={2}>
							{subtitle}
						</Text>
					) : null}
				</View>
				{trailing}
				{onClose ? (
					<TouchableOpacity
						style={styles.iconBtn}
						onPress={onClose}
						hitSlop={12}
						activeOpacity={0.7}
						accessibilityRole='button'
						accessibilityLabel='Close'
					>
						<Ionicons name='close' size={22} color={C.text} />
					</TouchableOpacity>
				) : null}
			</View>
		</View>
	)
}

function makeStyles(C: AppColors) {
	return StyleSheet.create({
		wrap: {
			marginBottom: 10,
		},
		handle: {
			alignSelf: 'center',
			width: 36,
			height: 4,
			borderRadius: 2,
			backgroundColor: C.border,
			marginBottom: 12,
		},
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			minHeight: 36,
			gap: 8,
		},
		titleCol: {
			flex: 1,
			minWidth: 0,
			paddingRight: 4,
		},
		title: {
			fontSize: 18,
			fontWeight: '700',
			color: C.text,
		},
		subtitle: {
			marginTop: 2,
			fontSize: 13,
			fontWeight: '500',
			color: C.textSecondary,
			lineHeight: 18,
		},
		iconBtn: {
			width: 36,
			height: 36,
			borderRadius: 18,
			backgroundColor: C.cardLight,
			alignItems: 'center',
			justifyContent: 'center',
		},
	})
}
