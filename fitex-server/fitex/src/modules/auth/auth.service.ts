import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import * as appleSignin from 'apple-signin-auth'
import { OAuth2Client } from 'google-auth-library'
import { Model } from 'mongoose'
import { User, UserDocument } from 'src/models/user.schema'

@Injectable()
export class AuthService {
	private googleClient: OAuth2Client

	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		private jwtService: JwtService,
	) {
		this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
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

	login(user: UserDocument) {
		const payload = {
			sub: user._id,
			email: user.email,
			isPremium: user.isPremium,
		}

		return {
			access_token: this.jwtService.sign(payload),
			user: {
				id: user._id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				avatarUrl: user.avatarUrl,
				isPremium: user.isPremium,
				trialStartedAt: user.trialStartedAt ?? null,
				trialEndsAt: user.trialEndsAt ?? null,
				isNewUser: user.isNewUser ?? true,
			},
		}
	}
}