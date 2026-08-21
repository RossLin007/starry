# 测试用例集 (Test Cases)

## 1. 认证与用户中心用例 (Auth & User)

| 用例 ID | 测试模块 | 输入 / 前提条件 | 预期输出 / 行为 | 实际执行状态 |
| :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-001** | 小程序微信登录 | `POST /client/auth/wechat-login` 带合法 code | 返回 `code: 0`，携带 JWT Token 与 User 概要数据 | **PASS** |
| **TC-AUTH-002** | 小程序微信登录异常 | `POST /client/auth/wechat-login` 缺少 code | 返回 `code: 40001`，错误提示“微信登录 Code 不能为空” | **PASS** |
| **TC-AUTH-003** | 学员获取个人资料 | 携带有效学员 Token 请求 `GET /client/auth/profile` | 返回学员昵称、头像、会员层级、星图积分与加入天数 | **PASS** |
| **TC-AUTH-004** | 学员更新个人资料 | `PUT /client/auth/profile` 提交新昵称 | 成功更新，返回最新用户信息 | **PASS** |
| **TC-AUTH-005** | 学员维护收货地址 | `PUT /client/auth/address` 提交姓名/手机/省市区 | 成功保存地址并返回 | **PASS** |
| **TC-ADMIN-001** | 管理员正确登密 | `POST /admin/auth/login` (admin / admin123456) | 返回 `code: 0`，携带 Admin JWT 与角色 `SUPER_ADMIN` | **PASS** |

---

## 2. 课程体系与学习区用例 (Phase 3: Course & Study)

| 用例 ID | 测试模块 | 输入 / 前提条件 | 预期输出 / 行为 | 实际执行状态 |
| :--- | :--- | :--- | :--- | :--- |
| **TC-CRS-001** | 后台新建课程 | 管理员调用 `POST /admin/courses` | 成功创建课程，返回课程详情与 ID | **PASS** |
| **TC-CRS-002** | 后台编排课节 | 管理员调用 `POST /admin/courses/:id/lessons` | 成功添加课节，设定阶段名称与解锁类型 | **PASS** |
| **TC-ENROLL-001** | 学员报名与快照 | 学员提交问卷与物料收货信息 `POST /client/courses/:id/enroll` | 创建报名记录并生成关联订单，状态为 ACTIVE | **PASS** |
| **TC-ENROLL-002** | 重复报名拦截 | 已报名的学员再次提交同一课程报名 | 拦截并返回 `code: 40902`，提示已报名 | **PASS** |
| **TC-STUDY-001** | 学习区阶段聚合 | 学员请求 `GET /client/study/courses/:id` | 聚合返回阶段分组列表与课节解锁状态 | **PASS** |
| **TC-STUDY-002** | 课节打卡与进度推进 | 学员调用 `POST /client/study/lessons/:id/complete` | 成功标记完成，动态重算课程进度为 100% | **PASS** |
| **TC-ADMIN-005** | 名单检索与发货回填 | 管理员检索名单并调用 `PUT /admin/courses/enrollments/:id/shipping` | 回填顺丰快递单号，发货状态更新为 SHIPPED | **PASS** |

---

## 3. 线下/线上活动与电子票核销用例 (Phase 4: Activity & Ticket Check-in)

| 用例 ID | 测试模块 | 输入 / 前提条件 | 预期输出 / 行为 | 实际执行状态 |
| :--- | :--- | :--- | :--- | :--- |
| **TC-ACT-001** | 后台发布活动 | 管理员调用 `POST /admin/activities` | 成功创建线下/线上活动，返回活动详情与 ID | **PASS** |
| **TC-ACT-002** | 学员报名活动 | 学员调用 `POST /client/activities/:id/enroll` | 创建活动报名记录，签发唯一电子票号 (`TICK-xxxx`) | **PASS** |
| **TC-ACT-003** | 活动重复报名拦截 | 已报名的学员再次提交同一活动报名 | 拦截并返回 `code: 40903`，提示已报名 | **PASS** |
| **TC-ACT-004** | 我的活动电子票 | 学员请求 `GET /client/activities/my/tickets` | 返回学员拥有的全部活动电子入场票与核销状态 | **PASS** |
| **TC-CHECKIN-001** | 现场验券核销 | 管理员调用 `POST /admin/activities/checkin/verify` | 成功核销入场，返回学员姓名、活动主题与核销时间 | **PASS** |
| **TC-CHECKIN-002** | 防重复核销拦截 | 对已核销电子票再次执行核销 | 提示 `alreadyCheckedIn: true`，拒绝重复入场 | **PASS** |

---

## 4. 实践打卡墙、星图积分与内容生态用例 (Phase 5: Check-in & Content)

| 用例 ID | 测试模块 | 输入 / 前提条件 | 预期输出 / 行为 | 实际执行状态 |
| :--- | :--- | :--- | :--- | :--- |
| **TC-CHK-001** | 学员提交打卡 | `POST /client/checkins` (图文心得) | 成功创建打卡记录，学员积分事务自动累加 10 pts | **PASS** |
| **TC-GROWTH-001** | 成长星图日历 | `GET /client/checkins/growth` | 返回累计积分、连续打卡天数与打卡热力日期集 | **PASS** |
| **TC-REVIEW-001** | 管理端审核与寄语 | `PUT /admin/checkins/:id/review` | 成功标记 `isFeatured: true`，写入主理人温润陪伴寄语 | **PASS** |
| **TC-WALL-001** | 精选广场瀑布流 | `GET /client/checkins/featured` | 成功返回精选打卡卡片流与主理人回评寄语 | **PASS** |
| **TC-DAILY-001** | 每日星语发布与检索 | `POST /admin/contents/daily` & `GET /client/contents/daily` | 成功发布并实时读取每日金句日签与伴读说明 | **PASS** |

---

## 5. 微信支付对接与会员体系用例 (Phase 6: Payment & Member)

| 用例 ID | 测试模块 | 输入 / 前提条件 | 预期输出 / 行为 | 实际执行状态 |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BENEFIT-001** | 获取星愿会员权益 | `GET /client/members/benefits` | 返回五大会员核心特权与定价 ¥999/年 | **PASS** |
| **TC-ORDER-001** | 创建星愿会员订单 | `POST /client/members/orders` | 成功创建 `MEMBER` 订单，返回 `orderId` 与 `orderNo` | **PASS** |
| **TC-PAY-001** | 发起微信支付调起参数 | `POST /client/orders/:id/pay` | 生成 `timeStamp`、`nonceStr`、`package` 与 `paySign` 签名 | **PASS** |
| **TC-NOTIFY-001** | 微信支付回调与会员开通 | `POST /v1/payments/wechat/notify` | 幂等流转订单为 `PAID`，学员层级自动升为 `DEEP` 延期 365 天 | **PASS** |
| **TC-ADMIN-ORD-001** | 管理端订单检索 | `GET /admin/orders` | 返回全站订单列表、支付流水号与对账详情 | **PASS** |
| **TC-ADMIN-MBR-001** | 管理端会员中台 | `GET /admin/members` | 返回会员等级、到期时间与积分统计 | **PASS** |

---

## 6. 全链路端到端集成测试用例 (Phase 7: Full Journey E2E)

| 用例 ID | 测试模块 | 输入 / 旅程流转 | 预期输出 / 行为 | 实际执行状态 |
| :--- | :--- | :--- | :--- | :--- |
| **E2E-01** | 学员登录与档案 | 微信静默登录 -> 档案读取 -> 填写收货地址 | 返回真实 Token，收货地址写入成功 | **PASS** |
| **E2E-02** | 课程发布到发货 | 管理端排课 -> 学员问卷报名 -> 快递回填 | 问卷快照存入，顺丰单号更新成功 | **PASS** |
| **E2E-03** | 学习区进度推进 | 大纲加载 -> 完成课节打卡 -> 进度重算 | 进度重算为 100%，大纲状态更新 | **PASS** |
| **E2E-04** | 线下雅集核销闭环 | 报名签发唯一票号 -> 现场核销 -> 重复核销拦截 | 初次通过，二次拦截拒绝重复入场 | **PASS** |
| **E2E-05** | 打卡与星图热力 | 图文心得提交 -> 自动加10分 -> 30天热力点亮 | 积分累加成功，热力日期集包含今日 | **PASS** |
| **E2E-06** | 导师寄语与精选墙 | 管理端精选并写寄语 -> 广场实时展示 | 前台卡片实时展示主理人金黄色寄语 | **PASS** |
| **E2E-07** | 会员支付闭环 | 会员下单 -> 签名生成 -> 回调解密 -> 会员升级 | 订单流转为 PAID，会员升级为 DEEP (365天) | **PASS** |
| **E2E-08** | 对账与全站配置 | 订单列表检索 -> Slogan 配置修改 | 订单含支付流水，配置修改实时生效 | **PASS** |
