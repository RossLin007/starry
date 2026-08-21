import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service.js';
import { sendSuccess, ApiError } from '../utils/response.js';

export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    if (!userId) throw ApiError.unauthorized();
    const status = req.query.status as any;
    const orders = await orderService.getMyOrders(userId, status);
    return sendSuccess(res, orders);
  } catch (err) {
    next(err);
  }
};

export const getOrderDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    if (!userId) throw ApiError.unauthorized();
    const order = await orderService.getOrderDetail(userId, req.params.id);
    return sendSuccess(res, order);
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    if (!userId) throw ApiError.unauthorized();
    const order = await orderService.cancelOrder(userId, req.params.id);
    return sendSuccess(res, order, '订单已成功取消');
  } catch (err) {
    next(err);
  }
};

export const getAdminOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.getAdminOrders(req.query as any);
    return sendSuccess(res, orders);
  } catch (err) {
    next(err);
  }
};
