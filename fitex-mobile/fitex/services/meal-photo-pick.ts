import { requireOptionalNativeModule } from 'expo-modules-core'
import type * as ImagePickerTypes from 'expo-image-picker'
import { prepareMealPhoto } from '@/services/meal-camera'

export type MealPickSource = 'camera' | 'library'

export type MealPickResult =
	| { ok: true; uri: string }
	| { ok: false; reason: 'permission' | 'cancel' | 'unsupported' }

/**
 * Builds older than the nutrition feature ship without the picker/manipulator
 * native code. Touching those modules there is a hard crash, so probe first —
 * OTA updates cannot add native modules.
 */
export function isMealPhotoSupported(): boolean {
	return requireOptionalNativeModule('ExponentImagePicker') != null
}

export async function pickMealJpeg(
	from: MealPickSource,
): Promise<MealPickResult> {
	if (!isMealPhotoSupported()) return { ok: false, reason: 'unsupported' }

	const ImagePicker = await import('expo-image-picker')

	const perm =
		from === 'camera'
			? await ImagePicker.requestCameraPermissionsAsync()
			: await ImagePicker.requestMediaLibraryPermissionsAsync()
	if (!perm.granted) return { ok: false, reason: 'permission' }

	const opts: ImagePickerTypes.ImagePickerOptions = {
		mediaTypes: ImagePicker.MediaTypeOptions.Images,
		quality: 0.85,
		allowsEditing: false,
	}

	const result =
		from === 'camera'
			? await ImagePicker.launchCameraAsync(opts)
			: await ImagePicker.launchImageLibraryAsync(opts)

	if (result.canceled || !result.assets?.[0]?.uri) {
		return { ok: false, reason: 'cancel' }
	}

	const uri = await prepareMealPhoto(result.assets[0].uri)
	return { ok: true, uri }
}
