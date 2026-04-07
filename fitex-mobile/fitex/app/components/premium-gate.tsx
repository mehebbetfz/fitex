import { useLanguage } from '@/contexts/language-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const FEATURES = [
	{ icon: 'ribbon-outline',        color: '#FFD700' },
	{ icon: 'podium-outline',         color: '#FF9500' },
	{ icon: 'cloud-upload-outline',   color: '#5AC8FA' },
	{ icon: 'analytics-outline',      color: '#AF52DE' },
	{ icon: 'body-outline',           color: '#34C759' },
] as const

interface Props {
	featureIcon?: string
	featureColor?: string
}

export default function PremiumGate({ featureIcon = 'trophy', featureColor = '#FFD700' }: Props) {
	const { t } = useLanguage()

	return (
		<SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
			<View style={s.header}>
				<TouchableOpacity onPress={() => router.back()} style={s.back}>
					<Ionicons name='chevron-back' size={26} color='#fff' />
				</TouchableOpacity>
			</View>

			<View style={s.container}>
				<View style={[s.iconWrap, { borderColor: `${featureColor}40`, backgroundColor: `${featureColor}12` }]}>
					<Ionicons name={featureIcon as any} size={52} color={featureColor} />
				</View>

				<Text style={s.title}>{t('rating', 'premiumGateTitle')}</Text>
				<Text style={s.subtitle}>{t('rating', 'premiumGateSubtitle')}</Text>

				{/* Mini feature grid */}
				<View style={s.grid}>
					{([
						{ key: 'feature1' as const, icon: 'ribbon-outline',       color: '#FFD700' },
						{ key: 'feature4' as const, icon: 'podium-outline',        color: '#FF9500' },
						{ key: 'feature2' as const, icon: 'cloud-upload-outline',  color: '#5AC8FA' },
						{ key: 'feature3' as const, icon: 'analytics-outline',     color: '#AF52DE' },
						{ key: 'feature5' as const, icon: 'body-outline',          color: '#34C759' },
					]).map(f => (
						<View key={f.icon} style={s.featItem}>
							<View style={[s.featIcon, { backgroundColor: `${f.color}18` }]}>
								<Ionicons name={f.icon as any} size={16} color={f.color} />
							</View>
							<Text style={s.featLabel}>{t('subscription', f.key)}</Text>
						</View>
					))}
				</View>

				<TouchableOpacity
					style={s.btn}
					onPress={() => router.push('/(auth)/trial-paywall' as any)}
					activeOpacity={0.85}
				>
					<Ionicons name='diamond' size={18} color='#000' />
					<Text style={s.btnText}>{t('rating', 'premiumGateBtn')}</Text>
				</TouchableOpacity>

				<TouchableOpacity onPress={() => router.back()} style={s.skip}>
					<Text style={s.skipText}>{t('common', 'cancel')}</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	)
}

const s = StyleSheet.create({
	safe: { flex: 1, backgroundColor: '#121212' },
	header: { paddingHorizontal: 12, paddingTop: 4 },
	back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
	container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
	iconWrap: {
		width: 96, height: 96, borderRadius: 26,
		alignItems: 'center', justifyContent: 'center',
		borderWidth: 1.5, marginBottom: 20,
	},
	title: { fontSize: 24, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 10 },
	subtitle: { fontSize: 14, color: '#8E8E93', textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 8 },
	grid: {
		width: '100%', gap: 8, marginBottom: 28,
	},
	featItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
	featIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
	featLabel: { fontSize: 14, color: '#fff', fontWeight: '500', flex: 1 },
	btn: {
		flexDirection: 'row', alignItems: 'center', gap: 8,
		backgroundColor: '#FFD700', borderRadius: 16,
		paddingHorizontal: 32, paddingVertical: 15,
		width: '100%', justifyContent: 'center', marginBottom: 12,
	},
	btnText: { color: '#000', fontWeight: '800', fontSize: 16 },
	skip: { paddingVertical: 8 },
	skipText: { color: '#8E8E93', fontSize: 14 },
})
