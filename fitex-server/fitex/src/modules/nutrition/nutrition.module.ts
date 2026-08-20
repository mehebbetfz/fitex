import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { FoodEntry, FoodEntrySchema } from 'src/models/food-entry.schema'
import { User, UserSchema } from 'src/models/user.schema'
import { MealStorageService } from './meal-storage.service'
import { NutritionController } from './nutrition.controller'
import { NutritionService } from './nutrition.service'
import { NutritionVisionService } from './nutrition-vision.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: FoodEntry.name, schema: FoodEntrySchema },
			{ name: User.name, schema: UserSchema },
		]),
	],
	controllers: [NutritionController],
	providers: [NutritionService, NutritionVisionService, MealStorageService],
	exports: [NutritionService],
})
export class NutritionModule {}
