import { api } from './api'

export interface TrainerProfile {
  _id: string
  displayName: string
  bio: string
  specialties: string[]
  avatarUrl?: string
  yearsExperience: number
  certifications: string[]
  studentsCount: number
  rating: number
  reviewsCount: number
  isVerified: boolean
  results: Array<{
    imageUrl: string
    beforeImageUrl?: string
    description: string
    type: 'own' | 'student'
    studentName?: string
    durationWeeks?: number
  }>
  plans?: Plan[]
}

export interface Plan {
  _id: string
  trainerId: TrainerProfile | string
  title: string
  description: string
  type: 'workout' | 'nutrition' | 'combo'
  price: number
  currency: string
  durationWeeks: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  previewImageUrl?: string
  tags: string[]
  purchasesCount: number
  rating: number
  reviewsCount: number
}

export const getTrainers = (params?: { specialty?: string; search?: string }) =>
  api.get<TrainerProfile[]>('/marketplace/trainers', { params }).then(r => r.data)

export const getTrainer = (id: string) =>
  api.get<TrainerProfile>(`/marketplace/trainers/${id}`).then(r => r.data)

export const getPlans = (params?: { type?: string; difficulty?: string; search?: string }) =>
  api.get<Plan[]>('/marketplace/plans', { params }).then(r => r.data)

export const getPlan = (id: string) =>
  api.get<Plan>(`/marketplace/plans/${id}`).then(r => r.data)

export const getMyPlans = () =>
  api.get('/marketplace/my-plans').then(r => r.data)

export const getMyTrainerProfile = () =>
  api.get<TrainerProfile | null>('/marketplace/trainer-profile/me').then(r => r.data)

export const createTrainerProfile = (dto: Partial<TrainerProfile>) =>
  api.post<TrainerProfile>('/marketplace/trainer-profile', dto).then(r => r.data)

export const createPlan = (dto: Partial<Plan>) =>
  api.post<Plan>('/marketplace/plans', dto).then(r => r.data)

export const purchasePlan = (planId: string, transactionId: string) =>
  api.post('/marketplace/purchase', { planId, transactionId }).then(r => r.data)
