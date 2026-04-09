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
					{/* Header */}
					<View style={us.header}>
						<View style={us.grabber} />
						<TouchableOpacity style={us.closeBtn} onPress={closeUpsell} hitSlop={10}>
							<Ionicons name='close' size={18} color='#8E8E93' />
						</TouchableOpacity>
					</View>

					{/* Hero card */}
					<View style={us.heroCard}>
						<View style={us.heroTop}>
							<View style={us.iconWrap}>
								<Ionicons name='diamond' size={22} color='#FFD700' />
							</View>
							{isTrialActive && (
								<View style={us.pill}>
									<Ionicons name='time-outline' size={14} color='#34C759' />
									<Text style={us.pillText}>
										{trialDaysLeft} {t('trial', 'days')}
									</Text>
								</View>
							)}
						</View>

						<Text style={us.title}>
							{isTrialActive
								? `${t('upsell', 'title')} · ${t('upsell', 'titleTrial')}`
								: t('upsell', 'title')}
						</Text>
						<Text style={us.subtitle}>{t('upsell', 'subtitle')}</Text>

						{/* Features grid */}
						<View style={us.featGrid}>
							{([
								{ icon: 'ribbon-outline', key: 'featureRating', color: '#FFD700' },
								{ icon: 'podium-outline', key: 'featureLeaderboard', color: '#FF9500' },
								{ icon: 'cloud-upload-outline', key: 'featureSync', color: '#5AC8FA' },
								{ icon: 'analytics-outline', key: 'featureAnalytics', color: '#AF52DE' },
								{ icon: 'body-outline', key: 'featureRecovery', color: '#34C759' },
							] as const).map(f => (
								<View key={f.icon} style={us.featItem}>
									<View style={[us.featIconWrap, { backgroundColor: `${f.color}18` }]}>
										<Ionicons name={f.icon as any} size={18} color={f.color} />
									</View>
									<Text style={us.featLabel}>{t('upsell', f.key)}</Text>
								</View>
							))}
						</View>
					</View>

					{/* Actions */}
					<View style={us.actions}>
						<TouchableOpacity style={us.ctaBtn} onPress={goToPremium} activeOpacity={0.85}>
							<Ionicons name='card-outline' size={18} color='#fff' />
							<Text style={us.ctaText}>{t('upsell', 'cta')}</Text>
						</TouchableOpacity>

						<TouchableOpacity style={us.skipBtn} onPress={closeUpsell}>
							<Text style={us.skipText}>{t('upsell', 'later')}</Text>
						</TouchableOpacity>
					</View>
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
		paddingTop: 10,
		paddingHorizontal: 16,
		paddingBottom: 18,
		borderTopWidth: 1,
		borderColor: '#2C2C2E',
	},
	header: {
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
	},
	grabber: {
		width: 44,
		height: 5,
		borderRadius: 3,
		backgroundColor: 'rgba(255,255,255,0.18)',
	},
	closeBtn: {
		position: 'absolute',
		right: 6,
		top: 6,
		padding: 10,
		backgroundColor: '#2C2C2E',
		borderRadius: 20,
	},
	heroCard: {
		backgroundColor: '#151518',
		borderRadius: 20,
		padding: 18,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.08)',
	},
	heroTop: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 14,
	},
	iconWrap: {
		width: 44,
		height: 44,
		borderRadius: 14,
		backgroundColor: 'rgba(255,215,0,0.12)',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255,215,0,0.25)',
	},
	pill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: 'rgba(52,199,89,0.12)',
		borderWidth: 1,
		borderColor: 'rgba(52,199,89,0.22)',
	},
	pillText: {
		color: '#34C759',
		fontSize: 12,
		fontWeight: '700',
	},
	title: {
		fontSize: 20,
		fontWeight: '900',
		color: '#FFFFFF',
		marginBottom: 6,
	},
	subtitle: {
		fontSize: 14,
		color: '#8E8E93',
		lineHeight: 20,
		marginBottom: 16,
	},
	featGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
		marginBottom: 2,
		justifyContent: 'center',
	},
	featItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		width: '45%',
	},
	featIconWrap: {
		width: 32,
		height: 32,
		borderRadius: 9,
		alignItems: 'center',
		justifyContent: 'center',
	},
	featLabel: {
		fontSize: 12,
		color: '#FFFFFF',
		fontWeight: '500',
		flex: 1,
	},
	actions: {
		marginTop: 12,
		paddingHorizontal: 2,
	},
	ctaBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		backgroundColor: '#34C759',
		borderRadius: 14,
		paddingVertical: 14,
		paddingHorizontal: 48,
		width: '100%',
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
		alignItems: 'center',
	},
	skipText: {
		color: '#8E8E93',
		fontSize: 14,
	},
})
