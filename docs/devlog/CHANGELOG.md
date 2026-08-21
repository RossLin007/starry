# Changelog

本文档记录若星空间项目所有具有长期价值的重要技术变更与里程碑演进。

---

## [Phase 7: Full Integration, Container Deployment & Commercial Acceptance] - 2026-08-21

### Added
- **全域端到端业务闭环回归套件**：
  - 新建 `server/tests/e2e.test.ts`：端到端覆盖 8 大核心业务链路（学员登录初始化、课程问卷报名与发货、学习区大纲进度重算、线下雅集唯一票号签发与现场防重复核销、图文打卡加积分与成长热力日历、导师温润寄语与精选广场、星愿会员微信支付调起与回调自动延期升级、管理端订单对账与全站配置热更新）；
  - 全套 16 个自动化测试用例 100% 真实通过 (`PASS`)；
- **生产级容器部署与运维方案**：
  - 编写 `docs/DEPLOYMENT.md`：涵盖云服务器环境要求、Docker Compose 生产编排、Prisma Migration 生产迁移、Nginx HTTPS/SSL 证书配置以及微信支付 V3 证书部署；
  - 编写 `scripts/backup_db.sh`：实现 PostgreSQL 数据库自动 pg_dump 备份、gzip 压缩与 14 天过期轮换清理；
- **交付验收与矩阵归档**：
  - 更新 `docs/testing/regression.md` 记录 10 大核心回归场景全部通过；
  - 更新 `README.md` 交付商用运维与架构文档；
  - 项目全部 7 大阶段交付完毕，进入商业化就绪状态。

---

## [Phase 6: WeChat Pay, VIP Member & Settings] - 2026-08-21

### Added
- 微信支付 V3 直连与安全闭环（统一下单、客户端签名参数生成、AES-256-GCM 异步通知回调解密与幂等状态流转）；
- 星愿年度会员权益体系（5 大专属特权、下单与自动升级 DEEP 深度会员 365 天）；
- 学员端订单中心与个人中心尊享会员态；
- 管理后台订单中心、会员中台与系统设置中台。

---

## [Phase 5: Check-in Practice, Star Map & Content Ecosystem] - 2026-08-21

### Added
- 实践打卡提交自动事务累加 10 星图积分 (`CheckinService.createCheckin`)；
- 成长星图连续打卡天数与 30 天打卡热力日历 (`GET /client/checkins/growth`)；
- 精选打卡广场瀑布流与主理人温润陪伴寄语 (`GET /client/checkins/featured`)；
- 每日星语日签、学员故事采编与第三方好物商城跳转；
- 管理后台四大生态视图全量落地。

---

## [Phase 4: Activities & Ticket Check-in] - 2026-08-21

### Added
- 活动发布与名额管控 (`ActivityService.enrollActivity`)；
- 唯一电子入场券与管理端现场验券核销系统 (`POST /admin/activities/checkin/verify`)；
- 管理后台活动与现场核销中台 (`ActivitiesView.vue`)；
- 小程序端活动广场、详情与打孔票根电子凭证。

---

## [Phase 3: Courses & Study Space Closed Loop] - 2026-08-21

### Added
- 课程报名与表单快照闭环 (`CourseService.enrollCourse`)；
- 学习区实践与动态按天解锁系统 (`CourseService.getStudyCourseDetail`)；
- 管理后台课程管理与物料发货中台 (`CoursesView.vue`)；
- 小程序端课程与学习区流转。

---

## [Phase 2: User Center & Core APIs] - 2026-08-21

### Added
- 建立 `docs/testing/` 完整测试体系；
- 用户中心与微信鉴权 (`UserService` / `AdminAuthService`)；
- 学员档案中台管理 (`StudentService` / `TagService`) 与系统配置 (`ConfigService`)；
- 核心业务领域服务初步落地。

---

## [Phase 1: Foundation] - 2026-08-21

### Added
- Monorepo 根工程与三容器编排 (`docker-compose.yml`)；
- 后端 Express + TS + Prisma 16 张全量表建模与种子数据；
- 管理后台 Vue 3 + TailwindCSS 母版布局与 19 个页面路由骨架；
- 原生小程序 TS + VI Tokens + 5 大 TabBar 页面；
- 建立 `docs/devlog/` 记忆库与 SOP 工作流。
