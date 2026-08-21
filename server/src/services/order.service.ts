import prisma from '../utils/prisma.js';
import { ApiError } from '../utils/response.js';
import { OrderStatus, OrderType } from '@prisma/client';

export class OrderService {
  // 学员获取我的订单列表
  async getMyOrders(userId: string, status?: OrderStatus) {
    const where: any = { userId };
    if (status) where.status = status;

    return prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  // 学员获取订单详情
  async getOrderDetail(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw ApiError.notFound('订单不存在');
    }

    return order;
  }

  // 学员取消待支付订单
  async cancelOrder(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw ApiError.notFound('订单不存在');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw ApiError.badRequest('仅待支付订单支持取消');
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CLOSED },
    });
  }

  // 管理端：获取订单列表与对账数据
  async getAdminOrders(params: {
    status?: OrderStatus;
    orderType?: OrderType;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(Number(params.page) || 1, 1);
    const limit = Math.min(Math.max(Number(params.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.orderType) where.orderType = params.orderType;
    if (params.search) {
      where.OR = [
        { orderNo: { contains: params.search } },
        { targetTitle: { contains: params.search } },
        { user: { nickname: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    const [total, list] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, nickname: true, avatarUrl: true, phone: true } },
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

export const orderService = new OrderService();
