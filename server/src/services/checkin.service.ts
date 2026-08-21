import prisma from '../utils/prisma.js';
import { ApiError } from '../utils/response.js';
import { CheckinStatus } from '@prisma/client';

export class CheckinService {
  // 学员提交实践打卡 (事务写入：创建打卡 + 自动累加 10 星图积分)
  async createCheckin(userId: string, data: { courseId?: string; lessonId?: string; content: string; images?: string[] }) {
    if (!data.content || data.content.trim().length === 0) {
      throw ApiError.badRequest('打卡心得内容不能为空');
    }

    const images = data.images && Array.isArray(data.images) ? data.images : [];

    const [checkin, user] = await prisma.$transaction([
      prisma.checkin.create({
        data: {
          userId,
          courseId: data.courseId || null,
          lessonId: data.lessonId || null,
          content: data.content,
          images: images as any,
          status: CheckinStatus.PENDING,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { points: { increment: 10 } },
      }),
    ]);

    return {
      ...checkin,
      rewardPoints: 10,
      currentTotalPoints: user.points,
    };
  }

  // 我的打卡历史列表
  async getMyCheckins(userId: string) {
    return prisma.checkin.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        course: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true } },
      },
    });
  }

  // 学员成长星图与打卡日历热力聚合
  async getMyGrowthMap(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        points: true,
        memberTier: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('学员不存在');
    }

    const checkins = await prisma.checkin.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
      },
    });

    // 统计唯一打卡日期集合 (YYYY-MM-DD)
    const checkinDateSet = new Set<string>();
    checkins.forEach((c) => {
      const dateStr = new Date(c.createdAt).toISOString().slice(0, 10);
      checkinDateSet.add(dateStr);
    });

    const checkinDays = Array.from(checkinDateSet);

    // 计算连续打卡天数
    let streakDays = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      if (checkinDateSet.has(dateStr)) {
        streakDays++;
      } else if (i > 0) {
        // 如果今天还没打卡，允许从昨天算起
        break;
      }
    }

    return {
      user: {
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        memberTier: user.memberTier,
        points: user.points,
      },
      totalCheckins: checkins.length,
      totalDays: checkinDays.length,
      streakDays,
      checkinDates: checkinDays,
    };
  }

  // 精选上墙打卡广场 (展示主理人温润陪伴寄语)
  async getFeaturedCheckins() {
    return prisma.checkin.findMany({
      where: { isFeatured: true, status: CheckinStatus.APPROVED },
      orderBy: { featuredAt: 'desc' },
      take: 30,
      include: {
        user: { select: { id: true, nickname: true, avatarUrl: true, memberTier: true } },
        course: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true } },
      },
    });
  }

  // 后台打卡列表（分页与状态筛选）
  async getAdminCheckins(params: { status?: CheckinStatus; isFeatured?: boolean; courseId?: string; page?: number; limit?: number }) {
    const page = Math.max(Number(params.page) || 1, 1);
    const limit = Math.min(Math.max(Number(params.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.isFeatured !== undefined) where.isFeatured = params.isFeatured;
    if (params.courseId) where.courseId = params.courseId;

    const [total, list] = await Promise.all([
      prisma.checkin.count({ where }),
      prisma.checkin.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, nickname: true, avatarUrl: true, phone: true } },
          course: { select: { id: true, title: true } },
          lesson: { select: { id: true, title: true } },
        },
      }),
    ]);

    return {
      list,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 审核打卡与撰写若星主理人温润陪伴寄语
  async reviewCheckin(checkinId: string, data: { status: CheckinStatus; isFeatured?: boolean; adminComment?: string }) {
    const checkin = await prisma.checkin.findUnique({ where: { id: checkinId } });
    if (!checkin) {
      throw ApiError.notFound('打卡记录不存在');
    }

    const isFeatured = data.isFeatured !== undefined ? data.isFeatured : checkin.isFeatured;
    const featuredAt = isFeatured && !checkin.isFeatured ? new Date() : (isFeatured ? checkin.featuredAt : null);

    return prisma.checkin.update({
      where: { id: checkinId },
      data: {
        status: data.status,
        isFeatured,
        featuredAt,
        adminComment: data.adminComment !== undefined ? data.adminComment : checkin.adminComment,
      },
    });
  }
}

export const checkinService = new CheckinService();
