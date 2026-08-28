import AppBottomSheet from '@/components/ui/app-bottom-sheet'
import type { AppColors } from '@/constants/app-theme'
import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useEffect, useMemo, useRef } from 'react'
import {
	Animated,
	ScrollView,
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
	onClose?: () => void
	compact?: boolean
}

function PremiumGateContent({
	featureIcon = 'diamond',
	featureColor,
	onClose,
	variant,
}: {
	featureIcon?: string
	featureColor?: string
	onClose?: () => void
	variant: 'page' | 'sheet'
}) {
	const { t } = useLanguage()
	const { colors: C } = useAppTheme()
	const accent = featureColor ?? '#E8C547'
	const styles = useMemo(() => makeStyles(C, accent), [C, accent])
	const fade = useRef(new Animated.Value(0)).current
	const rise = useRef(new Animated.Value(14)).current

	useEffect(() => {
		Animated.parallel([
			Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: true }),
			Animated.timing(rise, { toValue: 0, duration: 280, useNativeDriver: true }),
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

	return (
		<Animated.View
			style={[
				variant === 'sheet' ? styles.sheetBody : styles.pageBody,
				{ opacity: fade, transform: [{ translateY: rise }] },
			]}
		>
			<LinearGradient
				colors={[`${accent}33`, `${C.primary}18`, 'transparent']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.heroGlow}
			/>

			<View style={styles.hero}>
				<View style={[styles.iconRing, { borderColor: `${accent}66` }]}>
					<LinearGradient
						colors={[`${accent}40`, `${C.primary}28`]}
						style={styles.iconCore}
					>
						<Ionicons
							name={featureIcon as any}
							size={variant === 'sheet' ? 30 : 36}
							color={accent}
						/>
					</LinearGradient>
				</View>
				<Text style={styles.kicker}>Fitex Premium</Text>
				<Text style={styles.title}>{t('rating', 'premiumGateTitle')}</Text>
				{variant === 'page' ? (
					<Text style={styles.subtitle}>{t('rating', 'premiumGateSubtitle')}</Text>
				) : (
					<Text style={styles.subtitleSheet} numberOfLines={2}>
						{t('rating', 'premiumGateSubtitle')}
					</Text>
				)}
			</View>

			<View style={styles.featureGrid}>
				{FEATURES.map(f => (
					<View key={f.key} style={styles.featureCard}>
						<View style={[styles.featureIcon, { backgroundColor: `${C.primary}18` }]}>
							<Ionicons name={f.icon} size={16} color={C.primary} />
						</View>
						<Text style={styles.featureText} numberOfLines={2}>
							{t('subscription', f.key)}
						</Text>
						<Ionicons name='checkmark-circle' size={16} color={C.primary} />
					</View>
				))}
			</View>

			<View style={styles.actions}>
				<TouchableOpacity style={styles.btn} onPress={goPaywall} activeOpacity={0.88}>
					<LinearGradient
						colors={[C.primary, C.primaryDark]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={styles.btnGrad}
					>
						<Ionicons name='diamond' size={17} color='#06140A' />
						<Text style={styles.btnText}>{t('rating', 'premiumGateBtn')}</Text>
					</LinearGradient>
				</TouchableOpacity>
				<TouchableOpacity onPress={close} style={styles.skip} hitSlop={10}>
					<Text style={styles.skipText}>{t('common', 'cancel')}</Text>
				</TouchableOpacity>
			</View>
		</Animated.View>
	)
}

export default function PremiumGate({
	featureIcon = 'diamond',
	featureColor,
	onClose,
}: Props) {
	const { colors: C } = useAppTheme()
	const styles = useMemo(() => makePageStyles(C), [C])

	return (
		<View style={styles.root}>
			<LinearGradient
				colors={[C.background, C.card, C.background]}
				locations={[0, 0.35, 1]}
				style={StyleSheet.absoluteFill}
			/>
			<SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => (onClose ? onClose() : router.back())}
						style={styles.back}
						hitSlop={12}
					>
						<Ionicons name='close' size={20} color={C.textSecondary} />
					</TouchableOpacity>
				</View>
				<ScrollView
					contentContainerStyle={styles.scroll}
					showsVerticalScrollIndicator={false}
				>
					<PremiumGateContent
						featureIcon={featureIcon}
						featureColor={featureColor}
						onClose={onClose}
						variant='page'
					/>
				</ScrollView>
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

export function PremiumGateModal({
	visible,
	onClose,
	featureIcon = 'diamond',
	featureColor,
}: ModalProps) {
	return (
		<AppBottomSheet
			visible={visible}
			onClose={onClose}
			showHandle
			maxHeight={640}
			scroll
		>
			<PremiumGateContent
				featureIcon={featureIcon}
				featureColor={featureColor}
				onClose={onClose}
				variant='sheet'
			/>
		</AppBottomSheet>
	)
}

function makeStyles(C: AppColors, accent: string) {
	return StyleSheet.create({
		sheetBody: {
			paddingTop: 4,
			paddingBottom: 4,
		},
		pageBody: {
			flexGrow: 1,
			paddingHorizontal: 8,
			paddingBottom: 24,
		},
		heroGlow: {
			position: 'absolute',
			top: -20,
			left: -16,
			right: -16,
			height: 160,
			borderRadius: 24,
		},
		hero: {
			alignItems: 'center',
			marginBottom: 16,
		},
		iconRing: {
			padding: 3,
			borderRadius: 40,
			borderWidth: 1,
			marginBottom: 12,
		},
		iconCore: {
			width: 64,
			height: 64,
			borderRadius: 32,
			alignItems: 'center',
			justifyContent: 'center',
		},
		kicker: {
			fontSize: 11,
			fontWeight: '700',
			letterSpacing: 1.3,
			textTransform: 'uppercase',
			color: accent,
			marginBottom: 6,
		},
		title: {
			fontSize: 22,
			fontWeight: '800',
			color: C.text,
			textAlign: 'center',
			letterSpacing: -0.4,
			marginBottom: 6,
		},
		subtitle: {
			fontSize: 14,
			lineHeight: 20,
			color: C.textSecondary,
			textAlign: 'center',
			paddingHorizontal: 12,
			marginBottom: 4,
		},
		subtitleSheet: {
			fontSize: 13,
			lineHeight: 18,
			color: C.textSecondary,
			textAlign: 'center',
			paddingHorizontal: 8,
		},
		featureGrid: {
			gap: 8,
			marginBottom: 16,
		},
		featureCard: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 10,
			paddingVertical: 10,
			paddingHorizontal: 12,
			borderRadius: 14,
			backgroundColor: C.card,
			borderWidth: 1,
			borderColor: C.border,
		},
		featureIcon: {
			width: 32,
			height: 32,
			borderRadius: 10,
			alignItems: 'center',
			justifyContent: 'center',
		},
		featureText: {
			flex: 1,
			fontSize: 13,
			fontWeight: '600',
			color: C.text,
			lineHeight: 18,
		},
		actions: {
			gap: 6,
		},
		btn: {
			borderRadius: 16,
			overflow: 'hidden',
		},
		btnGrad: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
			paddingVertical: 14,
		},
		btnText: {
			color: '#06140A',
			fontWeight: '800',
			fontSize: 15,
		},
		skip: {
			alignItems: 'center',
			paddingVertical: 6,
		},
		skipText: {
			color: C.textSecondary,
			fontSize: 13,
			fontWeight: '500',
		},
	})
}

function makePageStyles(C: AppColors) {
	return StyleSheet.create({
		root: {
			flex: 1,
			backgroundColor: C.background,
		},
		safe: {
			flex: 1,
		},
		header: {
			paddingHorizontal: 16,
			paddingTop: 4,
			alignItems: 'flex-end',
		},
		back: {
			width: 40,
			height: 40,
			borderRadius: 20,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: C.cardLight,
		},
		scroll: {
			flexGrow: 1,
			paddingHorizontal: 16,
			justifyContent: 'center',
		},
	})
}
