import {
  PrismaClient,
  AdminRole,
  UserStatus,
  PublishStatus,
  MemberTier,
  ShopStatus,
  ActivityType,
  CheckinStatus,
  EnrollmentStatus,
  OrderType,
  OrderStatus,
  UnlockType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 正在向数据库注入全量高质量测试/示范数据...');

  // ==========================================
  // 1. 管理后台成员 (AdminUser)
  // ==========================================
  const passwordHash = await bcrypt.hash('admin123456', 10);
  const superAdmin = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: { passwordHash },
    create: {
      username: 'admin',
      email: 'admin@starryspace.com',
      passwordHash,
      realName: '若星主理人',
      role: AdminRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const editorAdmin = await prisma.adminUser.upsert({
    where: { username: 'editor' },
    update: { passwordHash },
    create: {
      username: 'editor',
      email: 'editor@starryspace.com',
      passwordHash,
      realName: '若星陪伴人',
      role: AdminRole.OPERATOR,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`✅ 管理员数据已就绪: ${superAdmin.username} (${superAdmin.role}), ${editorAdmin.username}`);

  // ==========================================
  // 2. 学员与会员测试账号 (User)
  // ==========================================
  const userJingyi = await prisma.user.upsert({
    where: { openid: 'wx_openid_jingyi' },
    update: {},
    create: {
      openid: 'wx_openid_jingyi',
      nickname: '静怡',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      phone: '13800000001',
      memberTier: MemberTier.FREE,
      points: 120,
      status: UserStatus.ACTIVE,
      shippingAddress: {
        name: '李静怡',
        phone: '13800000001',
        province: '浙江省',
        city: '杭州市',
        district: '西湖区',
        address: '文三路 100 号若星生活馆 2 楼',
      },
    },
  });

  const userXinyuan = await prisma.user.upsert({
    where: { openid: 'wx_openid_xinyuan' },
    update: {},
    create: {
      openid: 'wx_openid_xinyuan',
      nickname: '心远',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      phone: '13800000002',
      memberTier: MemberTier.DEEP,
      memberExpireAt: new Date(Date.now() + 365 * 24 * 3600 * 1000), // 1年后
      points: 360,
      status: UserStatus.ACTIVE,
      shippingAddress: {
        name: '王心远',
        phone: '13800000002',
        province: '上海市',
        city: '上海市',
        district: '闵行区',
        address: '莘庄镇七莘路 88 号',
      },
    },
  });

  const userAling = await prisma.user.upsert({
    where: { openid: 'wx_openid_aling' },
    update: {},
    create: {
      openid: 'wx_openid_aling',
      nickname: '阿玲',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      phone: '13800000003',
      memberTier: MemberTier.DEEP,
      memberExpireAt: new Date(Date.now() + 180 * 24 * 3600 * 1000),
      points: 240,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`✅ 测试学员账号已就绪: ${userJingyi.nickname}, ${userXinyuan.nickname}, ${userAling.nickname}`);

  // ==========================================
  // 3. 标签分类 (Tag & StudentTag)
  // ==========================================
  const tagsData = [
    { name: '拾光读书', group: 'course', color: '#019A4A' },
    { name: '空间管理', group: 'course', color: '#38502E' },
    { name: '生活料理', group: 'course', color: '#7BAF42' },
    { name: '全勤达人', group: 'student', color: '#019A4A' },
    { name: '共创伙伴', group: 'student', color: '#F0D9A8' },
  ];

  for (const t of tagsData) {
    await prisma.tag.upsert({
      where: { name_group: { name: t.name, group: t.group } },
      update: {},
      create: t,
    });
  }
  console.log('✅ 基础标签体系已就绪');

  // ==========================================
  // 4. 精品课程与课节体系 (Course & CourseLesson)
  // ==========================================
  // 课程 1: 生活料理
  const courseCooking = await prisma.course.upsert({
    where: { id: 'seed_course_cooking' },
    update: {},
    create: {
      id: 'seed_course_cooking',
      title: '生活料理 · 第 12 期',
      subtitle: '把一日三餐，过成修行',
      category: '生活料理',
      coverUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
      price: 499.00,
      originalPrice: 699.00,
      maxStudents: 30,
      currentStudents: 18,
      status: PublishStatus.PUBLISHED,
      sortOrder: 1,
      isRecommended: true,
      description: '做饭不仅是填饱肚子，更是关照自己与家人身心最直接的方式。从选米、淘洗、煮饭到一餐的敬意，回归食材本味。',
      courseStartTime: new Date('2026-09-03T19:30:00Z'),
      courseEndTime: new Date('2026-10-22T21:00:00Z'),
    },
  });

  const cookingLessons = [
    {
      id: 'lesson_c1',
      title: '第 1 课：厨房的心念与秩序',
      sectionName: '第一周：敬意与起步',
      sortOrder: 1,
      unlockType: UnlockType.IMMEDIATE,
      content: '整理厨房的第一步，是看见自己与食物的关系。从今天开始，试着在做饭前深呼吸三次。',
    },
    {
      id: 'lesson_c2',
      title: '第 2 课：一碗好米饭的温度',
      sectionName: '第一周：敬意与起步',
      sortOrder: 2,
      unlockType: UnlockType.IMMEDIATE,
      content: '淘米时的专注，水与米的比例，火候的守候。把日常最平凡的一餐，当成对自己的款待。',
    },
    {
      id: 'lesson_c3',
      title: '第 3 课：刀工与心绪的安顿',
      sectionName: '第二周：刀法与心念',
      sortOrder: 3,
      unlockType: UnlockType.DAYS_AFTER_START,
      unlockDays: 7,
      content: '切菜的节律，是指尖与食材的对话。均匀细致的下刀，就是安顿念头的时刻。',
    },
    {
      id: 'lesson_c4',
      title: '第 4 课：留白与装盘美学',
      sectionName: '第二周：器物与呈现',
      sortOrder: 4,
      unlockType: UnlockType.DAYS_AFTER_START,
      unlockDays: 14,
      content: '器皿的选择与盘中的呼吸感。一份素雅清爽的摆盘，带来进餐时的清净与喜悦。',
    },
  ];

  for (const l of cookingLessons) {
    await prisma.courseLesson.upsert({
      where: { id: l.id },
      update: {},
      create: {
        ...l,
        courseId: courseCooking.id,
      },
    });
  }

  // 课程 2: 空间管理
  const courseSpace = await prisma.course.upsert({
    where: { id: 'seed_course_space' },
    update: {},
    create: {
      id: 'seed_course_space',
      title: '空间管理 · 第 7 期',
      subtitle: '整理的不是物品，是心的秩序',
      category: '空间管理',
      coverUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
      price: 399.00,
      originalPrice: 599.00,
      maxStudents: 30,
      currentStudents: 30,
      status: PublishStatus.PUBLISHED,
      sortOrder: 2,
      isRecommended: true,
      description: '为期 21 天的空间断舍离与心念梳理。从玄关、客厅到衣橱，建立可持续维持的清爽家居秩序。',
      courseStartTime: new Date('2026-09-10T19:30:00Z'),
    },
  });

  // 课程 3: 拾光读书
  const courseReading = await prisma.course.upsert({
    where: { id: 'seed_course_reading' },
    update: {},
    create: {
      id: 'seed_course_reading',
      title: '拾光读书 · 第 3 期',
      subtitle: '《瓦尔登湖》· 在书里遇见同频的人',
      category: '拾光读书',
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
      price: 299.00,
      originalPrice: 399.00,
      maxStudents: 50,
      currentStudents: 36,
      status: PublishStatus.PUBLISHED,
      sortOrder: 3,
      isRecommended: true,
      description: '共读梭罗的《瓦尔登湖》，在嘈杂浮躁的世界中，慢下来找回内心的宁静与清朗。',
      courseStartTime: new Date('2026-09-06T20:00:00Z'),
    },
  });
  console.log('✅ 精品课程与课节已就绪 (生活料理/空间管理/拾光读书)');

  // ==========================================
  // 5. 学员学籍与报名记录 (CourseEnrollment)
  // ==========================================
  await prisma.courseEnrollment.upsert({
    where: {
      userId_courseId: {
        userId: userJingyi.id,
        courseId: courseCooking.id,
      },
    },
    update: {},
    create: {
      userId: userJingyi.id,
      courseId: courseCooking.id,
      progressPercent: 25,
      status: EnrollmentStatus.ACTIVE,
    },
  });
  console.log('✅ 学员在学课程档案已就绪');

  // ==========================================
  // 6. 线下雅集与活动 (Activity)
  // ==========================================
  const actTea = await prisma.activity.upsert({
    where: { id: 'seed_act_tea' },
    update: {},
    create: {
      id: 'seed_act_tea',
      title: '初秋茶会',
      coverUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600',
      activityType: ActivityType.OFFLINE,
      location: '若星莘庄空间 · 二楼茶室',
      price: 168.00,
      maxParticipants: 12,
      currentParticipants: 8,
      startTime: new Date('2026-09-07T14:00:00Z'),
      endTime: new Date('2026-09-07T16:30:00Z'),
      enrollDeadline: new Date('2026-09-06T18:00:00Z'),
      status: PublishStatus.PUBLISHED,
      isRecommended: true,
      content: '九月初三，午后三时。在茶香中慢下来，一期一会，品味岩茶与节气茶点。',
    },
  });

  const actBaking = await prisma.activity.upsert({
    where: { id: 'seed_act_baking' },
    update: {},
    create: {
      id: 'seed_act_baking',
      title: '食光烘焙 · 线下 3 天工坊',
      coverUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
      activityType: ActivityType.OFFLINE,
      location: '若星莘庄空间 · 料理烘焙教室',
      price: 1280.00,
      maxParticipants: 10,
      currentParticipants: 6,
      startTime: new Date('2026-09-19T09:30:00Z'),
      endTime: new Date('2026-09-21T17:00:00Z'),
      enrollDeadline: new Date('2026-09-17T18:00:00Z'),
      status: PublishStatus.PUBLISHED,
      isRecommended: true,
      content: '天然酵母鲁邦种培育、全麦乡村欧包与素食茶点烘焙。',
    },
  });

  const actKids = await prisma.activity.upsert({
    where: { id: 'seed_act_kids' },
    update: {},
    create: {
      id: 'seed_act_kids',
      title: '少年茶会 · 孩子的一盏茶',
      coverUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600',
      activityType: ActivityType.OFFLINE,
      location: '若星莘庄空间',
      price: 198.00,
      maxParticipants: 10,
      currentParticipants: 7,
      startTime: new Date('2026-09-14T10:00:00Z'),
      endTime: new Date('2026-09-14T12:00:00Z'),
      enrollDeadline: new Date('2026-09-13T18:00:00Z'),
      status: PublishStatus.PUBLISHED,
      isRecommended: true,
      content: '让孩子学习奉茶礼仪与专注力培养。',
    },
  });
  console.log('✅ 雅集活动已就绪 (初秋茶会/食光烘焙/少年茶会)');

  // 报名雅集
  await prisma.activityEnrollment.upsert({
    where: {
      userId_activityId: {
        userId: userXinyuan.id,
        activityId: actTea.id,
      },
    },
    update: {},
    create: {
      userId: userXinyuan.id,
      activityId: actTea.id,
      isCheckedIn: false,
    },
  });

  // ==========================================
  // 7. 实践打卡与精选寄语 (Checkin)
  // ==========================================
  await prisma.checkin.upsert({
    where: { id: 'seed_checkin_1' },
    update: {},
    create: {
      id: 'seed_checkin_1',
      userId: userJingyi.id,
      courseId: courseSpace.id,
      content: '今天完成了衣橱的第一轮断舍离，舍弃了 12 件三年没穿过的衣服。衣橱留白后，呼吸都顺畅了许多。',
      images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600'],
      status: CheckinStatus.APPROVED,
      isFeatured: true,
      featuredAt: new Date(),
      adminComment: '给衣橱留白，就是在给未来的生活腾出新的可能性。很棒的觉察！',
    },
  });

  await prisma.checkin.upsert({
    where: { id: 'seed_checkin_2' },
    update: {},
    create: {
      id: 'seed_checkin_2',
      userId: userXinyuan.id,
      courseId: courseCooking.id,
      content: '晚餐为家人煮了一锅番茄杂粮饭，慢火细熬，孩子吃得干干净净。日常的修行就在这一碗米饭里。',
      images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'],
      status: CheckinStatus.APPROVED,
      isFeatured: true,
      featuredAt: new Date(),
      adminComment: '烟火气中最抚人心，米饭的香气就是家的温暖。',
    },
  });
  console.log('✅ 打卡实践与导师温润寄语已就绪');

  // ==========================================
  // 8. 学员精选故事 (Story)
  // ==========================================
  await prisma.story.upsert({
    where: { id: 'seed_story_1' },
    update: {},
    create: {
      id: 'seed_story_1',
      title: '从厨房开始，一家人的改变',
      authorName: '学员 阿玲 · 料理课第 9 期',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      summary: '学习料理课的第三个月，阿玲家里的餐桌变了。不再点外卖的周末，孩子开始跟着她一起揉面……',
      content: '从前下班总是匆忙点外卖，家里厨房常年冷清。参加若星料理营后，我开始试着每天早起 20 分钟煮一碗粥。慢慢地，先生和孩子也参与进来，厨房变成了家里最温暖的角落。',
      coverUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600',
      status: PublishStatus.PUBLISHED,
      isRecommended: true,
    },
  });
  console.log('✅ 会员温润故事已就绪');

  // ==========================================
  // 9. 好物商城 (ShopItem)
  // ==========================================
  const shopGoods = [
    {
      id: 'seed_goods_1',
      title: '老豆腐 · 盐卤点浆',
      category: '豆制品',
      price: 8.80,
      originalPrice: 12.00,
      coverUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
      thirdPartyAppId: 'wx_mock_shop_appid',
      sortOrder: 1,
      status: ShopStatus.ON_SALE,
    },
    {
      id: 'seed_goods_2',
      title: '有机糙米 · 五常产地',
      category: '谷物杂粮',
      price: 19.90,
      originalPrice: 28.00,
      coverUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
      thirdPartyAppId: 'wx_mock_shop_appid',
      sortOrder: 2,
      status: ShopStatus.ON_SALE,
    },
    {
      id: 'seed_goods_3',
      title: '香菇 · 古田厚肉菇',
      category: '菌菇干货',
      price: 29.90,
      originalPrice: 38.00,
      coverUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
      thirdPartyAppId: 'wx_mock_shop_appid',
      sortOrder: 3,
      status: ShopStatus.ON_SALE,
    },
    {
      id: 'seed_goods_4',
      title: '纯燕麦奶 · 无糖原味',
      category: '植物奶',
      price: 15.90,
      originalPrice: 22.00,
      coverUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600',
      thirdPartyAppId: 'wx_mock_shop_appid',
      sortOrder: 4,
      status: ShopStatus.ON_SALE,
    },
    {
      id: 'seed_goods_5',
      title: '武夷肉桂 · 岩茶小罐',
      category: '茶饮',
      price: 68.00,
      originalPrice: 88.00,
      coverUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600',
      thirdPartyAppId: 'wx_mock_shop_appid',
      sortOrder: 5,
      status: ShopStatus.ON_SALE,
    },
    {
      id: 'seed_goods_6',
      title: '黑芝麻丸 · 九蒸九晒',
      category: '零食',
      price: 39.90,
      originalPrice: 49.00,
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
      thirdPartyAppId: 'wx_mock_shop_appid',
      sortOrder: 6,
      status: ShopStatus.ON_SALE,
    },
  ];

  for (const g of shopGoods) {
    await prisma.shopItem.upsert({
      where: { id: g.id },
      update: {},
      create: g,
    });
  }
  console.log('✅ 好物推荐商城货架已就绪');

  // ==========================================
  // 10. 系统配置与每日星语 (SystemConfig & DailyContent)
  // ==========================================
  const configs = [
    {
      key: 'home_quote',
      value: {
        brandName: '若星空间',
        lede: [
          '在一餐一饭、',
          '一桌一椅之间，',
          '回到更健康、更清明、',
          '更有觉知的生活。',
        ],
        meta: '每一个心灵觉醒的人，都是一颗星。一颗星不耀眼，但很多星，就是黑夜里的光。',
      },
      description: '首页品牌核心引言',
    },
    {
      key: 'member_config',
      value: {
        annualFee: 365,
        benefits: [
          '全年全场线上课程 8.8 折专享优惠',
          '每月若星线下空间雅集优先留席',
          '年度成长星图专属定制报告',
          '若星主理人 1v1 陪伴答疑',
        ],
      },
      description: '星愿会员权益与定价配置',
    },
    {
      key: 'customer_service',
      value: {
        name: '若星空间 · 官方陪伴客服',
        wechatId: 'starry_service_01',
        workHours: '每日 9:00 - 21:00',
        greeting: '已为你留好位置，随时欢迎和我们聊聊。',
      },
      description: '客服联系配置',
    },
  ];

  for (const cfg of configs) {
    await prisma.systemConfig.upsert({
      where: { key: cfg.key },
      update: { value: cfg.value },
      create: {
        key: cfg.key,
        value: cfg.value,
        description: cfg.description,
      },
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  await prisma.dailyContent.upsert({
    where: { date: today },
    update: {},
    create: {
      date: today,
      quote: '生活不在别处，当下即是全部。整理外在的物，是在安顿内在的心。',
      author: '若星',
      content: '今天给自己留出15分钟，整理书桌的一角。当物品各得其所，心也会清朗起来。',
    },
  });
  console.log('✅ 系统配置与今日星语已就绪');

  console.log('🎉 数据库全量测试/种子数据初始化成功！');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
