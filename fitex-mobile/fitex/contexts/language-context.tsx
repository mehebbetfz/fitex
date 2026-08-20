import AsyncStorage from '@react-native-async-storage/async-storage'
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'
import { Language, Translations, translations } from '../locales'

const STORAGE_KEY = 'app_language'

interface LanguageContextType {
	language: Language | null
	isLoading: boolean
	setLanguage: (lang: Language) => Promise<void>
	t: <S extends keyof Translations>(
		section: S,
		key: keyof Translations[S],
	) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [language, setLanguageState] = useState<Language | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		AsyncStorage.getItem(STORAGE_KEY)
			.then(saved => {
				if (saved === 'ru' || saved === 'en' || saved === 'az') {
					setLanguageState(saved)
				}
			})
			.finally(() => setIsLoading(false))
	}, [])

	const setLanguage = useCallback(async (lang: Language) => {
		await AsyncStorage.setItem(STORAGE_KEY, lang)
		setLanguageState(lang)
	}, [])

	const t = useCallback(
		<S extends keyof Translations>(
			section: S,
			key: keyof Translations[S],
		): string => {
			try {
				const lang = language ?? 'ru'
				const pack = translations[lang] ?? translations.ru
				const section_translations = pack?.[section] as
					| Record<string, string>
					| undefined
				const value = section_translations?.[key as string]
				return typeof value === 'string' ? value : String(key)
			} catch {
				return String(key)
			}
		},
		[language],
	)

	return (
		<LanguageContext.Provider value={{ language, isLoading, setLanguage, t }}>
			{children}
		</LanguageContext.Provider>
	)
}

export const useLanguage = () => {
	const ctx = useContext(LanguageContext)
	if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
	return ctx
}
