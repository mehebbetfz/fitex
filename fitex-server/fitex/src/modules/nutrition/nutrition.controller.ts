import {
	Body,
	Controller,
	Delete,
	Get,
	Logger,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard'
import { NutritionService } from './nutrition.service'

@Controller('nutrition')
@UseGuards(JwtAuthGuard)
export class NutritionController {
	private readonly log = new Logger(NutritionController.name)

	constructor(private readonly nutrition: NutritionService) {}

	@Get('targets')
	async targets(@Req() req: { user: { userId: string } }) {
		return this.nutrition.getTargets(req.user.userId)
	}

	@Patch('targets')
	async updateTargets(
		@Req() req: { user: { userId: string } },
		@Body()
		body: {
			calories?: number | null
			proteinG?: number | null
			carbsG?: number | null
			fatG?: number | null
			reset?: boolean
		},
	) {
		this.log.log(
			`PATCH /targets user=${req.user.userId} reset=${Boolean(body.reset)}`,
		)
		return this.nutrition.updateTargets(req.user.userId, body)
	}

	@Get('day')
	async day(
		@Req() req: { user: { userId: string } },
		@Query('date') date: string,
	) {
		const d = date || new Date().toLocaleDateString('en-CA')
		return this.nutrition.getDay(req.user.userId, d)
	}

	@Post('analyze')
	@UseInterceptors(
		FileInterceptor('file', {
			storage: memoryStorage(),
			limits: { fileSize: 8 * 1024 * 1024 },
		}),
	)
	async analyze(
		@Req() req: { user: { userId: string } },
		@UploadedFile() file: Express.Multer.File,
		@Body('date') date?: string,
		@Body('note') note?: string,
	) {
		const d = date || new Date().toLocaleDateString('en-CA')
		this.log.log(
			`POST /analyze user=${req.user.userId} date=${d} ` +
				`fileBytes=${file?.size ?? 0} mime=${file?.mimetype ?? 'none'} ` +
				`note=${note?.trim() ? 'yes' : 'no'}`,
		)
		try {
			const result = await this.nutrition.analyzeAndCreate(
				req.user.userId,
				file,
				d,
				note,
			)
			this.log.log(
				`POST /analyze ok user=${req.user.userId} entry=${result.entry?.id} ` +
					`name=${result.entry?.name} kcal=${result.entry?.calories}`,
			)
			return result
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e)
			this.log.error(`POST /analyze failed user=${req.user.userId}: ${msg}`)
			throw e
		}
	}

	@Patch('entries/:id')
	async update(
		@Req() req: { user: { userId: string } },
		@Param('id') id: string,
		@Body()
		body: {
			name?: string
			calories?: number
			proteinG?: number
			carbsG?: number
			fatG?: number
		},
	) {
		this.log.log(`PATCH /entries/${id} user=${req.user.userId}`)
		return this.nutrition.updateEntry(req.user.userId, id, body)
	}

	@Delete('entries/:id')
	async remove(
		@Req() req: { user: { userId: string } },
		@Param('id') id: string,
	) {
		this.log.log(`DELETE /entries/${id} user=${req.user.userId}`)
		return this.nutrition.deleteEntry(req.user.userId, id)
	}
}
