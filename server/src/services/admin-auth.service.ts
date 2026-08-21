import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import { ApiError } from '../utils/response.js';
import { signAdminToken } from '../utils/jwt.js';

export class AdminAuthService {
  // 管理员登录
  async login(form: { username: string; password: string }) {
    const { username, password } = form;

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

    // 记录最后登录时间
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signAdminToken({
      adminId: admin.id,
      username: admin.username,
      role: admin.role,
    });

    return {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        realName: admin.realName,
        avatarUrl: admin.avatarUrl,
        role: admin.role,
      },
    };
  }

  // 获取当前管理员详情
  async getProfile(adminId: string) {
    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        username: true,
        realName: true,
        avatarUrl: true,
        role: true,
        email: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!admin) {
      throw ApiError.notFound('管理员账号不存在');
    }

    return admin;
  }
}

export const adminAuthService = new AdminAuthService();
