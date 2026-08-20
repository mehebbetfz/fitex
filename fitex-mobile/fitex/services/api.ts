import axios, { type AxiosError } from 'axios'
import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'

/** Secret EAS vars не попадают в OTA — нужен plaintext + явный fallback. */
const API_BASE = (
	process.env.EXPO_PUBLIC_API_URL ||
	(Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ||
	'https://fitex.4talk.club'
).replace(/\/$/, '')

export const api = axios.create({
	baseURL: API_BASE,
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 20_000,
})

/** Текст для Alert / Metro: URL, код, причина (вместо голого "Network Error"). */
export function formatApiError(error: unknown): string {
	const err = error as AxiosError<{ message?: string | string[] }>
	const method = (err.config?.method || 'GET').toUpperCase()
	const path = err.config?.url || '?'
	const base = err.config?.baseURL || API_BASE
	const full = `${base}${path.startsWith('/') ? path : `/${path}`}`
	const serverMsg = err.response?.data?.message
	const detail = Array.isArray(serverMsg)
		? serverMsg.join(', ')
		: serverMsg || err.message || 'Unknown error'
	const status = err.response?.status
	const code = err.code ? ` [${err.code}]` : ''
	if (status) return `${method} ${full}\nHTTP ${status}${code}\n${detail}`
	return `${method} ${full}\n${detail}${code}\n(API unreachable — check host:port / firewall)`
}

api.interceptors.request.use(async config => {
	const token = await SecureStore.getItemAsync('access_token')
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	console.log(
		`[API] → ${(config.method || 'get').toUpperCase()} ${config.baseURL || API_BASE}${config.url || ''}`,
	)
	return config
})

/**
 * Не чистим сессию из интерцептора.
 * Раньше любой 401 (пустая БД / другой JWT / недоступный API) стирал токен → выкидывало на логин.
 * Выход только через signOut() в UI.
 */
api.interceptors.response.use(
	response => {
		console.log(
			`[API] ← ${response.status} ${(response.config.method || 'get').toUpperCase()} ${response.config.url}`,
		)
		return response
	},
	error => {
		console.error('[API] ✕', formatApiError(error))
		return Promise.reject(error)
	},
)
