---
title: 数据模型
---

# 数据模型

记录 RunDoc 后端数据库实体定义、字段类型与关联关系。

## 数据库技术

- **查询构建器**：Kysely（类型安全 SQL 查询）
- **数据库引擎**：better-sqlite3（SQLite）
- **运行模式**：WAL 模式，外键约束开启
- **迁移策略**：服务启动时自动执行迁移（当前 2 个迁移文件：`0001_create_projects`、`0002_create_documents`）

## 实体定义

### Project（项目）

文档项目的顶层组织单元。

```text
id              # UUID      — 主键
slug_id         # string    — URL 友好的唯一标识，创建时由 name 自动生成
name            # string    — 项目名称（必填）
description     # string?   — 项目描述
git_repo_url    # string?   — 关联 Git 仓库地址
workspace_id    # UUID?     — 所属工作空间
org_id          # UUID?     — 所属组织
created_by      # UUID?     — 创建者用户 ID
status          # string    — 状态：active | archived（默认 active）
created_at      # string    — 创建时间（ISO 8601）
updated_at      # string    — 更新时间（ISO 8601）
```

**约束与规则：**

| 字段 | 规则 |
|------|------|
| `id` | 主键，自动生成 UUID |
| `slug_id` | 唯一，由 `name` 自动生成，用于 URL 路径 |
| `name` | 必填，创建时必须提供 |
| `status` | 枚举值 `active` / `archived`，DELETE 操作执行软删除（设为 `archived`） |

### Document（文档）

项目下的文档节点，支持树形层级结构。

```text
id              # UUID      — 主键
slug_id         # string?   — URL 友好的唯一标识
title           # string    — 文档标题（必填）
content         # text      — 文档正文（Markdown 格式）
project_id      # UUID      — 外键 → projects.id
parent_doc_id   # UUID?     — 自引用外键 → documents.id，用于构建文档树
position        # string    — 排序位置（分数索引字符串，如 'a0'、'a1'）
status          # string    — 状态：draft | published | archived（默认 draft）
last_updated_by # UUID?     — 最近更新者用户 ID
created_at      # string    — 创建时间（ISO 8601）
updated_at      # string    — 更新时间（ISO 8601）
deleted_at      # string?   — 软删除时间，非空表示已删除
```

**约束与规则：**

| 字段 | 规则 |
|------|------|
| `id` | 主键，自动生成 UUID |
| `title` | 必填，创建时必须提供 |
| `project_id` | 外键，引用 `projects.id`，不可为空 |
| `parent_doc_id` | 自引用外键，可为空（空表示根级文档） |
| `position` | 分数索引字符串（如 `'a0'`），用于文档排序 |
| `status` | 枚举值 `draft` / `published` / `archived` |
| `deleted_at` | DELETE 操作执行软删除，设置此字段时间戳，列表查询排除已删除记录 |
| `content` | Markdown 格式文本，更新时自动将旧版本保存到 `document_history` |

### DocumentHistory（文档历史）

文档内容的版本快照，每次 PUT 更新自动生成。

```text
id              # UUID      — 主键
document_id     # UUID      — 外键 → documents.id
title           # string    — 更新时的文档标题
content         # text      — 更新时的文档正文
changed_by      # UUID?     — 变更者用户 ID
change_summary  # string?   — 变更摘要
created_at      # string    — 记录创建时间（ISO 8601）
```

**约束与规则：**

| 字段 | 规则 |
|------|------|
| `id` | 主键，自动生成 UUID |
| `document_id` | 外键，引用 `documents.id`，不可为空 |
| `title` | 快照时的文档标题 |
| `content` | 快照时的完整 Markdown 内容 |
| `change_summary` | 可选，人类可读的变更描述 |

## 实体关系图

```text
┌──────────┐      1:N       ┌──────────┐      1:N       ┌──────────────────┐
│  Project │ ────────────→ │ Document │ ────────────→ │ DocumentHistory   │
└──────────┘                └─────┬────┘                └──────────────────┘
                                  │
                                  │ 自引用 (parent_doc_id)
                                  ▼
                            ┌──────────┐
                            │ Document │  (子文档)
                            └──────────┘
```

**关系说明：**

- 一个 **Project** 包含多个 **Document**
- 一个 **Document** 拥有多条 **DocumentHistory**（每次更新产生一条历史记录）
- **Document** 通过 `parent_doc_id` 自引用构建树形层级结构
- 软删除贯穿全部实体：Project 通过 `status=archived` 实现，Document 通过 `deleted_at` 实现

## API 响应封装

所有 API 响应均采用键名包裹：

- 单个项目：`{ project: { ... } }`
- 项目列表：`{ projects: [ ... ] }`
- 单个文档：`{ document: { ... }, history: [ ... ] }`
- 文档列表：`{ documents: [ ... ] }`
- 历史记录：`{ history: [ ... ] }`
