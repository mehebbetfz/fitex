import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UserService } from './user.service'
import { User, UserSchema } from 'src/models/user.schema'

@Module({
	imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
	providers: [UserService],
	exports: [UserService, MongooseModule],
})
export class UserModule { }