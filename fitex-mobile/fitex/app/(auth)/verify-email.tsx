import { useAuth } from '@/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
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
} as const

const RESEND_SECONDS = 60

export default function VerifyEmailScreen() {
	const { verifyEmail, resendVerification, pendingVerificationEmail } = useAuth()
	const { t } = useLanguage()

	const [digits, setDigits] = useState(['', '', '', '', '', ''])
	const [loading, setLoading] = useState(false)
	const [countdown, setCountdown] = useState(RESEND_SECONDS)
	const inputRefs = useRef<(TextInput | null)[]>([])

	useEffect(() => {
		if (countdown <= 0) return
		const id = setInterval(() => setCountdown(v => v - 1), 1000)
		return () => clearInterval(id)
	}, [countdown])

	const code = digits.join('')
	const email = pendingVerificationEmail || ''

	const handleDigit = useCallback((text: string, idx: number) => {
		const char = text.slice(-1).replace(/\D/g, '')
		const next = [...digits]
		next[idx] = char
		setDigits(next)
		if (char && idx < 5) {
			inputRefs.current[idx + 1]?.focus()
		}
		if (!char && idx > 0) {
			inputRefs.current[idx - 1]?.focus()
		}
	}, [digits])

	const handleVerify = async () => {
		if (code.length !== 6) {
			Alert.alert(t('common', 'error'), t('verify', 'code') + ' must be 6 digits')
			return
		}
		setLoading(true)
		try {
			await verifyEmail(email, code)
		} catch (e: any) {
			const msg = e?.response?.data?.message || e.message
			Alert.alert(t('common', 'error'), msg)
			setDigits(['', '', '', '', '', ''])
			inputRefs.current[0]?.focus()
		} finally {
			setLoading(false)
		}
	}

	const handleResend = async () => {
		if (countdown > 0) return
		try {
			await resendVerification(email)
			setCountdown(RESEND_SECONDS)
			Alert.alert('✓', `Code sent to ${email}`)
		} catch (e: any) {
			Alert.alert(t('common', 'error'), e?.response?.data?.message || e.message)
		}
	}

	if (!email) {
		return (
			<SafeAreaView style={s.safe}>
				<View style={s.center}>
					<Text style={s.subtext}>No pending verification. Please register first.</Text>
					<TouchableOpacity onPress={() => router.replace('/(auth)/register' as any)} style={s.btn}>
						<Text style={s.btnText}>{t('register', 'submit')}</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={s.safe}>
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
				<View style={s.scroll}>
					{/* Header */}
					<View style={s.header}>
						<TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
							<Ionicons name='arrow-back' size={22} color={C.text} />
						</TouchableOpacity>

						<View style={s.iconWrap}>
							<Ionicons name='mail-outline' size={40} color={C.primary} />
						</View>
						<Text style={s.title}>{t('verify', 'title')}</Text>
						<Text style={s.subtitle}>{t('verify', 'subtitle')}</Text>
						<Text style={s.emailText}>{email}</Text>
					</View>

					{/* OTP Boxes */}
					<View style={s.otpRow}>
						{digits.map((d, i) => (
							<TextInput
								key={i}
								ref={r => { inputRefs.current[i] = r }}
								style={[s.otpBox, d ? s.otpBoxFilled : {}]}
								value={d}
								onChangeText={text => handleDigit(text, i)}
								keyboardType='number-pad'
								maxLength={1}
								textAlign='center'
								autoFocus={i === 0}
								selectTextOnFocus
							/>
						))}
					</View>

					{/* Verify button */}
					<TouchableOpacity
						style={[s.btn, (loading || code.length < 6) && s.btnDisabled]}
						onPress={handleVerify}
						disabled={loading || code.length < 6}
						activeOpacity={0.85}
					>
						{loading
							? <ActivityIndicator color='#fff' />
							: <Text style={s.btnText}>{t('verify', 'submit')}</Text>
						}
					</TouchableOpacity>

					{/* Resend */}
					<TouchableOpacity style={s.resendRow} onPress={handleResend} disabled={countdown > 0} activeOpacity={0.7}>
						{countdown > 0
							? <Text style={s.resendOff}>{t('verify', 'resendIn')} {countdown}s</Text>
							: <Text style={s.resendOn}>{t('verify', 'resend')}</Text>
						}
					</TouchableOpacity>

					{/* Wrong email */}
					<TouchableOpacity style={s.wrongRow} onPress={() => router.replace('/(auth)/register' as any)}>
						<Text style={s.wrongText}>{t('verify', 'wrongEmail')}</Text>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}

const s = StyleSheet.create({
	safe: { flex: 1, backgroundColor: C.background },
	scroll: { flex: 1, padding: 24, justifyContent: 'center' },
	center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
	header: { alignItems: 'center', marginBottom: 40 },
	backBtn: { position: 'absolute', left: 0, top: 0, padding: 8 },
	iconWrap: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: '#1C2E1C',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 20,
	},
	title: { fontSize: 26, fontWeight: '700', color: C.text, marginBottom: 8 },
	subtitle: { fontSize: 14, color: C.subtext, textAlign: 'center' },
	emailText: { fontSize: 15, color: C.primary, fontWeight: '600', marginTop: 8 },
	subtext: { color: C.subtext, textAlign: 'center', marginBottom: 20 },
	otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 32 },
	otpBox: {
		width: 48,
		height: 58,
		borderRadius: 12,
		backgroundColor: '#2C2C2E',
		borderWidth: 1.5,
		borderColor: '#3A3A3C',
		color: C.text,
		fontSize: 24,
		fontWeight: '700',
	},
	otpBoxFilled: { borderColor: C.primary },
	btn: {
		backgroundColor: C.primary,
		borderRadius: 14,
		paddingVertical: 15,
		alignItems: 'center',
		shadowColor: C.primary,
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.35,
		shadowRadius: 12,
		elevation: 8,
	},
	btnDisabled: { opacity: 0.5 },
	btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
	resendRow: { alignItems: 'center', marginTop: 20 },
	resendOff: { color: C.subtext, fontSize: 14 },
	resendOn: { color: C.primary, fontSize: 14, fontWeight: '600' },
	wrongRow: { alignItems: 'center', marginTop: 12 },
	wrongText: { color: C.subtext, fontSize: 13, textDecorationLine: 'underline' },
})
