import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

export const api = axios.create({
	baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
	// baseURL: 'http://192.168.100.12:3000',
	headers: {
		'Content-Type': 'application/json',
	},
})

api.interceptors.request.use(async (config) => {
	const token = await SecureStore.getItemAsync('access_token')
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

/** 401 на этих путях — ожидаемая ошибка (неверный пароль и т.д.), не сбрасываем сохранённую сессию. */
function isAuthFlowUnauthorized(url: string | undefined): boolean {
	if (!url) return false
	const u = url.includes('://') ? new URL(url).pathname : url
	return (
		u.includes('/auth/login-email') ||
		u.includes('/auth/register') ||
		u.includes('/auth/verify-email') ||
		u.includes('/auth/resend-verification') ||
		u.includes('/auth/google') ||
		u.includes('/auth/apple') ||
		u.includes('/auth/demo') ||
		u.includes('/auth/request-password-reset') ||
		u.includes('/auth/reset-password')
	)
}

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {
			const reqUrl = error.config?.url as string | undefined
			if (!isAuthFlowUnauthorized(reqUrl)) {
				await SecureStore.deleteItemAsync('access_token')
				await SecureStore.deleteItemAsync('user')
				delete api.defaults.headers.common['Authorization']
			}
		}
		return Promise.reject(error)
	}
)