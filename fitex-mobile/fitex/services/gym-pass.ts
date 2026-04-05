import { api } from './api'

export interface GymPartner {
  _id: string
  name: string
  address: string
  city: string
  latitude?: number
  longitude?: number
  phone?: string
  photos: string[]
  workingHours: Record<string, { open: string; close: string }>
  amenities: string[]
  membershipPrices: Array<{
    planType: string
    price: number
    currency: string
  }>
  isActive: boolean
}

export interface Membership {
  _id: string
  gymId: GymPartner | null
  planType: string
  startDate: string
  endDate: string
  status: string
  price: number
  currency: string
  visitsCount: number
  accessToken: string
}

export interface GymVisit {
  _id: string
  gymId: { name: string; address: string; city: string }
  checkInTime: string
}

export const getGyms = (city?: string) =>
  api.get<GymPartner[]>('/gym-pass/gyms', { params: city ? { city } : {} }).then(r => r.data)

export const getGym = (id: string) =>
  api.get<GymPartner>(`/gym-pass/gyms/${id}`).then(r => r.data)

export const getActiveMembership = () =>
  api.get<Membership | null>('/gym-pass/membership').then(r => r.data)

export const getUserMemberships = () =>
  api.get<Membership[]>('/gym-pass/memberships').then(r => r.data)

export const purchaseMembership = (dto: {
  gymId?: string
  planType: string
  transactionId?: string
}) => api.post<Membership>('/gym-pass/membership', dto).then(r => r.data)

export const getVisitHistory = () =>
  api.get<GymVisit[]>('/gym-pass/visits').then(r => r.data)

export const formatPrice = (kopeks: number, currency = 'RUB') => {
  const amount = kopeks / 100
  return currency === 'RUB'
    ? `${amount.toLocaleString('ru-RU')} ₽`
    : `${amount.toFixed(2)} ${currency}`
}

export const PLAN_DURATION_DAYS: Record<string, number> = {
  day: 1,
  month: 30,
  quarter: 90,
  year: 365,
  all_access: 365,
}
