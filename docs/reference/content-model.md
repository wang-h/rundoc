---
title: 内容模型
---

# 内容模型

RunDoc 的数据模型涵盖两大领域：**后端持久化实体**（Project、Document、DocumentHistory）与**变更分析链路**（变更事件、影响映射、文档补丁、生成报告）。

---

## 后端持久化实体

### Project（项目）

文档项目的顶层组织单元。每个项目包含多个文档，支持软删除。

```text
id              # UUID      — 主键
slug_id         # string    — URL 友好标识，由 name 自动生成
name            # string    — 项目名称（必填）
description     # string?   — 项目描述
git_repo_url    # string?   — 关联 Git 仓库地址
workspace_id    # UUID?     — 所属工作空间
org_id          # UUID?     — 所属组织
created_by      # UUID?     — 创建者用户 ID
status          # string    — active | archived
created_at      # string    — ISO 8601
updated_at      # string    — ISO 8601
```

### Document（文档）

项目下的 Markdown 文档节点。通过 `parent_doc_id` 支持树形层级，通过 `position` 分数索引排序。

```text
id              # UUID      — 主键
slug_id         # string?   — URL 友好标识
title           # string    — 文档标题（必填）
content         # text      — Markdown 正文
project_id      # UUID      — FK → projects.id
parent_doc_id   # UUID?     — 自引用 FK → documents.id
position        # string    — 分数索引（如 'a0'）
status          # string    — draft | published | archived
last_updated_by # UUID?     — 最近更新者
created_at      # string    — ISO 8601
updated_at      # string    — ISO 8601
deleted_at      # string?   — 软删除时间戳
```

### DocumentHistory（文档历史）

每次文档更新自动生成的历史快照，记录完整的 `title` 和 `content`。

```text
id              # UUID      — 主键
document_id     # UUID      — FK → documents.id
title           # string    — 快照标题
content         # text      — 快照正文
changed_by      # UUID?     — 变更者
change_summary  # string?   — 变更摘要
created_at      # string    — ISO 8601
```

### 实体关系

```text
┌──────────┐      1:N       ┌──────────┐      1:N       ┌──────────────────┐
│  Project │ ────────────→ │ Document │ ────────────→ │ DocumentHistory   │
└──────────┘                └─────┬────┘                └──────────────────┘
                                  │
                                  │ parent_doc_id (自引用)
                                  ▼
                            ┌──────────┐
                            │ Document │  (子文档)
                            └──────────┘
```

---

## 变更分析链路

RunDoc 的变更分析模型分三层：项目变更、文档目标、补丁产物。

## 1) 变更事件

记录 Git 仓库中一次完整的代码变更。

```text
change_id          # string   — 变更唯一标识，格式 YYYY-MM-DD[-序号]
base_commit        # string   — 上次扫描时的基准提交 SHA
head_commit        # string   — 本次扫描时的 HEAD 提交 SHA
changed_paths[]    # string[] — 变更涉及的文件路径列表
commit_messages[]  # string[] — 本次变更区间内所有提交说明
detected_at        # string   — 变更检测时间，ISO 8601 格式
```

**示例数据：**

```json
{
  "change_id": "2026-05-20",
  "base_commit": "a1b2c3d4",
  "head_commit": "e5f6g7h8",
  "changed_paths": [
    "backend/routes/quotes.py",
    "backend/models/quote.py",
    "frontend/src/views/Quotes.vue"
  ],
  "commit_messages": [
    "feat: add quote generation endpoint",
    "fix: update quote model validation"
  ],
  "detected_at": "2026-05-20T09:30:00Z"
}
```

**验证规则：**

| 字段 | 规则 |
|------|------|
| `change_id` | 必填，格式 `YYYY-MM-DD`，同日多次运行追加 `-2`、`-3` |
| `base_commit` | 必填，40 字符 SHA-1 哈希 |
| `head_commit` | 必填，40 字符 SHA-1 哈希，不得与 `base_commit` 相同 |
| `changed_paths` | 必填，至少包含 1 个路径，每个路径不得超过 1024 字符 |
| `commit_messages` | 必填，至少包含 1 条消息 |
| `detected_at` | 必填，ISO 8601 格式，不得早于 `2025-01-01` |

## 2) 影响映射

将代码变更映射到文档影响域与具体目标文档。

```text
change_id           # string   — 关联的变更事件 ID
impact_domain       # string   — 影响域：product / technical / ai / ops / business / decisions
reason              # string   — 影响判定依据，人类可读说明
target_docs[]       # string[] — 应被更新的目标文档路径
confidence          # float    — 置信度 0.0-1.0，低于 0.6 标记为低置信
needs_human_review  # boolean  — 是否需要人工审核
```

**示例数据：**

```json
{
  "change_id": "2026-05-20",
  "impact_domain": "technical",
  "reason": "quotes API 路由和模型变更，需要同步 API 文档",
  "target_docs": [
    "docs/03-technical/api-routes.md",
    "docs/03-technical/data-models.md"
  ],
  "confidence": 0.89,
  "needs_human_review": false
}
```

**验证规则：**

| 字段 | 规则 |
|------|------|
| `change_id` | 必填，必须对应已存在的变更事件 |
| `impact_domain` | 必填，必须为六个预定义域之一 |
| `reason` | 必填，长度 10-500 字符 |
| `target_docs` | 必填，至少包含 1 个路径，路径必须以 `docs/` 开头 |
| `confidence` | 必填，范围 0.0-1.0，保留两位小数 |
| `needs_human_review` | 必填，`confidence < 0.6` 时自动设为 `true` |

## 3) 文档补丁

对目标 Markdown 文档生成的最小变更补丁。

```text
doc_path       # string — 目标文档路径
patch_type     # string — 补丁类型：update / create / conflict
summary        # string — 补丁变更的人类可读摘要
diff_preview   # string — 统一 diff 格式的变更预览
applied        # bool   — 补丁是否已被应用
```

**示例数据：**

```json
{
  "doc_path": "docs/03-technical/api-routes.md",
  "patch_type": "update",
  "summary": "新增 GET /api/quotes 和 POST /api/quotes 路由说明",
  "diff_preview": "@@ -45,6 +45,12 @@\n \n+## GET /api/quotes\n+\n+返回报价列表，支持分页和筛选。\n+...",
  "applied": false
}
```

**验证规则：**

| 字段 | 规则 |
|------|------|
| `doc_path` | 必填，路径必须以 `docs/` 开头，以 `.md` 结尾 |
| `patch_type` | 必填，必须为 `update` / `create` / `conflict` |
| `summary` | 必填，长度 10-200 字符 |
| `diff_preview` | 必填，非空字符串 |
| `applied` | 必填，默认 `false` |

## 4) 生成报告

单次扫描运行的汇总产物，记录所有变更、影响和补丁的完整链路。

```text
run_id           # string   — 运行唯一标识
report_path      # string   — 报告文件路径
affected_docs[]  # string[] — 所有受影响的文档路径
conflicts[]      # string[] — 冲突列表，每条描述冲突原因
followups[]      # string[] — 人工后续需要处理的待办事项
```

**示例数据：**

```json
{
  "run_id": "2026-05-20",
  "report_path": ".rundoc/reports/2026-05-20-run.md",
  "affected_docs": [
    "docs/03-technical/api-routes.md",
    "docs/03-technical/data-models.md"
  ],
  "conflicts": [],
  "followups": [
    "新模型 Quote 缺少字段级别文档注释，建议开发者补充",
    "前端 Quotes.vue 页面变更未影响文档，但可能需要更新截屏"
  ]
}
```

**验证规则：**

| 字段 | 规则 |
|------|------|
| `run_id` | 必填，格式 `YYYY-MM-DD[-序号]` |
| `report_path` | 必填，路径必须以 `.rundoc/reports/` 开头 |
| `affected_docs` | 至少包含 1 个文档路径 |
| `conflicts` | 可选，空数组表示无冲突 |
| `followups` | 每个条目长度不超过 500 字符 |

## 5) 站点渲染模型（已有）

已实现的渲染层数据模型，用于文档站 UI 和搜索。

```text
doc_id        # string   — 文档唯一标识，即源文件路径
path          # string   — 站点 URL 路径
title         # string   — 文档标题
section       # string   — 文档所属分区
tags[]        # string[] — 分类标签
summary       # string   — 文档摘要
headings[]    # string[] — 所有标题文本列表
chunks[]      # object[] — 文档分块（按标题拆分）
links[]       # object[] — 文档内部和交叉引用链接
updated_at    # string   — 最后更新时间
source_hash   # string   — 源文件内容哈希
```

## 模型关系图

```text
┌─────────────┐      1:N       ┌─────────────┐
│  变更事件    │ ────────────→ │  影响映射    │
│  ChangeEvent│                │  ImpactMap  │
└─────────────┘                └──────┬──────┘
                                      │ 1:N
                                      ▼
┌─────────────┐      N:1       ┌─────────────┐
│  生成报告    │ ←──────────── │  文档补丁    │
│  RunReport  │                │  DocPatch   │
└─────────────┘                └─────────────┘
```

**关系说明：**

- 一次**变更事件**可触发多条**影响映射**（一个文件改动可能影响多个文档域）
- 每条**影响映射**可生成多条**文档补丁**（一个影响域可能影响多篇目标文档）
- 一次 **RunDoc 运行**汇总所有补丁和影响，产出**生成报告**
- **站点渲染模型**独立于此链路，只关心当前的 `docs/` 文件内容和元信息，不感知变更历史

## 设计理念

三层模型的拆分基于以下考虑：

1. **关注点分离**：Git 变更检测、影响分析、补丁生成是三个独立的决策阶段。每个阶段可以独立迭代和替换实现（例如影响分析从规则引擎升级为 LLM 推理），而不影响上下游。

2. **可追溯性**：每个补丁都通过影响映射追溯到具体的变更提交，审阅者可以沿着 `ChangeEvent → ImpactMap → DocPatch` 链路理解"为什么这篇文档被修改了"。

3. **人工卡点**：`needs_human_review` 和 `applied` 标志在影响映射和补丁两个层级分别设置审批卡点。低置信影响需人工确认后才会生成补丁，补丁生成后也需人工审核才会标记为已应用。

4. **与渲染解耦**：渲染模型（第 5 层）是一个只读快照，关心"文档站现在长什么样"；变更模型（第 1-4 层）关心"文档站应该如何演化"。两者通过文件系统（`docs/` 目录）桥接，而非 API 耦合。
