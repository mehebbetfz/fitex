import {
	colorsFor,
	type AppColors,
	type ResolvedTheme,
	type ThemePreference,
} from '@/constants/app-theme'
import AsyncStorage from '@react-native-async-storage/async-storage'
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react'
import { Appearance, StatusBar, useColorScheme } from 'react-native'

const STORAGE_KEY = 'app_theme_preference'

type ThemeContextType = {
	preference: ThemePreference
	resolved: ResolvedTheme
	colors: AppColors
	isDark: boolean
	setPreference: (pref: ThemePreference) => Promise<void>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function resolve(
	preference: ThemePreference,
	system: 'light' | 'dark' | null | undefined,
): ResolvedTheme {
	if (preference === 'system') {
		return system === 'light' ? 'light' : 'dark'
	}
	return preference
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const system = useColorScheme()
	const [preference, setPreferenceState] = useState<ThemePreference>('dark')
	const [ready, setReady] = useState(false)

	useEffect(() => {
		AsyncStorage.getItem(STORAGE_KEY)
			.then(saved => {
				if (saved === 'light' || saved === 'dark' || saved === 'system') {
					setPreferenceState(saved)
				}
			})
			.finally(() => setReady(true))
	}, [])

	const resolved = useMemo(
		() => resolve(preference, system),
		[preference, system],
	)
	const colors = useMemo(() => colorsFor(resolved), [resolved])
	const isDark = resolved === 'dark'

	useEffect(() => {
		if (!ready) return
		// RN 0.72+: force native UI (DatePicker etc.) to match app choice
		try {
			const setScheme = (Appearance as { setColorScheme?: (s: 'light' | 'dark' | null) => void })
				.setColorScheme
			setScheme?.(preference === 'system' ? null : preference)
		} catch {
			/* older runtimes */
		}
	}, [preference, ready])

	const setPreference = useCallback(async (pref: ThemePreference) => {
		await AsyncStorage.setItem(STORAGE_KEY, pref)
		setPreferenceState(pref)
	}, [])

	const value = useMemo(
		() => ({ preference, resolved, colors, isDark, setPreference }),
		[preference, resolved, colors, isDark, setPreference],
	)

	return (
		<ThemeContext.Provider value={value}>
			<StatusBar
				barStyle={isDark ? 'light-content' : 'dark-content'}
				backgroundColor={colors.background}
			/>
			{children}
		</ThemeContext.Provider>
	)
}

export function useAppTheme() {
	const ctx = useContext(ThemeContext)
	if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider')
	return ctx
}
