# 开发经验与避坑指南 (Lessons Learned)

本文档记录在若星空间开发过程中总结出的实战经验、微信生态与框架避坑指南。

目标：**让未来的开发者不用重新踩一遍已经踩过的坑。**

---

## 1. 微信小程序生态开发经验

1. **wx.login 与 session_key 校验**：
   - 小程序端的 `code` 只能在微信服务端使用一次且有效期仅 5 分钟；换取到的 `session_key` 不可传回前端，仅保存在服务端用于数据解密。
2. **WXSS 样式变量与组件穿透**：
   - 在自定义组件中使用全局 CSS 变量（如 `--color-primary`）时，需确保 `options: { styleIsolation: 'apply-shared' }` 或在 `app.wxss` 中统一定义。
3. **微信开发者工具 npm 构建**：
   - 每次在 `miniprogram/` 下安装新的 npm 包后，必须在开发者工具中执行 `工具 -> 构建 npm` 才能正常引入。

---

## 2. Prisma ORM 与 PostgreSQL 实战经验

1. **数据库迁移严谨性**：
   - 在生产与测试环境严禁直接修改数据库表结构，所有改动必须通过 `prisma/schema.prisma` 并运行 `npx prisma migrate dev` 记录版本化迁移。
2. **事务与幂等性**：
   - 微信支付回调处理与订单状态流转必须使用 `prisma.$transaction`，并先检查订单是否已被标记为 `PAID`，防止重复通知导致多次发货或积分累加。

---

## 3. TailwindCSS 与 Vue 3 管理后台经验

1. **类名动态拼接问题**：
   - Tailwind 在构建时会静态扫描类名，避免使用动态拼接字符串（如 `bg-${color}-500`），应使用完整映射对象或原子类。
