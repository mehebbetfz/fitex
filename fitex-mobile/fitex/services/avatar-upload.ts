import type { User } from '@/app/contexts/auth-context'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'
import * as SecureStore from 'expo-secure-store'

export type PickSquareAvatarResult =
	| { ok: true; uri: string }
	| { ok: false; reason: 'permission' | 'cancel' }

/**
 * Галерея → нативный кроп 1:1 → сжатие JPEG 512px (квадрат после кропа).
 */
export async function pickSquareAvatarJpeg(): Promise<PickSquareAvatarResult> {
	const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
	if (!perm.granted) return { ok: false, reason: 'permission' }

	const result = await ImagePicker.launchImageLibraryAsync({
		mediaTypes: ImagePicker.MediaTypeOptions.Images,
		allowsEditing: true,
		aspect: [1, 1],
		quality: 0.92,
	})

	if (result.canceled || !result.assets?.[0]?.uri) {
		return { ok: false, reason: 'cancel' }
	}

	const processed = await manipulateAsync(
		result.assets[0].uri,
		[{ resize: { width: 512 } }],
		{ compress: 0.82, format: SaveFormat.JPEG },
	)

	return { ok: true, uri: processed.uri }
}

/** Ответ POST /auth/avatar — полный публичный объект пользователя. */
export async function uploadProfileAvatar(jpegUri: string): Promise<User> {
	const token = await SecureStore.getItemAsync('access_token')
	const base = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000').replace(
		/\/$/,
		'',
	)
	const form = new FormData()
	// RN FormData file entry (see expo upload docs)
	form.append('file', {
		uri: jpegUri,
		name: 'avatar.jpg',
		type: 'image/jpeg',
	} as never)
	const res = await fetch(`${base}/auth/avatar`, {
		method: 'POST',
		headers: token ? { Authorization: `Bearer ${token}` } : {},
		body: form,
	})
	if (!res.ok) {
		let msg = res.statusText
		try {
			const j = (await res.json()) as { message?: string | string[] }
			const m = j.message
			msg = Array.isArray(m) ? m.join(', ') : m || msg
		} catch {
			/* ignore */
		}
		throw new Error(msg)
	}
	return (await res.json()) as User
}
