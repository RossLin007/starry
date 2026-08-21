---
name: devlog
description: >-
  若星空间项目工程记忆库（DevLog）维护工作流。用于在完成开发任务、架构调整、技术决策或疑难排查后，
  按照标准化 SOP 更新 docs/devlog/ 下的 progress、CHANGELOG、decisions、issues、lessons 和 daily 日志。
---

# DevLog 工程记忆库维护工作流 (SOP)

本文档是更新若星空间 `docs/devlog/` 工程记忆库的标准作业程序（SOP）。

---

## 一、触发时机

当完成以下任一任务时，必须触发本工作流：
1. 完成或推进了一个功能模块（M1 ~ M5 里程碑）；
2. 调整了系统架构、数据模型（Prisma Schema）或 API 契约；
3. 做出了重大技术决策或技术选型（Why）；
4. 排查并解决了一个疑难 Bug / 踩坑经验；
5. 每日/每次开发任务交付总结。

---

## 二、标准化执行步骤 (6 步闭环)

### 步骤 1：检查本次变更
- 查看 Git 修改文件与代码 diff；
- 确认新增、修改、删除了哪些核心逻辑与文件。

### 步骤 2：判断影响与归类 (判定树)
- **是否有架构/模型/API/重大决策变更？(P0)**
  ➔ 编写/更新 `docs/devlog/architecture.md`、`docs/devlog/decisions.md` (DEC-xxx)、`docs/devlog/CHANGELOG.md`
- **是否有功能交付或阶段演进？(P1)**
  ➔ 更新 `docs/devlog/progress.md`、`docs/devlog/CHANGELOG.md`
- **是否排查了疑难问题？(P0/P1)**
  ➔ 更新 `docs/devlog/issues.md` (ISSUE-xxx)
- **是否有踩坑避坑经验？(P1)**
  ➔ 更新 `docs/devlog/lessons.md`
- **每次开发实录 (必填)**
  ➔ 写入/追加 `docs/devlog/daily/YYYY-MM-DD.md`

### 步骤 3：执行精准更新
- 打开目标 DevLog 文件；
- 按照既定 Markdown 模板追加或修改内容；
- 遵循“真实准确、记录前后对比、记录 Why”原则，严禁捏造。

### 步骤 4：更新进度清单
- 在 `docs/devlog/progress.md` 中勾选已完成项 `[x]`，调整当前开发中与下一步待办。

### 步骤 5：自检与一致性核对
- 核对 DevLog 记录的内容与当前代码、测试结果是否完全一致。

### 步骤 6：生成标准交付汇报
在对话中按如下标准格式向用户汇报：
```text
## 开发完成

### 本次完成
- [功能点描述]

### 主要修改
- `文件路径`

### DevLog 更新
- `docs/devlog/...`

### 重要技术决策
- [如有决策，注明 DEC-XXX]

### 遗留问题
- [当前未解决项]

### 下一步建议
- [下一步实施内容]
```
