import { useLanguage } from '@/contexts/language-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
	Alert,
	Image,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProfileTab() {
	const router = useRouter()
	const { t } = useLanguage()
	const [user, setUser] = useState({
		firstName: 'Алексей',
		lastName: 'Иванов',
		email: 'alexey@example.com',
		avatar:
			'https://ui-avatars.com/api/?name=Алексей+Иванов&background=4CAF50&color=fff',
	})

	const [settings, setSettings] = useState({
		notifications: true,
		darkMode: true,
		autoSync: false, // Отключаем, так как синхронизации нет
		metricSystem: true,
	})

	const [stats, setStats] = useState({
		totalWorkouts: 24,
		totalSets: 156,
		streakDays: 7,
	})

	// Загружаем сохраненные настройки
	useEffect(() => {
		loadSettings()
		loadUserData()
	}, [])

	const loadSettings = async () => {
		try {
			const savedSettings = await AsyncStorage.getItem('@profile_settings')
			if (savedSettings) {
				setSettings(JSON.parse(savedSettings))
			}
		} catch (error) {
			console.error('Failed to load settings:', error)
		}
	}

	const loadUserData = async () => {
		try {
			const savedUser = await AsyncStorage.getItem('@profile_user')
			if (savedUser) {
				setUser(JSON.parse(savedUser))
			}
		} catch (error) {
			console.error('Failed to load user data:', error)
		}
	}

	const saveSettings = async (newSettings: typeof settings) => {
		try {
			await AsyncStorage.setItem(
				'@profile_settings',
				JSON.stringify(newSettings),
			)
		} catch (error) {
			console.error('Failed to save settings:', error)
		}
	}

	const saveUserData = async (newUser: typeof user) => {
		try {
			await AsyncStorage.setItem('@profile_user', JSON.stringify(newUser))
		} catch (error) {
			console.error('Failed to save user data:', error)
		}
	}

	const toggleSetting = (key: string) => {
		const newSettings = {
			...settings,
			[key]: !settings[key as keyof typeof settings],
		}
		setSettings(newSettings)
		saveSettings(newSettings)
	}

	const updateUser = (updates: Partial<typeof user>) => {
		const newUser = { ...user, ...updates }
		setUser(newUser)
		saveUserData(newUser)
	}

	const menuItems = [
		{
			icon: 'person',
			label: 'Редактировать профиль',
			onPress: () => router.push('/(tabs)/profile/edit'),
		},
		{
			icon: 'stats-chart',
			label: 'Статистика',
			onPress: () => router.push('/(tabs)/statistics'),
		},
		{
			icon: 'download',
			label: 'Экспорт данных',
			onPress: () => Alert.alert('Экспорт', 'Экспорт данных в разработке'),
		},
		{
			icon: 'settings',
			label: 'Настройки',
			onPress: () => router.push('/(tabs)/settings'),
		},
		{
			icon: 'help-circle',
			label: 'Помощь',
			onPress: () => router.push('/(tabs)/help'),
		},
		{
			icon: 'shield-checkmark',
			label: 'Конфиденциальность',
			onPress: () => router.push('/(tabs)/privacy'),
		},
		{
			icon: 'document-text',
			label: 'Условия использования',
			onPress: () => router.push('/(tabs)/terms'),
		},
		{
			icon: 'share',
			label: 'Поделиться приложением',
			onPress: () => Alert.alert('Поделиться', 'Поделиться приложением'),
		},
		{
			icon: 'star',
			label: 'Оценить приложение',
			onPress: () => Alert.alert('Оценить', 'Оценить приложение в магазине'),
		},
	]

	const handleEditProfile = () => {
		Alert.prompt(
			'Редактировать имя',
			'Введите ваше имя и фамилию:',
			[
				{ text: 'Отмена', style: 'cancel' },
				{
					text: 'Сохранить',
					onPress: text => {
						if (text) {
							const names = text.split(' ')
							updateUser({
								firstName: names[0] || '',
								lastName: names.slice(1).join(' ') || '',
								avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
									text,
								)}&background=4CAF50&color=fff`,
							})
						}
					},
				},
			],
			'plain-text',
			`${user.firstName} ${user.lastName}`,
		)
	}

	// Цветовая палитра для темной темы
	const colors = {
		background: '#121212',
		surface: '#1E1E1E',
		surfaceLight: '#2A2A2A',
		textPrimary: '#FFFFFF',
		textSecondary: '#B0B0B0',
		textTertiary: '#757575',
		accentGreen: '#4CAF50',
		accentGreenDark: '#388E3C',
		accentGreenLight: '#66BB6A',
		border: '#333333',
		warning: '#FFA000',
		danger: '#EF5350',
		success: '#4CAF50',
	}

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<ScrollView>
				<View style={[styles.header, { backgroundColor: colors.surface }]}>
					<TouchableOpacity onPress={handleEditProfile}>
						<Image
							source={{
								uri: user.avatar,
							}}
							style={styles.avatar}
						/>
					</TouchableOpacity>

					<View style={styles.userInfo}>
						<Text style={[styles.userName, { color: colors.textPrimary }]}>
							{user.firstName} {user.lastName}
						</Text>
						<Text style={[styles.userEmail, { color: colors.textSecondary }]}>
							{user.email}
						</Text>

						<View style={styles.subscriptionStatus}>
							<View
								style={[styles.statusDot, { backgroundColor: colors.success }]}
							/>
							<Text
								style={[styles.statusText, { color: colors.textSecondary }]}
							>
								{t('profile', 'title')}
							</Text>
						</View>
					</View>
				</View>

				<View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
					<View style={styles.statItem}>
						<Text style={[styles.statNumber, { color: colors.accentGreen }]}>
							{stats.totalWorkouts}
						</Text>
						<Text style={[styles.statLabel, { color: colors.textSecondary }]}>
							{t('history', 'workout5')}
						</Text>
					</View>
					<View style={[styles.divider, { backgroundColor: colors.border }]} />
					<View style={styles.statItem}>
						<Text style={[styles.statNumber, { color: colors.accentGreen }]}>
							{stats.totalSets}
						</Text>
						<Text style={[styles.statLabel, { color: colors.textSecondary }]}>
							{t('workout', 'sets')}
						</Text>
					</View>
					<View style={[styles.divider, { backgroundColor: colors.border }]} />
					<View style={styles.statItem}>
						<Text style={[styles.statNumber, { color: colors.accentGreen }]}>
							{stats.streakDays}
						</Text>
						<Text style={[styles.statLabel, { color: colors.textSecondary }]}>
							{t('profile', 'title')}
						</Text>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
						{t('profile', 'notifications')}
					</Text>
					<View
						style={[styles.settingsCard, { backgroundColor: colors.surface }]}
					>
						<View style={styles.settingItem}>
							<View style={styles.settingLeft}>
								<Ionicons
									name='notifications'
									size={22}
									color={colors.accentGreen}
								/>
								<Text
									style={[styles.settingLabel, { color: colors.textPrimary }]}
								>
									{t('profile', 'notifications')}
								</Text>
							</View>
							<Switch
								value={settings.notifications}
								onValueChange={() => toggleSetting('notifications')}
								trackColor={{
									false: colors.border,
									true: colors.accentGreenDark,
								}}
								thumbColor={
									settings.notifications ? colors.accentGreen : '#f4f3f4'
								}
								ios_backgroundColor={colors.border}
							/>
						</View>

						<View style={styles.settingItem}>
							<View style={styles.settingLeft}>
								<Ionicons name='moon' size={22} color={colors.accentGreen} />
								<Text
									style={[styles.settingLabel, { color: colors.textPrimary }]}
								>
									{t('profile', 'syncData')}
								</Text>
							</View>
							<Switch
								value={settings.darkMode}
								onValueChange={() => toggleSetting('darkMode')}
								trackColor={{
									false: colors.border,
									true: colors.accentGreenDark,
								}}
								thumbColor={settings.darkMode ? colors.accentGreen : '#f4f3f4'}
								ios_backgroundColor={colors.border}
							/>
						</View>

						<View style={styles.settingItem}>
							<View style={styles.settingLeft}>
								<Ionicons
									name='speedometer'
									size={22}
									color={colors.accentGreen}
								/>
								<Text
									style={[styles.settingLabel, { color: colors.textPrimary }]}
								>
									{t('profile', 'language')}
								</Text>
							</View>
							<Switch
								value={settings.metricSystem}
								onValueChange={() => toggleSetting('metricSystem')}
								trackColor={{
									false: colors.border,
									true: colors.accentGreenDark,
								}}
								thumbColor={
									settings.metricSystem ? colors.accentGreen : '#f4f3f4'
								}
								ios_backgroundColor={colors.border}
							/>
						</View>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
						{t('profile', 'title')}
					</Text>
					<View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
						{menuItems.map((item, index) => (
							<TouchableOpacity
								key={index}
								style={[styles.menuItem, { borderBottomColor: colors.border }]}
								onPress={item.onPress}
							>
								<View style={styles.menuLeft}>
									<Ionicons
										name={item.icon as any}
										size={22}
										color={colors.accentGreen}
									/>
									<Text
										style={[styles.menuLabel, { color: colors.textPrimary }]}
									>
										{item.label}
									</Text>
								</View>
								<Ionicons
									name='chevron-forward'
									size={20}
									color={colors.textTertiary}
								/>
							</TouchableOpacity>
						))}
					</View>
				</View>

				<TouchableOpacity
					style={[styles.logoutButton, { backgroundColor: colors.surface }]}
					onPress={() => {
						Alert.alert(
							t('profile', 'signOutTitle'),
							t('profile', 'signOutConfirm'),
							[
								{ text: t('common', 'cancel'), style: 'cancel' },
								{
									text: t('common', 'confirm'),
									style: 'destructive',
									onPress: async () => {
										try {
											await AsyncStorage.clear()
											Alert.alert(t('common', 'success'), t('profile', 'syncDone'))
										} catch (error) {
											Alert.alert(t('common', 'error'), t('common', 'unknownError'))
										}
									},
								},
							],
						)
					}}
				>
					<Ionicons name='refresh-circle' size={22} color={colors.warning} />
					<Text style={[styles.logoutText, { color: colors.warning }]}>
						{t('profile', 'signOut')}
					</Text>
				</TouchableOpacity>

				<View style={styles.footer}>
				<Text style={[styles.version, { color: colors.textTertiary }]}>
					v1.0.0
				</Text>
				<Text style={[styles.copyright, { color: colors.textTertiary }]}>
					© 2024 Fitex
				</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#121212',
	},
	header: {
		paddingHorizontal: 10,
		paddingTop: 20,
		paddingBottom: 30,
		flexDirection: 'row',
		alignItems: 'center',
	},
	avatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
		marginRight: 16,
	},
	userInfo: {
		flex: 1,
	},
	userName: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	userEmail: {
		fontSize: 14,
		marginBottom: 8,
	},
	subscriptionStatus: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	statusDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: 6,
	},
	statusText: {
		fontSize: 14,
	},
	statsCard: {
		marginHorizontal: 20,
		marginTop: 20,
		borderRadius: 16,
		padding: 20,
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
	},
	statItem: {
		alignItems: 'center',
	},
	statNumber: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 12,
	},
	divider: {
		width: 1,
		height: 40,
	},
	section: {
		marginTop: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		marginLeft: 20,
		marginBottom: 12,
	},
	settingsCard: {
		marginHorizontal: 20,
		borderRadius: 16,
		paddingHorizontal: 16,
	},
	settingItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#333333',
	},
	settingLeft: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	settingLabel: {
		fontSize: 16,
		marginLeft: 12,
	},
	menuCard: {
		marginHorizontal: 20,
		borderRadius: 16,
		overflow: 'hidden',
	},
	menuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 16,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
	},
	menuLeft: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	menuLabel: {
		fontSize: 16,
		marginLeft: 12,
	},
	logoutButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginHorizontal: 20,
		marginTop: 24,
		marginBottom: 20,
		paddingVertical: 16,
		borderRadius: 16,
	},
	logoutText: {
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 8,
	},
	footer: {
		alignItems: 'center',
		paddingVertical: 20,
		paddingHorizontal: 10,
	},
	version: {
		fontSize: 14,
		marginBottom: 4,
	},
	copyright: {
		fontSize: 12,
	},
})
