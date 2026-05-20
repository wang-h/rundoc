---
title: 路线图
---

# 路线图

RunDoc 以“项目变化驱动文档更新”为主线推进。

## V0.1 项目文档骨架

- 标准化 `docs/` 分层目录
- 初始化 `.rundoc/config.yml`
- 建立 `.rundoc/state/` 与 `.rundoc/reports/`

## V0.2 差异扫描

- 实现 `rundoc scan`
- 读取 `last_commit..HEAD`
- 生成影响分析报告

## V0.3 Markdown 补丁

- 实现 `rundoc write`
- 对受影响文档生成最小补丁
- 优先更新已有文档

## V0.4 AI 上下文刷新

- 自动刷新 `docs/04-ai/` 核心上下文文档
- 输出代码变更映射 / 验收清单 / 已知不一致

## V0.5 GitLab 集成

- 读取 Issue / MR 元数据
- 在 MR 生成文档影响评论
- 对“代码变更未同步文档”给出提醒
