import prisma from '../utils/prisma.js';
import { ApiError } from '../utils/response.js';
import { PublishStatus, ShopStatus } from '@prisma/client';

export class ContentService {
  // 1. 每日星语 / 每日内容
  async getDailyContent(date?: string) {
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const content = await prisma.dailyContent.findUnique({
      where: { date: targetDate },
    });
    return content || {
      date: targetDate,
      quote: '生活不在别处，当下即是全部。整理外在的物，是在安顿内在的心。',
      author: '若星',
    };
  }

  async createOrUpdateDailyContent(data: { date: string; quote: string; author?: string; audioUrl?: string; content?: string }) {
    if (!data.date || !data.quote) {
      throw ApiError.badRequest('日期和金句内容不能为空');
    }

    return prisma.dailyContent.upsert({
      where: { date: data.date },
      update: {
        quote: data.quote,
        author: data.author,
        audioUrl: data.audioUrl,
        content: data.content,
      },
      create: {
        date: data.date,
        quote: data.quote,
        author: data.author,
        audioUrl: data.audioUrl,
        content: data.content,
      },
    });
  }

  // 2. 学员故事
  async getStories(params: { status?: PublishStatus; isRecommended?: boolean }) {
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.isRecommended !== undefined) where.isRecommended = params.isRecommended;

    return prisma.story.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStoryDetail(id: string) {
    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) throw ApiError.notFound('故事不存在');
    return story;
  }

  async createStory(data: any) {
    if (!data.title || !data.content || !data.authorName) {
      throw ApiError.badRequest('标题、内容和作者名称为必填项');
    }
    return prisma.story.create({
      data: {
        title: data.title,
        authorName: data.authorName,
        authorAvatar: data.authorAvatar,
        summary: data.summary || '',
        content: data.content,
        coverUrl: data.coverUrl,
        status: data.status || PublishStatus.DRAFT,
        isRecommended: Boolean(data.isRecommended),
      },
    });
  }

  async updateStory(id: string, data: any) {
    return prisma.story.update({
      where: { id },
      data: {
        title: data.title,
        authorName: data.authorName,
        authorAvatar: data.authorAvatar,
        summary: data.summary,
        content: data.content,
        coverUrl: data.coverUrl,
        status: data.status,
        isRecommended: data.isRecommended !== undefined ? Boolean(data.isRecommended) : undefined,
      },
    });
  }

  // 3. 工具表单
  async getToolForms(category?: string) {
    const where: any = category ? { category } : {};
    return prisma.toolForm.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  // 4. 好物推荐商品 (跳转第三方)
  async getShopItems(params: { category?: string; status?: ShopStatus }) {
    const where: any = {};
    if (params.category && params.category !== '全部') where.category = params.category;
    if (params.status) where.status = params.status;

    return prisma.shopItem.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async createShopItem(data: any) {
    if (!data.title || !data.category || !data.coverUrl || data.price === undefined) {
      throw ApiError.badRequest('商品标题、分类、封面图和价格为必填项');
    }

    return prisma.shopItem.create({
      data: {
        title: data.title,
        category: data.category,
        coverUrl: data.coverUrl,
        images: data.images ? (data.images as any) : [],
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        thirdPartyAppId: data.thirdPartyAppId,
        thirdPartyPath: data.thirdPartyPath,
        thirdPartyUrl: data.thirdPartyUrl,
        status: data.status || ShopStatus.ON_SALE,
        sortOrder: Number(data.sortOrder) || 0,
      },
    });
  }

  async updateShopItem(id: string, data: any) {
    return prisma.shopItem.update({
      where: { id },
      data: {
        title: data.title,
        category: data.category,
        coverUrl: data.coverUrl,
        images: data.images ? (data.images as any) : undefined,
        price: data.price !== undefined ? Number(data.price) : undefined,
        originalPrice: data.originalPrice !== undefined ? (data.originalPrice ? Number(data.originalPrice) : null) : undefined,
        thirdPartyAppId: data.thirdPartyAppId,
        thirdPartyPath: data.thirdPartyPath,
        thirdPartyUrl: data.thirdPartyUrl,
        status: data.status,
        sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : undefined,
      },
    });
  }
}

export const contentService = new ContentService();
