import { useAuth } from '@/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const C = {
	primary: '#34C759',
	background: '#121212',
	card: '#1C1C1E',
	border: '#2C2C2E',
	text: '#FFFFFF',
	subtext: '#8E8E93',
	error: '#FF453A',
	inputBg: '#2C2C2E',
	orange: '#FF9500',
} as const

type Screen = 'login' | 'forgot' | 'reset'

export default function EmailLoginScreen() {
	const { loginWithEmail, requestPasswordReset, resetPassword, setPendingVerificationEmail } = useAuth()
	const { t } = useLanguage()

	const [screen, setScreen] = useState<Screen>('login')

	// Login state
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [loading, setLoading] = useState(false)

	// Reset state
	const [resetEmail, setResetEmail] = useState('')
	const [resetCode, setResetCode] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [showNew, setShowNew] = useState(false)
	const [resetStep, setResetStep] = useState<'email' | 'code'>('email')

	const handleLogin = async () => {
		if (!email.trim() || !password) {
			Alert.alert(t('common', 'error'), `${t('emailLogin', 'email')} and ${t('emailLogin', 'password')} are required`)
			return
		}
		setLoading(true)
		try {
			await loginWithEmail(email.trim().toLowerCase(), password)
		} catch (e: any) {
			const status = e?.response?.status
			const msg = e?.response?.data?.message || e.message
			if (status === 401 && msg?.includes('verify')) {
				// Not verified — go to verification screen
				setPendingVerificationEmail(email.trim().toLowerCase())
				router.push('/(auth)/verify-email' as any)
			} else {
				Alert.alert(t('common', 'error'), msg || t('common', 'error'))
			}
		} finally {
			setLoading(false)
		}
	}

	const handleForgotSend = async () => {
		if (!resetEmail.trim()) return
		setLoading(true)
		try {
			await requestPasswordReset(resetEmail.trim().toLowerCase())
			setResetStep('code')
		} catch (e: any) {
			Alert.alert(t('common', 'error'), e?.response?.data?.message || e.message)
		} finally {
			setLoading(false)
		}
	}

	const handleResetSubmit = async () => {
		if (!resetCode || !newPassword) return
		if (newPassword.length < 6) {
			Alert.alert(t('common', 'error'), t('register', 'passwordTooShort'))
			return
		}
		setLoading(true)
		try {
			await resetPassword(resetEmail.trim().toLowerCase(), resetCode, newPassword)
			Alert.alert('✓', 'Password reset successfully')
			setScreen('login')
			setResetStep('email')
			setResetCode('')
			setNewPassword('')
		} catch (e: any) {
			Alert.alert(t('common', 'error'), e?.response?.data?.message || e.message)
		} finally {
			setLoading(false)
		}
	}

	if (screen === 'forgot' || screen === 'reset') {
		return (
			<SafeAreaView style={s.safe}>
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
					<ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps='handled'>
						<View style={s.header}>
							<TouchableOpacity style={s.backBtn} onPress={() => { setScreen('login'); setResetStep('email') }}>
								<Ionicons name='arrow-back' size={22} color={C.text} />
							</TouchableOpacity>
							<View style={[s.badge, { backgroundColor: C.orange }]}>
								<Text style={s.badgeText}>FITEX</Text>
							</View>
							<Text style={s.title}>{t('emailLogin', 'resetTitle')}</Text>
							<Text style={s.subtitle}>{t('emailLogin', 'resetSubtitle')}</Text>
						</View>

						<View style={s.form}>
							{resetStep === 'email' ? (
								<>
									<FieldComp
										label={t('emailLogin', 'email')}
										value={resetEmail}
										onChangeText={setResetEmail}
										placeholder='you@example.com'
										keyboardType='email-address'
										autoCapitalize='none'
									/>
									<TouchableOpacity style={[s.btn, { backgroundColor: C.orange }, loading && s.btnDisabled]} onPress={handleForgotSend} disabled={loading} activeOpacity={0.85}>
										{loading ? <ActivityIndicator color='#fff' /> : <Text style={s.btnText}>{t('emailLogin', 'forgotPassword')}</Text>}
									</TouchableOpacity>
								</>
							) : (
								<>
									<FieldComp
										label={t('emailLogin', 'resetCode')}
										value={resetCode}
										onChangeText={setResetCode}
										placeholder='123456'
										keyboardType='numeric'
										autoCapitalize='none'
									/>
									<FieldComp
										label={t('emailLogin', 'newPassword')}
										value={newPassword}
										onChangeText={setNewPassword}
										placeholder='••••••••'
										secureTextEntry={!showNew}
										rightIcon={
											<TouchableOpacity onPress={() => setShowNew(v => !v)}>
												<Ionicons name={showNew ? 'eye-off' : 'eye'} size={18} color={C.subtext} />
											</TouchableOpacity>
										}
									/>
									<TouchableOpacity style={[s.btn, { backgroundColor: C.orange }, loading && s.btnDisabled]} onPress={handleResetSubmit} disabled={loading} activeOpacity={0.85}>
										{loading ? <ActivityIndicator color='#fff' /> : <Text style={s.btnText}>{t('emailLogin', 'resetSubmit')}</Text>}
									</TouchableOpacity>
								</>
							)}

							<TouchableOpacity style={s.footerSingle} onPress={() => { setScreen('login'); setResetStep('email') }}>
								<Text style={s.footerLink}>← {t('emailLogin', 'backToLogin')}</Text>
							</TouchableOpacity>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={s.safe}>
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
				<ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps='handled'>
					<View style={s.header}>
						<TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
							<Ionicons name='arrow-back' size={22} color={C.text} />
						</TouchableOpacity>
						<View style={s.badge}>
							<Text style={s.badgeText}>FITEX</Text>
						</View>
						<Text style={s.title}>{t('emailLogin', 'title')}</Text>
						<Text style={s.subtitle}>{t('emailLogin', 'subtitle')}</Text>
					</View>

					<View style={s.form}>
						<FieldComp
							label={t('emailLogin', 'email')}
							value={email}
							onChangeText={setEmail}
							placeholder='you@example.com'
							keyboardType='email-address'
							autoCapitalize='none'
						/>
						<FieldComp
							label={t('emailLogin', 'password')}
							value={password}
							onChangeText={setPassword}
							placeholder='••••••••'
							secureTextEntry={!showPassword}
							rightIcon={
								<TouchableOpacity onPress={() => setShowPassword(v => !v)}>
									<Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color={C.subtext} />
								</TouchableOpacity>
							}
						/>

						<TouchableOpacity style={s.forgotRow} onPress={() => { setResetEmail(email); setScreen('forgot') }}>
							<Text style={s.forgotText}>{t('emailLogin', 'forgotPassword')}</Text>
						</TouchableOpacity>

						<TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
							{loading ? <ActivityIndicator color='#fff' /> : <Text style={s.btnText}>{t('emailLogin', 'submit')}</Text>}
						</TouchableOpacity>

						<View style={s.footer}>
							<Text style={s.footerText}>{t('emailLogin', 'noAccount')} </Text>
							<TouchableOpacity onPress={() => router.replace('/(auth)/register' as any)}>
								<Text style={s.footerLink}>{t('emailLogin', 'register')}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}

type FieldProps = {
	label: string
	value: string
	onChangeText: (v: string) => void
	placeholder?: string
	secureTextEntry?: boolean
	keyboardType?: 'default' | 'email-address' | 'numeric'
	autoCapitalize?: 'none' | 'words' | 'sentences'
	rightIcon?: React.ReactNode
}

function FieldComp({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, rightIcon }: FieldProps) {
	return (
		<View style={s.fieldWrap}>
			<Text style={s.label}>{label}</Text>
			<View style={s.inputRow}>
				<TextInput
					style={[s.input, rightIcon ? { flex: 1 } : {}]}
					value={value}
					onChangeText={onChangeText}
					placeholder={placeholder}
					placeholderTextColor='#5A5A5E'
					secureTextEntry={secureTextEntry}
					keyboardType={keyboardType || 'default'}
					autoCapitalize={autoCapitalize || 'sentences'}
					autoCorrect={false}
				/>
				{rightIcon && <View style={s.inputRight}>{rightIcon}</View>}
			</View>
		</View>
	)
}

const s = StyleSheet.create({
	safe: { flex: 1, backgroundColor: C.background },
	scroll: { flexGrow: 1, padding: 24 },
	header: { alignItems: 'center', marginBottom: 32, paddingTop: 8 },
	backBtn: { position: 'absolute', left: 0, top: 8, padding: 8 },
	badge: {
		backgroundColor: C.primary,
		paddingHorizontal: 16,
		paddingVertical: 6,
		borderRadius: 20,
		marginBottom: 16,
	},
	badgeText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 2 },
	title: { fontSize: 28, fontWeight: '700', color: C.text, marginBottom: 6 },
	subtitle: { fontSize: 15, color: C.subtext },
	form: { gap: 4 },
	fieldWrap: { marginBottom: 12 },
	label: { fontSize: 13, color: C.subtext, marginBottom: 6, marginLeft: 2 },
	inputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: C.inputBg,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: C.border,
		paddingHorizontal: 14,
	},
	input: {
		flex: 1,
		color: C.text,
		fontSize: 15,
		paddingVertical: 13,
	},
	inputRight: { paddingLeft: 8 },
	forgotRow: { alignItems: 'flex-end', marginTop: -4, marginBottom: 12 },
	forgotText: { color: C.subtext, fontSize: 13 },
	btn: {
		backgroundColor: C.primary,
		borderRadius: 14,
		paddingVertical: 15,
		alignItems: 'center',
		marginTop: 4,
		shadowColor: C.primary,
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.35,
		shadowRadius: 12,
		elevation: 8,
	},
	btnDisabled: { opacity: 0.6 },
	btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
	footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
	footerSingle: { alignItems: 'center', marginTop: 20 },
	footerText: { color: C.subtext, fontSize: 14 },
	footerLink: { color: C.primary, fontSize: 14, fontWeight: '600' },
})
