import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' })
  const configService = app.get(ConfigService)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )

  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS')
  app.enableCors({
    origin: allowedOrigins ? allowedOrigins.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })

  // ✅ Берём PORT из переменных Railway, fallback 3000 для локалки
  const port = process.env.PORT || 3000

  // ✅ '0.0.0.0' обязательно для Railway
  await app.listen(port, '0.0.0.0')

  console.log(`Application is running on port: ${port}`)
}
bootstrap()