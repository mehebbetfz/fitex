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

		this.log.log(
			`vision request model=${model} jpegBytes=${jpegBuffer.length} ` +
				`keyPrefix=${apiKey.slice(0, 7)}… note=${note?.trim() ? 'yes' : 'no'}`,
		)

		const b64 = jpegBuffer.toString('base64')
		const noteLine = note?.trim()
			? `User note: ${note.trim()}`
			: 'No extra note.'

		const system = `You are a nutrition analyst. Estimate the meal in the photo.
Return ONLY valid JSON (no markdown) with this shape:
{
  "name": "short food name",
  "calories": number,
  "proteinG": number,
  "carbsG": number,
  "fatG": number,
  "vitamins": { "vitaminC_mg": number, "iron_mg": number, "calcium_mg": number, "vitaminA_ug": number },
  "confidence": number between 0 and 1
}
Estimate a single serving as shown. Use realistic values. If unclear, still give best estimate.`

		const userText = `Analyze this meal photo. ${noteLine}`

		const res = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model,
				temperature: 0.2,
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
									detail: 'low',
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

		const result: VisionFoodResult = {
			name: String(parsed.name || 'Meal').slice(0, 120),
			calories: Math.round(num(parsed.calories)),
			proteinG: Math.round(num(parsed.proteinG) * 10) / 10,
			carbsG: Math.round(num(parsed.carbsG) * 10) / 10,
			fatG: Math.round(num(parsed.fatG) * 10) / 10,
			vitamins,
			confidence: num(parsed.confidence, 0.5),
			raw: parsed,
		}

		this.log.log(
			`vision ok name="${result.name}" kcal=${result.calories} ` +
				`tokens=${data.usage?.prompt_tokens ?? '?'}/${data.usage?.completion_tokens ?? '?'} ` +
				`ms=${Date.now() - started}`,
		)

		return result
	}
}
