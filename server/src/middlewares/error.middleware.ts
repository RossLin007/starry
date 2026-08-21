import { Request, Response, NextFunction } from 'express';
import { ApiError, sendError } from '../utils/response.js';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // 1. 自定义业务异常 ApiError
  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.errorCode, err.message);
  }

  // 2. Zod 参数校验异常
  if (err instanceof ZodError) {
    const errorDetails = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    return sendError(res, 400, 40001, `参数校验失败: ${errorDetails}`);
  }

  // 3. Prisma 数据库异常
  if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    console.error('Prisma Database Error:', err);
    if (err.code === 'P2002') {
      return sendError(res, 409, 40901, '唯一约束冲突，数据已存在');
    }
    if (err.code === 'P2025') {
      return sendError(res, 404, 40401, '目标记录不存在或已被删除');
    }
  }

  // 4. 未捕获的未知异常
  console.error('Unhandled Server Error:', err);
  return sendError(res, 500, 50001, '服务器繁忙，请稍后再试');
};
