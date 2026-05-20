---
title: API 约定
---

# API 约定

RunDoc 应该暴露适合 AI 读取的文档接口。

当前仓库版本仍是静态站点，但提前记录 API 约定可以保证系统方向清晰。

## 计划接口

```text
GET  /api/docs/tree
GET  /api/docs/doc/:id
GET  /api/docs/search?q=
GET  /api/docs/context?path=
GET  /api/docs/related?path=
POST /api/docs/reindex
POST /api/rundoc/scan
POST /api/rundoc/write
POST /api/rundoc/check
POST /api/rundoc/commit
```

## 接口详细说明

### GET /api/docs/tree

获取完整文档树结构，返回所有已发布文档的层级关系。AI 代理可用此接口了解整个文档站的结构，决定需要读取哪些文档。

**使用场景：**
- AI 代理初次了解项目文档骨架
- 构建文档导航与站点地图
- 发现特定领域的文档分组

**预期响应：**

```json
{
  "sections": [
    {
      "id": "docs/00-positioning",
      "title": "产品定位",
      "docs": [
        { "id": "docs/00-positioning/overview.md", "title": "概述", "path": "/docs/00-positioning/overview" }
      ]
    },
    {
      "id": "docs/03-technical",
      "title": "技术文档",
      "docs": [
        { "id": "docs/03-technical/api-routes.md", "title": "API 路由", "path": "/docs/03-technical/api-routes" }
      ]
    }
  ]
}
```

### GET /api/docs/doc/:id

获取单篇文档的完整内容，包含正文、标题结构、元信息、关联链接及分块数据。

**使用场景：**
- 获取具体文档用于 AI 阅读或呈现
- 根据变更影响结果定位目标文档
- 文档站页面渲染

**预期响应：** 见下方 [文档响应结构](#文档响应结构) 章节。

### GET /api/docs/search?q=

在文档全文中执行搜索，返回匹配文档片段及相关性评分。

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| `q` | string | 搜索关键词（必填） |
| `section` | string | 限定搜索域（可选） |
| `limit` | int | 返回条数上限，默认 10 |

**预期响应：**

```json
{
  "query": "API 路由",
  "results": [
    {
      "docId": "docs/03-technical/api-routes.md",
      "heading": "用户接口",
      "snippet": "...GET /api/users 返回用户列表...",
      "score": 0.92
    }
  ],
  "total": 5
}
```

### GET /api/docs/context?path=

根据文件路径查找相关文档上下文。输入一个源码路径，返回与之关联的文档片段。

**使用场景：**
- 开发者想知道某段代码是否有对应文档
- AI 代码审查时自动关联相关文档
- 变更感知流程中反向查找文档目标

**预期响应：** 见下方 [上下文响应结构](#上下文响应结构) 章节。

### GET /api/docs/related?path=

查找与指定文档路径语义相关的其他文档，用于辅助 AI 理解文档间关联。

**预期响应：**

```json
{
  "sourceDoc": "docs/03-technical/api-routes.md",
  "related": [
    {
      "docId": "docs/02-business/process-notes.md",
      "relation": "业务流程依赖此 API",
      "score": 0.85
    }
  ]
}
```

### POST /api/docs/reindex

触发全量重新索引，重新扫描所有 Markdown 文件、重新生成搜索索引与哈希缓存。

**请求体（可选）：**

```json
{ "full": true }
```

**预期响应：**

```json
{
  "indexed": 42,
  "durationMs": 1230,
  "indexHash": "sha256:..."
}
```

### POST /api/rundoc/scan

触发一次项目变更扫描，分析 `last_commit..HEAD` 的差异并生成影响报告。

**请求体（可选）：**

```json
{
  "baseRef": "main",
  "headRef": "HEAD",
  "paths": ["backend/", "docs/"]
}
```

**预期响应：** 见下方 [RunDoc 引擎响应结构](#rundoc-引擎响应结构) 章节。

### POST /api/rundoc/write

根据最近一次扫描结果，对受影响目标文档生成 Markdown 补丁。此接口为"干运行"（dry-run），不直接写入文件。

**预期响应：**

```json
{
  "runId": "2026-05-20",
  "patches": [
    {
      "docPath": "docs/03-technical/api-routes.md",
      "patchType": "update",
      "summary": "新增 /api/quotes 路由说明",
      "diffPreview": "+## GET /api/quotes\n+返回报价列表..."
    }
  ]
}
```

### POST /api/rundoc/check

验证当前文档站的一致性：检查死链接、过期引用、缺失交叉引用、哈希不匹配等问题。

**预期响应：**

```json
{
  "issues": [
    {
      "severity": "warning",
      "docPath": "docs/03-technical/api-routes.md",
      "message": "引用的源码路径 backend/routes/old.py 已不存在",
      "suggestion": "请更新或归档此引用"
    }
  ],
  "summary": {
    "errors": 0,
    "warnings": 2,
    "info": 5
  }
}
```

### POST /api/rundoc/commit

将已审核通过的文档补丁提交为新的 Git 分支，生成可审阅的 PR 描述和变更摘要。

**预期响应：**

```json
{
  "branchName": "rundoc/2026-05-20-sync",
  "commitSha": "e7f8g9h",
  "prTitle": "docs: 同步 2026-05-20 项目变更",
  "affectedDocs": ["docs/03-technical/api-routes.md"],
  "reportPath": ".rundoc/reports/2026-05-20-run.md"
}
```

## RunDoc 引擎响应结构

扫描操作返回的完整响应结构，每个字段的详细说明：

```json
{
  "runId": "2026-05-20",
  "baseCommit": "a1b2c3d",
  "headCommit": "d4e5f6g",
  "changes": [
    {
      "path": "backend/routes/quotes.py",
      "type": "modified"
    }
  ],
  "impacts": [
    {
      "domain": "technical",
      "reason": "quotes API route changed",
      "targetDocs": [
        "docs/03-technical/api-routes.md"
      ],
      "confidence": 0.89
    }
  ],
  "conflicts": []
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `runId` | string | 本次运行的唯一标识，格式 `YYYY-MM-DD`，同一天多次运行会追加序号 |
| `baseCommit` | string | 上次扫描的基准提交 SHA，即 `last_commit` |
| `headCommit` | string | 当前 `HEAD` 的提交 SHA |
| `changes[]` | array | 检测到的文件变更列表 |
| `changes[].path` | string | 相对于仓库根目录的变更文件路径 |
| `changes[].type` | string | 变更类型：`added` / `modified` / `deleted` / `renamed` |
| `impacts[]` | array | 影响分析结果列表 |
| `impacts[].domain` | string | 影响域：`product` / `technical` / `ai` / `ops` / `business` / `decisions` |
| `impacts[].reason` | string | 影响判定依据，人类可读的原因说明 |
| `impacts[].targetDocs[]` | array | 应被更新的目标文档路径列表 |
| `impacts[].confidence` | float | 影响判定置信度（0.0-1.0），低于 `0.6` 通常需要人工确认 |
| `conflicts[]` | array | 冲突列表，空数组表示无冲突 |

## 文档响应结构

```json
{
  "id": "docs/ai/api-contract.md",
  "path": "/docs/ai/api-contract",
  "title": "API 约定",
  "section": "AI-native",
  "headings": ["计划接口", "文档响应结构"],
  "summary": "RunDoc 应该暴露适合 AI 读取的文档接口。",
  "sourceHash": "sha256:...",
  "updatedAt": "2026-05-20T00:00:00Z"
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 文档唯一标识，即其相对于仓库根目录的 Markdown 文件路径 |
| `path` | string | 文档在站点中的 URL 路径，去掉 `.md` 后缀 |
| `title` | string | 文档标题，取自 Markdown 第一个 `#` 标题，用于页面展示和搜索排序 |
| `section` | string | 文档所属分区名称，用于导航分组和权限控制 |
| `headings[]` | array | 文档内所有二级标题列表，用于快速跳转和 AI 定位 |
| `summary` | string | 文章开头的一段概要文字，AI 可用此判断是否需要读取全文 |
| `sourceHash` | string | 源文件内容的 SHA-256 哈希，用于检测文档是否过期或需要重新索引 |
| `updatedAt` | string | 文档最后更新时间，ISO 8601 格式，由 Git 提交记录或构建时自动生成 |

## 上下文响应结构

```json
{
  "doc": {},
  "chunks": [
    {
      "id": "docs/ai/api-contract.md#planned-endpoints",
      "heading": "Planned Endpoints",
      "text": "GET /api/docs/tree..."
    }
  ],
  "links": []
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `doc` | object | 关联文档的元信息（与文档响应结构一致，但不包含完整正文） |
| `chunks[]` | array | 与请求路径语义相关的文档片段列表 |
| `chunks[].id` | string | 片段唯一标识，格式 `文档路径#锚点`，可直接定位 |
| `chunks[].heading` | string | 片段所属的标题文本 |
| `chunks[].text` | string | 片段正文内容，长度控制在 200-500 字符，适合直接注入 AI 上下文 |
| `links[]` | array | 与请求路径相关的交叉引用链接列表，包含目标文档路径和锚点 |

## 错误响应

所有 API 错误返回统一结构：

```json
{
  "error": {
    "code": "DOC_NOT_FOUND",
    "message": "文档 docs/nonexistent.md 不存在",
    "details": {
      "docId": "docs/nonexistent.md",
      "suggestion": "请检查文档路径，或使用 GET /api/docs/tree 查看可用文档列表"
    }
  }
}
```

**标准错误码：**

| 错误码 | HTTP 状态码 | 说明 |
|------|------------|------|
| `DOC_NOT_FOUND` | 404 | 请求的文档 ID 不存在 |
| `INVALID_PARAM` | 400 | 请求参数格式或取值不合法 |
| `REINDEX_IN_PROGRESS` | 409 | 已有索引任务正在执行，拒绝重复请求 |
| `SCAN_NOT_READY` | 409 | 无可用扫描结果，需先调用 `/api/rundoc/scan` |
| `MERGE_CONFLICT` | 409 | 生成补丁时检测到合并冲突，需人工介入 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误，返回 `requestId` 用于排查 |

## 认证与访问控制

当前计划阶段的认证模式：

- **内部集成方式**：API 部署于团队内部网络，不直接暴露公网。使用共享的 API Token（通过环境变量 `RUNDOC_API_TOKEN` 配置）进行服务间认证。
- **Token 传递**：所有请求通过 `Authorization: Bearer <token>` 头传递认证令牌。
- **读写分离**：计划支持两种 Token 级别：
  - `read`：仅允许 GET 请求，适用于 AI 代理和文档浏览器
  - `write`：允许 POST 请求（scan / write / check / commit），适用于 CI/CD 流水线
- **未来规划**：考虑与 GitLab / GitHub OAuth 集成，利用平台已有的身份认证体系。同时支持按文档分区（section）设置只读或隐藏访问。

**示例请求头：**

```http
GET /api/docs/doc/docs/ai/api-contract.md
Authorization: Bearer rundoc_token_xxxx
Accept: application/json
```
