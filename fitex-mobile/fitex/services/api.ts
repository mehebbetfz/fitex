import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

export const api = axios.create({
	baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 20_000,
})

api.interceptors.request.use(async config => {
	const token = await SecureStore.getItemAsync('access_token')
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

/**
 * Не чистим сессию из интерцептора.
 * Раньше любой 401 (пустая БД / другой JWT / недоступный API) стирал токен → выкидывало на логин.
 * Выход только через signOut() в UI.
 */
api.interceptors.response.use(
	response => response,
	error => Promise.reject(error),
)
