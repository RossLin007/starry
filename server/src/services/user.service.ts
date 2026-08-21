import prisma from '../utils/prisma.js';
import { ApiError } from '../utils/response.js';
import { signClientToken } from '../utils/jwt.js';

export class UserService {
  // 微信登录 / 自动注册
  async wechatLogin(code: string) {
    if (!code) {
      throw ApiError.badRequest('微信登录 Code 不能为空');
    }

    // 开发环境兼容 mock，生产对接 code2session
    const openid = `wx_user_${code}`;

    let user = await prisma.user.findUnique({
      where: { openid },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          openid,
          nickname: '若星学员',
        },
      });
    }

    if (user.status !== 'ACTIVE') {
      throw ApiError.forbidden('该账号已被停用，请联系客服');
    }

    const token = signClientToken({
      userId: user.id,
      openid: user.openid,
    });

    return {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        memberTier: user.memberTier,
        points: user.points,
      },
    };
  }

  // 获取学员个人中心资料
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        courseEnrollments: {
          where: { status: 'ACTIVE' },
          include: {
            course: {
              select: { id: true, title: true, coverUrl: true, courseStartTime: true },
            },
          },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!user) {
      throw ApiError.notFound('学员不存在');
    }

    // 计算加入天数
    const now = new Date();
    const created = new Date(user.createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const daysJoined = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    // 检查是否有即将开课的提醒 (24h 内开课)
    const upcomingEnrollment = (user.courseEnrollments || []).find((e) => {
      if (!e.course?.courseStartTime) return false;
      const start = new Date(e.course.courseStartTime).getTime();
      const diffHours = (start - now.getTime()) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 24;
    });

    const reminder = upcomingEnrollment
      ? {
          hasReminder: true,
          courseId: upcomingEnrollment.course.id,
          courseTitle: upcomingEnrollment.course.title,
          message: `您报名的「${upcomingEnrollment.course.title}」将于 24 小时内开课，请留意课节解锁提醒。`,
        }
      : { hasReminder: false };

    return {
      id: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      memberTier: user.memberTier,
      memberExpireAt: user.memberExpireAt,
      points: user.points,
      daysJoined,
      shippingAddress: user.shippingAddress,
      activeCoursesCount: user.courseEnrollments?.length || 0,
      reminder,
      tags: (user.tags || []).map((t) => ({ id: t.tag.id, name: t.tag.name, color: t.tag.color })),
    };
  }

  // 修改学员资料
  async updateProfile(userId: string, data: { nickname?: string; avatarUrl?: string; phone?: string }) {
    if (data.nickname && (data.nickname.length < 1 || data.nickname.length > 20)) {
      throw ApiError.badRequest('昵称长度需在 1 到 20 个字符之间');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        nickname: data.nickname,
        avatarUrl: data.avatarUrl,
        phone: data.phone,
      },
    });

    return {
      id: updated.id,
      nickname: updated.nickname,
      avatarUrl: updated.avatarUrl,
      phone: updated.phone,
    };
  }

  // 获取收货地址
  async getAddress(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { shippingAddress: true },
    });
    return user?.shippingAddress || null;
  }

  // 更新收货地址
  async updateAddress(userId: string, addressData: { name: string; phone: string; province: string; city: string; district: string; address: string }) {
    if (!addressData.name || !addressData.phone || !addressData.address) {
      throw ApiError.badRequest('姓名、手机号及详细地址不能为空');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        shippingAddress: addressData as any,
      },
      select: { shippingAddress: true },
    });

    return updated.shippingAddress;
  }
}

export const userService = new UserService();
