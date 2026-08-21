import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service.js';
import { sendSuccess, ApiError } from '../utils/response.js';

export const initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    if (!userId) throw ApiError.unauthorized();
    const result = await paymentService.initiatePayment(userId, req.params.orderId);
    return sendSuccess(res, result, '微信支付调起参数已生成');
  } catch (err) {
    next(err);
  }
};

export const handleWechatNotify = async (req: Request, res: Response) => {
  try {
    const result = await paymentService.handlePaymentNotify(req.headers, req.body);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ code: 'FAIL', message: err.message });
  }
};
