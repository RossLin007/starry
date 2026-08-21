# 若星空间 (Starry Space) - 测试规范与测试套件 (Testing)

本文档是若星空间项目的测试入口与测试体系索引。遵循 `AGENTS.md` 第 13 ~ 19 节规定。

---

## 核心测试纪律

1. **测试必须真实执行**：严禁把未运行或失败的测试写成 PASS，真实记录 PASS / FAIL / NOT RUN / BLOCKED。
2. **代码完成不等于任务完成**：任务完成必须满足 `实现 + 验证 + 测试 + 修复 + 回归 + 验收`。
3. **分层验证覆盖**：
   - 基础校验：TypeScript 类型检查 (`npm run build`)、Lint；
   - API 测试：Jest / Supertest 自动化接口测试 (`npm run test`)；
   - 业务流程测试：学员端全流程、管理端全流程；
   - 回归测试：核心鉴权、数据模型与事务幂等。

---

## 测试文档索引

- [test-plan.md](file:///Users/apple/Repo/dev/starry/mini2/docs/testing/test-plan.md)：项目整体测试计划与阶段覆盖范围
- [test-cases.md](file:///Users/apple/Repo/dev/starry/mini2/docs/testing/test-cases.md)：业务功能与异常边界测试用例集
- [regression.md](file:///Users/apple/Repo/dev/starry/mini2/docs/testing/regression.md)：核心回归测试检查清单
- [test-report.md](file:///Users/apple/Repo/dev/starry/mini2/docs/testing/test-report.md)：实际执行测试结果与报告记录
