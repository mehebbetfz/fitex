// app/(tabs)/_layout.tsx
import TemplateSelectionModal from '@/app/modals/template-selection-modal'
import { useLanguage } from '@/contexts/language-context'
import { TemplateExercise, WorkoutTemplate } from '@/scripts/database'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Tabs, useRouter } from 'expo-router'
import { useState } from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TabsLayout() {
	const { bottom } = useSafeAreaInsets()
	const router = useRouter()
	const [showTemplateModal, setShowTemplateModal] = useState(false)
	const { t } = useLanguage()

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
	</>
	)
}
