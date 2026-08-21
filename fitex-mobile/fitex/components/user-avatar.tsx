import {
	presetAvatarSource,
	type PresetAvatarId,
} from '@/constants/preset-avatars'
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native'

type Props = {
	avatarPreset?: string | null
	avatarUrl?: string | null
	name?: string
	size?: number
	style?: StyleProp<ViewStyle>
	backgroundColor?: string
	textColor?: string
}

function safeHttp(uri: string | null | undefined): string | null {
	if (!uri || typeof uri !== 'string') return null
	const t = uri.trim()
	if (!t.startsWith('http://') && !t.startsWith('https://')) return null
	return t
}

export function UserAvatar({
	avatarPreset,
	avatarUrl,
	name,
	size = 40,
	style,
	backgroundColor = '#2C2C2E',
	textColor = '#FFF',
}: Props) {
	const preset = presetAvatarSource(avatarPreset as PresetAvatarId)
	const remote = safeHttp(avatarUrl)
	const initial = (name?.trim()?.[0] || '?').toUpperCase()

	return (
		<View
			style={[
				styles.wrap,
				{
					width: size,
					height: size,
					borderRadius: size / 2,
					backgroundColor,
				},
				style,
			]}
		>
			{preset ? (
				<Image source={preset} style={styles.img} />
			) : remote ? (
				<Image source={{ uri: remote }} style={styles.img} />
			) : (
				<Text style={[styles.initial, { fontSize: size * 0.38, color: textColor }]}>
					{initial}
				</Text>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
	img: { width: '100%', height: '100%' },
	initial: { fontWeight: '800' },
})
