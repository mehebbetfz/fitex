import { useLanguage } from '@/contexts/language-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useEffect, useRef } from 'react'
import {
	Animated,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const FEATURES = [
	{ key: 'feature1' as const, icon: 'ribbon-outline' as const },
	{ key: 'feature4' as const, icon: 'podium-outline' as const },
	{ key: 'feature2' as const, icon: 'cloud-upload-outline' as const },
	{ key: 'feature3' as const, icon: 'analytics-outline' as const },
	{ key: 'feature5' as const, icon: 'body-outline' as const },
]

interface Props {
	featureIcon?: string
	featureColor?: string
}

export default function PremiumGate({
	featureIcon = 'diamond',
	featureColor = '#E8C547',
}: Props) {
	const { t } = useLanguage()
	const fade = useRef(new Animated.Value(0)).current
	const rise = useRef(new Animated.Value(18)).current
	const pulse = useRef(new Animated.Value(1)).current

	useEffect(() => {
		Animated.parallel([
			Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }),
			Animated.timing(rise, { toValue: 0, duration: 420, useNativeDriver: true }),
		]).start()
		Animated.loop(
			Animated.sequence([
				Animated.timing(pulse, { toValue: 1.06, duration: 1400, useNativeDriver: true }),
				Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
			]),
		).start()
	}, [fade, rise, pulse])

	return (
		<View style={s.root}>
			<LinearGradient
				colors={['#102418', '#0A0A0A', '#0A0A0A']}
				locations={[0, 0.42, 1]}
				style={StyleSheet.absoluteFill}
			/>
			<View style={s.glowTop} />
			<View style={s.glowBottom} />

			<SafeAreaView style={s.safe} edges={['top', 'left', 'right', 'bottom']}>
				<View style={s.header}>
					<TouchableOpacity onPress={() => router.back()} style={s.back} hitSlop={12}>
						<Ionicons name='close' size={22} color='rgba(255,255,255,0.7)' />
					</TouchableOpacity>
				</View>

				<Animated.View
					style={[
						s.body,
						{ opacity: fade, transform: [{ translateY: rise }] },
					]}
				>
					<Animated.View style={{ transform: [{ scale: pulse }] }}>
						<LinearGradient
							colors={['rgba(232,197,71,0.28)', 'rgba(52,199,89,0.12)', 'transparent']}
							style={s.iconRing}
						>
							<View style={[s.iconCore, { borderColor: `${featureColor}55` }]}>
								<Ionicons name={featureIcon as any} size={40} color={featureColor} />
							</View>
						</LinearGradient>
					</Animated.View>

					<Text style={s.kicker}>Fitex Premium</Text>
					<Text style={s.title}>{t('rating', 'premiumGateTitle')}</Text>
					<Text style={s.subtitle}>{t('rating', 'premiumGateSubtitle')}</Text>

					<View style={s.list}>
						{FEATURES.map(f => (
							<View key={f.key} style={s.row}>
								<View style={s.rowIcon}>
									<Ionicons name={f.icon} size={18} color='#34C759' />
								</View>
								<Text style={s.rowText}>{t('subscription', f.key)}</Text>
								<Ionicons name='checkmark' size={16} color='#34C759' />
							</View>
						))}
					</View>
				</Animated.View>

				<View style={s.footer}>
					<TouchableOpacity
						style={s.btn}
						onPress={() => router.push('/(auth)/trial-paywall' as any)}
						activeOpacity={0.88}
					>
						<LinearGradient
							colors={['#3DDB66', '#2FB350']}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={s.btnGrad}
						>
							<Ionicons name='diamond' size={18} color='#06140A' />
							<Text style={s.btnText}>{t('rating', 'premiumGateBtn')}</Text>
						</LinearGradient>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => router.back()} style={s.skip} hitSlop={10}>
						<Text style={s.skipText}>{t('common', 'cancel')}</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</View>
	)
}

const s = StyleSheet.create({
	root: { flex: 1, backgroundColor: '#0A0A0A' },
	safe: { flex: 1 },
	glowTop: {
		position: 'absolute',
		top: -80,
		alignSelf: 'center',
		width: 280,
		height: 280,
		borderRadius: 140,
		backgroundColor: 'rgba(52,199,89,0.14)',
	},
	glowBottom: {
		position: 'absolute',
		bottom: 40,
		right: -60,
		width: 200,
		height: 200,
		borderRadius: 100,
		backgroundColor: 'rgba(232,197,71,0.06)',
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
		backgroundColor: 'rgba(255,255,255,0.06)',
	},
	body: {
		flex: 1,
		paddingHorizontal: 24,
		justifyContent: 'center',
		alignItems: 'center',
	},
	iconRing: {
		width: 112,
		height: 112,
		borderRadius: 56,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 22,
	},
	iconCore: {
		width: 84,
		height: 84,
		borderRadius: 42,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(10,10,10,0.85)',
		borderWidth: 1,
	},
	kicker: {
		fontSize: 12,
		fontWeight: '700',
		letterSpacing: 1.4,
		textTransform: 'uppercase',
		color: '#E8C547',
		marginBottom: 8,
	},
	title: {
		fontSize: 28,
		fontWeight: '800',
		color: '#fff',
		textAlign: 'center',
		letterSpacing: -0.6,
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 15,
		lineHeight: 22,
		color: 'rgba(255,255,255,0.55)',
		textAlign: 'center',
		marginBottom: 28,
		paddingHorizontal: 8,
	},
	list: {
		width: '100%',
		gap: 8,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		paddingVertical: 12,
		paddingHorizontal: 14,
		borderRadius: 14,
		backgroundColor: 'rgba(255,255,255,0.04)',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.06)',
	},
	rowIcon: {
		width: 34,
		height: 34,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(52,199,89,0.12)',
	},
	rowText: {
		flex: 1,
		fontSize: 14,
		fontWeight: '600',
		color: '#F2F2F2',
	},
	footer: {
		paddingHorizontal: 24,
		paddingBottom: 12,
		gap: 10,
	},
	btn: {
		borderRadius: 18,
		overflow: 'hidden',
	},
	btnGrad: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		paddingVertical: 16,
	},
	btnText: {
		color: '#06140A',
		fontWeight: '800',
		fontSize: 16,
		letterSpacing: 0.2,
	},
	skip: { alignItems: 'center', paddingVertical: 6 },
	skipText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '500' },
})
