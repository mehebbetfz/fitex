import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { PassportStrategy } from '@nestjs/passport'
import { Model } from 'mongoose'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { User, UserDocument } from 'src/models/user.schema'


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private configService: ConfigService,
		@InjectModel(User.name) private userModel: Model<UserDocument>,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get('JWT_SECRET'),
		})
	}

	async validate(payload: any) {
		const user = await this.userModel.findById(payload.sub).lean()
		return { userId: payload.sub, email: payload.email, isPremium: payload.isPremium }
	}
}