import {
	BadRequestException,
	Injectable,
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
		return computeNutritionTargets({
			heightCm: user.heightCm,
			weightKg: user.weightKg,
			age: user.age,
			sex: user.sex,
			fitnessGoal: user.fitnessGoal,
			activityLevel: user.activityLevel,
		})
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
		this.assertDate(date)
		if (!file?.buffer?.length) throw new BadRequestException('Image required')

		const jpeg = await sharp(file.buffer)
			.rotate()
			.resize(1280, 1280, { fit: 'inside', withoutEnlargement: true })
			.jpeg({ quality: 80 })
			.toBuffer()

		const [analysis, photoUrl] = await Promise.all([
			this.vision.analyzeImage(jpeg, note),
			this.meals.saveMealPhoto(userId, jpeg, 'image/jpeg'),
		])

		const doc = await this.foodModel.create({
			userId: new Types.ObjectId(userId),
			date,
			name: analysis.name,
			photoUrl,
			calories: analysis.calories,
			proteinG: analysis.proteinG,
			carbsG: analysis.carbsG,
			fatG: analysis.fatG,
			vitamins: analysis.vitamins,
			source: 'vision',
			rawModelJson: analysis.raw,
			isDeleted: false,
		})

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
