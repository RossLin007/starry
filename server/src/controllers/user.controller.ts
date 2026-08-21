import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { sendSuccess, ApiError } from '../utils/response.js';

export const wechatLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    const result = await userService.wechatLogin(code);
    return sendSuccess(res, result, '微信登录成功');
  } catch (err) {
    next(err);
  }
};

export const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    if (!userId) throw ApiError.unauthorized();
    const profile = await userService.getProfile(userId);
    return sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
};

export const updateMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    if (!userId) throw ApiError.unauthorized();
    const result = await userService.updateProfile(userId, req.body);
    return sendSuccess(res, result, '个人资料已更新');
  } catch (err) {
    next(err);
  }
};

export const getMyAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    if (!userId) throw ApiError.unauthorized();
    const address = await userService.getAddress(userId);
    return sendSuccess(res, address);
  } catch (err) {
    next(err);
  }
};

export const updateMyAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    if (!userId) throw ApiError.unauthorized();
    const address = await userService.updateAddress(userId, req.body);
    return sendSuccess(res, address, '收货地址已保存');
  } catch (err) {
    next(err);
  }
};
