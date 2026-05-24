---
title: 路线图
---

# 路线图

RunDoc 以“项目变化驱动文档更新”为主线推进。

## V0.1 项目文档骨架 ✅

- 标准化 `docs/` 分层目录
- 初始化 `.rundoc/config.yml`
- 建立 `.rundoc/state/` 与 `.rundoc/reports/`

## V0.2 差异扫描 ✅

- 实现 `rundoc scan`
- 读取 `last_commit..HEAD`
- 生成影响分析报告

## V0.3 Markdown 补丁 ✅

- 实现 `rundoc write`
- 对受影响文档生成最小补丁
- 优先更新已有文档

## V0.4 AI 上下文刷新 ✅

- 自动刷新 `docs/04-ai/` 核心上下文文档
- 输出代码变更映射 / 验收清单 / 已知不一致

## V0.5.x 项目绑定与文档编辑器 ✅ (COMPLETED)

- 后端 Projects API（CRUD，软删除，slug_id 自动生成）
- 后端 Documents API（CRUD，软删除，版本历史自动保存）
- 文档树形结构（parent_doc_id 自引用，fractional index 排序）
- Kysely + SQLite 数据持久化（WAL 模式，启动自动迁移）
- Session Cookie 认证（OAuth 登录流程）
- 前端项目列表、项目详情、文档编辑与查看页面

## V0.6 实时协作

- WebSocket / SSE 文档实时同步
- 多人编辑冲突检测与合并
- 在线用户状态显示

## V0.7 GitLab 集成

- 读取 Issue / MR 元数据
- 在 MR 生成文档影响评论
- 对”代码变更未同步文档”给出提醒

## V0.8 RunMind 知识同步

- 连接 RunMind 知识库
- 文档内容同步至知识库索引
- 双向链接与引用追踪
