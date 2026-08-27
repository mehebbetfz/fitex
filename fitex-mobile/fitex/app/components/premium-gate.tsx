import { useLanguage } from '@/contexts/language-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useEffect, useRef } from 'react'
import {
	Animated,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const FEATURES = [
	{ key: 'feature1' as const, icon: 'ribbon-outline' as const },
	{ key: 'feature6' as const, icon: 'restaurant-outline' as const },
	{ key: 'feature4' as const, icon: 'podium-outline' as const },
	{ key: 'feature2' as const, icon: 'cloud-upload-outline' as const },
	{ key: 'feature3' as const, icon: 'analytics-outline' as const },
	{ key: 'feature5' as const, icon: 'body-outline' as const },
]

export const PREMIUM_NUDGE_KEY = '@fitex/premium_nudge_at'
export const PREMIUM_NUDGE_INTERVAL_MS = 20 * 60 * 1000

export async function shouldShowPremiumNudge(userId: string): Promise<boolean> {
	try {
		const raw = await AsyncStorage.getItem(PREMIUM_NUDGE_KEY)
		if (!raw) return true
		const [uid, tsRaw] = raw.split('|')
		if (uid !== userId) return true
		const ts = Number(tsRaw)
		if (!Number.isFinite(ts)) return true
		return Date.now() - ts >= PREMIUM_NUDGE_INTERVAL_MS
	} catch {
		return true
	}
}

export async function markPremiumNudgeShown(userId: string): Promise<void> {
	try {
		await AsyncStorage.setItem(PREMIUM_NUDGE_KEY, `${userId}|${Date.now()}`)
	} catch {
		/* ignore */
	}
}

interface Props {
	featureIcon?: string
	featureColor?: string
	/** When set, close uses callback instead of router.back() (modal / overlay). */
	onClose?: () => void
	/** Denser layout so content fits one screen. */
	compact?: boolean
}

export default function PremiumGate({
	featureIcon = 'diamond',
	featureColor = '#E8C547',
	onClose,
	compact = false,
}: Props) {
	const { t } = useLanguage()
	const fade = useRef(new Animated.Value(0)).current
	const rise = useRef(new Animated.Value(12)).current

	useEffect(() => {
		Animated.parallel([
			Animated.timing(fade, { toValue: 1, duration: 320, useNativeDriver: true }),
			Animated.timing(rise, { toValue: 0, duration: 320, useNativeDriver: true }),
		]).start()
	}, [fade, rise])

	const close = () => {
		if (onClose) onClose()
		else router.back()
	}

	const goPaywall = () => {
		onClose?.()
		router.push('/(auth)/trial-paywall' as any)
	}

	const s = compact ? compactStyles : pageStyles

	return (
		<View style={s.root}>
			<LinearGradient
				colors={['#102418', '#0A0A0A', '#0A0A0A']}
				locations={[0, 0.4, 1]}
				style={StyleSheet.absoluteFill}
			/>

			<SafeAreaView style={s.safe} edges={['top', 'left', 'right', 'bottom']}>
				<View style={s.header}>
					<TouchableOpacity onPress={close} style={s.back} hitSlop={12}>
						<Ionicons name='close' size={20} color='rgba(255,255,255,0.7)' />
					</TouchableOpacity>
				</View>

				<Animated.View
					style={[
						s.body,
						{ opacity: fade, transform: [{ translateY: rise }] },
					]}
				>
					<View style={[s.iconCore, { borderColor: `${featureColor}55` }]}>
						<Ionicons name={featureIcon as any} size={compact ? 28 : 36} color={featureColor} />
					</View>

					<Text style={s.kicker}>Fitex Premium</Text>
					<Text style={s.title}>{t('rating', 'premiumGateTitle')}</Text>
					{!compact ? (
						<Text style={s.subtitle}>{t('rating', 'premiumGateSubtitle')}</Text>
					) : null}

					<View style={s.list}>
						{FEATURES.map(f => (
							<View key={f.key} style={s.row}>
								<View style={s.rowIcon}>
									<Ionicons name={f.icon} size={compact ? 15 : 18} color='#34C759' />
								</View>
								<Text style={s.rowText} numberOfLines={compact ? 1 : 2}>
									{t('subscription', f.key)}
								</Text>
								<Ionicons name='checkmark' size={14} color='#34C759' />
							</View>
						))}
					</View>
				</Animated.View>

				<View style={s.footer}>
					<TouchableOpacity style={s.btn} onPress={goPaywall} activeOpacity={0.88}>
						<LinearGradient
							colors={['#3DDB66', '#2FB350']}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={s.btnGrad}
						>
							<Ionicons name='diamond' size={16} color='#06140A' />
							<Text style={s.btnText}>{t('rating', 'premiumGateBtn')}</Text>
						</LinearGradient>
					</TouchableOpacity>
					<TouchableOpacity onPress={close} style={s.skip} hitSlop={10}>
						<Text style={s.skipText}>{t('common', 'cancel')}</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</View>
	)
}

type ModalProps = {
	visible: boolean
	onClose: () => void
	featureIcon?: string
	featureColor?: string
}

/** Full-screen compact premium pitch (food FAB / periodic nudge). */
export function PremiumGateModal({
	visible,
	onClose,
	featureIcon = 'diamond',
	featureColor = '#E8C547',
}: ModalProps) {
	return (
		<Modal
			visible={visible}
			animationType='fade'
			presentationStyle='fullScreen'
			onRequestClose={onClose}
		>
			<PremiumGate
				compact
				onClose={onClose}
				featureIcon={featureIcon}
				featureColor={featureColor}
			/>
		</Modal>
	)
}

const gateBase = {
	root: { flex: 1, backgroundColor: '#0A0A0A' } as const,
	safe: { flex: 1 } as const,
	header: {
		paddingHorizontal: 16,
		paddingTop: 4,
		alignItems: 'flex-end' as const,
	},
	back: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center' as const,
		justifyContent: 'center' as const,
		backgroundColor: 'rgba(255,255,255,0.06)',
	},
	body: {
		flex: 1,
		paddingHorizontal: 24,
		justifyContent: 'center' as const,
		alignItems: 'center' as const,
	},
	iconCore: {
		width: 72,
		height: 72,
		borderRadius: 36,
		alignItems: 'center' as const,
		justifyContent: 'center' as const,
		backgroundColor: 'rgba(10,10,10,0.85)',
		borderWidth: 1,
		marginBottom: 14,
	},
	kicker: {
		fontSize: 11,
		fontWeight: '700' as const,
		letterSpacing: 1.2,
		textTransform: 'uppercase' as const,
		color: '#E8C547',
		marginBottom: 6,
	},
	title: {
		fontSize: 24,
		fontWeight: '800' as const,
		color: '#fff',
		textAlign: 'center' as const,
		letterSpacing: -0.5,
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 14,
		lineHeight: 20,
		color: 'rgba(255,255,255,0.55)',
		textAlign: 'center' as const,
		marginBottom: 18,
		paddingHorizontal: 8,
	},
	list: { width: '100%' as const, gap: 6 },
	row: {
		flexDirection: 'row' as const,
		alignItems: 'center' as const,
		gap: 10,
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 12,
		backgroundColor: 'rgba(255,255,255,0.04)',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.06)',
	},
	rowIcon: {
		width: 30,
		height: 30,
		borderRadius: 8,
		alignItems: 'center' as const,
		justifyContent: 'center' as const,
		backgroundColor: 'rgba(52,199,89,0.12)',
	},
	rowText: {
		flex: 1,
		fontSize: 13,
		fontWeight: '600' as const,
		color: '#F2F2F2',
	},
	footer: {
		paddingHorizontal: 24,
		paddingBottom: 8,
		gap: 6,
	},
	btn: { borderRadius: 16, overflow: 'hidden' as const },
	btnGrad: {
		flexDirection: 'row' as const,
		alignItems: 'center' as const,
		justifyContent: 'center' as const,
		gap: 8,
		paddingVertical: 14,
	},
	btnText: {
		color: '#06140A',
		fontWeight: '800' as const,
		fontSize: 15,
	},
	skip: { alignItems: 'center' as const, paddingVertical: 4 },
	skipText: {
		color: 'rgba(255,255,255,0.4)',
		fontSize: 13,
		fontWeight: '500' as const,
	},
}

const pageStyles = StyleSheet.create(gateBase)

const compactStyles = StyleSheet.create({
	...gateBase,
	body: {
		...gateBase.body,
		paddingHorizontal: 18,
		paddingBottom: 4,
	},
	iconCore: {
		...gateBase.iconCore,
		width: 52,
		height: 52,
		borderRadius: 26,
		marginBottom: 8,
	},
	kicker: {
		...gateBase.kicker,
		fontSize: 10,
		letterSpacing: 1.1,
		marginBottom: 4,
	},
	title: {
		...gateBase.title,
		fontSize: 20,
		marginBottom: 10,
	},
	list: { width: '100%', gap: 4 },
	row: {
		...gateBase.row,
		gap: 8,
		paddingVertical: 7,
		paddingHorizontal: 10,
		borderRadius: 10,
	},
	rowIcon: {
		...gateBase.rowIcon,
		width: 26,
		height: 26,
		borderRadius: 7,
	},
	rowText: {
		...gateBase.rowText,
		fontSize: 12,
	},
	footer: {
		...gateBase.footer,
		paddingHorizontal: 18,
		paddingBottom: 4,
		gap: 4,
	},
	btnGrad: {
		...gateBase.btnGrad,
		paddingVertical: 12,
	},
	btnText: {
		...gateBase.btnText,
		fontSize: 14,
	},
})
