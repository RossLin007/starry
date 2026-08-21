import { Request, Response, NextFunction } from 'express';
import { configService } from '../services/config.service.js';
import { sendSuccess } from '../utils/response.js';

export const getClientHomeData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    const data = await configService.getHomeAggregateData(userId);
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const getConfigs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const configs = await configService.getAllConfigs();
    return sendSuccess(res, configs);
  } catch (err) {
    next(err);
  }
};

export const updateConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key, value, description } = req.body;
    const config = await configService.updateConfig(key, value, description);
    return sendSuccess(res, config, '配置已保存');
  } catch (err) {
    next(err);
  }
};
