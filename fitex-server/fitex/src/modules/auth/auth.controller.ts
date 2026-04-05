import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@Post('google')
	@HttpCode(HttpStatus.OK)
	async googleAuth(@Body('idToken') idToken: string) {
		const user = await this.authService.validateGoogleUser(idToken)
		return this.authService.login(user)
	}

	@Post('demo')
	@HttpCode(HttpStatus.OK)
	async demoAuth(@Body('password') password: string) {
		if (!password) throw new BadRequestException('password is required')
		const user = await this.authService.validateDemoUser(password)
		return this.authService.login(user)
	}

	@Post('apple')
	@HttpCode(HttpStatus.OK)
	async appleAuth(
		@Body('code') code: string,
		@Body('identityToken') identityToken: string,
		@Body('fullName') fullName?: any,
	) {
		const parts = identityToken?.split('.') || []

		if (!identityToken || parts.length !== 3) {
			throw new BadRequestException(`Invalid JWT format: expected 3 parts, got ${parts.length}`)
		}

		const user = await this.authService.validateAppleUser(identityToken, code, fullName)
		return this.authService.login(user)
	}
}