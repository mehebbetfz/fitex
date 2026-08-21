import type { ImageSourcePropType } from 'react-native'

export const PRESET_AVATAR_IDS = [
	'animal-01',
	'animal-02',
	'animal-03',
	'animal-04',
	'animal-05',
	'animal-06',
	'animal-07',
	'animal-08',
	'animal-09',
	'animal-10',
	'animal-11',
	'animal-12',
	'animal-13',
	'animal-14',
	'animal-15',
	'animal-16',
	'animal-17',
	'animal-18',
	'animal-19',
	'animal-20',
	'animal-21',
	'animal-22',
	'animal-23',
	'animal-24',
	'animal-25',
] as const

export type PresetAvatarId = (typeof PRESET_AVATAR_IDS)[number]

const SOURCES: Record<PresetAvatarId, ImageSourcePropType> = {
	'animal-01': require('@/assets/avatars/animal-01.png'),
	'animal-02': require('@/assets/avatars/animal-02.png'),
	'animal-03': require('@/assets/avatars/animal-03.png'),
	'animal-04': require('@/assets/avatars/animal-04.png'),
	'animal-05': require('@/assets/avatars/animal-05.png'),
	'animal-06': require('@/assets/avatars/animal-06.png'),
	'animal-07': require('@/assets/avatars/animal-07.png'),
	'animal-08': require('@/assets/avatars/animal-08.png'),
	'animal-09': require('@/assets/avatars/animal-09.png'),
	'animal-10': require('@/assets/avatars/animal-10.png'),
	'animal-11': require('@/assets/avatars/animal-11.png'),
	'animal-12': require('@/assets/avatars/animal-12.png'),
	'animal-13': require('@/assets/avatars/animal-13.png'),
	'animal-14': require('@/assets/avatars/animal-14.png'),
	'animal-15': require('@/assets/avatars/animal-15.png'),
	'animal-16': require('@/assets/avatars/animal-16.png'),
	'animal-17': require('@/assets/avatars/animal-17.png'),
	'animal-18': require('@/assets/avatars/animal-18.png'),
	'animal-19': require('@/assets/avatars/animal-19.png'),
	'animal-20': require('@/assets/avatars/animal-20.png'),
	'animal-21': require('@/assets/avatars/animal-21.png'),
	'animal-22': require('@/assets/avatars/animal-22.png'),
	'animal-23': require('@/assets/avatars/animal-23.png'),
	'animal-24': require('@/assets/avatars/animal-24.png'),
	'animal-25': require('@/assets/avatars/animal-25.png'),
}

export function isPresetAvatarId(id: string | null | undefined): id is PresetAvatarId {
	return !!id && (PRESET_AVATAR_IDS as readonly string[]).includes(id)
}

export function presetAvatarSource(
	id: string | null | undefined,
): ImageSourcePropType | null {
	if (!isPresetAvatarId(id)) return null
	return SOURCES[id]
}
