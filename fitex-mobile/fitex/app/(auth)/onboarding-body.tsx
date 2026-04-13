import {
	BodyStatsFormSections,
	buildPayloadFromState,
	useBodyStatsInitial,
} from '@/components/body-stats-form'
import { api } from '@/services/api'
import { useLanguage } from '@/contexts/language-context'
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
import { useAuth } from '../contexts/auth-context'

const BG = '#0A0A0A'
const PRIMARY = '#34C759'

export default function OnboardingBodyScreen() {
	const { t } = useLanguage()
	const { user, refreshProfile } = useAuth()
	const initial = useBodyStatsInitial(user)
	const [state, setState] = useState(initial)
	const [loading, setLoading] = useState(false)

	const submit = async (skip: boolean) => {
		if (skip) {
			setLoading(true)
			try {
				await api.patch('/auth/profile', { bodyStatsCompleted: true })
				await refreshProfile()
				router.replace('/')
			} catch (e: unknown) {
				Alert.alert(t('common', 'error'), String((e as Error)?.message ?? 'network'))
			} finally {
				setLoading(false)
			}
			return
		}
		const payload = buildPayloadFromState(state)
		if (!payload) {
			Alert.alert(t('common', 'error'), t('bodyProfile', 'fillRequired'))
			return
		}
		setLoading(true)
		try {
			await api.patch('/auth/profile', payload)
			await refreshProfile()
			router.replace('/')
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
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				<ScrollView
					contentContainerStyle={styles.scroll}
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}
				>
					<Text style={styles.title}>{t('bodyProfile', 'onboardingTitle')}</Text>
					<Text style={styles.sub}>{t('bodyProfile', 'onboardingSubtitle')}</Text>

					<BodyStatsFormSections state={state} setState={setState} />

					<TouchableOpacity
						style={[styles.cta, loading && styles.ctaDisabled]}
						onPress={() => submit(false)}
						disabled={loading}
						activeOpacity={0.85}
					>
						{loading ? (
							<ActivityIndicator color='#fff' />
						) : (
							<Text style={styles.ctaText}>{t('bodyProfile', 'save')}</Text>
						)}
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.skip}
						onPress={() => submit(true)}
						disabled={loading}
					>
						<Text style={styles.skipText}>{t('bodyProfile', 'skip')}</Text>
					</TouchableOpacity>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: BG },
	scroll: { padding: 20, paddingBottom: 40 },
	title: {
		fontSize: 26,
		fontWeight: '700',
		color: '#fff',
		marginBottom: 8,
	},
	sub: { fontSize: 15, color: '#8E8E93', marginBottom: 28, lineHeight: 22 },
	cta: {
		backgroundColor: PRIMARY,
		paddingVertical: 16,
		borderRadius: 14,
		alignItems: 'center',
		marginTop: 8,
	},
	ctaDisabled: { opacity: 0.6 },
	ctaText: { fontSize: 17, fontWeight: '700', color: '#fff' },
	skip: { paddingVertical: 18, alignItems: 'center' },
	skipText: { fontSize: 16, color: '#8E8E93' },
})
