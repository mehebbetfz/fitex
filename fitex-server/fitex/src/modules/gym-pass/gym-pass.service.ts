import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { GymPartner, GymPartnerDocument } from 'src/models/gym-partner.schema'
import { GymVisit, GymVisitDocument } from 'src/models/gym-visit.schema'
import { Membership, MembershipDocument } from 'src/models/membership.schema'

interface PurchaseMembershipDto {
  gymId?: string
  planType: 'day' | 'month' | 'quarter' | 'year' | 'all_access'
  transactionId?: string
}

@Injectable()
export class GymPassService {
  constructor(
    @InjectModel(GymPartner.name) private gymModel: Model<GymPartnerDocument>,
    @InjectModel(Membership.name) private membershipModel: Model<MembershipDocument>,
    @InjectModel(GymVisit.name) private visitModel: Model<GymVisitDocument>,
  ) {}

  // ─── Gyms ──────────────────────────────────────────────────────────────────

  async getGyms(city?: string) {
    const filter: Record<string, any> = { isActive: true }
    if (city) filter.city = { $regex: city, $options: 'i' }
    return this.gymModel.find(filter).sort({ name: 1 }).lean()
  }

  async getGymById(id: string) {
    const gym = await this.gymModel.findById(id).lean()
    if (!gym) throw new NotFoundException('Gym not found')
    return gym
  }

  // ─── Membership ────────────────────────────────────────────────────────────

  async getActiveMembership(userId: string) {
    return this.membershipModel
      .findOne({
        userId: new Types.ObjectId(userId),
        status: 'active',
        endDate: { $gte: new Date() },
      })
      .populate('gymId', 'name address city photos')
      .lean()
  }

  async getUserMemberships(userId: string) {
    return this.membershipModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('gymId', 'name address city')
      .sort({ createdAt: -1 })
      .lean()
  }

  async purchaseMembership(userId: string, dto: PurchaseMembershipDto) {
    const { gymId, planType, transactionId } = dto

    if (gymId) {
      const gym = await this.gymModel.findById(gymId)
      if (!gym) throw new NotFoundException('Gym not found')
    }

    const now = new Date()
    const endDate = this.calculateEndDate(now, planType)
    const accessToken = this.generateAccessToken()

    const priceMap: Record<string, number> = {
      day: 30000,
      month: 199000,
      quarter: 499000,
      year: 1590000,
      all_access: 299000,
    }

    return this.membershipModel.create({
      userId: new Types.ObjectId(userId),
      gymId: gymId ? new Types.ObjectId(gymId) : null,
      planType,
      startDate: now,
      endDate,
      status: 'active',
      price: priceMap[planType] ?? 0,
      transactionId,
      accessToken,
    })
  }

  // ─── NFC / QR Check-in ────────────────────────────────────────────────────

  async checkIn(terminalId: string, accessToken: string) {
    const gym = await this.gymModel.findOne({ nfcTerminalId: terminalId, isActive: true })
    if (!gym) return { granted: false, message: 'Unknown terminal' }

    const membership = await this.membershipModel
      .findOne({
        accessToken,
        status: 'active',
        endDate: { $gte: new Date() },
        $or: [{ gymId: gym._id }, { gymId: null }],
      })
      .populate('userId', 'firstName lastName')
      .lean()

    if (!membership) return { granted: false, message: 'No valid membership' }

    await this.visitModel.create({
      userId: (membership.userId as any)._id ?? membership.userId,
      gymId: gym._id,
      membershipId: membership._id,
      checkInTime: new Date(),
      terminalId,
    })

    await this.membershipModel.findByIdAndUpdate(membership._id, { $inc: { visitsCount: 1 } })

    const user = membership.userId as any
    return {
      granted: true,
      memberName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Участник',
      validUntil: membership.endDate,
      gymName: gym.name,
      message: 'Добро пожаловать!',
    }
  }

  // ─── Visit history ─────────────────────────────────────────────────────────

  async getVisitHistory(userId: string) {
    return this.visitModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('gymId', 'name address city')
      .sort({ checkInTime: -1 })
      .limit(100)
      .lean()
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private calculateEndDate(from: Date, planType: string): Date {
    const end = new Date(from)
    switch (planType) {
      case 'day':     end.setDate(end.getDate() + 1); break
      case 'month':   end.setMonth(end.getMonth() + 1); break
      case 'quarter': end.setMonth(end.getMonth() + 3); break
      case 'year':    end.setFullYear(end.getFullYear() + 1); break
      case 'all_access': end.setFullYear(end.getFullYear() + 1); break
      default:        end.setMonth(end.getMonth() + 1)
    }
    return end
  }

  private generateAccessToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const segments = Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
    )
    return segments.join('-')
  }
}
