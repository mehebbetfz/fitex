import {
	BodyStatsFormSections,
	buildPayloadFromState,
	useBodyStatsInitial,
} from '@/components/body-stats-form'
import { api } from '@/services/api'
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
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../../contexts/auth-context'

const BG = '#0A0A0A'
const PRIMARY = '#34C759'

export default function EditBodyProfileScreen() {
	const { t } = useLanguage()
	const { user, refreshProfile } = useAuth()
	const initial = useBodyStatsInitial(user)
	const [state, setState] = useState(initial)
	const [loading, setLoading] = useState(false)

	const save = async () => {
		const payload = buildPayloadFromState(state)
		if (!payload) {
			Alert.alert(t('common', 'error'), t('bodyProfile', 'fillRequired'))
			return
		}
		setLoading(true)
		try {
			await api.patch('/auth/profile', payload)
			await refreshProfile()
			router.back()
		} catch (e: unknown) {
			const msg =
				(e as { response?: { data?: { message?: string } } })?.response?.data?.message
				?? String((e as Error)?.message ?? 'network')
			Alert.alert(t('common', 'error'), msg)
		} finally {
			setLoading(false)
		}
	}

	return (
		<SafeAreaView style={styles.safe}>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
				>
					<Ionicons name='chevron-back' size={28} color='#fff' />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{t('bodyProfile', 'editTitle')}</Text>
				<View style={{ width: 28 }} />
			</View>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				<ScrollView
					contentContainerStyle={styles.scroll}
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}
				>
					<BodyStatsFormSections state={state} setState={setState} />

					<TouchableOpacity
						style={[styles.cta, loading && styles.ctaDisabled]}
						onPress={save}
						disabled={loading}
						activeOpacity={0.85}
					>
						{loading ? (
							<ActivityIndicator color='#fff' />
						) : (
							<Text style={styles.ctaText}>{t('bodyProfile', 'save')}</Text>
						)}
					</TouchableOpacity>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: BG },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 8,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#2C2C2E',
	},
	headerTitle: {
		flex: 1,
		fontSize: 18,
		fontWeight: '600',
		color: '#fff',
		textAlign: 'center',
	},
	scroll: { padding: 20, paddingBottom: 40 },
	cta: {
		backgroundColor: PRIMARY,
		paddingVertical: 16,
		borderRadius: 14,
		alignItems: 'center',
		marginTop: 12,
	},
	ctaDisabled: { opacity: 0.6 },
	ctaText: { fontSize: 17, fontWeight: '700', color: '#fff' },
})
