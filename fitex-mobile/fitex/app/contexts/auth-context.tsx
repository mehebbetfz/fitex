// contexts/auth-context.tsx
import { api } from '@/services/api'
import * as AppleAuthentication from 'expo-apple-authentication'
import { makeRedirectUri } from 'expo-auth-session'
import * as Google from 'expo-auth-session/providers/google'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { createContext, useContext, useEffect, useState } from 'react'

export interface User {
	id: string
	email: string
	firstName?: string
	lastName?: string
	avatarUrl?: string
	isPremium: boolean
	/** ISO string from server; App Store / Play subscription end time */
	premiumExpiresAt?: string
	trialStartedAt?: string   // ISO date string, set when user starts trial
	trialEndsAt?: string      // ISO date string = trialStartedAt + 30 days
	isNewUser?: boolean       // true on very first login
	/** Анкета тела (сервер) */
	heightCm?: number | null
	weightKg?: number | null
	age?: number | null
	sex?: string | null
	fitnessGoal?: string | null
	activityLevel?: string | null
	/** true после онбординга или «Пропустить» */
	bodyStatsCompleted?: boolean
	/** Публичные ссылки (лидерборд / профиль спортсмена) */
	socialInstagram?: string | null
	socialTelegram?: string | null
	socialYoutube?: string | null
	socialTiktok?: string | null
	socialStrava?: string | null
	socialWebsite?: string | null
}

interface AuthContextType {
	user: User | null
	isLoading: boolean
	signInWithGoogle: () => Promise<void>
	signInWithApple: () => Promise<void>
	signInDemo: () => Promise<void>
	registerWithEmail: (email: string, password: string, firstName: string, lastName?: string) => Promise<void>
	loginWithEmail: (email: string, password: string) => Promise<void>
	verifyEmail: (email: string, code: string) => Promise<void>
	resendVerification: (email: string) => Promise<void>
	requestPasswordReset: (email: string) => Promise<void>
	resetPassword: (email: string, code: string, newPassword: string) => Promise<void>
	resetAuth: () => Promise<void>
	signOut: () => Promise<void>
	updateUser: (user: Partial<User>) => void
	/** Refetch premium / profile from server (e.g. after subscription changes). */
	refreshProfile: () => Promise<void>
	startTrial: () => Promise<void>
	dismissTrialPaywall: () => Promise<void>
	trialDaysLeft: number       // ≥0 if in trial, -1 if not started/expired
	isTrialActive: boolean
	pendingVerificationEmail: string | null
	setPendingVerificationEmail: (email: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	// ❌ Убрали useDatabase отсюда — было причиной циклической зависимости
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null)

	// ─── Trial helpers ────────────────────────────────────────────────────────
	const trialDaysLeft = (() => {
		if (!user?.trialEndsAt) return -1
		const diff = new Date(user.trialEndsAt).getTime() - Date.now()
		if (diff <= 0) return -1
		return Math.ceil(diff / (1000 * 60 * 60 * 24))
	})()

	const isTrialActive = trialDaysLeft > 0

	useEffect(() => {
		const loadUser = async () => {
			console.log('[Auth] Starting user load from SecureStore...')
			try {
				const token = await SecureStore.getItemAsync('access_token')
				const userStr = await SecureStore.getItemAsync('user')

				console.log('[Auth] Loaded token:', token ? 'exists' : 'missing')
				console.log('[Auth] Loaded user string length:', userStr?.length || 0)

				if (token && userStr) {
					const parsedUser = JSON.parse(userStr) as User
					api.defaults.headers.common['Authorization'] = `Bearer ${token}`
					try {
						const { data } = await api.get('/auth/me')
						const merged: User = { ...parsedUser, ...(data as User) }
						setUser(merged)
						await SecureStore.setItemAsync('user', JSON.stringify(merged))
						console.log('[Auth] Profile merged from server, isPremium:', merged.isPremium)
					} catch (e) {
						console.warn('[Auth] /auth/me failed, using cached user', e)
						setUser(parsedUser)
					}
				} else if (token) {
					api.defaults.headers.common['Authorization'] = `Bearer ${token}`
				} else {
					console.log('[Auth] No valid session found')
				}
			} catch (error) {
				console.error('[Auth] Failed to load user:', error)
			} finally {
				setIsLoading(false)
				console.log('[Auth] Loading finished, isLoading = false')
			}
		}
		loadUser()
	}, [])

	const saveUser = async (userData: User, token: string) => {
		console.log('[Auth] Saving user:', userData.email || userData.id)
		try {
			await SecureStore.setItemAsync('access_token', token)
			await SecureStore.setItemAsync('user', JSON.stringify(userData))
			api.defaults.headers.common['Authorization'] = `Bearer ${token}`
			setUser(userData)
			console.log('[Auth] User saved successfully')
			// Новый пользователь без Premium — trial paywall; с активной подпиской — сразу в приложение
			if (userData.isNewUser && !hasActivePremium(userData)) {
				router.replace('/(auth)/trial-paywall')
			} else {
				router.replace('/(tabs)')
			}
		} catch (err) {
			console.error('[Auth] Error saving user:', err)
		}
	}

	const startTrial = async () => {
		if (!user) return
		const now = new Date()
		const endsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
		const updated: User = {
			...user,
			trialStartedAt: now.toISOString(),
			trialEndsAt: endsAt.toISOString(),
			isNewUser: false,
		}
		try {
			await SecureStore.setItemAsync('user', JSON.stringify(updated))
			setUser(updated)
			// Inform server
			await api.post('/subscription/start-trial', {
				trialStartedAt: now.toISOString(),
				trialEndsAt: endsAt.toISOString(),
			}).catch(() => {/* non-critical */})
			console.log('[Auth] Trial started, ends:', endsAt.toISOString())
		} catch (err) {
			console.error('[Auth] startTrial error:', err)
		}
	}

	const dismissTrialPaywall = async () => {
		if (!user) return
		const updated: User = {
			...user,
			isNewUser: false,
		}
		try {
			await SecureStore.setItemAsync('user', JSON.stringify(updated))
			setUser(updated)
			await api.post('/subscription/dismiss-trial-paywall', {}).catch(() => { /* non-critical */ })
		} catch (err) {
			console.error('[Auth] dismissTrialPaywall error:', err)
		}
	}

	const [, , promptGoogleAsync] = Google.useIdTokenAuthRequest({
		clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
		iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
		androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
		redirectUri: makeRedirectUri({ scheme: 'fitex' }),
	})

	const signInWithGoogle = async () => {
		console.log('[Google] Starting sign in flow...')
		try {
			const result = await promptGoogleAsync()
			console.log('[Google] Prompt result type:', result?.type)

			if (result?.type === 'success') {
				const { id_token } = result.params
				const response = await api.post('/auth/google', { idToken: id_token })
				const { access_token, user } = response.data
				// saveUser сам сделает router.replace('/(tabs)')
				// SyncInitializer подхватит нового user и вызовет performInitialSync
				await saveUser(user, access_token)
				console.log('[Google] Sign in completed successfully')
			} else {
				throw new Error('Google Sign-In cancelled or failed')
			}
		} catch (error: any) {
			console.error('[Google] Sign in error:', error.message, error)
			throw error
		}
	}

	const signInWithApple = async () => {
		console.log('[Apple] Starting sign in flow...')
		try {
			const credential = await AppleAuthentication.signInAsync({
				requestedScopes: [
					AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
					AppleAuthentication.AppleAuthenticationScope.EMAIL,
				],
			})

			const response = await api.post('/auth/apple', {
				code: credential.authorizationCode,
				fullName: credential.fullName,
				identityToken: credential.identityToken,
			})

			const { access_token, user } = response.data
			// SyncInitializer подхватит нового user через useEffect на user?.id
			await saveUser(user, access_token)
			console.log('[Apple] Sign in completed successfully')
		} catch (error: any) {
			if (error.code === 'ERR_CANCELED') {
				throw new Error('Apple Sign-In cancelled')
			}
			console.error('[Apple] Sign in error:', error.code, error.message)
			throw error
		}
	}

	const signInDemo = async () => {
		try {
			const response = await api.post('/auth/demo', { password: 'FitExDemo2024!' })
			const { access_token, user } = response.data
			await saveUser(user, access_token)
		} catch (error: any) {
			console.error('[Demo] Sign in error:', error.message)
			throw error
		}
	}

	const registerWithEmail = async (email: string, password: string, firstName: string, lastName?: string) => {
		await api.post('/auth/register', { email, password, firstName, lastName })
		setPendingVerificationEmail(email)
		router.push('/(auth)/verify-email' as any)
	}

	const loginWithEmail = async (email: string, password: string) => {
		const response = await api.post('/auth/login-email', { email, password })
		const { access_token, user } = response.data
		await saveUser(user, access_token)
	}

	const verifyEmail = async (email: string, code: string) => {
		const response = await api.post('/auth/verify-email', { email, code })
		const { access_token, user } = response.data
		setPendingVerificationEmail(null)
		await saveUser(user, access_token)
	}

	const resendVerification = async (email: string) => {
		await api.post('/auth/resend-verification', { email })
	}

	const requestPasswordReset = async (email: string) => {
		await api.post('/auth/request-password-reset', { email })
	}

	const resetPassword = async (email: string, code: string, newPassword: string) => {
		await api.post('/auth/reset-password', { email, code, newPassword })
	}

	const signOut = async () => {
		console.log('[Auth] Starting sign out...')
		try {
			await SecureStore.deleteItemAsync('access_token')
			await SecureStore.deleteItemAsync('user')
			delete api.defaults.headers.common['Authorization']
			setUser(null)
			console.log('[Auth] Sign out completed')
		} catch (err) {
			console.error('[Auth] Sign out error:', err)
		}
	}

	const resetAuth = async () => {
		await signOut()
	}

	const updateUser = (updates: Partial<User>) => {
		console.log('[Auth] Updating user with:', updates)
		setUser(prev => {
			if (!prev) return null
			const next = { ...prev, ...updates }
			void SecureStore.setItemAsync('user', JSON.stringify(next)).catch(() => {})
			return next
		})
	}

	const refreshProfile = async () => {
		try {
			const token = await SecureStore.getItemAsync('access_token')
			if (!token) return
			const { data } = await api.get('/auth/me')
			setUser(prev => {
				if (!prev) return null
				const next = { ...prev, ...data }
				SecureStore.setItemAsync('user', JSON.stringify(next)).catch(() => {})
				return next
			})
		} catch (err) {
			console.warn('[Auth] refreshProfile failed:', err)
		}
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
			signInWithGoogle,
			signInWithApple,
			signInDemo,
			registerWithEmail,
			loginWithEmail,
			verifyEmail,
			resendVerification,
			requestPasswordReset,
			resetPassword,
			resetAuth,
			signOut,
			updateUser,
			refreshProfile,
			startTrial,
			dismissTrialPaywall,
			trialDaysLeft,
			isTrialActive,
			pendingVerificationEmail,
			setPendingVerificationEmail,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) throw new Error('useAuth must be used within AuthProvider')
	return context
}

/**
 * Активный Premium: дата окончания в будущем **или** флаг isPremium (как на сервере isPremiumEntitlementActive).
 * Если premiumExpiresAt в прошлом, но isPremium true (ручная правка БД), доступ всё равно есть.
 */
export function hasActivePremium(user: User | null): boolean {
	if (!user) return false
	if (user.premiumExpiresAt) {
		const t = new Date(user.premiumExpiresAt).getTime()
		if (!Number.isNaN(t) && t > Date.now()) return true
	}
	return !!user.isPremium
}
