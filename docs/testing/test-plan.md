# 项目测试计划 (Test Plan)

## 测试范围与阶段规划

### 阶段一：基础底座验证 (已完成)
- [x] 后端 TS 编译与 Prisma Client 生成通过
- [x] 管理后台 Vite 构建与 Tailwind 样式打包通过
- [x] 微信小程序 TypeScript 编译通过

### 阶段二：用户中心与核心业务 API 验证 (当前阶段)
- [ ] 学员端微信静默登录与 JWT 签发测试
- [ ] 学员个人资料获取与修改（头像、昵称长度校验）
- [ ] 学员收货地址维护（JSON 结构存储与更新）
- [ ] 管理员账号密码 Bcrypt 认证与 JWT 签发
- [ ] 管理员 RBAC 角色鉴权拦截（`SUPER_ADMIN` vs `OPERATOR`）
- [ ] 学员档案查询、标签多维关联与筛选
- [ ] 系统全局配置（首页引言、提醒配置）读写
- [ ] 核心业务（课程、活动、打卡、内容、商品）基础 CRUD API 联通

---

## 测试工具与执行命令

| 测试类型 | 工具链 | 命令 |
| :--- | :--- | :--- |
| **API 自动化测试** | Jest + Supertest + ts-jest | `npm run test` (在 `server/` 目录下执行) |
| **TypeScript 检查** | tsc / vue-tsc | `npm run build` |
| **健康检查探测** | HTTP GET | `GET /api/health` |
