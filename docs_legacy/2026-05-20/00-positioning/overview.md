---
title: 定位总览
---

# 定位总览

RunDoc 是一个跟随项目变更自动维护 Markdown 文档的系统。

它不是资料收件箱，不依赖人工先整理输入文件。  
它直接读取项目状态变化，并更新正式文档。

## 核心闭环

```text
Detect -> Understand -> Map -> Patch -> Commit
```

## 输入

- Git diff
- Commit 历史
- GitLab Issue / MR（可选）
- 现有 `docs/`
- `.rundoc/config.yml`

## 输出

- `docs/**/*.md` 更新
- `docs/04-ai/*` AI 上下文更新
- `.rundoc/reports/*.md` 扫描报告
- 可审核的提交或 MR 草稿
