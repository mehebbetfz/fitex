/** Normalize AI vitamin keys → stable label ids for i18n. */
const VITAMIN_ALIASES: Record<string, string> = {
	vitamin_c: 'vitaminC',
	vitaminc: 'vitaminC',
	vitaminc_mg: 'vitaminC',
	vitamin_c_mg: 'vitaminC',
	c_mg: 'vitaminC',
	vitamin_a: 'vitaminA',
	vitamina: 'vitaminA',
	vitamina_ug: 'vitaminA',
	vitamin_a_ug: 'vitaminA',
	a_ug: 'vitaminA',
	vitamin_d: 'vitaminD',
	vitamind: 'vitaminD',
	vitamind_ug: 'vitaminD',
	vitamin_d_ug: 'vitaminD',
	vitamin_b12: 'vitaminB12',
	vitaminb12: 'vitaminB12',
	vitaminb12_ug: 'vitaminB12',
	vitamin_b12_ug: 'vitaminB12',
	vitamin_b6: 'vitaminB6',
	vitaminb6: 'vitaminB6',
	vitaminb6_mg: 'vitaminB6',
	vitamin_e: 'vitaminE',
	vitamine: 'vitaminE',
	vitamine_mg: 'vitaminE',
	vitamin_k: 'vitaminK',
	vitamink: 'vitaminK',
	iron: 'iron',
	iron_mg: 'iron',
	calcium: 'calcium',
	calcium_mg: 'calcium',
	magnesium: 'magnesium',
	magnesium_mg: 'magnesium',
	potassium: 'potassium',
	potassium_mg: 'potassium',
	zinc: 'zinc',
	zinc_mg: 'zinc',
	sodium: 'sodium',
	sodium_mg: 'sodium',
	fiber: 'fiber',
	fibre: 'fiber',
	fiber_g: 'fiber',
	folate: 'folate',
	folate_ug: 'folate',
	phosphorus: 'phosphorus',
	phosphorus_mg: 'phosphorus',
	selenium: 'selenium',
	selenium_ug: 'selenium',
}

export type VitaminUnit = 'mg' | 'ug' | 'g' | ''

export function parseVitaminKey(raw: string): {
	id: string
	unit: VitaminUnit
} {
	const key = raw.trim().replace(/\s+/g, '_').toLowerCase()
	let unit: VitaminUnit = ''
	if (/_mg$/i.test(key) || /mg$/i.test(key)) unit = 'mg'
	else if (/_ug$/i.test(key) || /_µg$/i.test(key) || /ug$/i.test(key)) unit = 'ug'
	else if (/_g$/i.test(key)) unit = 'g'

	const id =
		VITAMIN_ALIASES[key] ||
		VITAMIN_ALIASES[key.replace(/_(mg|ug|µg|g)$/i, '')] ||
		raw
			.replace(/_(mg|ug|µg|g)$/i, '')
			.replace(/_/g, ' ')
			.trim()

	return { id, unit }
}

export function formatVitaminValue(val: number): string {
	if (!Number.isFinite(val)) return '0'
	if (val >= 100) return String(Math.round(val))
	if (val >= 10) return String(Math.round(val * 10) / 10)
	return String(Math.round(val * 100) / 100)
}

/** Accent colors for vitamin cards */
export const VITAMIN_ACCENTS: Record<string, string> = {
	vitaminC: '#34C759',
	vitaminA: '#FF9F0A',
	vitaminD: '#FFD60A',
	vitaminB12: '#BF5AF2',
	vitaminB6: '#AF52DE',
	vitaminE: '#30D158',
	vitaminK: '#64D2FF',
	iron: '#FF6B6B',
	calcium: '#5AC8FA',
	magnesium: '#64D2FF',
	potassium: '#FF9F0A',
	zinc: '#AC8E68',
	sodium: '#8E8E93',
	fiber: '#32ADE6',
	folate: '#FF375F',
	phosphorus: '#7D7AFF',
	selenium: '#FFCC00',
}
