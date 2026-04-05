import { useLanguage } from '@/contexts/language-context'
import { mains } from '@/constants/images'
import { Ionicons } from '@expo/vector-icons'
import * as AppleAuthentication from 'expo-apple-authentication'
import { Image } from 'expo-image'
import React, { useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../contexts/auth-context'

// Цветовая схема из history.tsx
const COLORS = {
	primary: '#34C759',
	background: '#121212',
	card: '#1C1C1E',
	border: '#2C2C2E',
	text: '#FFFFFF',
	textSecondary: '#8E8E93',
	accent: '#FF9500',
	google: '#4285F4', // оставляем оригинальный цвет Google, но можно и primary
} as const

export default function LoginScreen() {
	const { signInWithGoogle, signInWithApple } = useAuth()
	const { t } = useLanguage()
	const [loading, setLoading] = useState<'google' | 'apple' | null>(null)

	const handleGoogle = async () => {
		setLoading('google')
		try {
			await signInWithGoogle()
		} catch (error: any) {
			Alert.alert(t('common', 'error'), error.message)
		} finally {
			setLoading(null)
		}
	}

	const handleApple = async () => {
		setLoading('apple')
		try {
			await signInWithApple()
		} catch (error: any) {
			Alert.alert(t('common', 'error'), error.message)
		} finally {
			setLoading(null)
		}
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Логотип и приветствие */}
			<View style={styles.header}>
				<Image style={{ width: 300, height: 300 }} source={mains.logo} />
				<Text style={styles.subtitle}>{t('login', 'subtitle')}</Text>
			</View>

			{/* Карточка с кнопками входа */}
			<View style={styles.card}>
				{/* Кнопка Google */}
				<TouchableOpacity
					style={[styles.button, styles.googleButton]}
					onPress={handleGoogle}
					disabled={loading !== null}
					activeOpacity={0.8}
				>
					{loading === 'google' ? (
						<ActivityIndicator color={COLORS.text} />
					) : (
						<>
							<Ionicons name='logo-google' size={20} color={COLORS.text} />
							<Text style={styles.buttonText}>{t('login', 'signInGoogle')}</Text>
						</>
					)}
				</TouchableOpacity>

				{/* Кнопка Apple (только iOS) */}
				{Platform.OS === 'ios' && (
					<View style={styles.appleButtonWrapper}>
						{loading === 'apple' ? (
							<View
								style={{
									...styles.button,
									...styles.appleFallback,
									marginBottom: 0,
								}}
							>
								<ActivityIndicator color={COLORS.text} />
							</View>
						) : (
							<AppleAuthentication.AppleAuthenticationButton
								onPress={handleApple}
								buttonType={
									AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
								}
								buttonStyle={
									AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
								}
								cornerRadius={12}
								style={styles.appleButton}
							/>
						)}
					</View>
				)}
			</View>

			{/* Нижний текст с условиями */}
			<Text style={styles.termsText}>{t('login', 'terms')}</Text>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	header: {
		alignItems: 'center',
		marginBottom: 40,
	},
	logoContainer: {
		width: 100,
		height: 100,
		borderRadius: 30,
		backgroundColor: COLORS.card,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 16,
		borderWidth: 2,
		borderColor: COLORS.primary,
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.3,
		shadowRadius: 10,
		elevation: 10,
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		color: COLORS.text,
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: COLORS.textSecondary,
	},
	card: {
		backgroundColor: COLORS.card,
		borderRadius: 24,
		padding: 24,
		width: '100%',
		maxWidth: 400,
		borderWidth: 1,
		borderColor: COLORS.border,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderRadius: 12,
		marginBottom: 12,
		gap: 8,
	},
	googleButton: {
		backgroundColor: COLORS.google,
	},
	buttonText: {
		color: COLORS.text,
		fontSize: 16,
		fontWeight: '600',
	},
	appleButtonWrapper: {},
	appleButton: {
		width: '100%',
		height: 50,
	},
	appleFallback: {
		backgroundColor: '#000',
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
	},
	divider: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 20,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: COLORS.border,
	},
	dividerText: {
		color: COLORS.textSecondary,
		paddingHorizontal: 10,
		fontSize: 14,
	},
	guestButton: {
		paddingVertical: 12,
		alignItems: 'center',
	},
	guestButtonText: {
		color: COLORS.primary,
		fontSize: 16,
		fontWeight: '500',
	},
	termsText: {
		color: COLORS.textSecondary,
		fontSize: 12,
		textAlign: 'center',
		marginTop: 30,
		paddingHorizontal: 20,
	},
})
