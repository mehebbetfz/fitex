import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { FoodEntry, FoodEntryDocument } from 'src/models/food-entry.schema'
import { User, UserDocument } from 'src/models/user.schema'
import { MealStorageService } from './meal-storage.service'
import { computeNutritionTargets } from './nutrition-targets'
import { NutritionVisionService } from './nutrition-vision.service'
import sharp from 'sharp'

@Injectable()
export class NutritionService {
	private readonly log = new Logger(NutritionService.name)

	constructor(
		@InjectModel(FoodEntry.name)
		private readonly foodModel: Model<FoodEntryDocument>,
		@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
		private readonly vision: NutritionVisionService,
		private readonly meals: MealStorageService,
	) {}

	async getTargets(userId: string) {
		const user = await this.userModel.findById(userId).lean()
		if (!user) throw new NotFoundException('User not found')
		const auto = computeNutritionTargets({
			heightCm: user.heightCm,
			weightKg: user.weightKg,
			age: user.age,
			sex: user.sex,
			fitnessGoal: user.fitnessGoal,
			activityLevel: user.activityLevel,
		})

		const hasCustom =
			user.nutritionCalories != null ||
			user.nutritionProteinG != null ||
			user.nutritionCarbsG != null ||
			user.nutritionFatG != null

		if (!hasCustom) return auto

		return {
			...auto,
			calories:
				user.nutritionCalories != null
					? Math.round(Math.max(800, Number(user.nutritionCalories)))
					: auto.calories,
			proteinG:
				user.nutritionProteinG != null
					? Math.round(Math.max(0, Number(user.nutritionProteinG)))
					: auto.proteinG,
			carbsG:
				user.nutritionCarbsG != null
					? Math.round(Math.max(0, Number(user.nutritionCarbsG)))
					: auto.carbsG,
			fatG:
				user.nutritionFatG != null
					? Math.round(Math.max(0, Number(user.nutritionFatG)))
					: auto.fatG,
			custom: true,
			complete: true,
		}
	}

	async updateTargets(
		userId: string,
		patch: {
			calories?: number | null
			proteinG?: number | null
			carbsG?: number | null
			fatG?: number | null
			reset?: boolean
		},
	) {
		const user = await this.userModel.findById(userId)
		if (!user) throw new NotFoundException('User not found')

		if (patch.reset) {
			await this.userModel.findByIdAndUpdate(userId, {
				$unset: {
					nutritionCalories: 1,
					nutritionProteinG: 1,
					nutritionCarbsG: 1,
					nutritionFatG: 1,
				},
			})
			return this.getTargets(userId)
		}

		if (patch.calories != null) {
			const v = Number(patch.calories)
			if (!Number.isFinite(v) || v < 800 || v > 10000) {
				throw new BadRequestException('calories must be between 800 and 10000')
			}
			user.nutritionCalories = Math.round(v)
		}
		if (patch.proteinG != null) {
			const v = Number(patch.proteinG)
			if (!Number.isFinite(v) || v < 0 || v > 500) {
				throw new BadRequestException('proteinG must be between 0 and 500')
			}
			user.nutritionProteinG = Math.round(v)
		}
		if (patch.carbsG != null) {
			const v = Number(patch.carbsG)
			if (!Number.isFinite(v) || v < 0 || v > 1000) {
				throw new BadRequestException('carbsG must be between 0 and 1000')
			}
			user.nutritionCarbsG = Math.round(v)
		}
		if (patch.fatG != null) {
			const v = Number(patch.fatG)
			if (!Number.isFinite(v) || v < 0 || v > 400) {
				throw new BadRequestException('fatG must be between 0 and 400')
			}
			user.nutritionFatG = Math.round(v)
		}

		await user.save()
		return this.getTargets(userId)
	}

	async getDay(userId: string, date: string) {
		this.assertDate(date)
		const uid = new Types.ObjectId(userId)
		const entries = await this.foodModel
			.find({ userId: uid, date, isDeleted: false })
			.sort({ createdAt: -1 })
			.lean()

		const totals = entries.reduce(
			(acc, e) => {
				acc.calories += e.calories || 0
				acc.proteinG += e.proteinG || 0
				acc.carbsG += e.carbsG || 0
				acc.fatG += e.fatG || 0
				return acc
			},
			{ calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
		)

		const targets = await this.getTargets(userId)
		return {
			date,
			targets,
			totals: {
				calories: Math.round(totals.calories),
				proteinG: Math.round(totals.proteinG * 10) / 10,
				carbsG: Math.round(totals.carbsG * 10) / 10,
				fatG: Math.round(totals.fatG * 10) / 10,
			},
			entries: entries.map(e => this.toPublic(e)),
		}
	}

	async analyzeAndCreate(
		userId: string,
		file: Express.Multer.File,
		date: string,
		note?: string,
	) {
		const started = Date.now()
		this.assertDate(date)
		if (!file?.buffer?.length) {
			this.log.warn(`analyze: empty file user=${userId}`)
			throw new BadRequestException('Image required')
		}

		this.log.log(
			`analyze start user=${userId} date=${date} rawBytes=${file.buffer.length} mime=${file.mimetype}`,
		)

		let jpeg: Buffer
		try {
			jpeg = await sharp(file.buffer)
				.rotate()
				.resize(1280, 1280, { fit: 'inside', withoutEnlargement: true })
				.jpeg({ quality: 80 })
				.toBuffer()
			this.log.log(
				`analyze sharp ok user=${userId} jpegBytes=${jpeg.length} ms=${Date.now() - started}`,
			)
		} catch (e) {
			this.log.error(`analyze sharp failed user=${userId}: ${e}`)
			throw new BadRequestException('Could not process image')
		}

		// Vision first — storage must not block AI analysis if S3/PUBLIC_BASE_URL missing
		const visionStarted = Date.now()
		const analysis = await this.vision.analyzeImage(jpeg, note)
		this.log.log(
			`analyze vision ok user=${userId} name="${analysis.name}" ` +
				`kcal=${analysis.calories} P=${analysis.proteinG} C=${analysis.carbsG} F=${analysis.fatG} ` +
				`conf=${analysis.confidence} ms=${Date.now() - visionStarted}`,
		)

		let photoUrl: string | null = null
		try {
			photoUrl = await this.meals.saveMealPhoto(userId, jpeg, 'image/jpeg')
			this.log.log(`analyze photo saved user=${userId} url=${photoUrl}`)
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e)
			this.log.warn(`Meal photo save skipped user=${userId}: ${msg}`)
		}

		const doc = await this.foodModel.create({
			userId: new Types.ObjectId(userId),
			date,
			name: analysis.name,
			photoUrl: photoUrl ?? undefined,
			calories: analysis.calories,
			proteinG: analysis.proteinG,
			carbsG: analysis.carbsG,
			fatG: analysis.fatG,
			vitamins: analysis.vitamins,
			source: 'vision',
			rawModelJson: analysis.raw,
			isDeleted: false,
		})

		this.log.log(
			`analyze done user=${userId} entry=${doc._id} totalMs=${Date.now() - started}`,
		)

		return {
			entry: this.toPublic(doc.toObject()),
			analysis: {
				confidence: analysis.confidence,
			},
		}
	}

	async updateEntry(
		userId: string,
		id: string,
		patch: {
			name?: string
			calories?: number
			proteinG?: number
			carbsG?: number
			fatG?: number
		},
	) {
		const doc = await this.foodModel.findOne({
			_id: id,
			userId: new Types.ObjectId(userId),
			isDeleted: false,
		})
		if (!doc) throw new NotFoundException('Entry not found')

		if (patch.name != null) doc.name = String(patch.name).slice(0, 120)
		if (patch.calories != null) doc.calories = Math.max(0, Number(patch.calories))
		if (patch.proteinG != null) doc.proteinG = Math.max(0, Number(patch.proteinG))
		if (patch.carbsG != null) doc.carbsG = Math.max(0, Number(patch.carbsG))
		if (patch.fatG != null) doc.fatG = Math.max(0, Number(patch.fatG))
		doc.source = 'edited'
		await doc.save()
		return this.toPublic(doc.toObject())
	}

	async deleteEntry(userId: string, id: string) {
		const res = await this.foodModel.updateOne(
			{ _id: id, userId: new Types.ObjectId(userId), isDeleted: false },
			{ $set: { isDeleted: true } },
		)
		if (!res.matchedCount) throw new NotFoundException('Entry not found')
		return { ok: true }
	}

	private assertDate(date: string) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			throw new BadRequestException('date must be YYYY-MM-DD')
		}
	}

	private toPublic(e: any) {
		return {
			id: String(e._id),
			date: e.date,
			name: e.name,
			photoUrl: e.photoUrl ?? null,
			calories: e.calories,
			proteinG: e.proteinG,
			carbsG: e.carbsG,
			fatG: e.fatG,
			vitamins: e.vitamins ?? {},
			source: e.source,
			createdAt: e.createdAt,
		}
	}
}
