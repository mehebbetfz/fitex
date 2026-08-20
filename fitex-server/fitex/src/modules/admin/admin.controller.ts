import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common'
import { GrantPremiumDto, SetUserRoleDto } from 'src/dtos/admin.dto'
import { AdminGuard } from 'src/guards/admin.guard'
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard'
import { AdminService } from './admin.service'

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
	constructor(private readonly admin: AdminService) {}

	@Get('users')
	async listUsers(
		@Query('q') q?: string,
		@Query('limit') limit?: string,
	) {
		return this.admin.searchUsers(q || '', limit ? parseInt(limit, 10) : 30)
	}

	@Get('users/:id')
	async getUser(@Param('id') id: string) {
		return this.admin.getUser(id)
	}

	@Patch('users/:id/premium')
	async grantPremium(
		@Param('id') id: string,
		@Body() dto: GrantPremiumDto,
	) {
		return this.admin.grantPremium(id, dto)
	}

	@Patch('users/:id/role')
	async setRole(
		@Param('id') id: string,
		@Body() dto: SetUserRoleDto,
		@Req() req: { user: { userId: string } },
	) {
		return this.admin.setRole(id, dto.role, req.user.userId)
	}
}
