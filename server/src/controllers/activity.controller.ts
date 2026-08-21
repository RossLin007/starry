import { Request, Response, NextFunction } from 'express';
import { activityService } from '../services/activity.service.js';
import { sendSuccess, ApiError } from '../utils/response.js';

// ----------------------------------------------------
// 小程序端控制器
// ----------------------------------------------------
export const getClientActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = req.query.type as any;
    const activities = await activityService.getActivities({ type, status: 'PUBLISHED' });
    return sendSuccess(res, activities);
  } catch (err) {
    next(err);
  }
};

export const getClientActivityDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    const activity = await activityService.getActivityDetail(req.params.id, userId);
    return sendSuccess(res, activity);
  } catch (err) {
    next(err);
  }
};

export const enrollActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    if (!userId) throw ApiError.unauthorized();
    const result = await activityService.enrollActivity(userId, req.params.id, req.body);
    return sendSuccess(res, result, '报名成功，已生成电子票', 201);
  } catch (err) {
    next(err);
  }
};

export const getMyActivityTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    if (!userId) throw ApiError.unauthorized();
    const list = await activityService.getMyActivityTickets(userId);
    return sendSuccess(res, list);
  } catch (err) {
    next(err);
  }
};

export const getActivityTicketDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    if (!userId) throw ApiError.unauthorized();
    const ticket = await activityService.getActivityTicketDetail(userId, req.params.ticketCode);
    return sendSuccess(res, ticket);
  } catch (err) {
    next(err);
  }
};

// ----------------------------------------------------
// 管理端控制器
// ----------------------------------------------------
export const getAdminActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = req.query.type as any;
    const activities = await activityService.getActivities({ type });
    return sendSuccess(res, activities);
  } catch (err) {
    next(err);
  }
};

export const createActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activity = await activityService.createActivity(req.body);
    return sendSuccess(res, activity, '活动创建成功', 201);
  } catch (err) {
    next(err);
  }
};

export const updateActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activity = await activityService.updateActivity(req.params.id, req.body);
    return sendSuccess(res, activity, '活动已更新');
  } catch (err) {
    next(err);
  }
};

export const deleteActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await activityService.deleteActivity(req.params.id);
    return sendSuccess(res, null, '活动已删除');
  } catch (err) {
    next(err);
  }
};

export const getActivityEnrollments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isCheckedIn = req.query.isCheckedIn !== undefined ? req.query.isCheckedIn === 'true' : undefined;
    const search = req.query.search as string | undefined;
    const list = await activityService.getActivityEnrollments(req.params.id, { isCheckedIn, search });
    return sendSuccess(res, list);
  } catch (err) {
    next(err);
  }
};

export const verifyTicketCheckin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ticketCode } = req.body;
    const result = await activityService.verifyTicketCheckin(ticketCode);
    return sendSuccess(res, result, result.message);
  } catch (err) {
    next(err);
  }
};
