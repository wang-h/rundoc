---
title: Quick Start
---

# Quick Start

Install dependencies and build the documentation site.

```bash
npm install
npm run build
npm run dev
```

RunDoc reads Markdown files from `docs/` and generates TypeScript content under `src/content/`.

## Add A Document

Create a Markdown file:

```text
docs/guide/example.md
```

Add it to navigation in:

```text
src/locales/zh-CN.json
```

Then rebuild:

```bash
npm run build
```

## Check Docs

```bash
npm run check:docs
```

The checker validates known routes and internal Markdown links.
