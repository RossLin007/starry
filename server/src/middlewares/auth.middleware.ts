import { Request, Response, NextFunction } from 'express';
import { verifyClientToken, verifyAdminToken, ClientJwtPayload, AdminJwtPayload } from '../utils/jwt.js';
import { ApiError } from '../utils/response.js';

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      clientUser?: ClientJwtPayload;
      adminUser?: AdminJwtPayload;
    }
  }
}

// 1. 小程序端鉴权中间件
export const requireClientAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('请先登录小程序'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyClientToken(token);
    req.clientUser = decoded;
    next();
  } catch (err) {
    return next(ApiError.unauthorized('登录凭证已失效，请重新登录'));
  }
};

// 2. 管理后台鉴权中间件
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('请先登录管理后台'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAdminToken(token);
    req.adminUser = decoded;
    next();
  } catch (err) {
    return next(ApiError.unauthorized('管理员会话已过期，请重新登录'));
  }
};

// 3. RBAC 角色鉴权中间件
export const requireRole = (...roles: ('SUPER_ADMIN' | 'OPERATOR')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.adminUser) {
      return next(ApiError.unauthorized('未登录管理员身份'));
    }

    if (!roles.includes(req.adminUser.role)) {
      return next(ApiError.forbidden('您的权限不足以执行此操作'));
    }

    next();
  };
};
