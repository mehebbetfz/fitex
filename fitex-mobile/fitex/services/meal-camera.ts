import { requireOptionalNativeModule } from 'expo-modules-core'
import { Image } from 'react-native'

export function isInAppMealCameraSupported(): boolean {
	try {
		return requireOptionalNativeModule('ExpoCamera') != null
	} catch {
		return false
	}
}

async function readImageSize(uri: string): Promise<{ w: number; h: number }> {
	return new Promise((resolve, reject) => {
		Image.getSize(
			uri,
			(w, h) => resolve({ w, h }),
			err => reject(err),
		)
	})
}

/**
 * Resize full-frame meal photo for upload (no square crop).
 */
export async function prepareMealPhoto(uri: string): Promise<string> {
	if (requireOptionalNativeModule('ExpoImageManipulator') == null) {
		return uri
	}
	try {
		const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator')
		const size = await readImageSize(uri)
		const longest = Math.max(size.w, size.h)
		const actions =
			longest > 1280
				? size.w >= size.h
					? [{ resize: { width: 1280 } }]
					: [{ resize: { height: 1280 } }]
				: []

		const out = await manipulateAsync(uri, actions, {
			compress: 0.82,
			format: SaveFormat.JPEG,
		})
		return out.uri
	} catch {
		return uri
	}
}

/** @deprecated Use prepareMealPhoto — kept for older call sites */
export async function cropMealToCenterSquare(uri: string): Promise<string> {
	return prepareMealPhoto(uri)
}
