# 若星空间 (Starry Space)

> **整理空间，整理心念。**  
> 若星小程序是若星团队与学员之间的效能工具与温润陪伴平台。以课程营期、线下雅集活动、实践打卡、星愿年度会员与生活好物为载体，帮助学员有序参与学习与实践，沉淀成长星图；同时帮助若星团队高效完成报名、收款、物料寄送、课节动态解锁与现场入场核销。

---

## 🌟 项目全景与核心特性

### 1. 学员前台微信小程序 (`miniprogram/`)
- **首页聚合**：每日星语伴读日签、伴读音频、主理人金句、推荐课程与热门雅集；
- **课程营期与学习区**：课程图文大纲、入营初访问卷快照、按天动态解锁课节、课件阅读与打卡进度百分比（0-100%）实时计算；
- **线下生活美学雅集**：多类型活动报名、唯一电子票凭证（`TICK-xxxx`）签发与现场扫码核销二维码；
- **实践打卡墙与成长星图**：学员图文打卡心得提交（自动获得 +10 星图积分）、近 30 天打卡热力点亮、精选打卡广场瀑布流与主理人温润金黄色寄语框；
- **星愿年度会员**：5 大核心特权（全场课程 8.8 折、线下雅集门票、精装纸质手册礼盒等）、¥999/年微信原生支付拉起；
- **个人中心与订单**：会员金标态、到期倒计时、订单中心、默认物料收货地址维护与 1v1 陪伴客服。

### 2. 团队管理中台 (`admin/`)
- **学员档案中台**：学员列表、多维色彩标签画像、加入天数与积分沉淀；
- **课程中台**：课程管理、课节大纲抽屉编排（阶段分类、按天解锁规则）、报名学员问卷查看与顺丰快递单号回填；
- **活动与现场核销中台**：活动发布、报名名单检索、现场快速扫码/输码核销与防重复核销保护；
- **打卡与陪伴中台**：学员打卡心得审核、一键精选上墙、撰写主理人温润陪伴寄语；
- **内容与生态中台**：每日星语编排与小程序日签实时预览、学员故事长文采编、甄选好物商品维护与第三方小程序 AppID/路径跳转；
- **订单与收款对账**：全站订单检索、微信支付单号流水对账；
- **系统设置**：品牌主张、年度会员费、客服微信二维码与联系电话。

### 3. 后端服务引擎 (`server/`)
- **架构栈**：Node.js 20 LTS + TypeScript + Express + Prisma ORM + PostgreSQL 16；
- **安全与鉴权**：物理隔离的双用户鉴权模型（`User` / `AdminUser`），JWT 强签名校验；
- **微信支付 V3 直连**：统一下单、客户端签名生成、AES-256-GCM 异步通知回调解密与幂等状态流转；
- **存储驱动适配器**：支持本地磁盘存储与腾讯云 COS / 阿里云 OSS 自由切换；
- **工程记忆库与自动化测试**：集成 Jest + Supertest，16/16 端到端业务闭环测试全量通过。

---

## 🛠️ 工程目录结构

```text
starry-mini2/
├── AGENTS.md                 # 若星空间工程宪法与 Agent 行为守则
├── README.md                 # 项目主文档与操作指南
├── docker-compose.yml        # Docker Compose 生产容器编排
├── .env.example              # 环境变量配置模板
│
├── docs/                     # 权威技术与需求文档库
│   ├── PRD/                  # 业务需求说明书 (V3.3)
│   ├── Design/               # VI 视觉系统与原型 (prototype-v3/)
│   ├── DEPLOYMENT.md         # 生产部署与商用运维指南
│   ├── testing/              # 测试计划、测试用例集、回归矩阵与执行报告
│   └── devlog/               # 工程记忆库 (progress, changelog, decisions, daily)
│
├── scripts/                  # 运维与自动化脚本
│   └── backup_db.sh          # PostgreSQL 数据库自动备份脚本
│
├── server/                   # 后端 API 服务 (Node.js 20 + Express + TypeScript + Prisma)
│   ├── prisma/schema.prisma  # 16 张表全量数据库模型
│   ├── src/                  # 控制器、领域服务、适配器、中间件与路由
│   └── tests/                # Jest 自动化 API 与 E2E 集成测试套件
│
├── admin/                    # 管理后台前端 (Vue 3 + Vite + TailwindCSS + Pinia)
│   ├── src/views/            # 还原原型的高保真中台管理视图
│   └── nginx.conf            # 生产 Nginx 反向代理与 SPA 路由配置
│
└── miniprogram/              # 微信小程序客户端 (原生 TypeScript + VI Tokens)
    └── miniprogram/pages/    # 13 个端到端原生业务页面
```

---

## 🚀 快速启动 (本地开发)

### 1. 启动后端 API 服务
```bash
cd server
npm install
cp .env.example .env
# 启动本地服务 (默认端口 3000)
npm run dev
```

### 2. 启动管理后台
```bash
cd admin
npm install
npm run dev
# 访问后台：http://localhost:5173 (默认账号: admin / admin123456)
```

### 3. 打开微信小程序
使用微信开发者工具打开 `miniprogram/` 目录，编译运行即可体验全部业务流。

---

## 🧪 自动化测试与构建验证

遵循 `AGENTS.md` 真实性测试规范，项目配置了全量自动化回归测试：

```bash
# 运行后端 API 与全链路 E2E 自动化测试
cd server
npm test

# 全栈联合构建检查 (Server + Admin + Miniprogram)
(cd server && npm run build) && (cd admin && npm run build) && (cd miniprogram && npm run build:ts)
```

---

## 📦 生产容器化部署

详情请参阅 [`docs/DEPLOYMENT.md`](file:///Users/apple/Repo/dev/starry/mini2/docs/DEPLOYMENT.md)。

```bash
# 一键拉起 PostgreSQL 16、Server API 与 Admin Nginx 三大生产容器
docker compose --env-file .env.production up -d --build

# 执行生产数据库迁移与初始种子
docker compose exec server npx prisma migrate deploy
docker compose exec server npm run prisma:seed
```

---

## 📄 授权与守则
本项目所有开发、维护与演进严格遵循 [`AGENTS.md`](file:///Users/apple/Repo/dev/starry/mini2/AGENTS.md)。
