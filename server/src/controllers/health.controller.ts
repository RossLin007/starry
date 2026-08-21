import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response.js';

export const getHealthStatus = (req: Request, res: Response) => {
  return sendSuccess(res, {
    status: 'healthy',
    service: 'starry-space-api',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};
