import prisma from '../utils/prisma.js';
import { ApiError } from '../utils/response.js';

export class ConfigService {
  // 获取单个配置
  async getConfig(key: string) {
    const config = await prisma.systemConfig.findUnique({
      where: { key },
    });
    return config ? config.value : null;
  }

  // 获取全部配置列表 (Admin)
  async getAllConfigs() {
    return prisma.systemConfig.findMany({
      orderBy: { key: 'asc' },
    });
  }

  // 设置/更新配置 (Admin)
  async updateConfig(key: string, value: any, description?: string) {
    if (!key) {
      throw ApiError.badRequest('配置 key 不能为空');
    }

    const config = await prisma.systemConfig.upsert({
      where: { key },
      update: {
        value,
        ...(description ? { description } : {}),
      },
      create: {
        key,
        value,
        description,
      },
    });

    return config;
  }

  // 首页聚合接口 (小程序端首屏一次性获取所有必要数据)
  async getHomeAggregateData(userId?: string) {
    const today = new Date().toISOString().slice(0, 10);

    const [homeQuoteConfig, dailyContent, recommendedCourses, recommendedActivities, featuredStories, onSaleGoods] = await Promise.all([
      this.getConfig('home_quote'),
      prisma.dailyContent.findUnique({ where: { date: today } }),
      prisma.course.findMany({
        where: { status: 'PUBLISHED', isRecommended: true },
        take: 3,
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          title: true,
          subtitle: true,
          category: true,
          coverUrl: true,
          price: true,
          courseStartTime: true,
        },
      }),
      prisma.activity.findMany({
        where: { status: 'PUBLISHED', isRecommended: true },
        take: 2,
        orderBy: { startTime: 'asc' },
        select: {
          id: true,
          title: true,
          coverUrl: true,
          activityType: true,
          location: true,
          startTime: true,
        },
      }),
      prisma.story.findMany({
        where: { status: 'PUBLISHED', isRecommended: true },
        take: 3,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.shopItem.findMany({
        where: { status: 'ON_SALE' },
        take: 4,
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    // 如果用户已登录，获取该用户正在进行的课程进度
    let activeEnrollment = null;
    if (userId) {
      activeEnrollment = await prisma.courseEnrollment.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: {
          course: {
            select: { id: true, title: true, coverUrl: true, courseStartTime: true },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      });
    }

    return {
      brandQuote: homeQuoteConfig || {
        brandName: '若星空间',
        mainSlogan: ['整理空间', '整理心念', '温润前行'],
        subSlogan: '在星光下，发现生活本真之美',
      },
      dailyFeed: dailyContent || {
        date: today,
        quote: '生活不在别处，当下即是全部。',
        author: '若星',
      },
      activeStudy: activeEnrollment
        ? {
            courseId: activeEnrollment.course.id,
            title: activeEnrollment.course.title,
            progressPercent: activeEnrollment.progressPercent,
          }
        : null,
      recommendedCourses,
      recommendedActivities,
      featuredStories,
      featuredGoods: onSaleGoods,
    };
  }
}

export const configService = new ConfigService();
