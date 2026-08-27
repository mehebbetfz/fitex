const fs = require('fs')

const nutrition = 'app/(tabs)/nutrition.tsx'
let s = fs.readFileSync(nutrition, 'utf8')
if (s.includes('dateLocaleFor') && !s.includes("import { dateLocaleFor }")) {
	s = "import { dateLocaleFor } from '@/locales'\n" + s
	fs.writeFileSync(nutrition, s)
	console.log('added nutrition import')
} else {
	console.log('nutrition import ok')
}

const recovery = 'app/(tabs)/recovery.tsx'
let r = fs.readFileSync(recovery, 'utf8')
r = r.replace(
	/const DATE_LOCALES_UNUSED[\s\S]*?as const\r?\n\r?\n/,
	'',
)
fs.writeFileSync(recovery, r)
console.log('cleaned recovery')

const others = [
	'app/(tabs)/history.tsx',
	'components/food-history-panel.tsx',
	'components/profile-stats-sections.tsx',
	'app/(auth)/(routes)/workout-details/[id].tsx',
	'app/modals/exercise-history-modal.tsx',
	'app/(auth)/(routes)/sync-stats/index.tsx',
]
for (const f of others) {
	let t = fs.readFileSync(f, 'utf8')
	if (t.includes('dateLocaleFor') && !t.includes("import { dateLocaleFor }")) {
		t = "import { dateLocaleFor } from '@/locales'\n" + t
		fs.writeFileSync(f, t)
		console.log('import', f)
	}
}
