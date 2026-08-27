const fs = require('fs')

const files = [
	'app/(tabs)/recovery.tsx',
	'app/(tabs)/nutrition.tsx',
	'app/(tabs)/history.tsx',
	'components/food-history-panel.tsx',
	'components/profile-stats-sections.tsx',
	'app/(auth)/(routes)/workout-details/[id].tsx',
	'app/modals/exercise-history-modal.tsx',
	'app/(auth)/(routes)/sync-stats/index.tsx',
]

for (const f of files) {
	let s = fs.readFileSync(f, 'utf8')
	if (!s.includes('dateLocaleFor')) {
		if (s.includes("from '@/locales'")) {
			s = s.replace(
				"from '@/locales'",
				"from '@/locales'\nimport { dateLocaleFor } from '@/locales'",
			)
		}
	}
	s = s.replace(
		/language === 'az' \? 'az-AZ' : language === 'en' \? 'en-US' : 'ru-RU'/g,
		'dateLocaleFor(language)',
	)
	s = s.replace(
		/language === 'en' \? 'en-US' : language === 'az' \? 'az-AZ' : 'ru-RU'/g,
		'dateLocaleFor(language)',
	)
	s = s.replace(/DATE_LOCALES\[language\] \?\? 'ru-RU'/g, 'dateLocaleFor(language)')
	s = s.replace(/localeMap\[language\] \?\? 'ru-RU'/g, 'dateLocaleFor(language)')
	s = s.replace(/localeMap\[lang\] \?\? 'ru-RU'/g, 'dateLocaleFor(lang)')
	s = s.replace(/localeMap\[lang\] \?\? 'en-US'/g, 'dateLocaleFor(lang)')
	s = s.replace(/LOCALE_MAP\[lang\] \?\? 'ru-RU'/g, 'dateLocaleFor(lang)')
	fs.writeFileSync(f, s)
	console.log('updated', f)
}
