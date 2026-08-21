## 项目介绍

项目名称：若星空间 微信小程序与管理中台

详细架构与开发规范请参阅根目录文档：
- 完整项目指南：[README.md](file:///Users/apple/Repo/dev/starry/mini2/README.md)
- Agent 与开发规范：[AGENTS.md](file:///Users/apple/Repo/dev/starry/mini2/AGENTS.md)

## 最终确立的技术栈

- **小程序端**：原生微信小程序 (TypeScript + npm + WXSS)
- **后端**：Node.js (20 LTS) + Express.js + TypeScript + Prisma ORM
- **后台前端**：Vue 3 + Vite + TailwindCSS + TypeScript (基于 `docs/Design/prototype-v3/admin` 还原)
- **数据库**：PostgreSQL 16
- **支付与交易**：微信支付 V3 直连 (JSAPI)
- **文件存储**：存储适配器模式 (默认本地 Docker Volume，支持腾讯云 COS / 阿里云 OSS)

## 发布要求
通过 Docker / Docker Compose 标准三容器编排发布 (`postgres` + `server` + `admin/nginx`)

## 代码管理要求
- Monorepo 单仓管理
- Git 版本控制与 Conventional Commits 规范
