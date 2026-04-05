// app/contexts/sync-initializer.tsx
import { useSyncContext } from '@/app/contexts/sync-context'
import { useEffect, useRef } from 'react'
import { useAuth } from './auth-context'
import { useDatabase } from './database-context'

/**
 * Компонент-невидимка. Монтируется внутри всех провайдеров,
 * поэтому может безопасно использовать все хуки.
 *
 * Отвечает за:
 * 1. performInitialSync — при первом входе / смене пользователя
 * 2. syncUnsyncedData   — при старте приложения если уже залогинен
 *
 * Оба сценария теперь визуально отображаются через SyncBanner.
 */
export const SyncInitializer = () => {
	const { user } = useAuth()
	const { performInitialSync, syncUnsyncedData, isInitialized } = useDatabase()
	const { startSync, setProgress, setPhase, finishSync } = useSyncContext()

	const lastSyncedUserId = useRef<string | null>(null)
	const hasSyncedOnStartup = useRef(false)

	// ── Новый пользователь: полная двусторонняя синхронизация ──────────────
	useEffect(() => {
		if (!user || !isInitialized) return
		if (!user.isPremium) return
		if (lastSyncedUserId.current === user.id) return

		lastSyncedUserId.current = user.id
		hasSyncedOnStartup.current = true

		const run = async () => {
			try {
				startSync('Подключение к серверу...')

				// Имитируем фазы, чтобы прогресс выглядел живым.
				// Замени на реальные колбэки если performInitialSync их поддерживает.
				setProgress(15, 'Подключение...')
				await new Promise(r => setTimeout(r, 400))

				setProgress(35, 'Загрузка данных...')
				setPhase('uploading', 'Загрузка данных...')

				await performInitialSync(user.isPremium)

				setProgress(80, 'Получение данных...')
				setPhase('downloading', 'Получение данных...')

				await new Promise(r => setTimeout(r, 300))

				finishSync(true)
				console.log('[Sync] Initial sync completed')
			} catch (err) {
				console.error('[Sync] Initial sync failed:', err)
				finishSync(false)
			}
		}

		run()
	}, [user?.id, isInitialized])

	// ── Старт приложения: отправляем только не синхронизированное ──────────
	useEffect(() => {
		if (!user || !isInitialized) return
		if (!user.isPremium) return
		if (hasSyncedOnStartup.current) return

		hasSyncedOnStartup.current = true

		const run = async () => {
			try {
				startSync('Синхронизация...')
				setProgress(20, 'Отправка изменений...')
				setPhase('uploading', 'Отправка изменений...')

				await syncUnsyncedData(user.isPremium)

				setProgress(90)
				await new Promise(r => setTimeout(r, 200))

				finishSync(true)
				console.log('[Sync] Startup sync completed')
			} catch (err) {
				console.error('[Sync] Startup sync failed:', err)
				finishSync(false)
			}
		}

		run()
	}, [isInitialized])

	return null
}
