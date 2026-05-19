# RunDoc

AI-native Markdown docs for running teams.

RunDoc turns Markdown repositories into structured, searchable, AI-readable documentation systems. It is built for teams that need docs to stay useful while products, codebases, and decisions keep changing.

## What It Is

RunDoc is not a CMS and not a docsify wrapper. It keeps Markdown as the source of truth, then builds a React documentation system with navigation, search metadata, table of contents, previous/next links, and a future-facing AI context layer.

## Core Ideas

- Humans write Markdown.
- Git tracks every documentation decision.
- The app renders a clean documentation site.
- Build scripts generate document content and search indexes.
- AI agents get stable document IDs, paths, headings, summaries, and future API contracts.

## Development

```bash
npm install
npm run build
npm run dev
```

## Project Layout

```text
docs/                  Markdown source
scripts/build-docs.mjs Build Markdown into src/content
src/content/           Generated content and search index
src/components/        Header, Sidebar, TOC
src/pages/             Home and document pages
```

## AI Interface Direction

RunDoc is designed to expose stable interfaces such as:

```text
GET /api/docs/tree
GET /api/docs/doc/:id
GET /api/docs/search?q=
GET /api/docs/context?path=
GET /api/docs/related?path=
POST /api/docs/reindex
```

The first version is a static React app. The API layer is documented first so downstream teams and agents can build against a stable model.
