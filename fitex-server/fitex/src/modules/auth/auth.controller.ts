import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@Get('me')
	@UseGuards(JwtAuthGuard)
	async me(@Req() req: { user: { userId: string } }) {
		return this.authService.getSessionUser(req.user.userId)
	}

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

	// ── Email / Password Auth ───────────────────────────────────────────────────

	@Post('register')
	@HttpCode(HttpStatus.CREATED)
	async register(
		@Body('email') email: string,
		@Body('password') password: string,
		@Body('firstName') firstName: string,
		@Body('lastName') lastName?: string,
	) {
		if (!email || !password || !firstName) {
			throw new BadRequestException('email, password and firstName are required')
		}
		return this.authService.registerWithEmail(email, password, firstName, lastName)
	}

	@Post('verify-email')
	@HttpCode(HttpStatus.OK)
	async verifyEmail(@Body('email') email: string, @Body('code') code: string) {
		if (!email || !code) throw new BadRequestException('email and code are required')
		return this.authService.verifyEmail(email, code)
	}

	@Post('login-email')
	@HttpCode(HttpStatus.OK)
	async loginEmail(@Body('email') email: string, @Body('password') password: string) {
		if (!email || !password) throw new BadRequestException('email and password are required')
		return this.authService.loginWithEmail(email, password)
	}

	@Post('resend-verification')
	@HttpCode(HttpStatus.OK)
	async resendVerification(@Body('email') email: string) {
		if (!email) throw new BadRequestException('email is required')
		return this.authService.resendVerificationCode(email)
	}

	@Post('request-password-reset')
	@HttpCode(HttpStatus.OK)
	async requestPasswordReset(@Body('email') email: string) {
		if (!email) throw new BadRequestException('email is required')
		return this.authService.requestPasswordReset(email)
	}

	@Post('reset-password')
	@HttpCode(HttpStatus.OK)
	async resetPassword(
		@Body('email') email: string,
		@Body('code') code: string,
		@Body('newPassword') newPassword: string,
	) {
		if (!email || !code || !newPassword) {
			throw new BadRequestException('email, code and newPassword are required')
		}
		return this.authService.resetPassword(email, code, newPassword)
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