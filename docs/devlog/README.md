# 若星空间 (Starry Space) - 开发日志 (DevLog)

欢迎来到若星空间项目的工程记忆库（Engineering Memory）。

本文档库是若星空间长期维护与知识传承的核心载体。代码记录“系统现在是什么样子”，而 DevLog 记录**“系统是怎么一步一步变成现在这个样子的，以及为什么”**。

---

## 一、当前项目阶段与状态

- **当前阶段**：项目架构设计与工程化规范建立阶段（准备进入第一阶段：全栈脚手架与基础底座搭建）
- **基线版本**：PRD V3.3 / Prototype V3 / VI 设计规范 V1.0
- **当前状态**：技术选型、数据库建模原则、鉴权隔离、支付与存储方案已全部对齐，规范文档与 DevLog 体系已初始化。

---

## 二、如何阅读与使用开发日志

如果您是新加入的开发者，或在数月后重新接手此项目，建议按以下顺序阅读：

```
1. 本文件 (README.md)
   ▼ 了解项目全貌与日志结构
2. architecture.md
   ▼ 掌握当前系统架构、数据流与模块边界
3. decisions.md
   ▼ 理解核心技术决策的背景与代价 (Why)
4. progress.md
   ▼ 确认当前开发进度、已完成项与待办清单
5. CHANGELOG.md / daily/*.md
   ▼ 追踪最近的具体改动与每日开发记录
```

---

## 三、各日志文件职责说明

| 文件 | 职责说明 | 更新时机 |
| :--- | :--- | :--- |
| [progress.md](file:///Users/apple/Repo/dev/starry/mini2/docs/devlog/progress.md) | 记录项目整体阶段、已完成/进行中/待开发清单、阻塞问题与下一步计划 | 每完成一个里程碑/重要功能时更新 |
| [CHANGELOG.md](file:///Users/apple/Repo/dev/starry/mini2/docs/devlog/CHANGELOG.md) | 按时间倒序记录有长期价值的重要变更（Added/Changed/Fixed/Breaking） | 产生重要版本迭代或重大改动时更新 |
| [architecture.md](file:///Users/apple/Repo/dev/starry/mini2/docs/devlog/architecture.md) | 记录整体架构、技术栈、分层结构、数据流、API 规范与部署拓扑 | 架构调整、新模块引入时更新 |
| [decisions.md](file:///Users/apple/Repo/dev/starry/mini2/docs/devlog/decisions.md) | 记录所有关键技术决策（背景、备选方案、决策结论、原因、代价与影响） | 做出架构/技术选型/重大业务设计决策时更新 |
| [issues.md](file:///Users/apple/Repo/dev/starry/mini2/docs/devlog/issues.md) | 记录遇到的疑难杂症、排查过程、根本原因与最终解决方案 | 解决具有复用参考价值的技术/业务问题时更新 |
| [lessons.md](file:///Users/apple/Repo/dev/starry/mini2/docs/devlog/lessons.md) | 记录开发过程中总结的技术踩坑经验（微信 API、第三方 SDK、样式兼容等） | 踩坑并获得经验后更新 |
| [daily/](file:///Users/apple/Repo/dev/starry/mini2/docs/devlog/daily) | 记录每日或每次重要开发任务的具体过程、技术实现、修改文件与状态 | 每次有实质性开发交付时记录 |

---

## 四、核心原则

1. **真实记录，严禁捏造**：未验证的内容明确注明“待确认”或“尚未验证”，日志必须与实际代码高度一致。
2. **记录 Why，而不仅仅是 What**：代码记录当前状态，DevLog 记录背后的动机与权衡。
3. **开发自闭环**：每次开发任务均遵循 `理解 → 修改 → 测试 → 总结 → 记录 → 更新进度` 闭环流程。
