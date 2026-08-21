import prisma from '../utils/prisma.js';
import { ApiError } from '../utils/response.js';
import { MemberTier, OrderStatus, OrderType } from '@prisma/client';

export class MemberService {
  // 获取星愿年度会员权益与定价
  getMemberBenefits() {
    return {
      tierName: '星愿年度会员 (Star Member)',
      price: 999,
      durationDays: 365,
      benefits: [
        { icon: '✦', title: '全场课程专享特惠', desc: '若星空间全线空间整理营享 8.8 折专属优惠' },
        { icon: '🎟️', title: '雅集沙龙免费入场券', desc: '全年获赠 2 场线下生活美学工作坊/雅集免费席位' },
        { icon: '📦', title: '纸质手册礼盒寄送', desc: '免费寄送《若星空间生活整理手册》精装限定版' },
        { icon: '💬', title: '1v1 温润陪伴答疑', desc: '主理人及助教团队专属微信答疑与空间梳理指导' },
        { icon: '⭐', title: '星图双倍积分权益', desc: '日常实践打卡与活动参与享 2 倍星图积分' },
      ],
    };
  }

  // 学员创建星愿年度会员购买订单
  async createMemberOrder(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound('学员不存在');
    }

    const orderNo = `MO${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const memberFee = 999;

    const order = await prisma.order.create({
      data: {
        orderNo,
        userId,
        orderType: OrderType.MEMBER,
        targetId: 'star_member_annual',
        targetTitle: '若星星愿年度会员（365天尊享权益）',
        amount: memberFee,
        status: OrderStatus.PENDING,
      },
    });

    return {
      orderId: order.id,
      orderNo: order.orderNo,
      amount: order.amount,
      targetTitle: order.targetTitle,
    };
  }

  // 管理端：获取会员列表与到期状态
  async getAdminMembers(params: { tier?: MemberTier; page?: number; limit?: number }) {
    const page = Math.max(Number(params.page) || 1, 1);
    const limit = Math.min(Math.max(Number(params.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.tier) {
      where.memberTier = params.tier;
    }

    const [total, list] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ memberExpireAt: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          nickname: true,
          avatarUrl: true,
          phone: true,
          memberTier: true,
          memberExpireAt: true,
          points: true,
          status: true,
          createdAt: true,
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
}

export const memberService = new MemberService();
