import {
	Body,
	Controller,
	Delete,
	Get,
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
	constructor(private readonly nutrition: NutritionService) {}

	@Get('targets')
	async targets(@Req() req: { user: { userId: string } }) {
		return this.nutrition.getTargets(req.user.userId)
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
		return this.nutrition.analyzeAndCreate(req.user.userId, file, d, note)
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
		return this.nutrition.updateEntry(req.user.userId, id, body)
	}

	@Delete('entries/:id')
	async remove(
		@Req() req: { user: { userId: string } },
		@Param('id') id: string,
	) {
		return this.nutrition.deleteEntry(req.user.userId, id)
	}
}
