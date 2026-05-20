# RunDoc

RunDoc 是一个**项目变更驱动**的 Markdown 文档维护系统。  
它的目标很明确：**项目一变，文档就变。**

## What RunDoc Is

RunDoc 不是 inbox，不依赖“人工先整理资料再汇总”。  
RunDoc 绑定仓库状态，按固定引擎执行文档更新：

```text
Detect -> Understand -> Map -> Patch -> Commit
```

1. **Detect**: 读取 `git diff` / commit / docs 变化  
2. **Understand**: 判断影响域（product / technical / ai / ops / ...）  
3. **Map**: 映射到目标文档  
4. **Patch**: 生成最小 Markdown 变更  
5. **Commit**: 输出可审核提交（后续可接 MR）

## Repository Layout

```text
docs/                         # 正式文档（唯一事实源）
  00-positioning/
  01-product/
  02-business/
  03-technical/
  04-ai/
  05-decisions/
  06-ops/
  07-archive/

.rundoc/                      # RunDoc 运行目录
  config.yml                  # 规则配置
  prompts/                    # 执行提示模板
  state/                      # last_commit / last_scan / doc_index
  reports/                    # 每次扫描报告

scripts/rundoc.mjs            # RunDoc CLI (MVP)
```

## Current Capabilities (MVP)

- `scan`: 从 `last_commit..HEAD` 生成变更影响报告  
- `task`: 生成给 Codex/Claude 的标准执行任务  
- `check`: 校验 RunDoc 必要结构是否完整  
- `advance`: 将当前 HEAD 标记为新的扫描基线
- `init --rebuild`: 将旧 `docs/` 备份到 `docs_legacy/` 后重建标准文档骨架

## Quick Start

### 1) Install

```bash
npm install
```

### 2) Run RunDoc Engine

```bash
node scripts/rundoc.mjs init
node scripts/rundoc.mjs check
node scripts/rundoc.mjs scan
node scripts/rundoc.mjs task
```

如果是历史项目首轮迁移：

```bash
node scripts/rundoc.mjs init --rebuild
```

这会把现有 `docs/` 移动到 `docs_legacy/YYYY-MM-DD/`，并重建标准 `docs/00~07`。

扫描结果会写入：

```text
.rundoc/reports/YYYY-MM-DD-run.md
.rundoc/reports/YYYY-MM-DD-task.md
```

### 3) Run Docs UI (React + Vite)

```bash
npm run dev
```

## Configuration (YAML + .env)

RunDoc uses two layers:

1. `.rundoc/config.yml` for project policy  
2. `.env` for environment overrides

Key fields:

```yaml
project:
  default_locale: zh-CN

schedule:
  cadence: daily
  run_at: "09:00"
  timezone: "Asia/Shanghai"
```

Environment override examples:

```bash
RUNDOC_DEFAULT_LOCALE=zh-CN
RUNDOC_SCHEDULE_CADENCE=daily
RUNDOC_SCHEDULE_RUN_AT=09:00
RUNDOC_SCHEDULE_TIMEZONE=Asia/Shanghai
```

Inspect effective runtime config:

```bash
npm run rundoc:config
```

## Agent Files vs Tasks

推荐使用“稳定协议 + 每次任务”模式：

- 稳定协议：`.rundoc/agents/AGENT.md`、`.rundoc/agents/CLAUDE.md`
- 每次任务：`.rundoc/reports/*-task.md`

协议文件定义长期行为约束；任务文件定义本次变更范围。

## Automation Pattern

推荐将 RunDoc 挂到定时任务或 CI：

- 每日定时：`check -> scan -> task`
- MR 合并后：`scan --advance`
- 人工审核后再执行文档提交

## Status

当前版本提供：

- 项目变更扫描与影响报告
- 标准化任务提示生成
- 文档站浏览能力（导航/搜索/TOC）

后续版本将补齐：

- `write`（自动补丁）
- `commit`（自动分支/提交）
- GitLab MR 集成与文档一致性门禁
