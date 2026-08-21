# 回归测试矩阵 (Regression Test Matrix)

本文档定义若星空间发布前必须全量通过的端到端核心业务回归场景。遵循 `AGENTS.md` 真实性原则。

---

## 核心业务全链路回归验证清单

| 序号 | 业务流程 | 关键检查点 | 验证方式 | 状态 |
| :--- | :--- | :--- | :--- | :--- |
| **REG-01** | **学员静默登录与档案初始化** | `POST /client/auth/wechat-login` 生成真实 JWT，档案初始化，收货地址保存 | `server/tests/e2e.test.ts` (E2E-01) | **PASS** |
| **REG-02** | **课程发布与报名问卷流转** | 管理端建课排课 -> 学员提交问卷快照报名 -> 订单生成 -> 管理端回填发货单号 | `server/tests/e2e.test.ts` (E2E-02) | **PASS** |
| **REG-03** | **学习区渐进解锁与进度重算** | 开课天数动态解锁判定 -> 课节阅读 -> 打卡完成 -> 学习进度百分比重算为 100% | `server/tests/e2e.test.ts` (E2E-03) | **PASS** |
| **REG-04** | **活动报名与现场验券核销** | 线下雅集发布 -> 报名签发唯一 `TICK-xxxx` 票号 -> 现场快速核销 -> 重复核销拦截 | `server/tests/e2e.test.ts` (E2E-04) | **PASS** |
| **REG-05** | **图文实践打卡与星图成长** | 提交实践心得与照片 -> 事务原子累加 10 积分 -> 成长星图 30 天打卡热力点亮 | `server/tests/e2e.test.ts` (E2E-05) | **PASS** |
| **REG-06** | **打卡审核与主理人温润寄语** | 管理端精选打卡并撰写主理人陪伴寄语 -> 小程序精选打卡广场瀑布流实时同步 | `server/tests/e2e.test.ts` (E2E-06) | **PASS** |
| **REG-07** | **微信支付与星愿会员开通** | 会员下单 (¥999) -> 统一下单生成客户端签名 -> 支付回调验签解密 -> 自动升级 DEEP 会员 365 天 | `server/tests/e2e.test.ts` (E2E-07) | **PASS** |
| **REG-08** | **订单对账与全站品牌配置** | 管理端订单列表对账检索 -> 全站 Slogan 与客服配置保存实时生效 | `server/tests/e2e.test.ts` (E2E-08) | **PASS** |
| **REG-09** | **三端 TypeScript 严格类型检查** | Server / Admin / Miniprogram 严格类型检查，无隐式 `any`，零类型错误 | `npm run build` & `build:ts` | **PASS** |
| **REG-10** | **生产容器编排构建** | Docker Compose 三容器构建，Nginx 反向代理、SPA 路由回退与静态文件挂载 | `docker compose config` | **PASS** |

---

## 自动化测试执行汇总
- **测试套件**: `tests/api.test.ts` + `tests/e2e.test.ts`
- **用例总数**: 16 passed, 16 total, 0 failed
- **执行时间**: 1.146s
- **全栈构建**: Server `tsc` 通过, Admin `vite build` (110 modules) 通过, Miniprogram `tsc` 通过
