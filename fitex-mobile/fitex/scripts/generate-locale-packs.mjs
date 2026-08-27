/**
 * Generate locale JSON packs from en.json via Google Translate.
 *
 * Usage:
 *   node ./scripts/generate-locale-packs.mjs
 *   node ./scripts/generate-locale-packs.mjs de fr
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import translate from 'google-translate-api-x'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const packsDir = path.join(root, 'locales', 'packs')
const enPath = path.join(packsDir, 'en.json')

const TARGETS = [
	{ code: 'de', google: 'de' },
	{ code: 'uk', google: 'uk' },
	{ code: 'hi', google: 'hi' },
	{ code: 'zh', google: 'zh-CN' },
	{ code: 'ar', google: 'ar' },
	{ code: 'he', google: 'he' },
	{ code: 'tr', google: 'tr' },
	{ code: 'fr', google: 'fr' },
	{ code: 'es', google: 'es' },
	{ code: 'pt', google: 'pt' },
	{ code: 'it', google: 'it' },
	{ code: 'pl', google: 'pl' },
	{ code: 'nl', google: 'nl' },
	{ code: 'ja', google: 'ja' },
	{ code: 'ko', google: 'ko' },
	{ code: 'vi', google: 'vi' },
	{ code: 'th', google: 'th' },
	{ code: 'id', google: 'id' },
	{ code: 'ms', google: 'ms' },
	{ code: 'sv', google: 'sv' },
	{ code: 'no', google: 'no' },
	{ code: 'da', google: 'da' },
	{ code: 'fi', google: 'fi' },
	{ code: 'cs', google: 'cs' },
	{ code: 'ro', google: 'ro' },
	{ code: 'hu', google: 'hu' },
	{ code: 'el', google: 'el' },
]

function flatten(obj, prefix = '', out = []) {
	for (const [k, v] of Object.entries(obj)) {
		const key = prefix ? `${prefix}.${k}` : k
		if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out)
		else out.push({ key, value: String(v ?? '') })
	}
	return out
}

function unflatten(entries) {
	const rootObj = {}
	for (const { key, value } of entries) {
		const parts = key.split('.')
		let cur = rootObj
		for (let i = 0; i < parts.length - 1; i++) {
			cur[parts[i]] = cur[parts[i]] || {}
			cur = cur[parts[i]]
		}
		cur[parts[parts.length - 1]] = value
	}
	return rootObj
}

function sleep(ms) {
	return new Promise(r => setTimeout(r, ms))
}

async function translateBatch(texts, to) {
	const res = await translate(texts, { from: 'en', to, forceBatch: true })
	if (Array.isArray(res)) return res.map(r => r.text)
	return [res.text]
}

async function main() {
	const filter = process.argv.slice(2)
	const targets = filter.length
		? TARGETS.filter(t => filter.includes(t.code))
		: TARGETS

	if (!fs.existsSync(enPath)) {
		console.error('Missing locales/packs/en.json — export EN first')
		process.exit(1)
	}

	const en = JSON.parse(fs.readFileSync(enPath, 'utf8'))
	const flat = flatten(en)
	console.log(`EN leaves: ${flat.length}; targets: ${targets.map(t => t.code).join(', ')}`)

	const BATCH = 35
	for (const t of targets) {
		const outPath = path.join(packsDir, `${t.code}.json`)
		if (fs.existsSync(outPath) && !filter.length) {
			console.log(`skip ${t.code} (exists)`)
			continue
		}
		console.log(`→ ${t.code} (${t.google})`)
		const translated = []
		for (let i = 0; i < flat.length; i += BATCH) {
			const chunk = flat.slice(i, i + BATCH)
			const texts = chunk.map(c => c.value)
			let ok = false
			for (let attempt = 0; attempt < 5 && !ok; attempt++) {
				try {
					const parts = await translateBatch(texts, t.google)
					for (let j = 0; j < chunk.length; j++) {
						translated.push({
							key: chunk[j].key,
							value: parts[j] ?? chunk[j].value,
						})
					}
					ok = true
				} catch (e) {
					console.warn(
						`  retry ${attempt + 1} @${i}: ${e && e.message ? e.message : e}`,
					)
					await sleep(1500 * (attempt + 1))
				}
			}
			if (!ok) {
				for (const c of chunk) translated.push({ key: c.key, value: c.value })
			}
			process.stdout.write(`  ${Math.min(i + BATCH, flat.length)}/${flat.length}\r`)
			await sleep(300)
		}
		const tree = unflatten(translated)
		fs.writeFileSync(outPath, JSON.stringify(tree, null, 2), 'utf8')
		console.log(`\n✓ ${t.code} → ${outPath}`)
	}
}

main().catch(e => {
	console.error(e)
	process.exit(1)
})
