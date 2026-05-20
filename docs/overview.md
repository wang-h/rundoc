---
title: Overview
---

# Overview

RunDoc 是一个项目变更驱动的文档自动维护系统。

它绑定项目仓库，持续感知代码与配置变化，判断哪些文档受影响，并自动生成可审阅的 Markdown 更新。

## 核心定义

RunDoc 不以“人工整理材料”为主流程，不要求先手工产出 `meeting-notes.md` 或 `manual-notes.md` 再汇总。

RunDoc 的主流程是：

```text
项目变化 -> 影响分析 -> 文档补丁 -> 审核合并
```

## 输入与输出

输入（项目状态）：

- Git diff
- Commit history
- GitLab Issue / MR（可选）
- 现有 `docs/`
- `.rundoc/config.yml`
- 可选人工材料（只作为补充）

输出（文档变更资产）：

- `docs/**/*.md` 更新
- `docs/04-ai/*` AI 上下文更新
- 文档一致性检查结果
- `.rundoc/reports/*.md` 扫描报告
- Draft commit / MR 建议

## 运行闭环

```text
Detect -> Understand -> Map -> Patch -> Commit
```

1. Detect: 发现项目变化  
2. Understand: 理解变化影响  
3. Map: 映射到具体文档  
4. Patch: 生成 Markdown 补丁  
5. Commit: 生成可审核提交
