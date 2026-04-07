// app/(tabs)/_layout.tsx
import TemplateSelectionModal from '@/app/modals/template-selection-modal'
import { useAuth } from '../contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { TemplateExercise, WorkoutTemplate } from '@/scripts/database'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Tabs, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
	Animated,
	Modal,
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const UPSELL_KEY = 'fitex_last_upsell_shown'
const UPSELL_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 hours

export default function TabsLayout() {
	const { bottom } = useSafeAreaInsets()
	const router = useRouter()
	const [showTemplateModal, setShowTemplateModal] = useState(false)
	const [showUpsell, setShowUpsell] = useState(false)
	const { t } = useLanguage()
	const { user, isTrialActive, trialDaysLeft } = useAuth()
	const fadeAnim = useRef(new Animated.Value(0)).current
	const slideAnim = useRef(new Animated.Value(60)).current

	// Show upsell modal once per day for non-premium users
	useEffect(() => {
		if (!user) return
		if (user.isPremium) return

		const check = async () => {
			try {
				const lastShown = await AsyncStorage.getItem(UPSELL_KEY)
				const now = Date.now()
				if (!lastShown || now - Number(lastShown) > UPSELL_INTERVAL_MS) {
					// Delay 3s after app opens so it doesn't feel intrusive
					setTimeout(() => {
						setShowUpsell(true)
						Animated.parallel([
							Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
							Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
						]).start()
					}, 3000)
				}
			} catch { /* ignore */ }
		}

		check()
	}, [user?.id])

	const closeUpsell = async () => {
		Animated.parallel([
			Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
			Animated.timing(slideAnim, { toValue: 60, duration: 200, useNativeDriver: true }),
		]).start(async () => {
			setShowUpsell(false)
			await AsyncStorage.setItem(UPSELL_KEY, String(Date.now()))
		})
	}

	const goToPremium = async () => {
		await closeUpsell()
		router.push('/(auth)/trial-paywall' as any)
	}

	const handleStartWorkout = () => {
		setShowTemplateModal(true)
	}

	const handleSelectTemplate = (
		template: WorkoutTemplate,
		exercises: TemplateExercise[],
	) => {
		setShowTemplateModal(false)
		router.replace({
			pathname: '/workout/create',
			params: {
				templateId: template.id,
				templateName: template.name,
				// Упражнения передаём сериализованными
				templateExercises: JSON.stringify(exercises),
			},
		})
	}

	const handleStartEmpty = () => {
		setShowTemplateModal(false)
		router.replace('/workout/create')
	}

	return (
		<>
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarActiveTintColor: '#34C759',
					tabBarInactiveTintColor: '#8E8E93',

					tabBarStyle: {
						borderTopWidth: 0,
						elevation: 0,
						shadowOpacity: 0,
						height: 50 + bottom,
						paddingBottom: bottom + 8,
						paddingHorizontal: 15,
						position: 'relative',
					},

					tabBarBackground: () => (
						<View style={{ flex: 1 }}>
							<LinearGradient
								colors={['rgba(0, 0, 0, 0.91)', 'rgba(0, 0, 0, 0.89)']}
								start={{ x: 0, y: 0 }}
								end={{ x: 0, y: 1 }}
								style={{
									flex: 1,
									borderTopWidth: 1,
									borderTopColor: 'rgba(255, 255, 255, 0.08)',
								}}
							/>
						</View>
					),

					tabBarLabelStyle: {
						fontSize: 12,
						fontWeight: '500',
						marginTop: Platform.OS === 'ios' ? 0 : 2,
					},
					tabBarIconStyle: { marginBottom: 0 },
					tabBarItemStyle: { paddingVertical: 6 },
				}}
			>
			<Tabs.Screen
				name='index'
				options={{
					title: t('tabs', 'progress'),
						tabBarIcon: ({ color, size }) => (
							<Ionicons name='pie-chart-outline' size={size} color={color} />
						),
					}}
				/>

			<Tabs.Screen
				name='recovery'
				options={{
					title: t('tabs', 'body'),
						tabBarIcon: ({ color, size }) => (
							<Ionicons name='body-outline' size={size} color={color} />
						),
					}}
				/>

				<Tabs.Screen
					name='start-workout'
					options={{
						title: t('workout', 'start'),
						tabBarShowLabel: false,
						tabBarButton: () => (
							<View
								style={{
									flex: 1,
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<TouchableOpacity
									onPress={handleStartWorkout}
									style={{
										top: -25,
										width: 70,
										height: 70,
										borderRadius: 55,
										backgroundColor: '#1b1c1cff',
										alignItems: 'center',
										justifyContent: 'center',
										shadowOffset: { width: 0, height: 4 },
										shadowOpacity: 0.3,
										shadowRadius: 8,
										elevation: 8,
										borderWidth: 2,
										borderColor: 'rgba(255,255,255,0.1)',
									}}
								>
									<Ionicons name='flag' size={30} color='white' />
								</TouchableOpacity>
							</View>
						),
					}}
				/>

			<Tabs.Screen
				name='history'
				options={{
					title: t('tabs', 'history'),
						tabBarIcon: ({ color, size }) => (
							<MaterialIcons name='history' size={size} color={color} />
						),
					}}
				/>

			<Tabs.Screen
				name='profile'
				options={{
					title: t('tabs', 'profile'),
						tabBarIcon: ({ color, size }) => (
							<Ionicons name='person-outline' size={size} color={color} />
						),
					}}
				/>
			</Tabs>

		{/* Модал снаружи Tabs — рендерится поверх всего */}
		<TemplateSelectionModal
			visible={showTemplateModal}
			onClose={() => setShowTemplateModal(false)}
			onSelectTemplate={handleSelectTemplate}
			onStartEmpty={handleStartEmpty}
		/>

		{/* Daily premium upsell modal */}
		<Modal
			visible={showUpsell}
			transparent
			animationType='none'
			statusBarTranslucent
			onRequestClose={closeUpsell}
		>
			<Animated.View style={[us.overlay, { opacity: fadeAnim }]}>
				<TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeUpsell} activeOpacity={1} />
				<Animated.View style={[us.sheet, { transform: [{ translateY: slideAnim }] }]}>
					{/* Close */}
					<TouchableOpacity style={us.closeBtn} onPress={closeUpsell}>
						<Ionicons name='close' size={20} color='#8E8E93' />
					</TouchableOpacity>

					{/* Icon */}
					<View style={us.iconWrap}>
						<Ionicons name='trophy' size={36} color='#FFD700' />
					</View>

					<Text style={us.title}>
						{isTrialActive
							? `${trialDaysLeft} ${t('trial', 'days')} ${t('upsell', 'titleTrial')}`
							: t('upsell', 'title')}
					</Text>
					<Text style={us.subtitle}>{t('upsell', 'subtitle')}</Text>

					{/* Features row */}
					<View style={us.featRow}>
						{[
							{ icon: 'cloud-upload-outline', key: 'featureSync' as const },
							{ icon: 'analytics-outline', key: 'featureAnalytics' as const },
							{ icon: 'body-outline', key: 'featureRecovery' as const },
						].map(f => (
							<View key={f.icon} style={us.featItem}>
								<Ionicons name={f.icon as any} size={22} color='#34C759' />
								<Text style={us.featLabel}>{t('upsell', f.key)}</Text>
							</View>
						))}
					</View>

					<TouchableOpacity style={us.ctaBtn} onPress={goToPremium} activeOpacity={0.85}>
						<Text style={us.ctaText}>{t('upsell', 'cta')}</Text>
					</TouchableOpacity>

					<TouchableOpacity style={us.skipBtn} onPress={closeUpsell}>
						<Text style={us.skipText}>{t('upsell', 'later')}</Text>
					</TouchableOpacity>
				</Animated.View>
			</Animated.View>
		</Modal>
	</>
	)
}

const us = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.65)',
		justifyContent: 'flex-end',
	},
	sheet: {
		backgroundColor: '#1C1C1E',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		padding: 28,
		paddingBottom: 40,
		alignItems: 'center',
		borderTopWidth: 1,
		borderColor: '#2C2C2E',
	},
	closeBtn: {
		position: 'absolute',
		top: 16,
		right: 16,
		padding: 6,
		backgroundColor: '#2C2C2E',
		borderRadius: 20,
	},
	iconWrap: {
		width: 72,
		height: 72,
		borderRadius: 36,
		backgroundColor: 'rgba(255,215,0,0.12)',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 16,
		borderWidth: 1,
		borderColor: 'rgba(255,215,0,0.25)',
	},
	title: {
		fontSize: 22,
		fontWeight: '800',
		color: '#FFFFFF',
		textAlign: 'center',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 14,
		color: '#8E8E93',
		textAlign: 'center',
		lineHeight: 20,
		marginBottom: 24,
		paddingHorizontal: 8,
	},
	featRow: {
		flexDirection: 'row',
		gap: 24,
		marginBottom: 28,
	},
	featItem: {
		alignItems: 'center',
		gap: 6,
	},
	featLabel: {
		fontSize: 11,
		color: '#8E8E93',
		fontWeight: '500',
	},
	ctaBtn: {
		backgroundColor: '#34C759',
		borderRadius: 14,
		paddingVertical: 14,
		paddingHorizontal: 48,
		width: '100%',
		alignItems: 'center',
		shadowColor: '#34C759',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.35,
		shadowRadius: 12,
		elevation: 8,
		marginBottom: 12,
	},
	ctaText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '700',
	},
	skipBtn: {
		paddingVertical: 8,
	},
	skipText: {
		color: '#8E8E93',
		fontSize: 14,
	},
})
