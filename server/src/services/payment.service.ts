import prisma from '../utils/prisma.js';
import { ApiError } from '../utils/response.js';
import { paymentAdapter } from '../adapters/payment.adapter.js';
import { MemberTier, OrderStatus } from '@prisma/client';

export class PaymentService {
  // 发起微信支付，返回客户端拉起参数
  async initiatePayment(userId: string, orderId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound('学员信息不存在');
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw ApiError.notFound('订单不存在');
    }

    if (order.status === OrderStatus.PAID) {
      throw ApiError.badRequest('该订单已完成支付，请勿重复支付');
    }

    if (order.status === OrderStatus.CLOSED) {
      throw ApiError.badRequest('该订单已关闭，请重新下单');
    }

    const amountInCents = Math.round(Number(order.amount) * 100);

    // 调用微信支付适配器生成小程序客户端调起参数
    const payParams = await paymentAdapter.createWechatPayment({
      orderNo: order.orderNo,
      description: order.targetTitle,
      amountInCents,
      openid: user.openid,
    });

    return {
      orderId: order.id,
      orderNo: order.orderNo,
      amount: order.amount,
      payParams,
    };
  }

  // 处理微信支付 V3 回调通知 (幂等处理)
  async handlePaymentNotify(headers: any, body: any) {
    const notifyData = await paymentAdapter.verifyAndDecryptNotify(headers, body);
    const { orderNo, transactionId, tradeState } = notifyData;

    const order = await prisma.order.findUnique({
      where: { orderNo },
      include: { user: true },
    });

    if (!order) {
      return { code: 'FAIL', message: 'Order not found' };
    }

    // 幂等保护：若已支付直接返回成功
    if (order.status === OrderStatus.PAID) {
      return { code: 'SUCCESS', message: 'OK' };
    }

    if (tradeState === 'SUCCESS') {
      const now = new Date();

      await prisma.$transaction(async (tx) => {
        // 1. 更新订单为已支付并保存微信流水号
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.PAID,
            payTransactionId: transactionId,
            paidAt: now,
          },
        });

        // 2. 业务流转：若是星愿会员订单，自动开通或续费一年
        if (order.orderType === 'MEMBER') {
          const currentExpire = order.user.memberExpireAt;
          let newExpire: Date;
          if (currentExpire && new Date(currentExpire) > now) {
            newExpire = new Date(new Date(currentExpire).getTime() + 365 * 86400000);
          } else {
            newExpire = new Date(now.getTime() + 365 * 86400000);
          }

          await tx.user.update({
            where: { id: order.userId },
            data: {
              memberTier: MemberTier.DEEP,
              memberExpireAt: newExpire,
            },
          });
        }
      });
    }

    return { code: 'SUCCESS', message: '成功' };
  }
}

export const paymentService = new PaymentService();
