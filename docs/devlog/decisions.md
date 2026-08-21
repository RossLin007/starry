# 技术决策记录 (Decisions)

本文档记录若星空间项目所有重大的技术与架构决策。核心原则：**记录 Why，而不仅是 What**。

---

## DEC-001：采用 Monorepo 统一代码仓库管理

### 背景
项目包含后端 API 服务、管理后台前端、微信小程序原生端以及设计与 PRD 资产，需要确定代码仓库的管理方式。

### 可选方案
1. **Monorepo 单仓管理**：所有端代码与文档在同一 Git 仓库中分目录存放，统一 Docker 编排。
2. **Multi-repo 多仓管理**：将 `server`、`admin`、`miniprogram` 分别建立独立 Git 仓库。

### 决策
选择 **方案 1：Monorepo 单仓管理**。

### 原因
1. 业务强关联：小程序端与管理后台共享后端 API契约与枚举定义；
2. 部署简单：根目录单个 `docker-compose.yml` 即可一键编排并拉起 PostgreSQL、Server 和 Admin；
3. 开发协同成本低：AI Agent 与开发者无需跨仓库切换上下文即可完成端到端联调。

### 代价
- 仓库体积略大，但由于微信小程序与 Admin 代码体量可控，完全在可接受范围内。

### 后续影响
- 需在根目录配置统一的 `.gitignore` 与模块脚本索引。

---

## DEC-002：管理后台采用 Vue 3 + Vite + TailwindCSS + 自定义组件

### 背景
`docs/Design/prototype-v3/admin/` 已经提供了 19 个高质量的 HTML 原型页面，样式设计基于极简浅色调与 Tailwind 规范。

### 可选方案
1. **Vue 3 + Vite + Element Plus**：主流国内后台组件库，开发快，但默认样式与原型差异较大，覆盖样式成本高。
2. **React + Vite + Ant Design**：中后台方案，但对原型 HTML 的复用度较低。
3. **Vue 3 + Vite + TailwindCSS + 自定义组件**：直接复用原型已有的 Tailwind 类名与 DOM 结构。

### 决策
选择 **方案 3：Vue 3 + Vite + TailwindCSS + 自定义组件**。

### 原因
1. 最大程度还原原型：原型 HTML 中的 Flexbox、Grid、颜色与间距类名可近乎 100% 平移到 Vue 单文件组件中；
2. 视觉一致性高：避免引入 Element Plus 等重型组件库导致的视觉突兀；
3. 轻量极速：Tailwind 按需编译，打包产物极小，首屏加载极快。

### 代价
- 需要自行封装少量通用交互组件（如 DatePicker、Modal、Select 等简易组件）。

### 后续影响
- 在 `admin/src/components/` 沉淀 `StatCard`, `DataTable`, `FilterBar`, `StatusBadge`, `Modal` 等基础组件。

---

## DEC-003：后端选用 TypeScript + Node.js + Express.js + Prisma ORM + PostgreSQL 16

### 背景
后端需要提供高可靠、类型安全且易于维护的 RESTful API，并管理复杂的关系型数据（用户、课程、课节、报名、订单、打卡等）。

### 可选方案
1. **TypeScript + Express + Prisma ORM + PostgreSQL 16**：声明式建模、自动生成强类型 Client 与迁移。
2. **TypeScript + Express + TypeORM / Drizzle ORM**。
3. **Node.js (纯 JS) + Knex.js / pg**。

### 决策
选择 **方案 1：TypeScript + Express + Prisma ORM + PostgreSQL 16**。

### 原因
1. 声明式建模极佳：`schema.prisma` 清晰明了，兼具文档与代码生成功能；
2. 自动化迁移：`prisma migrate dev` 极大降低数据库变更风险；
3. 开箱即用的 `Prisma Studio`：方便开发期快速查看与修改测试数据；
4. 全量 TypeScript 类型推导，杜绝运行时类型错误。

### 代价
- Prisma 相比纯 SQL 略有内存开销，但在中小型并发场景下性能完全溢出。

### 后续影响
- 数据库表结构变更一律通过 `prisma/schema.prisma` 并生成迁移文件，严禁手动修改生产表。

---

## DEC-004：小程序学员与后台管理员采用物理隔离双表鉴权架构

### 背景
系统中存在前台学员/会员与后台运营/超级管理员两类完全不同的用户群体。

### 可选方案
1. **分离设计 (`User` 表 + `AdminUser` 表)**：小程序端与后台独立建表，独立 JWT 密钥与鉴权中间件。
2. **统一用户体系 (单一 `User` 表 + Role 字段)**：所有身份共用一张表，后台账号通过绑定微信号或设置密码登录。

### 决策
选择 **方案 1：分离设计 (`User` 表 + `AdminUser` 表)**。

### 原因
1. 安全隔离：后台管理员密码哈希与 RBAC 权限与前台微信静默登录完全隔离，杜绝越权漏洞；
2. 业务模型干净：学员表关注会员等级、星图积分、学习记录；管理员表关注后台操作角色与登录日志；
3. 登录逻辑独立：小程序端走 `wx.login` (code2Session)，后台走用户名密码。

### 代价
- 存在两套 JWT 签发与验证中间件逻辑。

### 后续影响
- 后端中间件提供 `requireClientAuth` 与 `requireAdminAuth` / `requireRole`。

---

## DEC-005：文件上传采用存储驱动适配器模式 (Storage Adapter)

### 背景
系统涉及课件物料、打卡图片、封面图与商品图等文件存储，本地开发/测试与云端生产部署环境不同。

### 可选方案
1. **存储适配器模式**：抽象统一接口，开发/Docker 部署默认写本地挂载卷，可配置切换至腾讯云 COS / 阿里云 OSS。
2. **强绑定腾讯云 COS**：直接接入 COS SDK。
3. **纯本地磁盘存储**。

### 决策
选择 **方案 1：存储驱动适配器模式**。

### 原因
1. 环境解耦：本地开箱即跑，无需配置外部云服务密钥即可完整测试上传；
2. 生产扩展性：生产环境只需修改环境变量 `STORAGE_DRIVER=cos` 即可切换，无需修改业务代码。

### 代价
- 需要维护一套简易的适配器接口与工厂类。

### 后续影响
- 编写 `server/src/adapters/storage.adapter.ts`，实现 `LocalStorageAdapter` 与 `CosStorageAdapter`。

---

## DEC-006：支付模块采用微信支付 V3 直连协议 (JSAPI)

### 背景
课程、活动及会员需要支持在线收款与退款处理。

### 可选方案
1. **标准微信支付 V3 直连**：官方 V3 JSAPI 规范，商户私钥签名、平台证书解密。
2. **微信支付 V2**：传统 MD5/HMAC-SHA256 签名（已不推荐）。

### 决策
选择 **方案 1：标准微信支付 V3 直连**。

### 原因
1. 符合微信官方最新规范与安全合规标准；
2. 原生支持 JSAPI 调起支付与原路退款；
3. AES-256-GCM 安全通知报文解析。

### 代价
- 需要在生产环境配置商户 API 证书与公私钥。

### 后续影响
- 支付成功回调必须结合数据库事务 (`prisma.$transaction`) 保证订单状态更新幂等。

---

## DEC-007：微信小程序端采用原生 TypeScript + npm + WXSS

### 背景
小程序端需要具备高流畅度、符合微信原生生态，同时保持代码质量与类型严谨。

### 可选方案
1. **原生 TypeScript + npm + WXSS**：官方原生支持，无打包黑盒，配合 npm 与类型定义。
2. **原生纯 JavaScript + WXSS**：无编译步骤，但缺乏类型安全。
3. **Uni-app / Taro 跨端框架**：多端编译，但增加了框架层复杂度。

### 决策
选择 **方案 1：原生 TypeScript + npm + WXSS**。

### 原因
1. 业务目标明确为微信单端，原生框架性能最高、坑最少；
2. TypeScript 能够与后端接口类型契约对齐；
3. WXSS 变量完美承接 `docs/Design/VI/` 中的设计 Token。

### 代价
- 需在微信开发者工具中开启 TypeScript 编译与 npm 构建。

### 后续影响
- 在 `miniprogram/styles/variables.wxss` 中统一定义 VI 颜色与间距变量。

---

## DEC-008：Docker 采用标准三容器编排拓扑

### 背景
项目部署要求通过 Docker 发布，需保证环境一致性与便捷性。

### 可选方案
1. **标准三容器编排 (`postgres` + `server` + `admin/nginx`)**：Nginx 负责静态托管、反代与 SSL。
2. **四容器编排 (`postgres` + `redis` + `server` + `admin`)**。

### 决策
选择 **方案 1：标准三容器编排**。

### 原因
1. 架构精简高效，资源消耗低；
2. Nginx 作为统一网关，规避跨域问题，集中处理静态资源与 API 反向代理。

### 代价
- 初期无 Redis 独立缓存，短期内依靠 PostgreSQL 与进程内缓存。

### 后续影响
- 编写根目录 `docker-compose.yml` 及各子目录 `Dockerfile` 与 `nginx.conf`。
