import {
	Injectable,
	Logger,
	ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface VisionFoodResult {
	name: string
	calories: number
	proteinG: number
	carbsG: number
	fatG: number
	vitamins: Record<string, number>
	confidence?: number
	raw: Record<string, unknown>
}

@Injectable()
export class NutritionVisionService {
	private readonly log = new Logger(NutritionVisionService.name)

	constructor(private readonly config: ConfigService) {}

	async analyzeImage(
		jpegBuffer: Buffer,
		note?: string,
		language?: string,
	): Promise<VisionFoodResult> {
		const started = Date.now()
		const apiKey = this.config.get<string>('OPENAI_API_KEY')?.trim()
		const model =
			this.config.get<string>('OPENAI_VISION_MODEL') || 'gpt-4o-mini'

		if (!apiKey) {
			this.log.error('OPENAI_API_KEY missing or empty — cannot analyze meal')
			throw new ServiceUnavailableException(
				'Food AI is not configured (OPENAI_API_KEY missing on server)',
			)
		}

		const lang = (language || 'en').toLowerCase().slice(0, 2)
		const langName =
			lang === 'ru' ? 'Russian' : lang === 'az' ? 'Azerbaijani' : 'English'

		this.log.log(
			`vision request model=${model} jpegBytes=${jpegBuffer.length} ` +
				`keyPrefix=${apiKey.slice(0, 7)}… note=${note?.trim() ? 'yes' : 'no'} lang=${lang}`,
		)

		const b64 = jpegBuffer.toString('base64')
		const noteLine = note?.trim()
			? `User note (treat as ground truth for ingredients/amounts when possible): ${note.trim()}`
			: 'No extra note from the user. If weight is ambiguous, state your best estimate and use confidence accordingly.'

		const system = `You are a precise nutrition analyst for meal photos.
Your job is to estimate TOTAL macros for EVERYTHING visible on the plate / in the frame — not a "typical small serving".

METHOD (follow strictly):
1) List each distinct food item (e.g. cottage cheese / творог, banana, rice, chicken…).
2) For each item estimate edible weight in GRAMS using visual cues:
   - plate diameter ~22–26 cm for a dinner plate; bowl volume; fork/spoon size; hand if visible
   - whole fruits: medium banana edible part ≈ 100–120 g each; large ≈ 130–150 g
   - mounds of soft food (cottage cheese, yogurt, oatmeal): compare height/spread to plate; a heaping pile covering most of a dinner plate is often 300–500 g, NOT 100 g
   - packaged foods: read label weight if visible; otherwise estimate from package size
3) Apply realistic per-100g nutrition, then multiply by grams/100.
4) SUM all items → final calories / proteinG / carbsG / fatG.

Photo quality:
- If no scale reference (plate edge, fork, hand) is visible, still estimate but lower confidence.
- Top-down photos: use plate coverage % to estimate volume.
- Mixed dishes: split into components when possible (rice, meat, sauce separately).

CRITICAL anti-bias rules:
- Do NOT default to restaurant "small portion" or snack sizes when the photo shows a large mound or multiple whole fruits.
- If you see TWO whole bananas, count BOTH (≈ 200–280 g edible total), not one.
- Cottage cheese (творог): dense white curds. Typical large home portion on a plate is often 250–450 g. Per 100 g approx:
  • 0–2% fat: ~70–90 kcal, ~16–18 g protein, ~3 g carbs, ~0–2 g fat
  • ~5% fat: ~110–130 kcal, ~16 g protein, ~3 g carbs, ~5 g fat
  • ~9% fat: ~150–170 kcal, ~16 g protein, ~2–3 g carbs, ~9 g fat
- Banana per 100 g edible: ~89 kcal, ~1.1 g protein, ~23 g carbs, ~0.3 g fat.
- Prefer slightly higher weight when unsure between two sizes for dense dairy piles (people usually under-estimate).

Return ONLY valid JSON (no markdown):
{
  "name": "short combined meal name",
  "items": [
    {
      "name": "item name",
      "grams": number,
      "calories": number,
      "proteinG": number,
      "carbsG": number,
      "fatG": number
    }
  ],
  "calories": number,
  "proteinG": number,
  "carbsG": number,
  "fatG": number,
  "vitamins": {
    "vitaminC_mg": number,
    "iron_mg": number,
    "calcium_mg": number,
    "vitaminA_ug": number,
    "vitaminD_ug": number,
    "magnesium_mg": number,
    "potassium_mg": number,
    "fiber_g": number
  },
  "confidence": number between 0 and 1
}

Rules for numbers:
- "calories"/"proteinG"/"carbsG"/"fatG" MUST equal the sum of items (within rounding).
- Write "name" and each items[].name in ${langName}.
- Use common local names (e.g. Russian: "Творог с бананами").
- confidence lower if food is occluded or lighting is bad; still give best estimate.`

		const userText = `Analyze this meal photo carefully. Estimate grams per item, then macros.
Reply with dish name and item names in ${langName}.
${noteLine}`

		const res = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model,
				temperature: 0.1,
				response_format: { type: 'json_object' },
				messages: [
					{ role: 'system', content: system },
					{
						role: 'user',
						content: [
							{ type: 'text', text: userText },
							{
								type: 'image_url',
								image_url: {
									url: `data:image/jpeg;base64,${b64}`,
									detail: 'high',
								},
							},
						],
					},
				],
			}),
		}).catch(e => {
			this.log.error(`OpenAI fetch failed after ${Date.now() - started}ms: ${e}`)
			throw new ServiceUnavailableException('Food AI unreachable')
		})

		if (!res.ok) {
			const errText = await res.text().catch(() => '')
			this.log.error(
				`OpenAI error ${res.status} after ${Date.now() - started}ms: ${errText.slice(0, 400)}`,
			)
			if (res.status === 401 || res.status === 403) {
				throw new ServiceUnavailableException(
					'Food AI key is invalid (check OPENAI_API_KEY)',
				)
			}
			if (res.status === 429) {
				throw new ServiceUnavailableException(
					'Food AI rate limit — try again in a moment',
				)
			}
			throw new ServiceUnavailableException('Food analysis failed')
		}

		const data = (await res.json()) as {
			choices?: { message?: { content?: string } }[]
			usage?: { prompt_tokens?: number; completion_tokens?: number }
		}
		const content = data.choices?.[0]?.message?.content
		if (!content) {
			this.log.error('OpenAI returned empty content')
			throw new ServiceUnavailableException('Empty analysis')
		}

		let parsed: Record<string, unknown>
		try {
			parsed = JSON.parse(content)
		} catch {
			this.log.warn(`Bad JSON from model: ${content.slice(0, 200)}`)
			throw new ServiceUnavailableException('Could not parse analysis')
		}

		const num = (v: unknown, fallback = 0) => {
			const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''))
			return Number.isFinite(n) && n >= 0 ? n : fallback
		}

		const vitaminsRaw =
			parsed.vitamins && typeof parsed.vitamins === 'object'
				? (parsed.vitamins as Record<string, unknown>)
				: {}
		const vitamins: Record<string, number> = {}
		for (const [k, v] of Object.entries(vitaminsRaw)) {
			const n = num(v, -1)
			if (n >= 0) vitamins[k] = Math.round(n * 10) / 10
		}

		// Prefer summing structured items when the model provided them
		let calories = num(parsed.calories)
		let proteinG = num(parsed.proteinG)
		let carbsG = num(parsed.carbsG)
		let fatG = num(parsed.fatG)

		const itemsRaw = Array.isArray(parsed.items) ? parsed.items : []
		if (itemsRaw.length > 0) {
			let c = 0
			let p = 0
			let cb = 0
			let f = 0
			for (const it of itemsRaw) {
				if (!it || typeof it !== 'object') continue
				const row = it as Record<string, unknown>
				c += num(row.calories)
				p += num(row.proteinG)
				cb += num(row.carbsG)
				f += num(row.fatG)
			}
			if (c > 0 || p > 0 || cb > 0 || f > 0) {
				calories = c
				proteinG = p
				carbsG = cb
				fatG = f
			}
		}

		const result: VisionFoodResult = {
			name: String(parsed.name || 'Meal').slice(0, 120),
			calories: Math.round(calories),
			proteinG: Math.round(proteinG * 10) / 10,
			carbsG: Math.round(carbsG * 10) / 10,
			fatG: Math.round(fatG * 10) / 10,
			vitamins,
			confidence: num(parsed.confidence, 0.5),
			raw: parsed,
		}

		const itemSummary = itemsRaw
			.map(it => {
				if (!it || typeof it !== 'object') return '?'
				const row = it as Record<string, unknown>
				return `${String(row.name || '?')}~${Math.round(num(row.grams))}g`
			})
			.join(', ')

		this.log.log(
			`vision ok name="${result.name}" kcal=${result.calories} ` +
				`P/C/F=${result.proteinG}/${result.carbsG}/${result.fatG} ` +
				`items=[${itemSummary}] ` +
				`tokens=${data.usage?.prompt_tokens ?? '?'}/${data.usage?.completion_tokens ?? '?'} ` +
				`ms=${Date.now() - started}`,
		)

		return result
	}
}
