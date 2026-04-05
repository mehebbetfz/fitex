// app/contexts/sync-context.tsx
import React, {
	createContext,
	useCallback,
	useContext,
	useRef,
	useState,
} from 'react'

export type SyncPhase =
	| 'idle'
	| 'connecting'
	| 'uploading'
	| 'downloading'
	| 'done'
	| 'error'

export interface SyncState {
	phase: SyncPhase
	progress: number // 0–100
	message: string
}

interface SyncContextValue {
	sync: SyncState
	startSync: (message?: string) => void
	setProgress: (progress: number, message?: string) => void
	setPhase: (phase: SyncPhase, message?: string) => void
	finishSync: (success?: boolean) => void
}

const IDLE: SyncState = { phase: 'idle', progress: 0, message: '' }

const PHASE_LABELS: Record<SyncPhase, string> = {
	idle: '',
	connecting: 'Подключение...',
	uploading: 'Загрузка данных...',
	downloading: 'Получение данных...',
	done: 'Синхронизировано',
	error: 'Ошибка синхронизации',
}

const SyncContext = createContext<SyncContextValue>({
	sync: IDLE,
	startSync: () => {},
	setProgress: () => {},
	setPhase: () => {},
	finishSync: () => {},
})

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [sync, setSync] = useState<SyncState>(IDLE)
	const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

	const clearDismiss = () => {
		if (dismissTimer.current) {
			clearTimeout(dismissTimer.current)
			dismissTimer.current = null
		}
	}

	const startSync = useCallback((message?: string) => {
		clearDismiss()
		setSync({
			phase: 'connecting',
			progress: 5,
			message: message ?? PHASE_LABELS.connecting,
		})
	}, [])

	const setProgress = useCallback((progress: number, message?: string) => {
		setSync(prev => ({
			...prev,
			progress: Math.min(99, progress),
			...(message ? { message } : {}),
		}))
	}, [])

	const setPhase = useCallback((phase: SyncPhase, message?: string) => {
		setSync(prev => ({
			...prev,
			phase,
			message: message ?? PHASE_LABELS[phase],
		}))
	}, [])

	const finishSync = useCallback((success = true) => {
		clearDismiss()
		setSync({
			phase: success ? 'done' : 'error',
			progress: 100,
			message: success ? PHASE_LABELS.done : PHASE_LABELS.error,
		})
		dismissTimer.current = setTimeout(() => setSync(IDLE), 2500)
	}, [])

	return (
		<SyncContext.Provider
			value={{ sync, startSync, setProgress, setPhase, finishSync }}
		>
			{children}
		</SyncContext.Provider>
	)
}

export const useSyncContext = () => useContext(SyncContext)