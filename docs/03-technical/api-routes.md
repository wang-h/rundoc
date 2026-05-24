---
title: API 路由总览
---

# API 路由总览

记录接口、参数、兼容性与迁移说明。

## 认证 API

所有认证端点基于 Session Cookie 机制。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/auth/login` | 发起 OAuth 登录流程 |
| GET | `/auth/callback` | OAuth 回调处理 |
| POST | `/auth/logout` | 登出，清除会话 |
| GET | `/auth/me` | 获取当前登录用户信息 |

## 健康检查

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 服务健康检查，返回运行状态 |

## Projects API

所有端点需要有效的 Session Cookie（登录态）。

### 项目管理

| 方法 | 路径 | 请求体 | 响应 | 说明 |
|------|------|--------|------|------|
| POST | `/api/projects` | `{ name: string, description?: string, git_repo_url?: string, workspace_id?: UUID, org_id?: UUID }` | `{ project: { ... } }` | 创建项目，`name` 必填，自动生成 `slug_id` |
| GET | `/api/projects` | — (可选 `?workspace_id=`) | `{ projects: [ ... ] }` | 列出项目，可按工作空间筛选 |
| GET | `/api/projects/:id` | — | `{ project: { ... } }` | 按 ID 或 `slug_id` 获取单个项目 |
| PUT | `/api/projects/:id` | `{ name?, description?, git_repo_url?, workspace_id?, org_id? }` | `{ project: { ... } }` | 更新项目字段，仅更新提供的字段 |
| DELETE | `/api/projects/:id` | — | `{ project: { ... } }` | 软删除项目，设置 `status='archived'` |

## Documents API

所有端点需要有效的 Session Cookie（登录态）。

### 文档管理

| 方法 | 路径 | 请求体 | 响应 | 说明 |
|------|------|--------|------|------|
| POST | `/api/projects/:projectId/docs` | `{ title: string, content?: string, parent_doc_id?: UUID, slug_id?: string, position?: string }` | `{ document: { ... } }` | 在项目下创建文档，`title` 必填 |
| GET | `/api/projects/:projectId/docs` | — | `{ documents: [ ... ] }` | 列出项目下所有文档，按 `position` 排序，排除已软删除文档 |
| GET | `/api/projects/:projectId/docs/:docId` | — | `{ document: { ... }, history: [ ... ] }` | 获取单个文档及其版本历史 |
| PUT | `/api/projects/:projectId/docs/:docId` | `{ title?, content?, parent_doc_id?, slug_id?, position?, status? }` | `{ document: { ... } }` | 更新文档，自动将旧版本保存到 `document_history` |
| DELETE | `/api/projects/:projectId/docs/:docId` | — | `{ document: { ... } }` | 软删除文档，设置 `deleted_at` 时间戳 |

### 版本历史

| 方法 | 路径 | 请求体 | 响应 | 说明 |
|------|------|--------|------|------|
| GET | `/api/projects/:projectId/docs/:docId/history` | — | `{ history: [ ... ] }` | 获取指定文档的完整版本历史记录 |

## 文档站 API（计划中）

### 文档读取

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/docs/tree` | 获取完整文档树 |
| GET | `/api/docs/doc/:id` | 获取单篇文档 |
| GET | `/api/docs/search?q=` | 全文搜索 |
| GET | `/api/docs/context?path=` | 获取文档+分块上下文 |
| GET | `/api/docs/related?path=` | 获取关联文档 |

### 文档管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/docs/reindex` | 重建搜索索引 |

### 引擎操作

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/rundoc/scan` | 触发变更扫描 |
| POST | `/api/rundoc/write` | 触发文档更新 |
| POST | `/api/rundoc/check` | 触发一致性检查 |
| POST | `/api/rundoc/commit` | 生成提交建议 |

## 兼容性

Projects API 与 Documents API 已实现并可用。认证 API 与健康检查端点已就绪。文档站 API（文档树、搜索、上下文、关联文档）仍在规划中。

实现时应保持向后兼容，新增字段以可选方式添加。所有 API 响应采用键名包裹格式（如 `{ project: {...} }`、`{ documents: [...] }`）。
