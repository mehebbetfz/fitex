import type { AppColors } from '@/constants/app-theme'
import {
	PRESET_AVATAR_IDS,
	type PresetAvatarId,
	presetAvatarSource,
} from '@/constants/preset-avatars'
import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import { useAuth } from '@/app/contexts/auth-context'
import { api, formatApiError } from '@/services/api'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type Mode = 'onboarding' | 'profile'

export default function AvatarSelectScreen() {
	const { t } = useLanguage()
	const { colors: C } = useAppTheme()
	const styles = useMemo(() => makeStyles(C), [C])
	const { user, updateUser } = useAuth()
	const params = useLocalSearchParams<{ mode?: string }>()
	const mode: Mode = params.mode === 'profile' ? 'profile' : 'onboarding'

	const [selected, setSelected] = useState<PresetAvatarId | null>(
		(user?.avatarPreset as PresetAvatarId) || null,
	)
	const [saving, setSaving] = useState(false)

	const save = async () => {
		if (!selected || saving) return
		setSaving(true)
		try {
			const { data } = await api.patch('/auth/profile', {
				avatarPreset: selected,
			})
			updateUser({
				avatarPreset: data.avatarPreset ?? selected,
				avatarUrl: data.avatarUrl,
			})
			if (mode === 'profile') {
				router.back()
			} else {
				router.replace('/')
			}
		} catch (e) {
			Alert.alert(t('common', 'error'), formatApiError(e))
			setSaving(false)
		}
	}

	return (
		<SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
			<View style={styles.header}>
				{mode === 'profile' ? (
					<TouchableOpacity
						onPress={() => router.back()}
						style={styles.backBtn}
						hitSlop={12}
					>
						<Ionicons name='chevron-back' size={26} color={C.text} />
					</TouchableOpacity>
				) : (
					<View style={styles.backBtn} />
				)}
				<Text style={styles.title}>{t('avatarSelect', 'title')}</Text>
				<View style={styles.backBtn} />
			</View>
			<Text style={styles.subtitle}>{t('avatarSelect', 'subtitle')}</Text>

			<FlatList
				data={PRESET_AVATAR_IDS}
				keyExtractor={id => id}
				numColumns={3}
				contentContainerStyle={styles.grid}
				columnWrapperStyle={styles.row}
				renderItem={({ item }) => {
					const active = selected === item
					const src = presetAvatarSource(item)
					return (
						<TouchableOpacity
							style={[styles.cell, active && styles.cellActive]}
							onPress={() => setSelected(item)}
							activeOpacity={0.8}
						>
							{src ? (
								<Image source={src} style={styles.avatar} />
							) : null}
							{active ? (
								<View style={styles.check}>
									<Ionicons name='checkmark' size={16} color='#000' />
								</View>
							) : null}
						</TouchableOpacity>
					)
				}}
			/>

			<View style={styles.footer}>
				<TouchableOpacity
					style={[styles.btn, !selected && styles.btnDisabled]}
					onPress={() => void save()}
					disabled={!selected || saving}
					activeOpacity={0.85}
				>
					{saving ? (
						<ActivityIndicator color='#000' />
					) : (
						<Text style={[styles.btnText, !selected && styles.btnTextDisabled]}>
							{mode === 'profile'
								? t('common', 'save')
								: t('avatarSelect', 'continue')}
						</Text>
					)}
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	)
}

function makeStyles(C: AppColors) {
	return StyleSheet.create({
		safe: { flex: 1, backgroundColor: C.background },
		header: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingHorizontal: 8,
			paddingTop: 4,
		},
		backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
		title: {
			fontSize: 20,
			fontWeight: '700',
			color: C.text,
		},
		subtitle: {
			fontSize: 14,
			color: C.textSecondary,
			textAlign: 'center',
			paddingHorizontal: 28,
			marginTop: 6,
			marginBottom: 16,
			lineHeight: 20,
		},
		grid: { paddingHorizontal: 16, paddingBottom: 20 },
		row: { justifyContent: 'space-between', marginBottom: 12 },
		cell: {
			width: '31%',
			aspectRatio: 1,
			borderRadius: 999,
			overflow: 'hidden',
			borderWidth: 2,
			borderColor: 'transparent',
			backgroundColor: C.card,
		},
		cellActive: {
			borderColor: C.primary,
		},
		avatar: { width: '100%', height: '100%' },
		check: {
			position: 'absolute',
			right: 6,
			bottom: 6,
			width: 24,
			height: 24,
			borderRadius: 12,
			backgroundColor: C.primary,
			alignItems: 'center',
			justifyContent: 'center',
		},
		footer: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
		btn: {
			backgroundColor: C.primary,
			borderRadius: 14,
			paddingVertical: 16,
			alignItems: 'center',
		},
		btnDisabled: { backgroundColor: C.cardLight },
		btnText: { color: '#000', fontSize: 16, fontWeight: '700' },
		btnTextDisabled: { color: C.textSecondary },
	})
}
