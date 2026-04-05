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
} as const

export default function RegisterScreen() {
	const { registerWithEmail } = useAuth()
	const { t } = useLanguage()

	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)
	const [loading, setLoading] = useState(false)

	const handleSubmit = async () => {
		if (!firstName.trim() || !email.trim() || !password) {
			Alert.alert(t('common', 'error'), `${t('register', 'firstName')}, ${t('register', 'email')} and ${t('register', 'password')} are required`)
			return
		}
		if (password.length < 6) {
			Alert.alert(t('common', 'error'), t('register', 'passwordTooShort'))
			return
		}
		if (password !== confirmPassword) {
			Alert.alert(t('common', 'error'), t('register', 'passwordMismatch'))
			return
		}

		setLoading(true)
		try {
			await registerWithEmail(email.trim().toLowerCase(), password, firstName.trim(), lastName.trim() || undefined)
		} catch (e: any) {
			const msg = e?.response?.data?.message || e.message || t('common', 'error')
			Alert.alert(t('common', 'error'), msg)
		} finally {
			setLoading(false)
		}
	}

	return (
		<SafeAreaView style={s.safe}>
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
				<ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps='handled'>
					{/* Header */}
					<View style={s.header}>
						<TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
							<Ionicons name='arrow-back' size={22} color={C.text} />
						</TouchableOpacity>
						<View style={s.badge}>
							<Text style={s.badgeText}>FITEX</Text>
						</View>
						<Text style={s.title}>{t('register', 'title')}</Text>
						<Text style={s.subtitle}>{t('register', 'subtitle')}</Text>
					</View>

					{/* Form */}
					<View style={s.form}>
						<Field
							label={t('register', 'firstName')}
							value={firstName}
							onChangeText={setFirstName}
							placeholder='Alex'
							autoCapitalize='words'
						/>
						<Field
							label={t('register', 'lastName')}
							value={lastName}
							onChangeText={setLastName}
							placeholder='Smith'
							autoCapitalize='words'
						/>
						<Field
							label={t('register', 'email')}
							value={email}
							onChangeText={setEmail}
							placeholder='you@example.com'
							keyboardType='email-address'
							autoCapitalize='none'
						/>
						<Field
							label={t('register', 'password')}
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
						<Field
							label={t('register', 'confirmPassword')}
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							placeholder='••••••••'
							secureTextEntry={!showConfirm}
							rightIcon={
								<TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
									<Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={18} color={C.subtext} />
								</TouchableOpacity>
							}
						/>

						<TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
							{loading ? <ActivityIndicator color='#fff' /> : <Text style={s.btnText}>{t('register', 'submit')}</Text>}
						</TouchableOpacity>

						<View style={s.footer}>
							<Text style={s.footerText}>{t('register', 'haveAccount')} </Text>
							<TouchableOpacity onPress={() => router.replace('/(auth)/email-login' as any)}>
								<Text style={s.footerLink}>{t('register', 'signIn')}</Text>
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
	keyboardType?: 'default' | 'email-address'
	autoCapitalize?: 'none' | 'words' | 'sentences'
	rightIcon?: React.ReactNode
}

function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, rightIcon }: FieldProps) {
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
	btn: {
		backgroundColor: C.primary,
		borderRadius: 14,
		paddingVertical: 15,
		alignItems: 'center',
		marginTop: 12,
		shadowColor: C.primary,
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.35,
		shadowRadius: 12,
		elevation: 8,
	},
	btnDisabled: { opacity: 0.6 },
	btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
	footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
	footerText: { color: C.subtext, fontSize: 14 },
	footerLink: { color: C.primary, fontSize: 14, fontWeight: '600' },
})
