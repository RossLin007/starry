import prisma from '../utils/prisma.js';
import { ApiError } from '../utils/response.js';
import { MemberTier } from '@prisma/client';

export interface StudentListQuery {
  page?: number;
  limit?: number;
  search?: string;
  memberTier?: MemberTier;
  tagId?: string;
}

export class StudentService {
  // 获取学员列表（分页、搜索、标签筛选）
  async getStudents(query: StudentListQuery) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { nickname: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
      ];
    }

    if (query.memberTier) {
      where.memberTier = query.memberTier;
    }

    if (query.tagId) {
      where.tags = {
        some: { tagId: query.tagId },
      };
    }

    const [total, list] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tags: {
            include: { tag: true },
          },
          _count: {
            select: {
              courseEnrollments: true,
              checkins: true,
              orders: true,
            },
          },
        },
      }),
    ]);

    const formatted = list.map((u) => ({
      id: u.id,
      nickname: u.nickname,
      avatarUrl: u.avatarUrl,
      phone: u.phone,
      memberTier: u.memberTier,
      memberExpireAt: u.memberExpireAt,
      points: u.points,
      status: u.status,
      createdAt: u.createdAt,
      tags: u.tags.map((t) => ({ id: t.tag.id, name: t.tag.name, color: t.tag.color })),
      coursesCount: u._count.courseEnrollments,
      checkinsCount: u._count.checkins,
      ordersCount: u._count.orders,
    }));

    return {
      list: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 获取学员完整详情与陪伴记录
  async getStudentDetail(studentId: string) {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        tags: {
          include: { tag: true },
        },
        courseEnrollments: {
          include: {
            course: {
              select: { id: true, title: true, coverUrl: true, category: true, status: true },
            },
          },
          orderBy: { enrolledAt: 'desc' },
        },
        checkins: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            course: { select: { title: true } },
          },
        },
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      throw ApiError.notFound('学员档案不存在');
    }

    return {
      ...student,
      tags: student.tags.map((t) => ({ id: t.tag.id, name: t.tag.name, color: t.tag.color })),
    };
  }

  // 为学员批量打标签
  async updateStudentTags(studentId: string, tagIds: string[]) {
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student) {
      throw ApiError.notFound('学员不存在');
    }

    // 先删除原有关联，再批量插入新标签
    await prisma.$transaction([
      prisma.studentTag.deleteMany({ where: { userId: studentId } }),
      prisma.studentTag.createMany({
        data: tagIds.map((tagId) => ({
          userId: studentId,
          tagId,
        })),
        skipDuplicates: true,
      }),
    ]);

    return this.getStudentDetail(studentId);
  }
}

export const studentService = new StudentService();
