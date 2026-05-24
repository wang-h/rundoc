# RunDoc

<p align="center">
  <img src="https://raw.githubusercontent.com/wang-h/rundoc/main/public/favicon.svg" width="80" alt="RunDoc" />
</p>

<p align="center"><strong>面向高速运转团队的 AI-native Markdown 文档系统。</strong></p>

<p align="center">
  <a href="https://github.com/wang-h/rundoc"><img src="https://img.shields.io/badge/version-0.1.0-blue?style=for-the-badge" alt="Version" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Proprietary-red?style=for-the-badge" alt="License" /></a>
  <img src="https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5-646cff?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/AI_Native-8b5cf6?style=for-the-badge" alt="AI-Native" />
</p>

RunDoc 让文档跟随项目一起运行。它读取仓库状态，理解项目变化，将变化映射到正确的 Markdown 文件，并生成可审核的文档更新任务。

```text
Detect -> Understand -> Map -> Patch -> Commit
```

## RunOS 中的定位

RunDoc 是 RunOS 的正式知识资产引擎，解决“正式知识如何保持新鲜”。

```text
RunID 解决“谁”
RunLoop 解决“做什么、怎么推进”
RunDoc 解决“正式知识如何保持新鲜”
RunMind 解决“组织如何记住”
RunAgent 解决“AI 如何成为组织成员”
```

RunDoc 不记录普通工作汇报，也不替代 RunMind。它承载已经沉淀、可长期引用、需要版本和负责人维护的正式内容，例如产品文档、技术文档、接口说明、SOP、制度、架构说明和决策文档。

腾讯生态相关的稳定规范也属于 RunDoc：企业微信通道 SOP、小程序架构、微信支付流程、腾讯云资源访问规范等，应沉淀为正式知识资产。

详细边界见：

- [RunDoc in RunOS](./docs/00-positioning/runos-document-engine.md)

## 为什么需要 RunDoc

大多数文档系统解决的是"怎么展示文档"。真实团队更难的问题是：产品和代码每天都在变，文档很快就过期。

RunDoc 把文档视为团队运行系统的一部分：

- Markdown 仍然是唯一事实源。
- Git 负责审核、历史和协作。
- AI 读取结构化上下文，而不是猜网页内容。
- 每次文档更新都应该能追溯到项目变化。
- 优先更新已有文档，而不是制造孤立总结。

## 产品形态

RunDoc 分为两层。

### 1. 文档引擎

引擎是 AI-native 的核心。

```text
Git / Repo State
  -> Detect changed files and commits
  -> Understand impacted domains
  -> Map changes to docs
  -> Patch Markdown
  -> Commit or prepare review
```

### 2. 文档站 UI

UI 是一个基于 React + Vite 的文档站，用于阅读 `docs/`。

包含：

- 左侧导航
- 搜索元数据
- 页面目录
- 上一篇 / 下一篇
- Markdown 渲染
- 面向 AI 的文档结构

## 仓库结构

```text
docs/                         正式文档唯一事实源
  00-positioning/             定位与产品主张
  01-product/                 产品页面与行为
  02-business/                业务流程与角色
  03-technical/               API、数据结构、架构、运行时
  04-ai/                      AI 上下文、变更地图、验收清单
  05-decisions/               决策记录
  06-ops/                     部署与运维
  07-archive/                 历史或失效文档

.rundoc/                      RunDoc 运行目录
  config.yml                  项目策略与计划配置
  prompts/                    稳定提示词模板
  agents/                     Codex / Claude agent 协议
  state/                      last_commit、last_scan、doc_index
  reports/                    扫描报告与任务文件

scripts/rundoc.mjs            RunDoc CLI
src/                          React 文档站 UI
```

## CLI

RunDoc 可以通过 npm scripts 使用，也可以本地 link 成 CLI。

```bash
npm install
npm link
rundoc config
rundoc check
rundoc scan
rundoc task
```

等价 npm scripts：

```bash
npm run rundoc:config
npm run rundoc:check
npm run rundoc:scan
npm run rundoc:task
```

### 命令

| 命令 | 用途 |
| --- | --- |
| `rundoc init` | 初始化 `.rundoc/` 与标准 docs 结构 |
| `rundoc init --rebuild` | 将旧 `docs/` 移到 `docs_legacy/` 并重建标准骨架 |
| `rundoc check` | 校验 RunDoc 必需结构 |
| `rundoc config` | 输出 YAML + `.env` 后的有效配置 |
| `rundoc scan` | 分析 `last_commit..HEAD` 并生成影响报告 |
| `rundoc task` | 根据最新扫描报告生成 agent 任务 |
| `rundoc advance` | 将当前 `HEAD` 标记为新的扫描基线 |

## 快速开始

```bash
npm install
npm run rundoc:init
npm run rundoc:check
npm run rundoc:scan
npm run rundoc:task
```

启动文档站：

```bash
npm run dev
```

构建文档站：

```bash
npm run build
npm run check:docs
```

## 配置

RunDoc 使用 `.rundoc/config.yml` 保存项目策略，使用 `.env` 保存本地覆盖。

```yaml
project:
  name: RunDoc
  docs_root: docs
  default_locale: zh-CN

schedule:
  cadence: daily
  run_at: "09:00"
  timezone: "Asia/Shanghai"
```

环境变量覆盖：

```bash
RUNDOC_DEFAULT_LOCALE=zh-CN
RUNDOC_SCHEDULE_CADENCE=daily
RUNDOC_SCHEDULE_RUN_AT=09:00
RUNDOC_SCHEDULE_TIMEZONE=Asia/Shanghai
```

## Agent 协议

RunDoc 推荐"稳定协议 + 单次任务"的模式。

稳定协议：

```text
.rundoc/agents/AGENT.md
.rundoc/agents/CLAUDE.md
```

单次任务：

```text
.rundoc/reports/YYYY-MM-DD-task.md
```

协议文件定义长期行为边界；任务文件只描述本次项目变化范围。

## AI-native 方向

RunDoc 会为 AI 系统暴露结构化上下文。

计划接口：

```text
GET /api/docs/tree
GET /api/docs/doc/:id
GET /api/docs/search?q=
GET /api/docs/context?path=
GET /api/docs/related?path=
POST /api/rundoc/scan
POST /api/rundoc/write
POST /api/rundoc/check
POST /api/rundoc/commit
```

长期文档模型：

```text
doc_id
path
title
section
summary
headings
chunks
links
updated_at
source_hash
```

## 状态

当前 MVP：

- React + Vite 文档站 UI
- Markdown 内容构建流程
- 搜索索引生成
- 文档结构校验
- RunDoc CLI 骨架
- 扫描报告生成
- agent 任务生成
- AI agent 协议文件

下一步：

- 自动 Markdown patch
- 分支 / 提交自动化
- GitLab MR 集成
- 文档新鲜度检查
- 结构化 AI context API

## License

[Proprietary](LICENSE). This project is proprietary and confidential to Shanghai RUZHI Information Technology Co., Ltd.

---

# English

<p align="center">
  <img src="https://raw.githubusercontent.com/wang-h/rundoc/main/public/favicon.svg" width="80" alt="RunDoc" />
</p>

<p align="center"><strong>AI-native Markdown docs for running teams.</strong></p>

<p align="center">
  <a href="https://github.com/wang-h/rundoc"><img src="https://img.shields.io/badge/version-0.1.0-blue?style=for-the-badge" alt="Version" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Proprietary-red?style=for-the-badge" alt="License" /></a>
  <img src="https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5-646cff?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/AI_Native-8b5cf6?style=for-the-badge" alt="AI-Native" />
</p>

RunDoc keeps documentation close to the work that changes it. It watches repository state, understands what changed, maps those changes to the right Markdown files, and prepares reviewable documentation updates.

```text
Detect -> Understand -> Map -> Patch -> Commit
```

## Why RunDoc

Most documentation systems solve publishing. Running teams have a harder problem: documentation decays as the product changes.

RunDoc treats documentation as an operational system:

- Markdown remains the source of truth.
- Git remains the review and history layer.
- AI agents receive structured context instead of scraping pages.
- Every update should be traceable to project changes.
- Existing docs are patched before new summaries are generated.

## Product Shape

RunDoc has two layers.

### 1. Documentation Engine

The engine is the AI-native core.

```text
Git / Repo State
  -> Detect changed files and commits
  -> Understand impacted domains
  -> Map changes to docs
  -> Patch Markdown
  -> Commit or prepare review
```

### 2. Documentation UI

The UI is a clean React + Vite docs site for reading `docs/`.

It includes:

- sidebar navigation
- full-text search metadata
- page table of contents
- previous/next navigation
- Markdown rendering
- AI-oriented document structure

## Repository Layout

```text
docs/                         Official documentation source
  00-positioning/             Positioning and product thesis
  01-product/                 Product pages and behavior
  02-business/                Business process and roles
  03-technical/               API, schema, architecture, runtime
  04-ai/                      AI context, change maps, acceptance checks
  05-decisions/               Decision records
  06-ops/                     Deployment and operations
  07-archive/                 Deprecated or historical docs

.rundoc/                      RunDoc runtime workspace
  config.yml                  Project policy and schedule
  prompts/                    Stable prompts for documentation tasks
  agents/                     Agent protocols for Codex / Claude
  state/                      last_commit, last_scan, doc_index
  reports/                    Scan and task reports

scripts/rundoc.mjs            RunDoc CLI
src/                          React documentation UI
```

## CLI

RunDoc can run through npm scripts or as a linked CLI.

```bash
npm install
npm link
rundoc config
rundoc check
rundoc scan
rundoc task
```

Equivalent npm scripts:

```bash
npm run rundoc:config
npm run rundoc:check
npm run rundoc:scan
npm run rundoc:task
```

### Commands

| Command | Purpose |
| --- | --- |
| `rundoc init` | Initialize `.rundoc/` and standard docs structure |
| `rundoc init --rebuild` | Move existing `docs/` into `docs_legacy/` and rebuild the standard skeleton |
| `rundoc check` | Validate required RunDoc structure |
| `rundoc config` | Print effective YAML + `.env` configuration |
| `rundoc scan` | Analyze `last_commit..HEAD` and create an impact report |
| `rundoc task` | Generate an agent task from the latest scan report |
| `rundoc advance` | Mark current `HEAD` as the new scan baseline |

## Quick Start

```bash
npm install
npm run rundoc:init
npm run rundoc:check
npm run rundoc:scan
npm run rundoc:task
```

Run the docs UI:

```bash
npm run dev
```

Build the site:

```bash
npm run build
npm run check:docs
```

## Configuration

RunDoc uses `.rundoc/config.yml` for project policy and `.env` for local overrides.

```yaml
project:
  name: RunDoc
  docs_root: docs
  default_locale: zh-CN

schedule:
  cadence: daily
  run_at: "09:00"
  timezone: "Asia/Shanghai"
```

Environment overrides:

```bash
RUNDOC_DEFAULT_LOCALE=zh-CN
RUNDOC_SCHEDULE_CADENCE=daily
RUNDOC_SCHEDULE_RUN_AT=09:00
RUNDOC_SCHEDULE_TIMEZONE=Asia/Shanghai
```

## Agent Protocol

RunDoc uses a stable-protocol plus per-run-task model.

Stable protocols:

```text
.rundoc/agents/AGENT.md
.rundoc/agents/CLAUDE.md
```

Per-run task files:

```text
.rundoc/reports/YYYY-MM-DD-task.md
```

This keeps long-term agent behavior stable while each run remains scoped to the current project changes.

## AI-native Direction

RunDoc is designed to expose structured context for AI systems.

Planned interfaces:

```text
GET /api/docs/tree
GET /api/docs/doc/:id
GET /api/docs/search?q=
GET /api/docs/context?path=
GET /api/docs/related?path=
POST /api/rundoc/scan
POST /api/rundoc/write
POST /api/rundoc/check
POST /api/rundoc/commit
```

The long-term contract is a document model that AI can rely on:

```text
doc_id
path
title
section
summary
headings
chunks
links
updated_at
source_hash
```

## Status

Current MVP:

- React + Vite documentation UI
- Markdown content build pipeline
- search index generation
- docs structure validation
- RunDoc CLI skeleton
- scan report generation
- agent task generation
- AI agent protocol files

Next:

- automatic Markdown patching
- branch / commit automation
- GitLab MR integration
- document freshness checks
- structured AI context API

## License

[Proprietary](LICENSE). This project is proprietary and confidential to Shanghai RUZHI Information Technology Co., Ltd.
