import request from 'supertest';
import { jest } from '@jest/globals';

// 内存 Mock 数据库
const mockDB = {
  users: new Map<string, any>(),
  courses: new Map<string, any>(),
  lessons: new Map<string, any>(),
  enrollments: new Map<string, any>(),
  orders: new Map<string, any>(),
  payments: new Map<string, any>(),
  configs: new Map<string, any>(),
  stories: new Map<string, any>(),
  activities: new Map<string, any>(),
  activityEnrollments: new Map<string, any>(),
  checkins: new Map<string, any>(),
  shopItems: new Map<string, any>(),
  dailyContents: new Map<string, any>(),
};

// 预设数据
mockDB.configs.set('home_quote', {
  key: 'home_quote',
  value: { brandName: '若星空间', mainSlogan: ['整理空间', '整理心念'] },
});

// Mock prisma client
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
  },
  activity: {
    findMany: jest.fn(async () => Array.from(mockDB.activities.values())),
  },
  checkin: {
    findUnique: jest.fn(async ({ where }: any) => mockDB.checkins.get(where.id) || null),
    findMany: jest.fn(async () => Array.from(mockDB.checkins.values())),
    create: jest.fn(async ({ data }: any) => {
      const id = `chk_${Date.now()}`;
      const checkin = { id, ...data };
      mockDB.checkins.set(id, checkin);
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
      return Array.from(mockDB.orders.values()).map((o) => {
        const user = mockDB.users.get(o.userId) || { nickname: '小星', phone: '13900000000' };
        const payment = mockDB.payments.get(o.id) || null;
        return { ...o, user, payment };
      });
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
  payment: {
    upsert: jest.fn(async ({ where, create, update }: any) => {
      let p = mockDB.payments.get(where.orderId);
      if (p) {
        Object.assign(p, update);
      } else {
        p = { id: `pay_${Date.now()}`, ...create };
        mockDB.payments.set(where.orderId, p);
      }
      return p;
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

describe('✨ 若星空间 (Starry Space) API 自动化测试套件 (Phase 6 支付与会员体系)', () => {
  const adminToken = signAdminToken({ adminId: 'test_admin_01', username: 'admin', role: 'SUPER_ADMIN' });
  let studentToken = '';
  let createdOrderId = '';
  let createdOrderNo = '';

  // 1. 公共健康检查
  describe('GET /api/health', () => {
    it('应返回系统健康状态 (code 0)', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data.status).toBe('healthy');
    });
  });

  // 2. 会员权益与订单创建
  describe('Member System & Order APIs', () => {
    it('获取星愿会员尊享权益列表 (GET /api/v1/client/members/benefits)', async () => {
      const res = await request(app).get('/api/v1/client/members/benefits');
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data.price).toBe(999);
      expect(Array.isArray(res.body.data.benefits)).toBe(true);
    });

    it('学员应能创建星愿年度会员订单 (POST /api/v1/client/members/orders)', async () => {
      const loginRes = await request(app).post('/api/v1/client/auth/wechat-login').send({ code: 'vip_user_01' });
      studentToken = loginRes.body.data.token;

      const orderRes = await request(app)
        .post('/api/v1/client/members/orders')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(orderRes.status).toBe(201);
      expect(orderRes.body.code).toBe(0);
      expect(orderRes.body.data).toHaveProperty('orderId');
      expect(orderRes.body.data).toHaveProperty('orderNo');
      createdOrderId = orderRes.body.data.orderId;
      createdOrderNo = orderRes.body.data.orderNo;
    });

    it('发起微信支付获取客户端拉起参数 (POST /api/v1/client/orders/:orderId/pay)', async () => {
      const payRes = await request(app)
        .post(`/api/v1/client/orders/${createdOrderId}/pay`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(payRes.status).toBe(200);
      expect(payRes.body.code).toBe(0);
      expect(payRes.body.data.payParams).toHaveProperty('timeStamp');
      expect(payRes.body.data.payParams).toHaveProperty('paySign');
      expect(payRes.body.data.payParams.package).toMatch(/^prepay_id=/);
    });

    it('微信支付异步通知回调并自动升级星愿会员 (POST /api/v1/payments/wechat/notify)', async () => {
      const notifyRes = await request(app)
        .post('/api/v1/payments/wechat/notify')
        .send({
          out_trade_no: createdOrderNo,
          transaction_id: '420000202608210001',
          amount: 999,
          trade_state: 'SUCCESS',
        });

      expect(notifyRes.status).toBe(200);
      expect(notifyRes.body.code).toBe('SUCCESS');

      // 验证学员会员层级已自动变更为 DEEP
      const profileRes = await request(app)
        .get('/api/v1/client/auth/profile')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(profileRes.status).toBe(200);
      expect(profileRes.body.data.memberTier).toBe('DEEP');
      expect(profileRes.body.data.memberExpireAt).not.toBeNull();
    });

    it('学员应能查询我的订单列表 (GET /api/v1/client/orders)', async () => {
      const res = await request(app)
        .get('/api/v1/client/orders')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  // 3. 管理端订单与会员中台
  describe('Admin Orders & Members Center', () => {
    it('管理端获取订单列表 (GET /api/v1/admin/orders)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data.list.length).toBeGreaterThan(0);
    });

    it('管理端获取会员列表 (GET /api/v1/admin/members)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/members')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data.list.length).toBeGreaterThan(0);
    });
  });
});
