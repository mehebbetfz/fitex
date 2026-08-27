// app/contexts/sync-initializer.tsx
import { useSyncContext } from '@/app/contexts/sync-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useRef } from 'react'
import { InteractionManager } from 'react-native'
import { hasActivePremium, useAuth } from './auth-context'
import { useDatabase } from './database-context'

const LAST_FULL_SYNC_USER_KEY = '@fitex/last_full_sync_user'

/**
 * Единственный владелец авто-синка при старте.
 * Тяжёлую работу откладывает после анимаций первого кадра,
 * чтобы баннер и UI не блокировали приложение.
 */
export const SyncInitializer = () => {
	const { user } = useAuth()
	const { performInitialSync, syncUnsyncedData, pullServerDataSilent, isInitialized } =
		useDatabase()
	const { startSync, setProgress, setPhase, finishSync } = useSyncContext()

	const lastSyncedUserId = useRef<string | null>(null)
	const inFlight = useRef(false)

	useEffect(() => {
		if (!user || !isInitialized) return
		if (!hasActivePremium(user)) return
		if (inFlight.current) return
		if (lastSyncedUserId.current === user.id) return

		const userId = user.id
		const previousUserId = lastSyncedUserId.current
		lastSyncedUserId.current = userId
		inFlight.current = true

		const task = InteractionManager.runAfterInteractions(() => {
			void (async () => {
				try {
					const lastFull = await AsyncStorage.getItem(LAST_FULL_SYNC_USER_KEY)
					const needsFullSync =
						previousUserId != null && previousUserId !== userId
							? true
							: lastFull !== userId

					startSync('Синхронизация...')
					setProgress(12, 'Синхронизация...')

					if (needsFullSync) {
						setPhase('downloading', 'Загрузка данных...')
						setProgress(35)
						await performInitialSync(true)
						await AsyncStorage.setItem(LAST_FULL_SYNC_USER_KEY, userId)
					} else {
						setPhase('uploading', 'Отправка изменений...')
						setProgress(40)
						await syncUnsyncedData(true)
						setPhase('downloading', 'Обновление...')
						setProgress(70)
						await pullServerDataSilent(true)
					}

					setProgress(95)
					finishSync(true)
					console.log(
						needsFullSync
							? '[Sync] Full sync completed'
							: '[Sync] Background sync completed',
					)
				} catch (err) {
					console.error('[Sync] Startup sync failed:', err)
					finishSync(false)
				} finally {
					inFlight.current = false
				}
			})()
		})

		return () => {
			task.cancel?.()
		}
	}, [
		user?.id,
		isInitialized,
		performInitialSync,
		syncUnsyncedData,
		pullServerDataSilent,
		startSync,
		setProgress,
		setPhase,
		finishSync,
	])

	return null
}
