import { useLanguage } from '@/contexts/language-context'
import { VideoView, useVideoPlayer } from 'expo-video'
import { useVideoCache } from '@/hooks/use-video-cache'
import { Image } from 'expo-image'
import React, { useEffect } from 'react'
import {
	View,
	Text,
	ActivityIndicator,
	StyleSheet,
	type StyleProp,
	type ViewStyle,
} from 'react-native'

interface CachedVideoProps {
	/** Текущая ссылка из muscle_groups.ts — может меняться */
	remoteUrl: string | undefined
	/** Стабильный ID упражнения, например 'incline-barbell-bench-press' */
	videoId: string
	style?: StyleProp<ViewStyle>
	/** Управляет play/pause после загрузки. Если не задан — используется autoPlay. */
	playing?: boolean
	autoPlay?: boolean
	loop?: boolean
	muted?: boolean
	nativeControls?: boolean
	/** Постер, пока видео качается / недоступно */
	poster?: any
	/** Вызывается когда ролик доиграл до конца (если loop=false) */
	onEnded?: () => void
}

export const CachedVideo: React.FC<CachedVideoProps> = ({
	remoteUrl,
	videoId,
	style,
	playing,
	autoPlay = false,
	loop = false,
	muted = true,
	nativeControls = false,
	poster,
	onEnded,
}) => {
	const { t } = useLanguage()
	const { localUri, isLoading, progress, error } = useVideoCache(
		remoteUrl,
		videoId,
	)

	const shouldPlay = playing ?? autoPlay

	const player = useVideoPlayer(
		localUri ? { uri: localUri } : null,
		(p) => {
			p.loop = loop
			p.muted = muted
			// Не глушим музыку/видео из других приложений (демо-ролики обычно muted)
			p.audioMixingMode = 'mixWithOthers'
		},
	)

	useEffect(() => {
		player.loop = loop
		player.muted = muted
		player.audioMixingMode = 'mixWithOthers'
	}, [player, loop, muted])

	useEffect(() => {
		if (!localUri) return
		try {
			if (shouldPlay) {
				const duration = player.duration
				const current = player.currentTime
				if (
					Number.isFinite(duration) &&
					duration > 0 &&
					current >= Math.max(0, duration - 0.35)
				) {
					player.currentTime = 0
				}
				player.play()
			} else {
				player.pause()
			}
		} catch {
			// ignore player race on unmount / source swap
		}
	}, [localUri, shouldPlay, player])

	useEffect(() => {
		if (loop || !onEnded) return
		const sub = player.addListener('playToEnd', () => {
			try {
				player.pause()
				player.currentTime = 0
			} catch {
				// ignore
			}
			onEnded()
		})
		return () => {
			sub.remove()
		}
	}, [player, loop, onEnded, localUri])

	const showPoster = !localUri || !!error || (!!remoteUrl && isLoading)

	if (showPoster) {
		if (poster) {
			return (
				<View style={[styles.posterWrap, style]}>
					<Image source={poster} style={styles.posterImage} contentFit='contain' />
					{isLoading && remoteUrl ? (
						<View style={styles.posterOverlay}>
							<ActivityIndicator size='small' color='#34C759' />
							{progress > 0 && progress < 1 ? (
								<Text style={styles.progressText}>
									{Math.round(progress * 100)}%
								</Text>
							) : null}
						</View>
					) : null}
				</View>
			)
		}

		return (
			<View style={[styles.loader, style]}>
				<ActivityIndicator size='small' color='#34C759' />
				{progress > 0 && progress < 1 && (
					<View style={styles.progressContainer}>
						<View
							style={[
								styles.progressBar,
								{ width: `${Math.round(progress * 100)}%` },
							]}
						/>
						<Text style={styles.progressText}>
							{Math.round(progress * 100)}%
						</Text>
					</View>
				)}
				{!remoteUrl && (
					<Text style={styles.noVideoText}>
						{t('exercises', 'videoUnavailable')}
					</Text>
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
	posterWrap: {
		overflow: 'hidden',
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	posterImage: {
		width: '100%',
		height: '100%',
	},
	posterOverlay: {
		...StyleSheet.absoluteFillObject,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(0,0,0,0.28)',
		gap: 6,
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
