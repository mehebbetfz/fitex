import { useAppTheme } from '@/contexts/theme-context'
import type { AppColors } from '@/constants/app-theme'
import {
	isInAppMealCameraSupported,
	prepareMealPhoto,
} from '@/services/meal-camera'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = {
	visible: boolean
	hint: string
	captureLabel: string
	cancelLabel: string
	permissionBody: string
	onCancel: () => void
	onCaptured: (uri: string) => void
}

type CameraViewType = typeof import('expo-camera').CameraView

export default function MealCameraModal({
	visible,
	hint,
	captureLabel,
	cancelLabel,
	permissionBody,
	onCancel,
	onCaptured,
}: Props) {
	const { colors } = useAppTheme()
	const styles = useMemo(() => makeStyles(colors), [colors])
	const insets = useSafeAreaInsets()

	const [busy, setBusy] = useState(false)
	const [ready, setReady] = useState(false)
	const [permDenied, setPermDenied] = useState(false)
	const [CameraView, setCameraView] = useState<CameraViewType | null>(null)
	const [bootDone, setBootDone] = useState(false)
	const cameraRef = useRef<InstanceType<CameraViewType> | null>(null)
	const inAppNative = isInAppMealCameraSupported()

	useEffect(() => {
		if (!visible) {
			setBusy(false)
			setReady(false)
			setPermDenied(false)
			setCameraView(null)
			setBootDone(false)
			return
		}
		let cancelled = false
		;(async () => {
			if (!inAppNative) {
				if (!cancelled) setBootDone(true)
				return
			}
			try {
				const cam = await import('expo-camera')
				const perm = await cam.Camera.requestCameraPermissionsAsync()
				if (cancelled) return
				if (!perm.granted) {
					setPermDenied(true)
					setBootDone(true)
					return
				}
				setCameraView(() => cam.CameraView)
			} catch {
				if (!cancelled) setPermDenied(true)
			} finally {
				if (!cancelled) setBootDone(true)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [visible, inAppNative])

	const finishWithUri = useCallback(
		async (uri: string) => {
			setBusy(true)
			try {
				const prepared = await prepareMealPhoto(uri)
				onCaptured(prepared)
			} finally {
				setBusy(false)
			}
		},
		[onCaptured],
	)

	const useLive = inAppNative && CameraView != null && !permDenied

	const takeInApp = useCallback(async () => {
		if (!cameraRef.current || busy || !ready) return
		setBusy(true)
		try {
			const photo = await cameraRef.current.takePictureAsync({
				quality: 0.85,
				skipProcessing: false,
				shutterSound: false,
			})
			if (photo?.uri) {
				await finishWithUri(photo.uri)
				return
			}
			setBusy(false)
		} catch {
			setBusy(false)
		}
	}, [busy, ready, finishWithUri])

	const takeSystem = useCallback(async () => {
		if (busy) return
		setBusy(true)
		try {
			const ImagePicker = await import('expo-image-picker')
			const perm = await ImagePicker.requestCameraPermissionsAsync()
			if (!perm.granted) {
				setPermDenied(true)
				setBusy(false)
				return
			}
			const result = await ImagePicker.launchCameraAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				quality: 0.85,
				allowsEditing: false,
			})
			if (result.canceled || !result.assets?.[0]?.uri) {
				setBusy(false)
				return
			}
			await finishWithUri(result.assets[0].uri)
		} catch {
			setBusy(false)
		}
	}, [busy, finishWithUri])

	const shutterDisabled = busy || !bootDone || (useLive && !ready)

	return (
		<Modal
			visible={visible}
			animationType='slide'
			presentationStyle='fullScreen'
			onRequestClose={onCancel}
		>
			<View style={styles.root}>
				{useLive ? (
					<CameraView
						ref={cameraRef}
						style={StyleSheet.absoluteFill}
						facing='back'
						mode='picture'
						onCameraReady={() => setReady(true)}
					/>
				) : (
					<View style={[StyleSheet.absoluteFill, styles.fallbackBg]} />
				)}

				<View
					style={[
						styles.bottom,
						{ paddingBottom: Math.max(16, insets.bottom + 8) },
					]}
				>
					<Text style={styles.hint}>{hint}</Text>
					{permDenied ? (
						<Text style={styles.permText}>{permissionBody}</Text>
					) : null}
					{!bootDone ? (
						<ActivityIndicator color='#fff' style={{ marginBottom: 16 }} />
					) : null}
					<TouchableOpacity
						style={[styles.shutter, shutterDisabled && { opacity: 0.55 }]}
						onPress={() => void (useLive ? takeInApp() : takeSystem())}
						disabled={shutterDisabled}
						activeOpacity={0.85}
						accessibilityLabel={captureLabel}
					>
						{busy ? (
							<ActivityIndicator color='#000' />
						) : (
							<View style={styles.shutterInner} />
						)}
					</TouchableOpacity>
					{bootDone && !useLive && !permDenied ? (
						<Text style={styles.fallbackHint}>{captureLabel}</Text>
					) : null}
					<TouchableOpacity
						style={styles.cancelTextBtn}
						onPress={onCancel}
						disabled={busy}
						hitSlop={12}
						accessibilityLabel={cancelLabel}
					>
						<Text style={styles.cancelText}>{cancelLabel}</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	)
}

function makeStyles(_C: AppColors) {
	return StyleSheet.create({
		root: {
			flex: 1,
			backgroundColor: '#000',
		},
		fallbackBg: {
			backgroundColor: '#1a1a1a',
		},
		bottom: {
			position: 'absolute',
			left: 0,
			right: 0,
			bottom: 0,
			alignItems: 'center',
			paddingHorizontal: 24,
			zIndex: 4,
		},
		hint: {
			color: '#fff',
			fontSize: 15,
			fontWeight: '600',
			textAlign: 'center',
			lineHeight: 21,
			marginBottom: 18,
			textShadowColor: 'rgba(0,0,0,0.65)',
			textShadowOffset: { width: 0, height: 1 },
			textShadowRadius: 4,
			maxWidth: 320,
		},
		permText: {
			color: '#ffb4b0',
			fontSize: 13,
			marginBottom: 10,
			textAlign: 'center',
		},
		shutter: {
			width: 74,
			height: 74,
			borderRadius: 37,
			borderWidth: 4,
			borderColor: '#fff',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: 'rgba(255,255,255,0.15)',
		},
		shutterInner: {
			width: 58,
			height: 58,
			borderRadius: 29,
			backgroundColor: '#fff',
		},
		fallbackHint: {
			marginTop: 10,
			color: 'rgba(255,255,255,0.75)',
			fontSize: 13,
			fontWeight: '500',
		},
		cancelTextBtn: {
			marginTop: 16,
			paddingVertical: 8,
			paddingHorizontal: 16,
		},
		cancelText: {
			color: 'rgba(255,255,255,0.75)',
			fontSize: 16,
			fontWeight: '600',
		},
	})
}
