# 系统架构设计 (Architecture)

本文档详细记录若星空间（Starry Space）的全栈系统架构、数据流向、模块边界与核心协议。

> 完整项目开发总纲与全量数据表/接口设计请参阅：[PROJECT_SPEC.md](file:///Users/apple/Repo/dev/starry/mini2/docs/PROJECT_SPEC.md)

---

## 1. 架构总览与拓扑图

系统分为三端一底座：
- **前台学员端**：原生微信小程序 (TypeScript + WXSS)
- **后台管理端**：Vue 3 + Vite + TailwindCSS 响应式单页应用
- **后端服务**：Node.js 20 LTS + Express.js + TypeScript RESTful API
- **数据与存储底座**：PostgreSQL 16 关系数据库 + 本地/对象存储驱动适配器

```
+-----------------------------------------------------------------------------------+
|                                 客户端接入层                                       |
|  +-------------------------------------+  +------------------------------------+  |
|  |     微信小程序端 (学员/会员)        |  |        管理中台 Web 前端 (团队端)   |  |
|  | (Native Miniprogram + TS + WXSS)    |  |     (Vue 3 + Vite + TailwindCSS)   |  |
|  +------------------+------------------+  +-----------------+------------------+  |
+---------------------|---------------------------------------|---------------------+
                      | HTTPS (API / 媒体访问)                | HTTP / HTTPS
                      v                                       v
+-----------------------------------------------------------------------------------+
|                             网关与反向代理层 (Nginx)                               |
|  - 静态页面托管 (/ -> admin dist)                                                  |
|  - API 路由反代 (/api/ -> server:3000)                                             |
|  - 静态媒体访问 (/uploads/ -> local storage)                                       |
|  - SSL / TLS 证书卸载与安全响应头                                                   |
+-----------------------------------------------------------------------------------+
                                      | 内部转发 (Port 3000)
                                      v
+-----------------------------------------------------------------------------------+
|                              后端服务层 (Server)                                  |
|  +-----------------------------------------------------------------------------+  |
|  | Express RESTful API Routing & Middleware                                    |  |
|  |  ├── 鉴权中间件 (JWT Client / Admin RBAC)                                   |  |
|  |  ├── 全局请求日志与统一错误处理 (ErrorHandler)                             |  |
|  |  └── 文件上传驱动 (Multer + StorageAdapter)                                 |  |
|  +-----------------------------------------------------------------------------+  |
|  | 业务服务层 (Services)                                                       |  |
|  |  ├── AuthService (微信授权登录 / 管理员登密)                                |  |
|  |  ├── CourseService / ActivityService (课程活动报名与课节排期)               |  |
|  |  ├── CheckinService (学员打卡、审核与精选)                                  |  |
|  |  ├── ContentService (星语、导读、故事、工具表单)                            |  |
|  |  └── PaymentService (微信支付 V3 下单、验签通知、退款)                       |  |
|  +-----------------------------------------------------------------------------+  |
|  | 数据访问层 (Prisma ORM)                                                     |  |
|  |  └── Prisma Client + Type-Safe Query Builder                                |  |
+-----------------------------------------------------------------------------------+
                   |                                           |
                   v                                           v
+------------------------------------+      +---------------------------------------+
|        数据持久层 (PostgreSQL 16)    |      |         第三方云服务生态              |
|  - 用户表 (User) / 管理员 (Admin)   |      |  - 微信开放平台 (code2Session, 手机号)|
|  - 课程/课节/活动/订单/打卡/内容   |      |  - 微信支付 V3 直连 (JSAPI / 退款)    |
|  - 标签/会员/配置/系统日志         |      |  - 腾讯云 COS / 阿里云 OSS (可选)     |
+------------------------------------+      +---------------------------------------+
```

---

## 2. 核心模块与职责划分

### 2.1 用户与身份体系 (User & Auth)
- **学员端**：基于微信生态 `wx.login` 获取 code，后端调用微信 `sns/jscode2session` 换取 `openid` 与 `session_key`，生成小程序端 JWT（Token 携带 `userId`, `openid`, `role: 'client'`）。
- **管理后台**：独立 `AdminUser` 体系，账号 + Bcrypt 加密哈希密码，支持 `SUPER_ADMIN` 与 `OPERATOR` 角色，生成独立后台 JWT。

### 2.2 课程与学习区体系 (Course & Study Space)
- 课程状态流转：草稿 (`DRAFT`) -> 已发布 (`PUBLISHED`) -> 已下架 (`OFFLINE`)。
- 课节支持定时解锁规则、配套物料地址收集、报名表单自定义字段。

### 2.3 打卡与成长体系 (Check-in & Growth)
- 学员根据课程/课节提交打卡（文本 + 多图）。
- 管理后台支持审核精选（`APPROVED` / `PENDING`），精选后可在前台日历墙/星图展示。

### 2.4 微信支付与交易闭环 (Payment & Order)
- 统一订单模型：支持 `COURSE` (课程)、`ACTIVITY` (活动)、`MEMBER` (会员)。
- 订单状态：`PENDING` -> `PAID` / `CLOSED` / `REFUNDED`。
- 支付流程：微信支付 V3 JSAPI 统一下单，回调报文 AES-256-GCM 解密验签，Prisma 事务保证幂等性。

---

## 3. 存储与多媒体架构 (Storage Adapter)

采用面向接口编程的存储适配器：

```typescript
export interface StorageAdapter {
  uploadFile(file: Express.Multer.File, folder?: string): Promise<{ url: string; key: string }>;
  deleteFile(key: string): Promise<boolean>;
}
```

- **LocalStorageAdapter**：默认驱动，将文件写入 `/app/uploads` 目录，通过 Nginx/Express 提供静态访问。
- **CosStorageAdapter / OssStorageAdapter**：生产环境通过环境变量平滑切换至腾讯云 COS 或阿里云 OSS。

---

## 4. API 契约与统一响应标准

所有对外接口遵循统一 Envelope 规范：

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "timestamp": 1755768000000
}
```

- `code === 0`：操作成功；
- `code !== 0`：业务错误（如 40001 参数校验错误、40101 未授权、40301 权限不足、50001 系统异常）。
