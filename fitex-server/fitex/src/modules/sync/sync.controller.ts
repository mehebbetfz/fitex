import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { SyncUploadDto } from 'src/dtos/sync-upload.dto'
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard'
import { SyncService } from './sync.service'

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
	constructor(private syncService: SyncService) { }

	@Post('upload')
	async upload(@Body() dto: SyncUploadDto, @Req() req) {
		return this.syncService.upload(req.user.userId, dto)
	}

	@Get('download')
	async download(@Req() req) {
		return this.syncService.download(req.user.userId)
	}
}