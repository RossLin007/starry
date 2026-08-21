import request from 'supertest';
import { jest } from '@jest/globals';

// 全局 Mock 内存数据库
const mockDB = {
  users: new Map<string, any>(),
  courses: new Map<string, any>(),
  lessons: new Map<string, any>(),
  enrollments: new Map<string, any>(),
  orders: new Map<string, any>(),
  configs: new Map<string, any>(),
  stories: new Map<string, any>(),
  activities: new Map<string, any>(),
  activityEnrollments: new Map<string, any>(),
  checkins: new Map<string, any>(),
  shopItems: new Map<string, any>(),
  dailyContents: new Map<string, any>(),
};

// 预设配置
mockDB.configs.set('home_quote', {
  key: 'home_quote',
  value: { brandName: '若星空间', mainSlogan: ['整理空间', '整理心念'] },
});

// Mock Prisma
const mockPrisma: any = {
  user: {
    findUnique: jest.fn(async ({ where }: any) => {
      if (where.id) return mockDB.users.get(where.id) || null;
      if (where.openid) {
        for (const u of mockDB.users.values()) {
          if (u.openid === where.openid) return u;
        }
      }
      return null;
    }),
    findMany: jest.fn(async () => Array.from(mockDB.users.values())),
    count: jest.fn(async () => mockDB.users.size),
    create: jest.fn(async ({ data }: any) => {
      const user = {
        id: `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        nickname: data.nickname || '若星学员',
        openid: data.openid,
        avatarUrl: data.avatarUrl || null,
        memberTier: 'FREE',
        memberExpireAt: null,
        points: 0,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        shippingAddress: null,
      };
      mockDB.users.set(user.id, user);
      return user;
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const user = mockDB.users.get(where.id);
      if (user) {
        if (data.points?.increment) {
          user.points += data.points.increment;
        } else {
          Object.assign(user, data);
        }
      }
      return user;
    }),
  },
  adminUser: {
    findUnique: jest.fn(async ({ where }: any) => {
      if (where.username === 'admin') {
        return {
          id: 'admin_1',
          username: 'admin',
          realName: '超级管理员',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          passwordHash: '$2a$10$w8T0bZ9N9nLd7F6t7y5C4O9e8p7q6r5s4t3u2v1w0x9y8z7a6b5c',
        };
      }
      return null;
    }),
    update: jest.fn(async ({ where, data }: any) => ({ id: where.id, ...data })),
  },
  course: {
    findMany: jest.fn(async () => Array.from(mockDB.courses.values())),
    findUnique: jest.fn(async ({ where }: any) => {
      const course = mockDB.courses.get(where.id);
      if (!course) return null;
      const lessons = Array.from(mockDB.lessons.values()).filter((l) => l.courseId === where.id);
      return {
        ...course,
        lessons,
        _count: { lessons: lessons.length, enrollments: 0 },
      };
    }),
    create: jest.fn(async ({ data }: any) => {
      const course = {
        id: `course_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        currentStudents: 0,
        ...data,
      };
      mockDB.courses.set(course.id, course);
      return course;
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const course = mockDB.courses.get(where.id);
      if (course) {
        if (data.currentStudents?.increment) {
          course.currentStudents += data.currentStudents.increment;
        } else {
          Object.assign(course, data);
        }
      }
      return course;
    }),
  },
  courseLesson: {
    findUnique: jest.fn(async ({ where }: any) => {
      const lesson = mockDB.lessons.get(where.id);
      if (!lesson) return null;
      const course = mockDB.courses.get(lesson.courseId);
      const lessons = Array.from(mockDB.lessons.values()).filter((l) => l.courseId === lesson.courseId);
      return {
        ...lesson,
        course: { ...course, lessons },
      };
    }),
    create: jest.fn(async ({ data }: any) => {
      const lesson = {
        id: `lesson_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        ...data,
      };
      mockDB.lessons.set(lesson.id, lesson);
      return lesson;
    }),
  },
  courseEnrollment: {
    findUnique: jest.fn(async ({ where }: any) => {
      if (where.id) return mockDB.enrollments.get(where.id) || null;
      if (where.userId_courseId) {
        const key = `${where.userId_courseId.userId}_${where.userId_courseId.courseId}`;
        const enrollment = mockDB.enrollments.get(key);
        if (!enrollment) return null;
        const course = mockDB.courses.get(enrollment.courseId);
        const lessons = Array.from(mockDB.lessons.values()).filter((l) => l.courseId === enrollment.courseId);
        return {
          ...enrollment,
          course: { ...course, lessons },
        };
      }
      return null;
    }),
    findMany: jest.fn(async () => Array.from(mockDB.enrollments.values())),
    count: jest.fn(async () => mockDB.enrollments.size),
    create: jest.fn(async ({ data }: any) => {
      const id = `enroll_${Date.now()}`;
      const enrollment = {
        id,
        progressPercent: 0,
        status: 'ACTIVE',
        enrolledAt: new Date(),
        ...data,
        user: mockDB.users.get(data.userId) || { nickname: '测试学员', phone: '13800000000' },
      };
      const key = `${data.userId}_${data.courseId}`;
      mockDB.enrollments.set(key, enrollment);
      mockDB.enrollments.set(id, enrollment);
      return enrollment;
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const enrollment = mockDB.enrollments.get(where.id);
      if (enrollment) {
        Object.assign(enrollment, data);
      }
      return enrollment;
    }),
  },
  activity: {
    findMany: jest.fn(async () => Array.from(mockDB.activities.values())),
    findUnique: jest.fn(async ({ where }: any) => {
      const act = mockDB.activities.get(where.id);
      if (!act) return null;
      return {
        ...act,
        _count: { enrollments: mockDB.activityEnrollments.size },
      };
    }),
    create: jest.fn(async ({ data }: any) => {
      const act = {
        id: `act_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        currentParticipants: 0,
        ...data,
      };
      mockDB.activities.set(act.id, act);
      return act;
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const act = mockDB.activities.get(where.id);
      if (act) {
        if (data.currentParticipants?.increment) {
          act.currentParticipants += data.currentParticipants.increment;
        } else {
          Object.assign(act, data);
        }
      }
      return act;
    }),
  },
  activityEnrollment: {
    findUnique: jest.fn(async ({ where }: any) => {
      if (where.userId_activityId) {
        const key = `${where.userId_activityId.userId}_${where.userId_activityId.activityId}`;
        return mockDB.activityEnrollments.get(key) || null;
      }
      return null;
    }),
    findFirst: jest.fn(async ({ where }: any) => {
      for (const e of mockDB.activityEnrollments.values()) {
        const idMatches = where.OR
          ? where.OR.some((cond: any) => cond.id === e.id || (cond.id?.startsWith && e.id.startsWith(cond.id.startsWith)))
          : e.id === where.id;
        if (idMatches) {
          const act = mockDB.activities.get(e.activityId);
          const usr = mockDB.users.get(e.userId) || { nickname: '小星', phone: '13900000000' };
          return { ...e, activity: act, user: usr };
        }
      }
      return null;
    }),
    findMany: jest.fn(async () => {
      return Array.from(mockDB.activityEnrollments.values()).map((e) => ({
        ...e,
        activity: mockDB.activities.get(e.activityId),
        user: mockDB.users.get(e.userId) || { nickname: '小星', phone: '13900000000' },
      }));
    }),
    create: jest.fn(async ({ data }: any) => {
      const id = `act_enroll_${Date.now()}`;
      const enrollment = {
        id,
        isCheckedIn: false,
        checkedInAt: null,
        createdAt: new Date(),
        ...data,
      };
      const key = `${data.userId}_${data.activityId}`;
      mockDB.activityEnrollments.set(key, enrollment);
      mockDB.activityEnrollments.set(id, enrollment);
      return enrollment;
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const enrollment = mockDB.activityEnrollments.get(where.id);
      if (enrollment) {
        Object.assign(enrollment, data);
      }
      return {
        ...enrollment,
        activity: mockDB.activities.get(enrollment.activityId),
        user: mockDB.users.get(enrollment.userId) || { nickname: '小星', phone: '13900000000' },
      };
    }),
  },
  checkin: {
    findUnique: jest.fn(async ({ where }: any) => mockDB.checkins.get(where.id) || null),
    findMany: jest.fn(async ({ where }: any) => {
      const list = Array.from(mockDB.checkins.values());
      if (where?.isFeatured) return list.filter((c) => c.isFeatured);
      if (where?.userId) return list.filter((c) => c.userId === where.userId);
      return list;
    }),
    count: jest.fn(async () => mockDB.checkins.size),
    create: jest.fn(async ({ data }: any) => {
      const id = `chk_${Date.now()}`;
      const checkin = {
        id,
        isFeatured: false,
        adminComment: null,
        createdAt: new Date(),
        ...data,
      };
      mockDB.checkins.set(id, checkin);
      return checkin;
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const checkin = mockDB.checkins.get(where.id);
      if (checkin) {
        Object.assign(checkin, data);
      }
      return checkin;
    }),
  },
  order: {
    findUnique: jest.fn(async ({ where }: any) => {
      if (where.id) return mockDB.orders.get(where.id) || null;
      if (where.orderNo) {
        for (const o of mockDB.orders.values()) {
          if (o.orderNo === where.orderNo) {
            const user = mockDB.users.get(o.userId);
            return { ...o, user };
          }
        }
      }
      return null;
    }),
    findFirst: jest.fn(async ({ where }: any) => {
      for (const o of mockDB.orders.values()) {
        if (o.id === where.id && (!where.userId || o.userId === where.userId)) {
          return o;
        }
      }
      return null;
    }),
    findMany: jest.fn(async () => {
      return Array.from(mockDB.orders.values()).map((o) => ({
        ...o,
        user: mockDB.users.get(o.userId) || { nickname: '小星', phone: '13900000000' },
      }));
    }),
    count: jest.fn(async () => mockDB.orders.size),
    create: jest.fn(async ({ data }: any) => {
      const order = {
        id: `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        status: 'PENDING',
        createdAt: new Date(),
        ...data,
      };
      mockDB.orders.set(order.id, order);
      return order;
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const order = mockDB.orders.get(where.id);
      if (order) {
        Object.assign(order, data);
      }
      return order;
    }),
  },
  story: {
    findMany: jest.fn(async () => Array.from(mockDB.stories.values())),
  },
  shopItem: {
    findMany: jest.fn(async () => Array.from(mockDB.shopItems.values())),
  },
  dailyContent: {
    findUnique: jest.fn(async ({ where }: any) => mockDB.dailyContents.get(where.date) || null),
  },
  systemConfig: {
    findUnique: jest.fn(async ({ where }: any) => mockDB.configs.get(where.key) || null),
    findMany: jest.fn(async () => Array.from(mockDB.configs.values())),
    upsert: jest.fn(async ({ create, update, where }: any) => {
      const item = { ...create, ...update };
      mockDB.configs.set(where.key, item);
      return item;
    }),
  },
  $transaction: jest.fn(async (cbOrArray: any) => {
    if (typeof cbOrArray === 'function') {
      return cbOrArray(mockPrisma);
    }
    return Promise.all(cbOrArray);
  }),
};

// 拦截 Prisma
jest.unstable_mockModule('../src/utils/prisma.js', () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

// 导入 app 与 jwt
const { default: app } = await import('../src/index.js');
const { signAdminToken } = await import('../src/utils/jwt.js');

describe('✨ 若星空间 (Starry Space) 全域端到端业务闭环回归测试 (Phase 7 E2E Integration)', () => {
  const adminToken = signAdminToken({ adminId: 'super_admin_01', username: 'admin', role: 'SUPER_ADMIN' });
  let studentToken = '';
  let courseId = '';
  let lessonId = '';
  let activityId = '';
  let ticketCode = '';
  let checkinId = '';
  let memberOrderId = '';
  let memberOrderNo = '';

  // 1. 学员静默登录与个人档案
  it('E2E-01: 学员微信静默登录与档案初始化', async () => {
    const loginRes = await request(app)
      .post('/api/v1/client/auth/wechat-login')
      .send({ code: 'e2e_student_code_001' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.code).toBe(0);
    expect(loginRes.body.data).toHaveProperty('token');
    studentToken = loginRes.body.data.token;

    // 完善收货地址
    const addrRes = await request(app)
      .put('/api/v1/client/auth/address')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        name: '若星学员·静怡',
        phone: '13888888888',
        province: '浙江省',
        city: '杭州市',
        district: '西湖区',
        address: '西溪路若星美学馆 101',
      });
    expect(addrRes.status).toBe(200);
    expect(addrRes.body.data.name).toBe('若星学员·静怡');
  });

  // 2. 课程发布、问卷报名与物料发货流转
  it('E2E-02: 课程发布 -> 问卷报名 -> 订单生成 -> 快递发货', async () => {
    // 后台建课
    const crsRes = await request(app)
      .post('/api/v1/admin/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: '21天空间生活整理营（秋日季）',
        category: '空间生活整理营',
        coverUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
        price: 980,
        maxStudents: 30,
        status: 'PUBLISHED',
      });
    expect(crsRes.status).toBe(201);
    courseId = crsRes.body.data.id;

    // 后台排课
    const lsnRes = await request(app)
      .post(`/api/v1/admin/courses/${courseId}/lessons`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: '第 1 课：心念的留白与物我关系',
        sectionName: '第一阶段：心念梳理',
        unlockType: 'IMMEDIATE',
        content: '审视过去一年未使用的物品。',
      });
    expect(lsnRes.status).toBe(201);
    lessonId = lsnRes.body.data.id;

    // 学员报名
    const enrollRes = await request(app)
      .post(`/api/v1/client/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        formData: { goal: '理清衣橱杂物' },
      });
    expect(enrollRes.status).toBe(201);
    expect(enrollRes.body.data).toHaveProperty('enrollmentId');

    // 管理端回填发货单号
    const enrollId = enrollRes.body.data.enrollmentId;
    const shipRes = await request(app)
      .put(`/api/v1/admin/courses/enrollments/${enrollId}/shipping`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ shippingTrackingNo: 'SF999888777' });
    expect(shipRes.status).toBe(200);
    expect(shipRes.body.data.shippingTrackingNo).toBe('SF999888777');
  });

  // 3. 学习区实践与打卡进度百分比重算
  it('E2E-03: 学习区大纲展示 -> 完成课节 -> 进度重算为 100%', async () => {
    const studyRes = await request(app)
      .get(`/api/v1/client/study/courses/${courseId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(studyRes.status).toBe(200);
    expect(studyRes.body.data.sections[0].lessons[0].isUnlocked).toBe(true);

    const compRes = await request(app)
      .post(`/api/v1/client/study/lessons/${lessonId}/complete`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(compRes.status).toBe(200);
    expect(compRes.body.data.progressPercent).toBe(100);
  });

  // 4. 线下雅集活动发布、报名电子票与现场防重复核销
  it('E2E-04: 线下雅集发布 -> 报名签发唯一票号 -> 现场扫码核销 -> 重复核销拦截', async () => {
    const tomorrow = new Date(Date.now() + 86400000);
    const actRes = await request(app)
      .post('/api/v1/admin/activities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: '若星生活雅集 · 秋日器物收纳工作坊',
        activityType: 'OFFLINE',
        location: '杭州市西湖区若星空间美学馆',
        price: 199,
        maxParticipants: 16,
        startTime: tomorrow.toISOString(),
        endTime: new Date(tomorrow.getTime() + 7200000).toISOString(),
        enrollDeadline: tomorrow.toISOString(),
        status: 'PUBLISHED',
      });
    expect(actRes.status).toBe(201);
    activityId = actRes.body.data.id;

    // 学员报名活动
    const actEnrollRes = await request(app)
      .post(`/api/v1/client/activities/${activityId}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(actEnrollRes.status).toBe(201);
    ticketCode = actEnrollRes.body.data.ticketCode;
    expect(ticketCode).toMatch(/^TICK-/);

    // 现场初次验券核销
    const chkRes1 = await request(app)
      .post('/api/v1/admin/activities/checkin/verify')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ticketCode });
    expect(chkRes1.status).toBe(200);
    expect(chkRes1.body.data.success).toBe(true);

    // 现场二次核销拦截
    const chkRes2 = await request(app)
      .post('/api/v1/admin/activities/checkin/verify')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ticketCode });
    expect(chkRes2.status).toBe(200);
    expect(chkRes2.body.data.alreadyCheckedIn).toBe(true);
  });

  // 5. 实践打卡提交与成长星图日历
  it('E2E-05: 图文实践打卡提交 -> 自动累加10积分 -> 成长星图热力聚合', async () => {
    const chkRes = await request(app)
      .post('/api/v1/client/checkins')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        courseId,
        lessonId,
        content: '整理了厨房台面，留白之后做饭心情变得十分从容。',
        images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600'],
      });
    expect(chkRes.status).toBe(201);
    expect(chkRes.body.data.rewardPoints).toBe(10);
    checkinId = chkRes.body.data.id;

    // 查看成长星图
    const growthRes = await request(app)
      .get('/api/v1/client/checkins/growth')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(growthRes.status).toBe(200);
    expect(growthRes.body.data.user.points).toBeGreaterThanOrEqual(10);
    expect(growthRes.body.data.totalCheckins).toBeGreaterThanOrEqual(1);
  });

  // 6. 管理端审核打卡、主理人寄语与精选广场
  it('E2E-06: 管理端精选打卡并撰写温润寄语 -> 精选广场展示', async () => {
    const revRes = await request(app)
      .put(`/api/v1/admin/checkins/${checkinId}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'APPROVED',
        isFeatured: true,
        adminComment: '台面的留白是心境开阔的起点，为你喝彩！',
      });
    expect(revRes.status).toBe(200);
    expect(revRes.body.data.adminComment).toContain('为你喝彩');

    // 广场查看
    const featRes = await request(app).get('/api/v1/client/checkins/featured');
    expect(featRes.status).toBe(200);
    expect(featRes.body.data.length).toBeGreaterThan(0);
  });

  // 7. 星愿年度会员购买、微信支付签名拉起与回调自动升级
  it('E2E-07: 星愿会员下单 -> 微信支付签名 -> 回调验签解密 -> 自动升级DEEP会员365天', async () => {
    const mbrOrderRes = await request(app)
      .post('/api/v1/client/members/orders')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(mbrOrderRes.status).toBe(201);
    memberOrderId = mbrOrderRes.body.data.orderId;
    memberOrderNo = mbrOrderRes.body.data.orderNo;

    // 发起支付
    const payRes = await request(app)
      .post(`/api/v1/client/orders/${memberOrderId}/pay`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(payRes.status).toBe(200);
    expect(payRes.body.data.payParams).toHaveProperty('paySign');

    // 模拟微信支付成功回调
    const notifyRes = await request(app)
      .post('/api/v1/payments/wechat/notify')
      .send({
        out_trade_no: memberOrderNo,
        transaction_id: '420000202608210088',
        amount: 999,
        trade_state: 'SUCCESS',
      });
    expect(notifyRes.status).toBe(200);
    expect(notifyRes.body.code).toBe('SUCCESS');

    // 检查学员会员态
    const profileRes = await request(app)
      .get('/api/v1/client/auth/profile')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.memberTier).toBe('DEEP');
    expect(profileRes.body.data.memberExpireAt).not.toBeNull();
  });

  // 8. 管理端订单对账与全站配置实时同步
  it('E2E-08: 管理端订单中心对账检索与全站系统配置保存', async () => {
    const ordersRes = await request(app)
      .get('/api/v1/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(ordersRes.status).toBe(200);
    expect(ordersRes.body.data.list.length).toBeGreaterThan(0);

    const cfgRes = await request(app)
      .put('/api/v1/admin/configs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        key: 'home_quote',
        value: {
          brandName: '若星空间',
          mainSlogan: ['整理空间', '整理心念'],
          annualMemberFee: 999,
        },
      });
    expect(cfgRes.status).toBe(200);
    expect(cfgRes.body.code).toBe(0);
  });
});
