import { PrismaClient, AdminRole, UserStatus, PublishStatus, MemberTier, ShopStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. 创建超级管理员
  const superAdminPassword = await bcrypt.hash('admin123456', 10);
  const admin = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@starryspace.com',
      passwordHash: superAdminPassword,
      realName: '若星超管',
      role: AdminRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`✅ Admin user ready: ${admin.username} (${admin.role})`);

  // 2. 初始化系统配置
  const configs = [
    {
      key: 'home_quote',
      value: {
        brandName: '若星空间',
        mainSlogan: ['整理空间', '整理心念', '温润前行'],
        subSlogan: '在星光下，发现生活本真之美',
      },
      description: '首页品牌引言文案配置',
    },
    {
      key: 'remind_config',
      value: {
        hoursBeforeStart: 24,
        enabled: true,
      },
      description: '开课前提醒提前时长配置',
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
  console.log('✅ System configs seeded');

  // 3. 初始化基础标签
  const tags = [
    { name: '空间整理营', group: 'course', color: '#6366F1' },
    { name: '深度阅读', group: 'course', color: '#EC4899' },
    { name: '全勤达人', group: 'student', color: '#10B981' },
    { name: '共创伙伴', group: 'student', color: '#F59E0B' },
  ];

  for (const t of tags) {
    await prisma.tag.upsert({
      where: { name_group: { name: t.name, group: t.group } },
      update: {},
      create: t,
    });
  }
  console.log('✅ Tags seeded');

  // 4. 示例每日星语
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
  console.log('✅ Daily content seeded');

  console.log('🎉 Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
