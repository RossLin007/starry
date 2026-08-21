import { Request, Response, NextFunction } from 'express';
import { checkinService } from '../services/checkin.service.js';
import { sendSuccess, ApiError } from '../utils/response.js';

export const createCheckin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    if (!userId) throw ApiError.unauthorized();
    const checkin = await checkinService.createCheckin(userId, req.body);
    return sendSuccess(res, checkin, '打卡提交成功，已获得 10 星图积分', 201);
  } catch (err) {
    next(err);
  }
};

export const getMyCheckins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    if (!userId) throw ApiError.unauthorized();
    const list = await checkinService.getMyCheckins(userId);
    return sendSuccess(res, list);
  } catch (err) {
    next(err);
  }
};

export const getMyGrowthMap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    if (!userId) throw ApiError.unauthorized();
    const growth = await checkinService.getMyGrowthMap(userId);
    return sendSuccess(res, growth);
  } catch (err) {
    next(err);
  }
};

export const getFeaturedCheckins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await checkinService.getFeaturedCheckins();
    return sendSuccess(res, list);
  } catch (err) {
    next(err);
  }
};

export const getAdminCheckins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await checkinService.getAdminCheckins(req.query);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const reviewCheckin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const checkin = await checkinService.reviewCheckin(req.params.id, req.body);
    return sendSuccess(res, checkin, '审核操作成功');
  } catch (err) {
    next(err);
  }
};
