// contexts/auth-context.tsx
import { api } from '@/services/api'
import * as AppleAuthentication from 'expo-apple-authentication'
import { makeRedirectUri } from 'expo-auth-session'
import * as Google from 'expo-auth-session/providers/google'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
	id: string
	email: string
	firstName?: string
	lastName?: string
	avatarUrl?: string
	isPremium: boolean
}

interface AuthContextType {
	user: User | null
	isLoading: boolean
	signInWithGoogle: () => Promise<void>
	signInWithApple: () => Promise<void>
	resetAuth: () => Promise<void>
	signOut: () => Promise<void>
	updateUser: (user: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	// ❌ Убрали useDatabase отсюда — было причиной циклической зависимости
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const loadUser = async () => {
			console.log('[Auth] Starting user load from SecureStore...')
			try {
				const token = await SecureStore.getItemAsync('access_token')
				const userStr = await SecureStore.getItemAsync('user')

				console.log('[Auth] Loaded token:', token ? 'exists' : 'missing')
				console.log('[Auth] Loaded user string length:', userStr?.length || 0)

				if (token && userStr) {
					const parsedUser = JSON.parse(userStr)
					console.log('[Auth] Parsed user:', parsedUser.email || parsedUser.id)
					setUser(parsedUser)
					api.defaults.headers.common['Authorization'] = `Bearer ${token}`
					console.log('[Auth] Set Authorization header')
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

	const saveUser = async (user: User, token: string) => {
		console.log('[Auth] Saving user:', user.email || user.id)
		try {
			await SecureStore.setItemAsync('access_token', token)
			await SecureStore.setItemAsync('user', JSON.stringify(user))
			api.defaults.headers.common['Authorization'] = `Bearer ${token}`
			setUser(user)
			router.replace('/(tabs)')
			console.log('[Auth] User saved successfully')
		} catch (err) {
			console.error('[Auth] Error saving user:', err)
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
		setUser(prev => (prev ? { ...prev, ...updates } : null))
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				signInWithGoogle,
				signInWithApple,
				resetAuth,
				signOut,
				updateUser,
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
