import { api } from '@/services/api'

export type AdminUser = {
	id: string
	email: string
	firstName: string | null
	lastName: string | null
	role: string
	provider: string
	isPremium: boolean
	premiumActive: boolean
	premiumExpiresAt: string | null
	premiumLifetime: boolean
	createdAt?: string | null
}

export type PremiumDuration =
	| '7d'
	| '30d'
	| '90d'
	| '180d'
	| '365d'
	| 'lifetime'
	| 'revoke'

export async function adminSearchUsers(q: string): Promise<AdminUser[]> {
	const { data } = await api.get<AdminUser[]>('/admin/users', {
		params: { q: q || undefined, limit: 50 },
	})
	return data
}

export async function adminGrantPremium(
	userId: string,
	body: { duration?: PremiumDuration; customDays?: number },
): Promise<AdminUser> {
	const { data } = await api.patch<AdminUser>(
		`/admin/users/${userId}/premium`,
		body,
	)
	return data
}
