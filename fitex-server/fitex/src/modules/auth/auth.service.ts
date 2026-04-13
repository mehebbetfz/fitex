import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import * as appleSignin from 'apple-signin-auth'
import * as bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import { Model } from 'mongoose'
import { UpdateProfileDto } from 'src/dtos/update-profile.dto'
import { User, UserDocument } from 'src/models/user.schema'
import { EmailService } from '../email/email.service'
import { AvatarStorageService } from './avatar-storage.service'

@Injectable()
export class AuthService {
	private googleClient: OAuth2Client

	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		private jwtService: JwtService,
		private emailService: EmailService,
		private avatarStorage: AvatarStorageService,
	) {
		this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
	}

	async uploadAvatar(userId: string, file: Express.Multer.File) {
		if (!file?.buffer?.length) throw new BadRequestException('file is required')
		const url = await this.avatarStorage.saveProcessedAvatar(userId, file.buffer, file.mimetype)
		const user = await this.userModel.findById(userId)
		if (!user) throw new UnauthorizedException('User not found')
		user.avatarUrl = url
		await user.save()
		const u = await this.clearExpiredPremium(userId)
		if (!u) throw new UnauthorizedException('User not found')
		return this.toPublicUser(u)
	}

	private generateCode(): string {
		return Math.floor(100000 + Math.random() * 900000).toString()
	}

	async registerWithEmail(email: string, password: string, firstName: string, lastName?: string): Promise<{ message: string }> {
		const existing = await this.userModel.findOne({ email, provider: 'email' })
		if (existing) {
			if (existing.isEmailVerified) throw new ConflictException('Email already registered')
			// Resend verification code for unverified accounts
			const code = this.generateCode()
			existing.emailVerificationToken = code
			existing.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000)
			await existing.save()
			await this.emailService.sendVerificationCode(email, code)
			return { message: 'Verification code resent' }
		}

		const passwordHash = await bcrypt.hash(password, 12)
		const code = this.generateCode()

		const user = new this.userModel({
			email,
			provider: 'email',
			providerId: email,
			firstName,
			lastName: lastName || '',
			passwordHash,
			isEmailVerified: false,
			emailVerificationToken: code,
			emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
			isNewUser: true,
		})
		await user.save()
		await this.emailService.sendVerificationCode(email, code)
		return { message: 'Verification code sent' }
	}

	async verifyEmail(email: string, code: string): Promise<ReturnType<AuthService['login']>> {
		const user = await this.userModel.findOne({ email, provider: 'email' })
		if (!user) throw new BadRequestException('User not found')
		if (user.isEmailVerified) throw new BadRequestException('Email already verified')
		if (!user.emailVerificationToken || user.emailVerificationToken !== code) {
			throw new BadRequestException('Invalid verification code')
		}
		if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
			throw new BadRequestException('Verification code expired')
		}

		user.isEmailVerified = true
		user.emailVerificationToken = undefined
		user.emailVerificationExpires = undefined
		await user.save()
		return await this.login(user)
	}

	async loginWithEmail(email: string, password: string): Promise<ReturnType<AuthService['login']>> {
		const user = await this.userModel.findOne({ email, provider: 'email' })
		if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid email or password')
		if (!user.isEmailVerified) throw new UnauthorizedException('Please verify your email first')

		const valid = await bcrypt.compare(password, user.passwordHash)
		if (!valid) throw new UnauthorizedException('Invalid email or password')

		return await this.login(user)
	}

	async resendVerificationCode(email: string): Promise<{ message: string }> {
		const user = await this.userModel.findOne({ email, provider: 'email' })
		if (!user) throw new BadRequestException('User not found')
		if (user.isEmailVerified) throw new BadRequestException('Email already verified')

		const code = this.generateCode()
		user.emailVerificationToken = code
		user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000)
		await user.save()
		await this.emailService.sendVerificationCode(email, code)
		return { message: 'Verification code sent' }
	}

	async requestPasswordReset(email: string): Promise<{ message: string }> {
		const user = await this.userModel.findOne({ email, provider: 'email' })
		// Always return success to prevent email enumeration
		if (!user) return { message: 'If this email exists, a reset code was sent' }

		const code = this.generateCode()
		user.passwordResetToken = code
		user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000)
		await user.save()
		await this.emailService.sendPasswordResetCode(email, code)
		return { message: 'If this email exists, a reset code was sent' }
	}

	async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
		const user = await this.userModel.findOne({ email, provider: 'email' })
		if (!user || !user.passwordResetToken || user.passwordResetToken !== code) {
			throw new BadRequestException('Invalid or expired reset code')
		}
		if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
			throw new BadRequestException('Reset code expired')
		}

		user.passwordHash = await bcrypt.hash(newPassword, 12)
		user.passwordResetToken = undefined
		user.passwordResetExpires = undefined
		await user.save()
		return { message: 'Password reset successfully' }
	}

	async validateGoogleUser(idToken: string): Promise<UserDocument> {
		try {
			// Accept tokens from web, iOS and Android clients — each platform
			// issues an id_token whose `aud` claim equals its own client ID.
			const audiences = [
				process.env.GOOGLE_CLIENT_ID,
				process.env.GOOGLE_MOBILE_CLIENT_ID,
				process.env.GOOGLE_IOS_CLIENT_ID,
				process.env.GOOGLE_ANDROID_CLIENT_ID,
			].filter(Boolean) as string[]

			const ticket = await this.googleClient.verifyIdToken({
				idToken,
				audience: audiences,
			})
			const payload = ticket.getPayload()
			if (!payload) throw new UnauthorizedException('Invalid Google token')

			const { sub, email, name, picture } = payload

			let user = await this.userModel.findOne({ providerId: sub, provider: 'google' })
			if (!user) {
				user = new this.userModel({
					email,
					provider: 'google',
					providerId: sub,
					firstName: name?.split(' ')[0] || '',
					lastName: name?.split(' ').slice(1).join(' ') || '',
					avatarUrl: picture,
				})
				await user.save()
			}
			return user
		} catch (error) {
			console.error('Google validation error:', error)
			throw new UnauthorizedException('Invalid Google token')
		}
	}

	/**
	 * Валидация пользователя через Apple Sign In
	 * @param identityToken — основной JWT от Apple (обязательно)
	 * @param code — authorization code (опционально, если нужен refresh_token)
	 * @param fullName — имя (только при первом входе)
	 */
	async validateAppleUser(
		identityToken: string,
		code?: string,           // опционально
		fullName?: any,
	): Promise<UserDocument> {
		if (!identityToken) {
			throw new BadRequestException('identityToken is required for Apple authentication')
		}

		try {
			// 1. Верифицируем identityToken (это основной и самый простой способ)
			const claims = await appleSignin.verifyIdToken(identityToken, {
				audience: process.env.APPLE_CLIENT_ID, // должен быть Service ID или bundle ID
				ignoreExpiration: false,
			})

			console.log('[Apple] Verified claims:', {
				sub: claims.sub,
				email: claims.email || 'hidden',
				iss: claims.iss,
				aud: claims.aud,
			})

			let user = await this.userModel.findOne({ providerId: claims.sub, provider: 'apple' })

			if (!user) {
				// Новый пользователь
				user = new this.userModel({
					email: claims.email || `${claims.sub}@privaterelay.appleid.com`,
					provider: 'apple',
					providerId: claims.sub,
					firstName: fullName?.givenName || '',
					lastName: fullName?.familyName || '',
				})
				await user.save()
			}

			// Опционально: если нужен refresh_token — можно обменять code
			// if (code) {
			//   const clientSecret = appleSignin.getClientSecret({
			//     clientID: process.env.APPLE_CLIENT_ID,
			//     teamID: process.env.APPLE_TEAM_ID,
			//     privateKey: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
			//     keyIdentifier: process.env.APPLE_KEY_ID,
			//   });
			//   const tokens = await appleSignin.getAuthorizationToken(code, {
			//     clientID: process.env.APPLE_CLIENT_ID,
			//     clientSecret,
			//   });
			//   // можно сохранить tokens.refresh_token в user, если нужно
			// }

			return user
		} catch (error) {
			console.error('Apple validation error:', error)
			throw new UnauthorizedException('Invalid Apple identity token')
		}
	}

	async validateDemoUser(password: string): Promise<UserDocument> {
		const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'FitExDemo2024!'
		if (password !== DEMO_PASSWORD) {
			throw new UnauthorizedException('Invalid demo credentials')
		}

		const DEMO_EMAIL = 'reviewer@fitex.app'
		let user = await this.userModel.findOne({ email: DEMO_EMAIL, provider: 'demo' })

		if (!user) {
			const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
			user = new this.userModel({
				email: DEMO_EMAIL,
				provider: 'demo',
				providerId: 'demo-reviewer-account',
				firstName: 'Demo',
				lastName: 'User',
				isPremium: true,
				trialStartedAt: new Date(),
				trialEndsAt: thirtyDaysFromNow,
				isNewUser: false,
			})
			await user.save()
		}

		return user
	}

	private async clearExpiredPremium(userId: string): Promise<UserDocument | null> {
		const u = await this.userModel.findById(userId)
		if (!u) return null
		const now = new Date()
		if (u.isPremium && u.premiumExpiresAt && u.premiumExpiresAt < now) {
			u.isPremium = false
			await u.save()
		}
		return u
	}

	async getSessionUser(userId: string) {
		const u = await this.clearExpiredPremium(userId)
		if (!u) throw new UnauthorizedException('User not found')
		return this.toPublicUser(u)
	}

	/** Совпадает с логикой мобильного hasActivePremium (источник истины — premiumExpiresAt). */
	private isPremiumEntitlementActive(user: UserDocument): boolean {
		if (user.premiumExpiresAt) {
			return new Date(user.premiumExpiresAt).getTime() > Date.now()
		}
		return !!user.isPremium
	}

	private toPublicUser(user: UserDocument) {
		const premiumActive = this.isPremiumEntitlementActive(user)
		return {
			id: user._id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			avatarUrl: user.avatarUrl,
			isPremium: user.isPremium,
			premiumExpiresAt: user.premiumExpiresAt ?? null,
			trialStartedAt: user.trialStartedAt ?? null,
			trialEndsAt: user.trialEndsAt ?? null,
			// С активной подпиской не показываем trial paywall (клиент редиректит по isNewUser).
			isNewUser: premiumActive ? false : (user.isNewUser ?? true),
			heightCm: user.heightCm ?? null,
			weightKg: user.weightKg ?? null,
			age: user.age ?? null,
			sex: user.sex ?? null,
			fitnessGoal: user.fitnessGoal ?? null,
			activityLevel: user.activityLevel ?? null,
			bodyStatsCompleted: !!user.bodyStatsCompleted,
			socialInstagram: user.socialInstagram ?? null,
			socialTelegram: user.socialTelegram ?? null,
			socialYoutube: user.socialYoutube ?? null,
			socialTiktok: user.socialTiktok ?? null,
			socialStrava: user.socialStrava ?? null,
			socialWebsite: user.socialWebsite ?? null,
		}
	}

	async updateProfile(userId: string, dto: UpdateProfileDto) {
		const user = await this.userModel.findById(userId)
		if (!user) throw new UnauthorizedException('User not found')

		const keys: (keyof UpdateProfileDto)[] = [
			'heightCm',
			'weightKg',
			'age',
			'sex',
			'fitnessGoal',
			'activityLevel',
			'bodyStatsCompleted',
			'socialInstagram',
			'socialTelegram',
			'socialYoutube',
			'socialTiktok',
			'socialStrava',
			'socialWebsite',
		]
		for (const k of keys) {
			if (dto[k] === undefined) continue
			const v = dto[k]
			if (typeof v === 'string' && v.trim() === '') {
				;(user as any)[k] = undefined
			} else {
				;(user as any)[k] = v
			}
		}
		await user.save()
		const u = await this.clearExpiredPremium(userId)
		if (!u) throw new UnauthorizedException('User not found')
		return this.toPublicUser(u)
	}

	async login(user: UserDocument) {
		const fresh = await this.clearExpiredPremium(user._id.toString())
		const u = fresh ?? user

		const payload = {
			sub: u._id,
			email: u.email,
			isPremium: u.isPremium,
		}

		return {
			access_token: this.jwtService.sign(payload),
			user: this.toPublicUser(u),
		}
	}
}