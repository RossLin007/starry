import prisma from '../utils/prisma.js';
import { ApiError } from '../utils/response.js';
import { ActivityType, OrderStatus, OrderType, PublishStatus } from '@prisma/client';

export class ActivityService {
  // 获取活动列表
  async getActivities(params: { type?: ActivityType; status?: PublishStatus; isRecommended?: boolean }) {
    const where: any = {};
    if (params.type) where.activityType = params.type;
    if (params.status) where.status = params.status;
    if (params.isRecommended !== undefined) where.isRecommended = params.isRecommended;

    return prisma.activity.findMany({
      where,
      orderBy: [{ startTime: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: { select: { enrollments: true } },
      },
    });
  }

  // 获取活动详情（包含用户报名状态与电子票）
  async getActivityDetail(id: string, userId?: string) {
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        _count: { select: { enrollments: true } },
      },
    });

    if (!activity) {
      throw ApiError.notFound('活动不存在');
    }

    let isEnrolled = false;
    let enrollmentInfo = null;

    if (userId) {
      const enrollment = await prisma.activityEnrollment.findUnique({
        where: { userId_activityId: { userId, activityId: id } },
      });
      if (enrollment) {
        isEnrolled = true;
        enrollmentInfo = {
          enrollmentId: enrollment.id,
          ticketCode: `TICK-${enrollment.id.slice(0, 8).toUpperCase()}`,
          isCheckedIn: enrollment.isCheckedIn,
          checkedInAt: enrollment.checkedInAt,
        };
      }
    }

    return {
      ...activity,
      isEnrolled,
      enrollment: enrollmentInfo,
    };
  }

  // 学员报名活动
  async enrollActivity(userId: string, activityId: string, data?: { notes?: string }) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        _count: { select: { enrollments: true } },
      },
    });

    if (!activity) {
      throw ApiError.notFound('活动不存在');
    }

    if (activity.status !== PublishStatus.PUBLISHED) {
      throw ApiError.badRequest('当前活动未开放报名');
    }

    const now = new Date();
    if (now > new Date(activity.enrollDeadline)) {
      throw ApiError.badRequest('活动报名已截止');
    }

    if (activity.maxParticipants && activity._count.enrollments >= activity.maxParticipants) {
      throw ApiError.badRequest('本场活动报名名额已满');
    }

    const existingEnrollment = await prisma.activityEnrollment.findUnique({
      where: { userId_activityId: { userId, activityId } },
    });

    if (existingEnrollment) {
      throw ApiError.badRequest('您已报名此活动，无需重复报名', 40903);
    }

    const orderNo = `AO${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const [order, enrollment] = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNo,
          userId,
          orderType: OrderType.ACTIVITY,
          targetId: activityId,
          targetTitle: `活动报名 - ${activity.title}`,
          amount: activity.price,
          status: OrderStatus.PAID,
          paidAt: new Date(),
        },
      });

      const newEnrollment = await tx.activityEnrollment.create({
        data: {
          userId,
          activityId,
          orderId: newOrder.id,
          feedback: data?.notes || null,
        },
      });

      await tx.activity.update({
        where: { id: activityId },
        data: { currentParticipants: { increment: 1 } },
      });

      return [newOrder, newEnrollment];
    });

    const ticketCode = `TICK-${enrollment.id.slice(0, 8).toUpperCase()}`;

    return {
      enrollmentId: enrollment.id,
      orderId: order.id,
      ticketCode,
      activityTitle: activity.title,
      startTime: activity.startTime,
      location: activity.location,
      message: '活动报名成功，已生成电子入场券',
    };
  }

  // 学员获取我的活动电子票列表
  async getMyActivityTickets(userId: string) {
    const enrollments = await prisma.activityEnrollment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        activity: true,
      },
    });

    return enrollments.map((e) => ({
      enrollmentId: e.id,
      ticketCode: `TICK-${e.id.slice(0, 8).toUpperCase()}`,
      activityId: e.activity.id,
      title: e.activity.title,
      activityType: e.activity.activityType,
      coverUrl: e.activity.coverUrl,
      location: e.activity.location,
      startTime: e.activity.startTime,
      endTime: e.activity.endTime,
      isCheckedIn: e.isCheckedIn,
      checkedInAt: e.checkedInAt,
      enrolledAt: e.createdAt,
    }));
  }

  // 获取单张电子票详情
  async getActivityTicketDetail(userId: string, enrollmentIdOrTicketCode: string) {
    let enrollment = await prisma.activityEnrollment.findFirst({
      where: {
        userId,
        OR: [
          { id: enrollmentIdOrTicketCode },
          { id: { startsWith: enrollmentIdOrTicketCode.replace('TICK-', '').toLowerCase() } },
        ],
      },
      include: {
        activity: true,
        user: { select: { nickname: true, phone: true } },
      },
    });

    if (!enrollment) {
      throw ApiError.notFound('电子入场票不存在');
    }

    return {
      enrollmentId: enrollment.id,
      ticketCode: `TICK-${enrollment.id.slice(0, 8).toUpperCase()}`,
      activity: enrollment.activity,
      user: enrollment.user,
      isCheckedIn: enrollment.isCheckedIn,
      checkedInAt: enrollment.checkedInAt,
      qrData: `STARRY_VERIFY:${enrollment.id}`,
    };
  }

  // 管理端：现场扫码 / 输入票号核销入场
  async verifyTicketCheckin(ticketQuery: string) {
    if (!ticketQuery) {
      throw ApiError.badRequest('请输入或扫描电子票码');
    }

    // 支持全量 ID、TICK-xxxx 前缀或 STARRY_VERIFY:xxxx 二维码格式
    const cleanId = ticketQuery.replace('STARRY_VERIFY:', '').replace('TICK-', '').toLowerCase();

    let enrollment = await prisma.activityEnrollment.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { id: { startsWith: cleanId } },
        ],
      },
      include: {
        activity: { select: { id: true, title: true, startTime: true, location: true } },
        user: { select: { id: true, nickname: true, phone: true, avatarUrl: true } },
      },
    });

    if (!enrollment) {
      throw ApiError.notFound('未找到对应的活动电子票凭证，请核对票号');
    }

    if (enrollment.isCheckedIn) {
      return {
        success: false,
        alreadyCheckedIn: true,
        message: '该电子票已于早前核销，请勿重复入场',
        checkedInAt: enrollment.checkedInAt,
        student: enrollment.user,
        activity: enrollment.activity,
      };
    }

    // 执行核销
    const updated = await prisma.activityEnrollment.update({
      where: { id: enrollment.id },
      data: {
        isCheckedIn: true,
        checkedInAt: new Date(),
      },
      include: {
        activity: true,
        user: { select: { nickname: true, phone: true } },
      },
    });

    return {
      success: true,
      alreadyCheckedIn: false,
      message: '核销成功，欢迎入场！',
      ticketCode: `TICK-${updated.id.slice(0, 8).toUpperCase()}`,
      checkedInAt: updated.checkedInAt,
      student: updated.user,
      activity: updated.activity,
    };
  }

  // 管理端：获取活动报名名单
  async getActivityEnrollments(activityId: string, params: { isCheckedIn?: boolean; search?: string }) {
    const where: any = { activityId };
    if (params.isCheckedIn !== undefined) {
      where.isCheckedIn = params.isCheckedIn;
    }
    if (params.search) {
      where.user = {
        OR: [
          { nickname: { contains: params.search, mode: 'insensitive' } },
          { phone: { contains: params.search } },
        ],
      };
    }

    const list = await prisma.activityEnrollment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, nickname: true, phone: true, avatarUrl: true, memberTier: true } },
      },
    });

    return list.map((e) => ({
      id: e.id,
      ticketCode: `TICK-${e.id.slice(0, 8).toUpperCase()}`,
      user: e.user,
      isCheckedIn: e.isCheckedIn,
      checkedInAt: e.checkedInAt,
      enrolledAt: e.createdAt,
      feedback: e.feedback,
    }));
  }

  // ----------------------------------------------------
  // 管理端基础 CRUD
  // ----------------------------------------------------
  async createActivity(data: any) {
    if (!data.title || !data.startTime || !data.endTime || !data.enrollDeadline) {
      throw ApiError.badRequest('活动标题、起止时间与报名截止时间为必填项');
    }

    return prisma.activity.create({
      data: {
        title: data.title,
        coverUrl: data.coverUrl || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600',
        activityType: data.activityType || ActivityType.OFFLINE,
        location: data.location || '',
        price: data.price ? Number(data.price) : 0,
        maxParticipants: data.maxParticipants ? Number(data.maxParticipants) : null,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        enrollDeadline: new Date(data.enrollDeadline),
        status: data.status || PublishStatus.DRAFT,
        content: data.content || '',
        isRecommended: Boolean(data.isRecommended),
      },
    });
  }

  async updateActivity(id: string, data: any) {
    const existing = await prisma.activity.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound('活动不存在');
    }

    return prisma.activity.update({
      where: { id },
      data: {
        title: data.title,
        coverUrl: data.coverUrl,
        activityType: data.activityType,
        location: data.location,
        price: data.price !== undefined ? Number(data.price) : undefined,
        maxParticipants: data.maxParticipants !== undefined ? (data.maxParticipants ? Number(data.maxParticipants) : null) : undefined,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        enrollDeadline: data.enrollDeadline ? new Date(data.enrollDeadline) : undefined,
        status: data.status,
        content: data.content,
        isRecommended: data.isRecommended !== undefined ? Boolean(data.isRecommended) : undefined,
      },
    });
  }

  async deleteActivity(id: string) {
    await prisma.activity.delete({ where: { id } });
    return true;
  }
}

export const activityService = new ActivityService();
