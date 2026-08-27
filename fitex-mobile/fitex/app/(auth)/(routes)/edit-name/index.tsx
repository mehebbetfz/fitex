import { useAuth } from '@/app/contexts/auth-context'
import type { AppColors } from '@/constants/app-theme'
import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import { api } from '@/services/api'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
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

export default function EditNameScreen() {
	const { t } = useLanguage()
	const { colors: C } = useAppTheme()
	const styles = useMemo(() => makeStyles(C), [C])
	const { user, refreshProfile } = useAuth()
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		if (!user) return
		setFirstName(user.firstName?.trim() ?? '')
		setLastName(user.lastName?.trim() ?? '')
	}, [user])

	const save = useCallback(async () => {
		const fn = firstName.trim()
		if (!fn) {
			Alert.alert(t('common', 'error'), t('profile', 'nameFirstRequired'))
			return
		}
		setSaving(true)
		try {
			await api.patch('/auth/profile', {
				firstName: fn,
				lastName: lastName.trim() || undefined,
			})
			await refreshProfile()
			router.back()
		} catch {
			Alert.alert(t('common', 'error'), t('profile', 'nameSaveError'))
		} finally {
			setSaving(false)
		}
	}, [firstName, lastName, refreshProfile, t])

	return (
		<SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
						<Ionicons name='chevron-back' size={26} color={C.text} />
					</TouchableOpacity>
					<Text style={styles.title}>{t('profile', 'editNameTitle')}</Text>
					<View style={{ width: 40 }} />
				</View>

				<ScrollView
					keyboardShouldPersistTaps='handled'
					contentContainerStyle={styles.scroll}
					showsVerticalScrollIndicator={false}
				>
					<Text style={styles.sub}>{t('profile', 'editNameHint')}</Text>

					<Text style={styles.label}>{t('profile', 'displayNameFirstLabel')}</Text>
					<View style={styles.row}>
						<View style={styles.iconWrap}>
							<Ionicons name='person-outline' size={20} color={C.primary} />
						</View>
						<TextInput
							style={styles.input}
							placeholder={t('profile', 'displayNameFirstPh')}
							placeholderTextColor={C.textSecondary}
							value={firstName}
							onChangeText={setFirstName}
							autoCapitalize='words'
							autoCorrect={false}
						/>
					</View>

					<Text style={styles.label}>{t('profile', 'displayNameLastLabel')}</Text>
					<View style={styles.row}>
						<View style={styles.iconWrap}>
							<Ionicons name='person-outline' size={20} color={C.textSecondary} />
						</View>
						<TextInput
							style={styles.input}
							placeholder={t('profile', 'displayNameLastPh')}
							placeholderTextColor={C.textSecondary}
							value={lastName}
							onChangeText={setLastName}
							autoCapitalize='words'
							autoCorrect={false}
						/>
					</View>

					<TouchableOpacity
						style={[styles.btn, saving && { opacity: 0.7 }]}
						onPress={() => void save()}
						disabled={saving}
					>
						{saving ? (
							<ActivityIndicator color='#000' />
						) : (
							<Text style={styles.btnText}>{t('common', 'save')}</Text>
						)}
					</TouchableOpacity>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}

function makeStyles(C: AppColors) {
	return StyleSheet.create({
		safe: { flex: 1, backgroundColor: C.background },
		header: {
			flexDirection: 'row',
			alignItems: 'center',
			paddingHorizontal: 8,
			paddingVertical: 8,
		},
		backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
		title: {
			flex: 1,
			textAlign: 'center',
			fontSize: 17,
			fontWeight: '800',
			color: C.text,
		},
		scroll: { padding: 16, paddingBottom: 40 },
		sub: { fontSize: 13, color: C.textSecondary, lineHeight: 18, marginBottom: 16 },
		label: {
			fontSize: 12,
			fontWeight: '700',
			color: C.textSecondary,
			marginBottom: 8,
			marginLeft: 4,
			textTransform: 'uppercase',
			letterSpacing: 0.5,
		},
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
			marginBottom: 18,
			backgroundColor: C.card,
			borderRadius: 14,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: C.border,
			paddingHorizontal: 12,
			paddingVertical: 4,
		},
		iconWrap: {
			width: 36,
			height: 36,
			borderRadius: 10,
			backgroundColor: 'rgba(52, 199, 89, 0.12)',
			alignItems: 'center',
			justifyContent: 'center',
		},
		input: {
			flex: 1,
			color: C.text,
			fontSize: 15,
			paddingVertical: 12,
		},
		btn: {
			marginTop: 12,
			backgroundColor: C.primary,
			paddingVertical: 16,
			borderRadius: 14,
			alignItems: 'center',
		},
		btnText: { fontSize: 16, fontWeight: '800', color: '#000' },
	})
}
