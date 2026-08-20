import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from 'src/models/user.schema'

@Injectable()
export class AdminGuard implements CanActivate {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest<{
			user?: { userId?: string }
		}>()
		const userId = req.user?.userId
		if (!userId) throw new UnauthorizedException()

		const user = await this.userModel.findById(userId).select('role').lean()
		if (!user || user.role !== 'admin') {
			throw new ForbiddenException('Admin access required')
		}
		return true
	}
}
