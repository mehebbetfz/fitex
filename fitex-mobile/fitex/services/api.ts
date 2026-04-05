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

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {
			await SecureStore.deleteItemAsync('access_token')
			await SecureStore.deleteItemAsync('user')
			// Можно редиректить на логин через навигацию, но здесь лучше через контекст
		}
		return Promise.reject(error)
	}
)