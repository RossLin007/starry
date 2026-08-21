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

    const [homeQuoteConfig, dailyContent, onlineCourses, offlineActivities, featuredStories, onSaleGoods] = await Promise.all([
      this.getConfig('home_quote'),
      prisma.dailyContent.findUnique({ where: { date: today } }),
      prisma.course.findMany({
        where: { status: 'PUBLISHED' },
        take: 4,
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          title: true,
          subtitle: true,
          category: true,
          coverUrl: true,
          price: true,
          originalPrice: true,
          courseStartTime: true,
        },
      }),
      prisma.activity.findMany({
        where: { status: 'PUBLISHED' },
        take: 3,
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
        where: { status: 'PUBLISHED' },
        take: 2,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.shopItem.findMany({
        where: { status: 'ON_SALE' },
        take: 4,
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    // 如果用户已登录，获取该用户正在进行的课程进度与已报名的活动
    let activeEnrollment = null;
    let activeActivityEnrollment = null;
    if (userId) {
      activeEnrollment = await prisma.courseEnrollment.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: {
          course: {
            select: { id: true, title: true, subtitle: true, category: true, coverUrl: true, courseStartTime: true },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      });

      activeActivityEnrollment = await prisma.activityEnrollment.findFirst({
        where: { userId, isCheckedIn: false },
        include: {
          activity: {
            select: { id: true, title: true, location: true, startTime: true, coverUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return {
      brandQuote: homeQuoteConfig || {
        brandName: '若星空间',
        lede: [
          '在一餐一饭、',
          '一桌一椅之间，',
          '回到更健康、更清明、',
          '更有觉知的生活。',
        ],
        meta: '每一个心灵觉醒的人，都是一颗星。一颗星不耀眼，但很多星，就是黑夜里的光。',
      },
      dailyFeed: dailyContent || {
        date: today,
        quote: '生活不在别处，当下即是全部。整理外在的物，是在安顿内在的心。',
        author: '若星',
      },
      activeStudy: activeEnrollment
        ? {
            courseId: activeEnrollment.course.id,
            title: activeEnrollment.course.title,
            category: activeEnrollment.course.category,
            coverUrl: activeEnrollment.course.coverUrl,
            subtitle: activeEnrollment.course.subtitle,
            progressPercent: activeEnrollment.progressPercent,
          }
        : null,
      activeActivity: activeActivityEnrollment
        ? {
            activityId: activeActivityEnrollment.activity.id,
            title: activeActivityEnrollment.activity.title,
            location: activeActivityEnrollment.activity.location,
            startTime: activeActivityEnrollment.activity.startTime,
            coverUrl: activeActivityEnrollment.activity.coverUrl,
          }
        : null,
      onlineCourses: onlineCourses.length > 0 ? onlineCourses : [
        {
          id: 'mock_c1',
          category: '拾光读书 · 第 3 期',
          title: '《瓦尔登湖》· 在书里遇见同频的人',
          courseStartTime: '9 月 6 日起 · 共 8 课 · 线上',
          subtitle: '每周六晚 · 腾讯会议直播',
          coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
          price: 299,
          tagText: '填写报名',
          tagClass: '',
        },
        {
          id: 'mock_c2',
          category: '空间管理 · 第 7 期',
          title: '整理的不是物品，是心的秩序',
          courseStartTime: '9 月 10 日起 · 共 8 课 · 线上',
          subtitle: '每周三晚 · 腾讯会议直播',
          coverUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
          price: 399,
          tagText: '报名已截止',
          tagClass: 'disabled',
        },
        {
          id: 'mock_c3',
          category: '生活料理 · 第 12 期',
          title: '把一日三餐，过成修行',
          courseStartTime: '9 月 3 日起 · 共 8 课 · 线上',
          subtitle: '每周四晚 · 腾讯会议直播',
          coverUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
          price: 499,
          tagText: '您已报名',
          tagClass: 'green',
        },
      ],
      offlineActivities: offlineActivities.length > 0 ? offlineActivities : [
        {
          id: 'mock_a1',
          tag: '烘焙',
          micro: '线下 · 莘庄空间 · 为期 3 天',
          title: '食光烘焙',
          timeStr: '9 月 19 日起 · 连续 3 天',
          coverUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
        },
        {
          id: 'mock_a2',
          tag: '茶会',
          micro: '线下 · 莘庄空间',
          title: '初秋茶会',
          timeStr: '9 月 7 日（周日）14:00',
          coverUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600',
        },
        {
          id: 'mock_a3',
          tag: '亲子',
          micro: '线下 · 莘庄空间',
          title: '少年茶会 · 孩子的一盏茶',
          timeStr: '9 月 14 日（周日）10:00',
          coverUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600',
        },
      ],
      featuredStories: featuredStories.length > 0 ? featuredStories : [
        {
          id: 'mock_s1',
          title: '从厨房开始，一家人的改变',
          summary: '学习料理课的第三个月，阿玲家里的餐桌变了。不再点外卖的周末，孩子开始跟着她一起揉面……',
          authorName: '学员 阿玲 · 料理课第 9 期',
          coverUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600',
        },
      ],
      featuredGoods: onSaleGoods.length > 0 ? onSaleGoods : [
        {
          id: 'mock_g1',
          title: '纯燕麦奶 · 无糖原味',
          category: '若心拾光',
          price: 15.9,
          unit: '/ 1L',
          sourceName: '若心拾光',
          coverUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600',
          targetAppId: 'wx_dummy_goods_app',
        },
        {
          id: 'mock_g2',
          title: '武夷肉桂 · 岩茶小罐',
          category: '若心拾光',
          price: 68,
          unit: '/ 50g',
          sourceName: '若心拾光',
          coverUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600',
          targetAppId: 'wx_dummy_goods_app',
        },
      ],
    };
  }
}

export const configService = new ConfigService();
