import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sendSuccess, ApiError } from '../utils/response.js';
import { signAdminToken, signClientToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

// 管理员登录校验 Schema
const adminLoginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(6, '密码至少6位'),
});

// 管理员登录接口
export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = adminLoginSchema.parse(req.body);

    const admin = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (!admin || admin.status !== 'ACTIVE') {
      throw ApiError.unauthorized('用户名或密码错误，或账号已被停用');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('用户名或密码错误');
    }

    // 更新最后登录时间
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signAdminToken({
      adminId: admin.id,
      username: admin.username,
      role: admin.role,
    });

    return sendSuccess(res, {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        realName: admin.realName,
        avatarUrl: admin.avatarUrl,
        role: admin.role,
      },
    }, '登录成功');
  } catch (err) {
    next(err);
  }
};

// 获取当前登录管理员信息
export const getAdminProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.adminUser?.adminId;
    if (!adminId) {
      throw ApiError.unauthorized();
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        username: true,
        realName: true,
        avatarUrl: true,
        role: true,
        email: true,
        lastLoginAt: true,
      },
    });

    if (!admin) {
      throw ApiError.notFound('管理员信息不存在');
    }

    return sendSuccess(res, admin);
  } catch (err) {
    next(err);
  }
};

// 小程序微信登录
export const wechatLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    if (!code) {
      throw ApiError.badRequest('微信登录 Code 不能为空');
    }

    // 开发与测试兼容：对于模拟 code 生成可用的 openid，生产接入 code2session
    const openid = `mock_openid_${code}`;

    let user = await prisma.user.findUnique({
      where: { openid },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          openid,
          nickname: '若星学员',
        },
      });
    }

    const token = signClientToken({
      userId: user.id,
      openid: user.openid,
    });

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        memberTier: user.memberTier,
        points: user.points,
      },
    }, '微信登录成功');
  } catch (err) {
    next(err);
  }
};
