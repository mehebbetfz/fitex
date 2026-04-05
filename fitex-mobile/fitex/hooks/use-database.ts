import {
	initDatabase,
	progressRepository,
	userRepository,
	workoutRepository,
} from '@/src/database'
import { useEffect, useState } from 'react'

export const useDatabase = () => {
	const [isInitialized, setIsInitialized] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const initialize = async () => {
			try {
				const success = await initDatabase()
				setIsInitialized(success)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error')
				setIsInitialized(false)
			}
		}

		initialize()
	}, [])

	return {
		isInitialized,
		error,
		workoutRepository,
		userRepository,
		progressRepository,
	}
}
