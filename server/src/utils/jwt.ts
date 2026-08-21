import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface ClientJwtPayload {
  userId: string;
  openid: string;
  role: 'client';
}

export interface AdminJwtPayload {
  adminId: string;
  username: string;
  role: 'SUPER_ADMIN' | 'OPERATOR';
}

// 签发小程序学员 JWT
export const signClientToken = (payload: Omit<ClientJwtPayload, 'role'>): string => {
  return jwt.sign({ ...payload, role: 'client' }, config.jwt.clientSecret, {
    expiresIn: config.jwt.clientExpiresIn as any,
  });
};

// 验证小程序学员 JWT
export const verifyClientToken = (token: string): ClientJwtPayload => {
  return jwt.verify(token, config.jwt.clientSecret) as ClientJwtPayload;
};

// 签发管理后台管理员 JWT
export const signAdminToken = (payload: AdminJwtPayload): string => {
  return jwt.sign(payload, config.jwt.adminSecret, {
    expiresIn: config.jwt.adminExpiresIn as any,
  });
};

// 验证管理后台管理员 JWT
export const verifyAdminToken = (token: string): AdminJwtPayload => {
  return jwt.verify(token, config.jwt.adminSecret) as AdminJwtPayload;
};
