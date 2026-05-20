# RunDoc

**AI-native Markdown docs for running teams.**

[中文文档](./README.zh-CN.md) · [GitHub Pages](https://wang-h.github.io/rundoc/)

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
VITE_DEFAULT_LOCALE=zh-CN
VITE_I18N_MODE=locked
```

UI language mode:

- `VITE_I18N_MODE=locked`: fixed team language, no switch button
- `VITE_I18N_MODE=switchable`: show language switch, persist user choice
- `VITE_I18N_MODE=auto`: detect browser language first, then persist user choice

GitHub Pages deployment uses bilingual UI by default:

- `VITE_DEFAULT_LOCALE=zh-CN`
- `VITE_I18N_MODE=switchable`

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

TBD.
