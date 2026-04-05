import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system/legacy'
import { useEffect, useRef, useState } from 'react'

const VIDEO_CACHE_DIR = `${FileSystem.documentDirectory}videos/`
const VIDEO_META_KEY = '@video_cache_meta'

type VideoMeta = Record<string, { localPath: string; originalUrl: string }>

async function ensureCacheDir(): Promise<void> {
	const info = await FileSystem.getInfoAsync(VIDEO_CACHE_DIR)
	if (!info.exists) {
		await FileSystem.makeDirectoryAsync(VIDEO_CACHE_DIR, {
			intermediates: true,
		})
	}
}

async function getMeta(): Promise<VideoMeta> {
	try {
		const raw = await AsyncStorage.getItem(VIDEO_META_KEY)
		return raw ? JSON.parse(raw) : {}
	} catch {
		return {}
	}
}

async function saveMeta(meta: VideoMeta): Promise<void> {
	await AsyncStorage.setItem(VIDEO_META_KEY, JSON.stringify(meta))
}

export async function getCachedVideoUri(
	remoteUrl: string,
	videoId: string,
): Promise<{ uri: string; fromCache: boolean }> {
	await ensureCacheDir()
	const meta = await getMeta()
	const cached = meta[videoId]

	if (cached && cached.originalUrl === remoteUrl) {
		const fileInfo = await FileSystem.getInfoAsync(cached.localPath)
		if (fileInfo.exists) {
			return { uri: cached.localPath, fromCache: true }
		}
	}

	// URL изменился или файл не существует — удаляем старый
	if (cached) {
		try {
			await FileSystem.deleteAsync(cached.localPath, { idempotent: true })
		} catch { }
		// Сразу чистим мету, чтобы не оставалось «мёртвых» записей
		const updatedMeta = await getMeta()
		delete updatedMeta[videoId]
		await saveMeta(updatedMeta)
	}

	const localPath = `${VIDEO_CACHE_DIR}${videoId}.mp4`
	const downloadResult = await FileSystem.downloadAsync(remoteUrl, localPath)

	if (downloadResult.status !== 200) {
		throw new Error(`Failed to download video: ${downloadResult.status}`)
	}

	const updatedMeta = await getMeta()
	updatedMeta[videoId] = { localPath, originalUrl: remoteUrl }
	await saveMeta(updatedMeta)

	return { uri: localPath, fromCache: false }
}

/**
 * Хук для использования в компонентах.
 *
 * Поведение при смене remoteUrl:
 *  1. Предыдущая загрузка немедленно отменяется (pauseAsync)
 *  2. Старый файл удаляется с диска и из меты
 *  3. Начинается загрузка по новой ссылке
 *  4. При ошибке — фолбэк на прямой стриминг
 */
export function useVideoCache(
	remoteUrl: string | undefined,
	videoId: string,
) {
	const [localUri, setLocalUri] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [progress, setProgress] = useState(0)
	const [error, setError] = useState<string | null>(null)

	const cancelledRef = useRef(false)
	const abortRef = useRef<(() => void) | null>(null)

	useEffect(() => {
		if (!remoteUrl) {
			setLocalUri(null)
			setProgress(0)
			setError(null)
			return
		}

		cancelledRef.current = false

		async function load() {
			if (!remoteUrl) return

			setIsLoading(true)
			setError(null)
			setProgress(0)
			setLocalUri(null)

			try {
				await ensureCacheDir()
				const meta = await getMeta()
				const cached = meta[videoId]

				// Кэш валиден: тот же URL и файл на диске существует
				if (cached && cached.originalUrl === remoteUrl) {
					const fileInfo = await FileSystem.getInfoAsync(cached.localPath)
					if (fileInfo.exists) {
						if (!cancelledRef.current) {
							setLocalUri(cached.localPath)
							setProgress(1)
						}
						return
					}
				}

				// URL изменился или файл исчез — чистим предыдущую запись
				if (cached) {
					try {
						await FileSystem.deleteAsync(cached.localPath, {
							idempotent: true,
						})
					} catch { }

					// Удаляем из меты сразу, не дожидаясь конца загрузки
					const cleanMeta = await getMeta()
					delete cleanMeta[videoId]
					await saveMeta(cleanMeta)
				}

				if (cancelledRef.current) return

				const localPath = `${VIDEO_CACHE_DIR}${videoId}.mp4`

				const downloadResumable = FileSystem.createDownloadResumable(
					remoteUrl,
					localPath,
					{},
					(downloadProgress) => {
						if (cancelledRef.current) return
						const total = downloadProgress.totalBytesExpectedToWrite
						const written = downloadProgress.totalBytesWritten
						if (total > 0) {
							setProgress(written / total)
						}
					},
				)

				abortRef.current = () => {
					downloadResumable.pauseAsync().catch(() => { })
				}

				const result = await downloadResumable.downloadAsync()

				if (cancelledRef.current) return

				if (!result || result.status !== 200) {
					throw new Error(`Download failed with status: ${result?.status}`)
				}

				const updatedMeta = await getMeta()
				updatedMeta[videoId] = { localPath, originalUrl: remoteUrl }
				await saveMeta(updatedMeta)

				if (!cancelledRef.current) {
					setLocalUri(localPath)
					setProgress(1)
				}
			} catch (e: unknown) {
				if (cancelledRef.current) return

				const message =
					e instanceof Error ? e.message : 'Unknown download error'
				setError(message)

				// Фолбэк — стриминг напрямую по новой ссылке
				setLocalUri(remoteUrl)
			} finally {
				if (!cancelledRef.current) {
					setIsLoading(false)
					abortRef.current = null
				}
			}
		}

		load()

		return () => {
			// Cleanup: отменяем текущую загрузку при смене url или размонтировании
			cancelledRef.current = true
			abortRef.current?.()
			abortRef.current = null
		}
	}, [remoteUrl, videoId])

	return { localUri, isLoading, progress, error }
}