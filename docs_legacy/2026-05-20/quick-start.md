---
title: Quick Start
---

# Quick Start

RunDoc 的最小工作流不是先整理 inbox，而是先绑定项目并扫描变更。

## 1. 初始化项目结构

在项目根目录准备：

```text
docs/
  00-positioning/
  01-product/
  02-business/
  03-technical/
  04-ai/
  05-decisions/
  06-ops/
  07-archive/

.rundoc/
  config.yml
  prompts/
  state/
  reports/
```

## 2. 运行命令闭环

```bash
rundoc init
rundoc scan
rundoc write
rundoc check
rundoc commit
```

- `scan`: 从 `last_commit..HEAD` 生成变更影响报告
- `write`: 更新受影响 Markdown 文档
- `check`: 检查冲突/缺失/过期
- `commit`: 生成可审阅提交

## 3. 报告产物

每次扫描应产出运行报告：

```text
.rundoc/reports/YYYY-MM-DD-run.md
```

报告至少包含：

- 本次项目变化摘要
- 受影响文档清单
- 建议更新项
- 未决冲突与人工确认点

## 4. 文档站本地开发（可选）

当前仓库包含文档站 UI，可用于浏览 `docs/`：

```bash
npm install
npm run build
npm run dev
```
