import type { BodyStatsState } from '@/components/body-stats-form'
import { buildPayloadFromState, mergeBodyStatsWithDefaults, useBodyStatsInitial } from '@/components/body-stats-form'
import { api } from '@/services/api'
import { useLanguage } from '@/contexts/language-context'
import { router } from 'expo-router'
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Alert } from 'react-native'
import { useAuth } from '../../contexts/auth-context'

type Ctx = {
	state: BodyStatsState
	setState: React.Dispatch<React.SetStateAction<BodyStatsState>>
	loading: boolean
	submitSkip: () => Promise<void>
	submitSave: () => Promise<void>
}

const OnboardingBodyCtx = createContext<Ctx | null>(null)

export function OnboardingBodyProvider({ children }: { children: React.ReactNode }) {
	const { t } = useLanguage()
	const { user, refreshProfile } = useAuth()
	const initial = useBodyStatsInitial(user)
	const [state, setState] = useState(() => mergeBodyStatsWithDefaults(initial))
	const [loading, setLoading] = useState(false)

	const submitSkip = useCallback(async () => {
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
	}, [refreshProfile, t])

	const submitSave = useCallback(async () => {
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
	}, [refreshProfile, state, t])

	const value = useMemo(
		() => ({ state, setState, loading, submitSkip, submitSave }),
		[state, loading, submitSkip, submitSave],
	)

	return <OnboardingBodyCtx.Provider value={value}>{children}</OnboardingBodyCtx.Provider>
}

export function useOnboardingBody() {
	const c = useContext(OnboardingBodyCtx)
	if (!c) throw new Error('useOnboardingBody must be used under OnboardingBodyProvider')
	return c
}
