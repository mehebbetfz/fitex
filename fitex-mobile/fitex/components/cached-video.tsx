import { useLanguage } from '@/contexts/language-context'
import { VideoView, useVideoPlayer } from 'expo-video'
import { useVideoCache } from '@/hooks/use-video-cache'
import React, { useEffect } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'

interface CachedVideoProps {
	/** Текущая ссылка из muscle_groups.ts — может меняться */
	remoteUrl: string | undefined
	/** Стабильный ID упражнения, например 'incline-barbell-bench-press' */
	videoId: string
	style?: object
	autoPlay?: boolean
	loop?: boolean
	muted?: boolean
	nativeControls?: boolean
}

export const CachedVideo: React.FC<CachedVideoProps> = ({
	remoteUrl,
	videoId,
	style,
	autoPlay = true,
	loop = true,
	muted = true,
	nativeControls = false,
}) => {
	const { t } = useLanguage()
	const { localUri, isLoading, progress, error } = useVideoCache(
		remoteUrl,
		videoId,
	)

	const player = useVideoPlayer(
		localUri ? { uri: localUri } : null,
		(p) => {
			p.loop = loop
			p.muted = muted
		},
	)

	// Запускаем воспроизведение когда uri готов
	useEffect(() => {
		if (localUri && autoPlay) {
			player.play()
		}
	}, [localUri, autoPlay])

	// Показываем лоадер пока идёт скачивание
	if (isLoading || !localUri) {
		return (
			<View style={[styles.loader, style]}>
				<ActivityIndicator size='small' color='#34C759' />
				{progress > 0 && progress < 1 && (
					<View style={styles.progressContainer}>
						<View
							style={[styles.progressBar, { width: `${Math.round(progress * 100)}%` }]}
						/>
						<Text style={styles.progressText}>
							{Math.round(progress * 100)}%
						</Text>
					</View>
				)}
				{!remoteUrl && (
					<Text style={styles.noVideoText}>{t('exercises', 'videoUnavailable')}</Text>
				)}
			</View>
		)
	}

	return (
		<VideoView
			style={style}
			player={player}
			allowsFullscreen
			allowsPictureInPicture
			nativeControls={nativeControls}
		/>
	)
}

const styles = StyleSheet.create({
	loader: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		height: 200,
		gap: 8,
	},
	progressContainer: {
		width: '70%',
		height: 4,
		backgroundColor: '#3A3A3C',
		borderRadius: 2,
		overflow: 'hidden',
		position: 'relative',
	},
	progressBar: {
		height: '100%',
		backgroundColor: '#34C759',
		borderRadius: 2,
	},
	progressText: {
		color: '#34C759',
		fontSize: 12,
		fontWeight: '600',
		marginTop: 6,
	},
	noVideoText: {
		color: '#8E8E93',
		fontSize: 13,
	},
})