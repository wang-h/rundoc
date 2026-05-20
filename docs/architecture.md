---
title: Architecture
---

# Architecture

RunDoc 分为两层：项目变更引擎（核心）和文档站渲染层（当前已实现）。

## 1) Project Watch 引擎（核心）

```text
Git / Repo State
  -> Detect (diff/commit/MR)
  -> Understand (impact analysis)
  -> Map (doc targets)
  -> Patch (markdown updates)
  -> Commit (reviewable change)
```

### Detect

读取 `last_commit..HEAD` 的变更，覆盖代码、配置、数据库脚本、部署脚本与 `docs/` 自身变化。

### Understand

基于路径、提交语义和规则判断变更影响域，例如：

- `frontend/**` 影响产品页面文档
- `backend/**` 影响 API/技术文档
- `schema.sql` 影响数据模型文档
- `docker-compose.yml` 影响部署运维文档

### Map

将影响域映射到文档目标路径（优先更新已有文档），并生成待修改清单。

### Patch

对目标 Markdown 生成最小补丁，不重写整篇文档。

### Commit

输出可审阅的分支、提交与报告，不直接跳过人工审核。

## 2) 文档站渲染层（当前）

```text
docs/**/*.md
  -> scripts/build-docs.mjs
  -> src/content/docs-content.ts
  -> src/content/search-index.json
  -> React documentation app
```

渲染层负责阅读体验（导航、搜索、TOC），不负责变更感知。
