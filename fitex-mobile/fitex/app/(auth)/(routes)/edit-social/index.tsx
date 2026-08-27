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

const fields = [
	{ key: 'socialInstagram' as const, icon: 'logo-instagram' as const, ph: 'socialInstagramPh' as const },
	{ key: 'socialTelegram' as const, icon: 'send' as const, ph: 'socialTelegramPh' as const },
	{ key: 'socialYoutube' as const, icon: 'logo-youtube' as const, ph: 'socialYoutubePh' as const },
	{ key: 'socialTiktok' as const, icon: 'musical-notes' as const, ph: 'socialTiktokPh' as const },
	{ key: 'socialStrava' as const, icon: 'bicycle' as const, ph: 'socialStravaPh' as const },
	{ key: 'socialWebsite' as const, icon: 'link' as const, ph: 'socialWebsitePh' as const },
]

export default function EditSocialScreen() {
	const { t } = useLanguage()
	const { colors: C } = useAppTheme()
	const styles = useMemo(() => makeStyles(C), [C])
	const { user, refreshProfile } = useAuth()
	const [saving, setSaving] = useState(false)
	const [vals, setVals] = useState<Record<string, string>>({})

	useEffect(() => {
		if (!user) return
		setVals({
			socialInstagram: user.socialInstagram ?? '',
			socialTelegram: user.socialTelegram ?? '',
			socialYoutube: user.socialYoutube ?? '',
			socialTiktok: user.socialTiktok ?? '',
			socialStrava: user.socialStrava ?? '',
			socialWebsite: user.socialWebsite ?? '',
		})
	}, [user])

	const save = useCallback(async () => {
		setSaving(true)
		try {
			const payload: Record<string, string> = {}
			for (const { key } of fields) {
				const v = (vals[key] ?? '').trim()
				payload[key] = v
			}
			await api.patch('/auth/profile', payload)
			await refreshProfile()
			router.back()
		} finally {
			setSaving(false)
		}
	}, [vals, refreshProfile])

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
					<Text style={styles.title}>{t('profile', 'socialLinksEntry')}</Text>
					<View style={{ width: 40 }} />
				</View>

				<ScrollView
					keyboardShouldPersistTaps='handled'
					contentContainerStyle={styles.scroll}
					showsVerticalScrollIndicator={false}
				>
					<Text style={styles.sub}>{t('profile', 'socialLinksSubtitle')}</Text>

					{fields.map(({ key, icon, ph }) => (
						<View key={key} style={styles.row}>
							<View style={styles.iconWrap}>
								<Ionicons name={icon} size={20} color={C.primary} />
							</View>
							<TextInput
								style={styles.input}
								placeholder={t('profile', ph)}
								placeholderTextColor={C.textSecondary}
								value={vals[key] ?? ''}
								onChangeText={text => setVals(prev => ({ ...prev, [key]: text }))}
								autoCapitalize='none'
								autoCorrect={false}
							/>
						</View>
					))}

					<TouchableOpacity
						style={[styles.btn, saving && { opacity: 0.7 }]}
						onPress={() => void save()}
						disabled={saving}
					>
						{saving ? (
							<ActivityIndicator color='#fff' />
						) : (
							<Text style={styles.btnText}>{t('profile', 'socialSave')}</Text>
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
		title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: C.text },
		scroll: { padding: 16, paddingBottom: 40 },
		sub: { fontSize: 13, color: C.textSecondary, lineHeight: 18, marginBottom: 18 },
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
			marginBottom: 12,
			backgroundColor: C.card,
			borderRadius: 14,
			borderWidth: 1,
			borderColor: C.border,
			paddingHorizontal: 12,
			paddingVertical: 4,
		},
		iconWrap: {
			width: 36,
			height: 36,
			borderRadius: 10,
			backgroundColor: `${C.primary}1F`,
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
			marginTop: 20,
			backgroundColor: C.primary,
			paddingVertical: 16,
			borderRadius: 14,
			alignItems: 'center',
		},
		btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
	})
}
