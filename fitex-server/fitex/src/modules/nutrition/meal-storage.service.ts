import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'
import { randomUUID } from 'crypto'

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

@Injectable()
export class MealStorageService {
	private readonly log = new Logger(MealStorageService.name)
	private readonly s3: S3Client | null

	constructor(private readonly config: ConfigService) {
		const bucket = this.config.get<string>('AWS_S3_BUCKET')
		this.s3 = bucket
			? new S3Client({
					region: this.config.get<string>('AWS_REGION') || 'eu-central-1',
				})
			: null
	}

	async saveMealPhoto(
		userId: string,
		buffer: Buffer,
		mimetype: string,
	): Promise<string> {
		if (!buffer?.length) throw new BadRequestException('Empty file')
		if (!ALLOWED_MIME.has(mimetype)) {
			throw new BadRequestException('Allowed types: JPEG, PNG, WebP')
		}

		let out: Buffer
		try {
			out = await sharp(buffer)
				.rotate()
				.resize(1280, 1280, { fit: 'inside', withoutEnlargement: true })
				.jpeg({ quality: 80, chromaSubsampling: '4:2:0' })
				.toBuffer()
		} catch (e) {
			this.log.warn(`sharp failed: ${e}`)
			throw new BadRequestException('Could not process image')
		}

		const id = randomUUID()
		const bucket = this.config.get<string>('AWS_S3_BUCKET')
		if (bucket && this.s3) {
			const key = `meals/${userId}/${id}.jpg`
			await this.s3.send(
				new PutObjectCommand({
					Bucket: bucket,
					Key: key,
					Body: out,
					ContentType: 'image/jpeg',
					CacheControl: 'public, max-age=31536000',
				}),
			)
			const region = this.config.get<string>('AWS_REGION') || 'eu-central-1'
			const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`
			this.log.log(`meal photo s3 save user=${userId} key=${key}`)
			return url
		}

		const publicBase = this.config.get<string>('PUBLIC_BASE_URL')?.replace(/\/$/, '')
		if (!publicBase) {
			this.log.error('PUBLIC_BASE_URL and AWS_S3_BUCKET both unset')
			throw new InternalServerErrorException(
				'Set PUBLIC_BASE_URL or AWS_S3_BUCKET for meal photos',
			)
		}

		const dir = join(process.cwd(), 'uploads', 'meals', userId)
		await mkdir(dir, { recursive: true })
		const fname = `${id}.jpg`
		await writeFile(join(dir, fname), out)
		const url = `${publicBase}/uploads/meals/${userId}/${fname}`
		this.log.log(`meal photo local save user=${userId} bytes=${out.length}`)
		return url
	}
}
