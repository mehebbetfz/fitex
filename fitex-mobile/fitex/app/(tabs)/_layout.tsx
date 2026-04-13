// app/(tabs)/_layout.tsx
import { hasActivePremium, useAuth } from '@/app/contexts/auth-context'
import TemplateSelectionModal from '@/app/modals/template-selection-modal'
import DailyLeadersModal, {
	DAILY_LEADERS_STORAGE_KEY,
	type DailyLeaderRow,
} from '@/components/daily-leaders-modal'
import { HapticTab } from '@/components/haptic-tab'
import { useLanguage } from '@/contexts/language-context'
import { api } from '@/services/api'
import { TemplateExercise, WorkoutTemplate } from '@/scripts/database'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { Tabs, useRouter } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function localTodayKey() {
	return new Date().toLocaleDateString('en-CA')
}

export default function TabsLayout() {
	const { bottom } = useSafeAreaInsets()
	const router = useRouter()
	const { user, isLoading: authLoading } = useAuth()
	const [showTemplateModal, setShowTemplateModal] = useState(false)
	const [dailyModalVisible, setDailyModalVisible] = useState(false)
	const [dailyRows, setDailyRows] = useState<DailyLeaderRow[]>([])
	const dailyFetchInFlight = useRef(false)
	/** null = ещё не измеряли; иначе был ли Premium в прошлом проходе эффекта (для free→premium) */
	const hadPremiumRef = useRef<boolean | null>(null)
	const lastUserIdForLeadersRef = useRef<string | undefined>(undefined)
	const { t } = useLanguage()

	const dismissDailyLeaders = useCallback(async () => {
		if (user?.id) {
			const stamp = `${user.id}|${localTodayKey()}`
			await AsyncStorage.setItem(DAILY_LEADERS_STORAGE_KEY, stamp)
		}
		setDailyModalVisible(false)
	}, [user?.id])

	useEffect(() => {
		if (authLoading) return
		if (!user) {
			hadPremiumRef.current = null
			lastUserIdForLeadersRef.current = undefined
			return
		}

		const prevUserId = lastUserIdForLeadersRef.current
		if (prevUserId !== undefined && prevUserId !== user.id) {
			hadPremiumRef.current = null
		}
		lastUserIdForLeadersRef.current = user.id

		const premiumNow = hasActivePremium(user)
		// Только что оформили Premium: снимаем «уже показали сегодня», чтобы окно открылось в этот же день
		if (hadPremiumRef.current === false && premiumNow) {
			void AsyncStorage.removeItem(DAILY_LEADERS_STORAGE_KEY)
		}
		hadPremiumRef.current = premiumNow

		if (!premiumNow) return
		if (dailyFetchInFlight.current) return
		dailyFetchInFlight.current = true
		let cancelled = false
		;(async () => {
			try {
				const today = localTodayKey()
				const last = await AsyncStorage.getItem(DAILY_LEADERS_STORAGE_KEY)
				if (last === `${user.id}|${today}` || cancelled) return
				const { data } = await api.get('/leaderboard')
				if (cancelled) return
				const raw = (data.entries ?? []) as DailyLeaderRow[]
				if (raw.length === 0) return
				setDailyRows(raw.slice(0, 15))
				setDailyModalVisible(true)
			} catch {
				// сеть / API — не показываем модалку
			} finally {
				dailyFetchInFlight.current = false
			}
		})()
		return () => {
			cancelled = true
			dailyFetchInFlight.current = false
		}
	}, [authLoading, user])

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
					tabBarButton: props => <HapticTab {...props} />,
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
									onPressIn={() => {
										if (Platform.OS !== 'web') {
											void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
										}
									}}
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

		<DailyLeadersModal visible={dailyModalVisible} onClose={dismissDailyLeaders} entries={dailyRows} t={t} />
	</>
	)
}
