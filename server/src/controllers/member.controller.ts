import { Request, Response, NextFunction } from 'express';
import { memberService } from '../services/member.service.js';
import { sendSuccess, ApiError } from '../utils/response.js';

export const getMemberBenefits = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const benefits = memberService.getMemberBenefits();
    return sendSuccess(res, benefits);
  } catch (err) {
    next(err);
  }
};

export const createMemberOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    if (!userId) throw ApiError.unauthorized();
    const order = await memberService.createMemberOrder(userId);
    return sendSuccess(res, order, '会员订单创建成功', 201);
  } catch (err) {
    next(err);
  }
};

export const getAdminMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await memberService.getAdminMembers(req.query as any);
    return sendSuccess(res, list);
  } catch (err) {
    next(err);
  }
};
