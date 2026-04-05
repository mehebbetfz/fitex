import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Plan, PlanDocument } from 'src/models/plan.schema'
import { PlanPurchase, PlanPurchaseDocument } from 'src/models/plan-purchase.schema'
import { TrainerProfile, TrainerProfileDocument } from 'src/models/trainer-profile.schema'

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectModel(TrainerProfile.name) private trainerModel: Model<TrainerProfileDocument>,
    @InjectModel(Plan.name) private planModel: Model<PlanDocument>,
    @InjectModel(PlanPurchase.name) private purchaseModel: Model<PlanPurchaseDocument>,
  ) {}

  // ─── Trainers ──────────────────────────────────────────────────────────────

  async getTrainers(query?: { specialty?: string; search?: string; limit?: number }) {
    const filter: Record<string, any> = { isActive: true }
    if (query?.specialty) filter.specialties = query.specialty
    if (query?.search) filter.displayName = { $regex: query.search, $options: 'i' }
    return this.trainerModel
      .find(filter)
      .sort({ rating: -1, studentsCount: -1 })
      .limit(query?.limit ?? 30)
      .lean()
  }

  async getTrainerById(id: string) {
    const trainer = await this.trainerModel.findById(id).lean()
    if (!trainer) throw new NotFoundException('Trainer not found')
    const plans = await this.planModel.find({ trainerId: trainer._id, isActive: true }).lean()
    return { ...trainer, plans }
  }

  async createTrainerProfile(userId: string, dto: Partial<TrainerProfile>) {
    const existing = await this.trainerModel.findOne({ userId: new Types.ObjectId(userId) })
    if (existing) throw new BadRequestException('Trainer profile already exists')
    return this.trainerModel.create({ ...dto, userId: new Types.ObjectId(userId) })
  }

  async updateTrainerProfile(userId: string, dto: Partial<TrainerProfile>) {
    return this.trainerModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: dto },
      { new: true },
    )
  }

  async getMyTrainerProfile(userId: string) {
    return this.trainerModel.findOne({ userId: new Types.ObjectId(userId) }).lean()
  }

  // ─── Plans ─────────────────────────────────────────────────────────────────

  async getPlans(query?: { type?: string; difficulty?: string; trainerId?: string; search?: string }) {
    const filter: Record<string, any> = { isActive: true }
    if (query?.type) filter.type = query.type
    if (query?.difficulty) filter.difficulty = query.difficulty
    if (query?.trainerId) filter.trainerId = new Types.ObjectId(query.trainerId)
    if (query?.search) filter.title = { $regex: query.search, $options: 'i' }
    return this.planModel
      .find(filter)
      .populate('trainerId', 'displayName avatarUrl rating isVerified')
      .sort({ rating: -1, purchasesCount: -1 })
      .lean()
  }

  async getPlanById(id: string) {
    const plan = await this.planModel
      .findById(id)
      .populate('trainerId', 'displayName avatarUrl rating isVerified bio specialties')
      .lean()
    if (!plan) throw new NotFoundException('Plan not found')
    return plan
  }

  async createPlan(userId: string, dto: Partial<Plan>) {
    const trainer = await this.trainerModel.findOne({ userId: new Types.ObjectId(userId) })
    if (!trainer) throw new BadRequestException('Create a trainer profile first')
    return this.planModel.create({ ...dto, trainerId: trainer._id })
  }

  // ─── Purchases ─────────────────────────────────────────────────────────────

  async getMyPurchasedPlans(userId: string) {
    return this.purchaseModel
      .find({ userId: new Types.ObjectId(userId), status: 'completed' })
      .populate({ path: 'planId', populate: { path: 'trainerId', select: 'displayName avatarUrl' } })
      .sort({ createdAt: -1 })
      .lean()
  }

  async purchasePlan(userId: string, planId: string, transactionId: string) {
    const plan = await this.planModel.findById(planId)
    if (!plan) throw new NotFoundException('Plan not found')

    const alreadyPurchased = await this.purchaseModel.findOne({
      userId: new Types.ObjectId(userId),
      planId: new Types.ObjectId(planId),
      status: 'completed',
    })
    if (alreadyPurchased) throw new BadRequestException('Plan already purchased')

    const purchase = await this.purchaseModel.create({
      userId: new Types.ObjectId(userId),
      planId: new Types.ObjectId(planId),
      transactionId,
      price: plan.price,
      currency: plan.currency,
      status: 'completed',
    })

    await this.planModel.findByIdAndUpdate(planId, { $inc: { purchasesCount: 1 } })
    return purchase
  }
}
