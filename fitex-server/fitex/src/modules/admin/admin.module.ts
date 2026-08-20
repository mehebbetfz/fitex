import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'src/models/user.schema'
import { AdminGuard } from 'src/guards/admin.guard'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
	],
	controllers: [AdminController],
	providers: [AdminService, AdminGuard],
	exports: [AdminService],
})
export class AdminModule {}
