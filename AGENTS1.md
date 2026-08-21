# 若星空间 (Starry Space) - Agent 开发守则与架构规范 (AGENTS.md)

本文档是 Antigravity AI Agent 及人类开发者在参与 **若星空间 (Starry Space)** 项目开发时的核心规范与行动指南。所有在此代码库中进行的编码、重构、模块设计与测试，均需严格遵守本规范。

---

## 1. 项目定位与核心愿景

- **产品定义**：若星小程序是若星团队与学员之间的效能工具与陪伴工具。以「课程、活动、内容、会员、商城」为载体，帮助学员有序参与课程与活动、沉淀学习与实践记录；同时帮助团队高效完成报名、收款、资料发布、内容管理与学员陪伴。
- **产品边界**：
  - 不是营销工具；
  - 不做开放式 UGC 社区；
  - 不做自有电商闭环交易（商城好物跳转第三方小程序/外链）；
  - 不制造焦虑，注重温润陪伴与极简美学。

---

## 2. 整体工程架构 (Monorepo)

本项目采用 Monorepo 统一仓库管理，根目录结构规划如下：

```text
starry-mini2/
├── AGENTS.md                  # Agent 开发守则与架构规范（本文档）
├── README.md                  # 项目总览与本地运行/部署指南
├── docker-compose.yml         # 生产/测试环境三容器编排配置
├── .gitignore                 # Git 忽略配置
├── docs/                      # 需求与设计资产
│   ├── PRD/                   # 产品需求文档 (若星小程序PRD.md)
│   ├── Design/
│   │   ├── VI/                # 视觉规范与 Token (index.html, vi.css)
│   │   └── prototype-v3/      # 交互原型 (前台小程序原型 + admin/ 后台原型)
│   ├── devlog/                # 项目工程记忆库 (DevLog)
│   │   ├── README.md          # DevLog 索引与项目状态
│   │   ├── progress.md        # 进度追踪与待办清单
│   │   ├── CHANGELOG.md       # 重要变更日志
│   │   ├── architecture.md    # 架构设计与演进
│   │   ├── decisions.md       # 关键技术决策 (Why)
│   │   ├── issues.md          # 疑难问题排查记录
│   │   ├── lessons.md         # 踩坑经验与避坑指南
│   │   └── daily/             # 每日/每次开发记录
│   └── README.md              # 需求阶段说明
├── server/                    # 后端服务 (Node.js + Express + TypeScript + Prisma)
│   ├── src/
│   │   ├── config/            # 环境配置、常量定义
│   │   ├── controllers/       # 控制器层 (参数校验、组装响应)
│   │   ├── services/          # 业务逻辑层 (事务、核心规则)
│   │   ├── middlewares/       # 鉴权 (JWT/RBAC)、错误捕获、日志、上传
│   │   ├── routes/            # 路由定义 (前台 /api/v1/client/*, 后台 /api/v1/admin/*)
│   │   ├── adapters/          # 存储驱动适配器 (Local / COS / OSS)
│   │   ├── utils/             # 微信 API、支付签名、加密工具
│   │   └── index.ts           # 服务入口
│   ├── prisma/
│   │   ├── schema.prisma      # 数据库建模定义
│   │   ├── migrations/        # 数据库迁移历史
│   │   └── seed.ts            # 初始种子数据 (超管账号、预设标签、基础字典)
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── admin/                     # 管理后台前端 (Vue 3 + Vite + TailwindCSS + TypeScript)
│   ├── src/
│   │   ├── assets/            # 静态资源、样式
│   │   ├── components/        # 通用组件 (表格、弹窗、上传、富文本、筛选器)
│   │   ├── views/             # 页面视图 (对应 prototype-v3/admin 原型)
│   │   ├── router/            # 路由与导航守卫
│   │   ├── stores/            # Pinia 状态管理
│   │   ├── api/               # Axios 请求与接口类型定义
│   │   └── App.vue
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── nginx.conf             # 静态托管与 API 反向代理配置
│   └── Dockerfile
└── miniprogram/               # 微信小程序端 (原生 TypeScript + npm + WXSS)
    ├── miniprogram/
    │   ├── app.ts / app.json / app.wxss
    │   ├── pages/             # 页面 (首页、课程、活动、学习区、打卡、我的等)
    │   ├── components/        # 自定义组件 (卡片、星图、倒计时、导航栏等)
    │   ├── styles/            # VI 设计规范对应的全局变量与通用样式
    │   └── utils/             # 网络请求封装 (Request/JWT)、微信 API Promise 化
    ├── typings/               # TypeScript 类型声明
    ├── project.config.json    # 微信开发者工具配置
    └── package.json
```

---

## 3. 技术栈选型规范

| 模块 | 核心技术选型 | 规范要求 |
|------|-------------|---------|
| **后端 API** | Node.js (20 LTS) + Express + TypeScript + Prisma ORM | 采用严格分层架构，强类型定义，禁止任意使用 `any`。 |
| **数据库** | PostgreSQL 16 | 所有数据表通过 `schema.prisma` 管理与迁移，禁止手动直接改动生产表结构。 |
| **后台管理前端** | Vue 3 + Vite + TailwindCSS + Pinia + TypeScript | 深度还原 `docs/Design/prototype-v3/admin/` 原型样式，复用 Tailwind 极简设计。 |
| **微信小程序端** | 微信小程序原生框架 + TypeScript + npm + WXSS | 严格贯彻 `docs/Design/VI/` 视觉规范，统一色彩、间距与圆角 Token。 |
| **部署与运维** | Docker + Docker Compose + Nginx (反向代理) | 标准三容器编排 (`postgres`, `server`, `admin`)，一键拉起。 |

---

## 4. 数据库与领域模型规范 (Prisma & PostgreSQL)

### 4.1 用户体系物理隔离规范
根据架构决策，学员端与管理后台采用**物理隔离**的两张表，杜绝权限越界与微信登录逻辑污染：
1. `User` (小程序学员/会员表)：
   - 字段：`id`, `openid` (唯一), `unionid`, `nickname`, `avatarUrl`, `phone`, `memberTier` (FREE, BASIC, DEEP, CO_CREATOR), `memberExpireAt`, `points`, `status`, `createdAt`, `updatedAt`。
2. `AdminUser` (管理后台团队成员表)：
   - 字段：`id`, `username` (唯一), `email`, `passwordHash`, `realName`, `avatarUrl`, `role` (SUPER_ADMIN, OPERATOR), `status`, `lastLoginAt`, `createdAt`, `updatedAt`。

### 4.2 核心业务实体命名与枚举
- **模型命名**：大驼峰（PascalCase，如 `Course`, `CourseLesson`, `Activity`, `Checkin`, `Order`）。
- **字段命名**：小驼峰（camelCase，如 `coverUrl`, `enrollDeadline`, `isRecommended`）。
- **通用枚举**：
  - `OrderStatus`: `PENDING` (待支付), `PAID` (已支付), `REFUNDED` (已退款), `CLOSED` (已关闭)
  - `OrderType`: `COURSE` (课程报名), `ACTIVITY` (活动报名), `MEMBER` (会员订阅)
  - `PublishStatus`: `DRAFT` (草稿), `PUBLISHED` (已发布), `OFFLINE` (已下架)
  - `CheckinStatus`: `PENDING` (待审核), `APPROVED` (已通过/精选), `REJECTED` (未通过)

---

## 5. API 接口设计与安全规范

### 5.1 路由前缀划分
- **前台接口**：`/api/v1/client/*` (如 `/api/v1/client/courses`, `/api/v1/client/checkins`)
- **后台接口**：`/api/v1/admin/*` (如 `/api/v1/admin/courses`, `/api/v1/admin/students`)
- **公共/回调接口**：`/api/v1/public/*`, `/api/v1/payments/wechat/notify`

### 5.2 统一响应结构
所有 API 必须返回统一的 JSON 格式响应：
```typescript
interface ApiResponse<T = any> {
  code: number;       // 0 表示成功，非 0 表示错误码
  message: string;    // 友好提示信息
  data?: T;           // 业务数据载荷
  timestamp: number;  // 毫秒时间戳
}
```

### 5.3 鉴权与中间件机制
1. **小程序端 JWT**：`Authorization: Bearer <token>`，Payload 包含 `{ userId, openid, role: 'client' }`。
2. **管理后台 JWT**：`Authorization: Bearer <token>`，Payload 包含 `{ adminId, username, role: 'admin' | 'operator' }`。
3. **RBAC 中间件**：`requireAdminAuth()`, `requireRole('SUPER_ADMIN')`。

---

## 6. 文件上传与第三方服务适配

### 6.1 存储驱动适配器模式 (Storage Adapter)
- 抽象统一的 `StorageAdapter` 接口：
  ```typescript
  export interface StorageAdapter {
    uploadFile(file: Express.Multer.File, folder?: string): Promise<{ url: string; key: string }>;
    deleteFile(key: string): Promise<boolean>;
  }
  ```
- 默认实现 `LocalStorageAdapter`（存储至 Docker 数据卷 `/app/uploads`，通过 Express 静态资源或 Nginx 映射访问）。
- 可通过环境变量 `STORAGE_DRIVER=cos` 或 `STORAGE_DRIVER=oss` 平滑切换至腾讯云 COS / 阿里云 OSS。

### 6.2 微信支付 V3 直连规范
- 严格遵循微信支付 V3 JSAPI 统一下单与通知回调规范；
- 统一下单接口生成参数并完成客户端拉起签名 (`prepay_id`, `paySign` 等)；
- 回调通知接口实现平台证书公钥验签与 AES-256-GCM 报文解密；
- 订单支付状态更新必须采用数据库事务 (`prisma.$transaction`) 保证幂等性。

---

## 7. 前端与小程序 UI 规范

### 7.1 管理后台 (Admin)
- **视觉基准**：严格参照 `docs/Design/prototype-v3/admin/*.html`。
- **样式工具**：TailwindCSS，主色系与原型保持一致（柔和浅色背景 `#f8fafc` / `#f3f4f6`，主交互色品牌 Indigo/Amber）。
- **组件化原则**：抽离通用的 `StatCard`, `DataTable`, `FilterBar`, `StatusBadge`, `MediaUploader`, `RichEditor`。

### 7.2 小程序端 (Miniprogram)
- **视觉基准**：严格贯彻 `docs/Design/VI/` 与 `docs/Design/prototype-v3/*.html`。
- **设计 Token**（已在 VI 中定义）：
  - 主品牌色：星空蓝 / 暖光金 / 治愈绿体系
  - 卡片圆角：`border-radius: 16rpx` / `24rpx`
  - 投影：轻量柔和阴影 (`0 4rpx 20rpx rgba(0,0,0,0.05)`)
  - 排版：首行引言支持流式排版与优雅换行，契合若星品牌意境。

---

## 8. Agent 开发与协作准则

1. **不可破坏现有资产**：`docs/PRD/` 与 `docs/Design/` 是产品的权威设计输入，严禁随意删除或篡改原型文件；
2. **代码提交自闭环**：每次生成代码需包含类型定义、单元测试/校验用例，确保编译无 Lint 报错；
3. **环境隔离意识**：所有敏感配置（AppSecret, 商户私钥, DB 密码, JWT Secret）必须通过 `.env` 注入，严禁硬编码。

---

## 9. DevLog 工程记忆库与持续维护规范

`docs/devlog/` 是本项目的**长期工程记忆库（Engineering Memory）**。代码记录“系统现在是什么样子”，而 DevLog 记录“系统是怎么一步一步变成现在这个样子的，以及为什么”。

### 9.1 强制工作流闭环
从现在开始，Agent 与人类开发者进行的每次任务必须严格遵循以下闭环：

$$\text{理解} \longrightarrow \text{修改} \longrightarrow \text{测试} \longrightarrow \text{总结} \longrightarrow \text{记录} \longrightarrow \text{更新进度}$$

禁止出现 `理解 → 修改 → 测试 → 结束` 的断环开发。

### 9.2 任务完成后的三步判断与维护
每次完成具有实际意义的开发任务后，必须执行：
1. **检查 Git/文件变动**：确认新增、修改、删除了哪些代码与功能；
2. **判断是否产生长期知识**：
   - 是否有架构调整或新模块引入？（更新 `architecture.md`）
   - 是否做出关键技术决策或方案权衡？（更新 `decisions.md`，记录 Why 而不仅是 What）
   - 是否解决疑难问题或踩坑？（更新 `issues.md` 或 `lessons.md`）
   - 是否有功能完成或状态演进？（更新 `progress.md` 与 `CHANGELOG.md`）
   - 当日工作过程沉淀（更新 `daily/YYYY-MM-DD.md`）
3. **精准更新**：只更新真正产生变化的文件，不制造虚假/冗余日志。

### 9.3 日志记录优先级
- **P0（必须记录）**：架构变化、数据表结构与 Migration、API 契约变化、核心技术决策、重大 Bug 排查、Breaking Changes、安全策略变更、第三方生态集成。
- **P1（建议记录）**：新功能上线、重要模块交付、性能优化、开发规范调整、高价值技术经验。
- **P2（可选记录）**：常规 UI 微调、小型重构、日常修复。

### 9.4 真实性与代码一致性准则
- **严禁捏造**：绝对不要编造未发生的开发、未验证的测试或虚假数据。尚未确认的信息明确标记为“待确认”或“尚未验证”。
- **以实际代码为准**：若历史日志与现有代码产生冲突，必须以实际代码和最新测试结果为准，并主动修正过时的 DevLog。
- **记录前后变化**：重要变更必须记录修改原因、影响范围与旧逻辑迁移说明，而非仅写一句话结果。

### 9.5 任务完成汇报模板
每次完成开发任务后，除了交付代码，必须在回复中按如下标准格式进行总结汇报：

```text
## 开发完成

### 本次完成
- [模块/功能点描述]

### 主要修改
- `文件路径/函数名`

### DevLog 更新
- `docs/devlog/progress.md`
- `docs/devlog/CHANGELOG.md`
- `docs/devlog/daily/YYYY-MM-DD.md`
- (其他更新的文件)

### 重要技术决策
- [如有技术决策，简要说明并指向 decisions.md]

### 遗留问题
- [当前未解决的问题或风险]

### 下一步建议
- [下一步建议实施的内容]
```

*(若本次修改属于极微小的局部调整，未产生长期知识，需明确声明：“DevLog：本次修改属于局部实现，未产生新的长期架构、技术决策或维护知识，因此无需新增日志。”)*
