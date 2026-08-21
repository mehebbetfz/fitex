import { Injectable, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

@Injectable()
export class EmailService {
	private readonly logger = new Logger(EmailService.name)
	private transporter: nodemailer.Transporter | null = null

	constructor() {
		if (this.isConfigured()) {
			this.transporter = nodemailer.createTransport({
				host: process.env.SMTP_HOST || 'smtp.gmail.com',
				port: Number(process.env.SMTP_PORT) || 587,
				secure: process.env.SMTP_SECURE === 'true',
				auth: {
					user: process.env.SMTP_USER,
					pass: process.env.SMTP_PASS,
				},
			})
		} else {
			this.logger.warn(
				'SMTP_USER / SMTP_PASS not set — email verification disabled until configured',
			)
		}
	}

	/** True when SMTP credentials are present. */
	isConfigured(): boolean {
		return Boolean(process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim())
	}

	/**
	 * Sends verification code. Returns false if SMTP is missing or delivery failed
	 * (never throws — callers decide whether to fall back).
	 */
	async trySendVerificationCode(to: string, code: string): Promise<boolean> {
		if (!this.transporter) {
			this.logger.warn(`Skip verification email to ${to}: SMTP not configured`)
			return false
		}
		try {
			await this.sendVerificationCode(to, code)
			return true
		} catch (err) {
			this.logger.error(`Failed to send verification email to ${to}:`, err)
			return false
		}
	}

	async trySendPasswordResetCode(to: string, code: string): Promise<boolean> {
		if (!this.transporter) {
			this.logger.warn(`Skip password-reset email to ${to}: SMTP not configured`)
			return false
		}
		try {
			await this.sendPasswordResetCode(to, code)
			return true
		} catch (err) {
			this.logger.error(`Failed to send password reset email to ${to}:`, err)
			return false
		}
	}

	async sendVerificationCode(to: string, code: string): Promise<void> {
		if (!this.transporter) {
			throw new Error('SMTP is not configured')
		}
		const from = process.env.SMTP_FROM || `FitEx <${process.env.SMTP_USER}>`
		await this.transporter.sendMail({
			from,
			to,
			subject: 'FitEx — Verification Code',
			html: `
					<div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#121212;color:#fff;border-radius:16px;overflow:hidden;">
						<div style="background:#34C759;padding:24px;text-align:center;">
							<h1 style="margin:0;font-size:28px;letter-spacing:2px;">FITEX</h1>
						</div>
						<div style="padding:32px;text-align:center;">
							<p style="font-size:16px;color:#8E8E93;margin-bottom:8px;">Your verification code</p>
							<div style="font-size:48px;font-weight:800;letter-spacing:12px;color:#34C759;margin:16px 0;">${code}</div>
							<p style="font-size:14px;color:#8E8E93;">This code expires in <strong style="color:#fff">10 minutes</strong>.</p>
							<p style="font-size:12px;color:#3A3A3C;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
						</div>
					</div>
				`,
		})
		this.logger.log(`Verification code sent to ${to}`)
	}

	async sendPasswordResetCode(to: string, code: string): Promise<void> {
		if (!this.transporter) {
			throw new Error('SMTP is not configured')
		}
		const from = process.env.SMTP_FROM || `FitEx <${process.env.SMTP_USER}>`
		await this.transporter.sendMail({
			from,
			to,
			subject: 'FitEx — Password Reset',
			html: `
					<div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#121212;color:#fff;border-radius:16px;overflow:hidden;">
						<div style="background:#FF9500;padding:24px;text-align:center;">
							<h1 style="margin:0;font-size:28px;letter-spacing:2px;">FITEX</h1>
						</div>
						<div style="padding:32px;text-align:center;">
							<p style="font-size:16px;color:#8E8E93;margin-bottom:8px;">Password reset code</p>
							<div style="font-size:48px;font-weight:800;letter-spacing:12px;color:#FF9500;margin:16px 0;">${code}</div>
							<p style="font-size:14px;color:#8E8E93;">This code expires in <strong style="color:#fff">10 minutes</strong>.</p>
						</div>
					</div>
				`,
		})
		this.logger.log(`Password reset code sent to ${to}`)
	}
}
