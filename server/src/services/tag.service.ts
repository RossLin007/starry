import prisma from '../utils/prisma.js';
import { ApiError } from '../utils/response.js';

export class TagService {
  // 获取标签列表（支持按分组筛选）
  async getTags(group?: string) {
    const where: any = group ? { group } : {};
    const tags = await prisma.tag.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { studentTags: true },
        },
      },
    });

    return tags.map((t) => ({
      id: t.id,
      name: t.name,
      group: t.group,
      color: t.color,
      studentCount: t._count.studentTags,
      createdAt: t.createdAt,
    }));
  }

  // 创建标签
  async createTag(data: { name: string; group: string; color?: string }) {
    if (!data.name || !data.group) {
      throw ApiError.badRequest('标签名称和所属分组不能为空');
    }

    const existing = await prisma.tag.findUnique({
      where: {
        name_group: {
          name: data.name,
          group: data.group,
        },
      },
    });

    if (existing) {
      throw ApiError.badRequest('该分组下已存在同名标签', 40901);
    }

    const tag = await prisma.tag.create({
      data: {
        name: data.name,
        group: data.group,
        color: data.color || '#4F46E5',
      },
    });

    return tag;
  }

  // 更新标签
  async updateTag(id: string, data: { name?: string; color?: string }) {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw ApiError.notFound('标签不存在');
    }

    const updated = await prisma.tag.update({
      where: { id },
      data: {
        name: data.name,
        color: data.color,
      },
    });

    return updated;
  }

  // 删除标签
  async deleteTag(id: string) {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw ApiError.notFound('标签不存在');
    }

    await prisma.tag.delete({ where: { id } });
    return true;
  }
}

export const tagService = new TagService();
