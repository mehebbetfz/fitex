import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

@Injectable()
export class AvatarStorageService {
	private readonly log = new Logger(AvatarStorageService.name)
	private readonly s3: S3Client | null

	constructor(private readonly config: ConfigService) {
		const bucket = this.config.get<string>('AWS_S3_BUCKET')
		this.s3 = bucket
			? new S3Client({ region: this.config.get<string>('AWS_REGION') || 'eu-central-1' })
			: null
	}

	async saveProcessedAvatar(userId: string, buffer: Buffer, mimetype: string): Promise<string> {
		if (!buffer?.length) throw new BadRequestException('Empty file')
		if (!ALLOWED_MIME.has(mimetype)) {
			throw new BadRequestException('Allowed types: JPEG, PNG, WebP')
		}

		let out: Buffer
		try {
			out = await sharp(buffer)
				.rotate()
				.resize(512, 512, { fit: 'cover', position: 'attention' })
				.jpeg({ quality: 82, chromaSubsampling: '4:2:0' })
				.toBuffer()
		} catch (e) {
			this.log.warn(`sharp failed for user ${userId}: ${e}`)
			throw new BadRequestException('Could not process image')
		}

		const bucket = this.config.get<string>('AWS_S3_BUCKET')
		if (bucket && this.s3) {
			const key = `avatars/${userId}.jpg`
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
			return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
		}

		const publicBase = this.config.get<string>('PUBLIC_BASE_URL')?.replace(/\/$/, '')
		if (!publicBase) {
			throw new InternalServerErrorException(
				'Set PUBLIC_BASE_URL (local files) or AWS_S3_BUCKET + credentials (S3)',
			)
		}

		const dir = join(process.cwd(), 'uploads', 'avatars')
		await mkdir(dir, { recursive: true })
		const fname = `${userId}.jpg`
		await writeFile(join(dir, fname), out)
		return `${publicBase}/uploads/avatars/${fname}`
	}
}
