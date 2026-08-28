import type { AppColors } from '@/constants/app-theme'
import { useAppTheme } from '@/contexts/theme-context'
import { useMemo, type ReactNode } from 'react'
import {
	Dimensions,
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
	type StyleProp,
	type ViewStyle,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import SheetModalHeader from './sheet-modal-header'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

type LeadingAction = {
	icon: 'arrow-back'
	onPress: () => void
	accessibilityLabel?: string
}

export type AppBottomSheetProps = {
	visible: boolean
	onClose: () => void
	title?: string
	subtitle?: string
	showHandle?: boolean
	leading?: LeadingAction
	trailing?: ReactNode
	children: ReactNode
	/** Wrap body in ScrollView (default when maxHeight is set). */
	scroll?: boolean
	maxHeight?: number
	animationType?: 'slide' | 'fade' | 'none'
	dismissOnBackdrop?: boolean
	sheetStyle?: StyleProp<ViewStyle>
	contentStyle?: StyleProp<ViewStyle>
	keyboardOffset?: number
	/** Extra bottom inset (e.g. keyboard height). */
	bottomInset?: number
}

export default function AppBottomSheet({
	visible,
	onClose,
	title,
	subtitle,
	showHandle = true,
	leading,
	trailing,
	children,
	scroll,
	maxHeight,
	animationType = 'slide',
	dismissOnBackdrop = true,
	sheetStyle,
	contentStyle,
	keyboardOffset = 0,
	bottomInset = 0,
}: AppBottomSheetProps) {
	const { colors: C } = useAppTheme()
	const insets = useSafeAreaInsets()
	const styles = useMemo(() => makeStyles(C), [C])

	const resolvedMaxHeight = maxHeight ?? SCREEN_HEIGHT * 0.88
	const useScroll = scroll ?? !!maxHeight
	const hasHeader = Boolean(title)

	const body = useScroll ? (
		<ScrollView
			style={{ maxHeight: resolvedMaxHeight - (hasHeader ? 72 : 24) }}
			contentContainerStyle={[styles.scrollContent, contentStyle]}
			showsVerticalScrollIndicator={false}
			keyboardShouldPersistTaps='handled'
		>
			{children}
		</ScrollView>
	) : (
		<View style={[styles.body, contentStyle]}>{children}</View>
	)

	return (
		<Modal
			visible={visible}
			transparent
			animationType={animationType}
			onRequestClose={onClose}
		>
			<KeyboardAvoidingView
				style={styles.root}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				keyboardVerticalOffset={keyboardOffset}
			>
				<Pressable
					style={styles.backdrop}
					onPress={dismissOnBackdrop ? onClose : undefined}
					accessibilityRole='button'
					accessibilityLabel='Close'
				/>
				<Pressable
					style={[
						styles.sheet,
						{
							paddingBottom: Math.max(insets.bottom, 16) + bottomInset,
						},
						{ maxHeight: resolvedMaxHeight },
						sheetStyle,
					]}
					onPress={e => e.stopPropagation()}
				>
					{hasHeader ? (
						<SheetModalHeader
							title={title!}
							subtitle={subtitle}
							onClose={onClose}
							showHandle={showHandle}
							leading={leading}
							trailing={trailing}
						/>
					) : showHandle ? (
						<View style={styles.handleOnly}>
							<View style={styles.handle} />
						</View>
					) : null}
					{body}
				</Pressable>
			</KeyboardAvoidingView>
		</Modal>
	)
}

function makeStyles(C: AppColors) {
	return StyleSheet.create({
		root: {
			flex: 1,
			justifyContent: 'flex-end',
		},
		backdrop: {
			...StyleSheet.absoluteFillObject,
			backgroundColor: C.overlay,
		},
		sheet: {
			backgroundColor: C.modalSurface,
			borderTopLeftRadius: 20,
			borderTopRightRadius: 20,
			paddingHorizontal: 16,
			paddingTop: 8,
			borderTopWidth: StyleSheet.hairlineWidth,
			borderColor: C.border,
		},
		handleOnly: {
			alignItems: 'center',
			paddingBottom: 8,
		},
		handle: {
			width: 36,
			height: 4,
			borderRadius: 2,
			backgroundColor: C.border,
		},
		body: {
			paddingBottom: 4,
		},
		scrollContent: {
			paddingBottom: 4,
		},
	})
}
