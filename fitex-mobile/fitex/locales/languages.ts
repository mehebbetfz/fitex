/** App language registry — codes, native names, BCP-47 date locales, RTL. */

export const LANGUAGE_CODES = [
	'ru',
	'en',
	'az',
	'de',
	'uk',
	'hi',
	'zh',
	'ar',
	'he',
	'tr',
	'fr',
	'es',
	'pt',
	'it',
	'pl',
	'nl',
	'ja',
	'ko',
	'vi',
	'th',
	'id',
	'ms',
	'sv',
	'no',
	'da',
	'fi',
	'cs',
	'ro',
	'hu',
	'el',
] as const

export type Language = (typeof LANGUAGE_CODES)[number]

/** Languages with full hand-maintained trees in index.ts */
export const CORE_LANGUAGES = ['ru', 'en', 'az'] as const
export type CoreLanguage = (typeof CORE_LANGUAGES)[number]

export const LANGUAGE_NAMES: Record<Language, string> = {
	ru: 'Русский',
	en: 'English',
	az: 'Azərbaycanca',
	de: 'Deutsch',
	uk: 'Українська',
	hi: 'हिन्दी',
	zh: '中文',
	ar: 'العربية',
	he: 'עברית',
	tr: 'Türkçe',
	fr: 'Français',
	es: 'Español',
	pt: 'Português',
	it: 'Italiano',
	pl: 'Polski',
	nl: 'Nederlands',
	ja: '日本語',
	ko: '한국어',
	vi: 'Tiếng Việt',
	th: 'ไทย',
	id: 'Bahasa Indonesia',
	ms: 'Bahasa Melayu',
	sv: 'Svenska',
	no: 'Norsk',
	da: 'Dansk',
	fi: 'Suomi',
	cs: 'Čeština',
	ro: 'Română',
	hu: 'Magyar',
	el: 'Ελληνικά',
}

export const LANGUAGE_FLAGS: Record<Language, string> = {
	ru: '🇷🇺',
	en: '🇬🇧',
	az: '🇦🇿',
	de: '🇩🇪',
	uk: '🇺🇦',
	hi: '🇮🇳',
	zh: '🇨🇳',
	ar: '🇸🇦',
	he: '🇮🇱',
	tr: '🇹🇷',
	fr: '🇫🇷',
	es: '🇪🇸',
	pt: '🇧🇷',
	it: '🇮🇹',
	pl: '🇵🇱',
	nl: '🇳🇱',
	ja: '🇯🇵',
	ko: '🇰🇷',
	vi: '🇻🇳',
	th: '🇹🇭',
	id: '🇮🇩',
	ms: '🇲🇾',
	sv: '🇸🇪',
	no: '🇳🇴',
	da: '🇩🇰',
	fi: '🇫🇮',
	cs: '🇨🇿',
	ro: '🇷🇴',
	hu: '🇭🇺',
	el: '🇬🇷',
}

export const DATE_LOCALES: Record<Language, string> = {
	ru: 'ru-RU',
	en: 'en-US',
	az: 'az-AZ',
	de: 'de-DE',
	uk: 'uk-UA',
	hi: 'hi-IN',
	zh: 'zh-CN',
	ar: 'ar-SA',
	he: 'he-IL',
	tr: 'tr-TR',
	fr: 'fr-FR',
	es: 'es-ES',
	pt: 'pt-BR',
	it: 'it-IT',
	pl: 'pl-PL',
	nl: 'nl-NL',
	ja: 'ja-JP',
	ko: 'ko-KR',
	vi: 'vi-VN',
	th: 'th-TH',
	id: 'id-ID',
	ms: 'ms-MY',
	sv: 'sv-SE',
	no: 'nb-NO',
	da: 'da-DK',
	fi: 'fi-FI',
	cs: 'cs-CZ',
	ro: 'ro-RO',
	hu: 'hu-HU',
	el: 'el-GR',
}

export const RTL_LANGUAGES: ReadonlySet<Language> = new Set(['ar', 'he'])

export function isRtlLanguage(lang: Language | null | undefined): boolean {
	return !!lang && RTL_LANGUAGES.has(lang)
}

export function isLanguage(value: string | null | undefined): value is Language {
	return !!value && (LANGUAGE_CODES as readonly string[]).includes(value)
}

export function dateLocaleFor(lang: Language | string | null | undefined): string {
	if (lang && isLanguage(lang) && DATE_LOCALES[lang]) return DATE_LOCALES[lang]
	return 'ru-RU'
}
