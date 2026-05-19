---
title: Architecture
---

# Architecture

RunDoc uses a small static build pipeline.

```text
docs/**/*.md
  -> scripts/build-docs.mjs
  -> src/content/docs-content.ts
  -> src/content/search-index.json
  -> React documentation app
```

## Source Layer

Markdown files are the source of truth. Frontmatter may define document metadata such as `title`.

## Build Layer

The build script scans Markdown files, extracts headings, creates route keys, and generates a search index.

## App Layer

The React app renders:

- Home page
- Documentation layout
- Sidebar
- Header search
- Markdown body
- Page table of contents
- Previous and next navigation

## AI Layer

The planned AI layer should consume the same document graph generated at build time. It should not scrape rendered HTML.
