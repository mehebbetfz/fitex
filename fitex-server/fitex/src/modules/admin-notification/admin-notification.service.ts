import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EmailService } from '../email/email.service'

type UserLike = {
	email?: string | null
	firstName?: string | null
	lastName?: string | null
	provider?: string | null
}

@Injectable()
export class AdminNotificationService {
	private readonly log = new Logger(AdminNotificationService.name)

	constructor(
		private readonly config: ConfigService,
		private readonly emailService: EmailService,
	) {}

	/** Fire-and-forget — never blocks auth / IAP flows. */
	notifyNewUser(user: UserLike): void {
		void this.dispatch('new_user', user, () => this.buildNewUserMessage(user))
	}

	notifyPremiumPurchase(
		user: UserLike,
		details: {
			productId: string
			platform: 'ios' | 'android'
			expiresAt: Date
		},
	): void {
		void this.dispatch('premium_purchase', user, () =>
			this.buildPremiumMessage(user, details),
		)
	}

	private async dispatch(
		kind: string,
		user: UserLike,
		build: () => { subject: string; text: string; html: string },
	): Promise<void> {
		try {
			const { subject, text, html } = build()
			await Promise.all([
				this.sendTelegram(text),
				this.sendAdminEmails(subject, html),
			])
		} catch (err) {
			this.log.error(`Admin notification failed (${kind}, ${user.email ?? '?'}):`, err)
		}
	}

	private buildNewUserMessage(user: UserLike) {
		const name = this.displayName(user)
		const provider = this.providerLabel(user.provider)
		const when = this.formatWhen(new Date())
		const subject = 'FitEx — новый пользователь'
		const text = [
			'🆕 FitEx — новый пользователь',
			`Email: ${user.email ?? '—'}`,
			`Имя: ${name}`,
			`Способ: ${provider}`,
			`Дата: ${when}`,
		].join('\n')
		const html = this.wrapHtml(subject, [
			['Email', user.email ?? '—'],
			['Имя', name],
			['Способ', provider],
			['Дата', when],
		])
		return { subject, text, html }
	}

	private buildPremiumMessage(
		user: UserLike,
		details: { productId: string; platform: 'ios' | 'android'; expiresAt: Date },
	) {
		const name = this.displayName(user)
		const plan = this.productLabel(details.productId)
		const platform = details.platform === 'ios' ? 'iOS' : 'Android'
		const expires = this.formatWhen(details.expiresAt)
		const when = this.formatWhen(new Date())
		const subject = 'FitEx — Premium подписка'
		const text = [
			'💎 FitEx — Premium подписка',
			`Email: ${user.email ?? '—'}`,
			`Имя: ${name}`,
			`Тариф: ${plan}`,
			`Платформа: ${platform}`,
			`Действует до: ${expires}`,
			`Дата покупки: ${when}`,
		].join('\n')
		const html = this.wrapHtml(subject, [
			['Email', user.email ?? '—'],
			['Имя', name],
			['Тариф', plan],
			['Платформа', platform],
			['Действует до', expires],
			['Дата покупки', when],
		])
		return { subject, text, html }
	}

	private displayName(user: UserLike): string {
		const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
		return full || '—'
	}

	private providerLabel(provider?: string | null): string {
		switch (provider) {
			case 'email':
				return 'Email'
			case 'google':
				return 'Google'
			case 'apple':
				return 'Apple'
			case 'demo':
				return 'Demo'
			default:
				return provider || '—'
		}
	}

	private productLabel(productId: string): string {
		if (productId.includes('year')) return 'Годовая'
		if (productId.includes('month')) return 'Месячная'
		return productId
	}

	private formatWhen(date: Date): string {
		return date.toLocaleString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	private wrapHtml(title: string, rows: [string, string][]): string {
		const body = rows
			.map(
				([label, value]) =>
					`<tr><td style="padding:8px 12px;color:#8E8E93;white-space:nowrap;">${label}</td><td style="padding:8px 12px;color:#fff;">${this.escapeHtml(value)}</td></tr>`,
			)
			.join('')
		return `
			<div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#121212;color:#fff;border-radius:16px;overflow:hidden;">
				<div style="background:#34C759;padding:20px;text-align:center;">
					<h1 style="margin:0;font-size:22px;">${this.escapeHtml(title)}</h1>
				</div>
				<table style="width:100%;border-collapse:collapse;">${body}</table>
			</div>
		`
	}

	private escapeHtml(value: string): string {
		return value
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
	}

	private getAdminEmails(): string[] {
		const raw = this.config.get<string>('ADMIN_EMAILS') || ''
		return raw
			.split(',')
			.map(e => e.trim().toLowerCase())
			.filter(Boolean)
	}

	private async sendAdminEmails(subject: string, html: string): Promise<void> {
		const emails = this.getAdminEmails()
		if (!emails.length) return
		await this.emailService.trySendAdminAlert(emails, subject, html)
	}

	private async sendTelegram(text: string): Promise<void> {
		const token = this.config.get<string>('TELEGRAM_BOT_TOKEN')?.trim()
		const chatId = this.config.get<string>('TELEGRAM_CHAT_ID')?.trim()
		if (!token || !chatId) return

		const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				chat_id: chatId,
				text,
				disable_web_page_preview: true,
			}),
		})

		if (!res.ok) {
			const body = await res.text().catch(() => '')
			throw new Error(`Telegram HTTP ${res.status}: ${body.slice(0, 200)}`)
		}
	}
}
