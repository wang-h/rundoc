---
title: API Contract
---

# API Contract

RunDoc should expose AI-readable document interfaces.

The first repository version is static, but the API contract is documented early to keep the system direction clear.

## Planned Endpoints

```text
GET /api/docs/tree
GET /api/docs/doc/:id
GET /api/docs/search?q=
GET /api/docs/context?path=
GET /api/docs/related?path=
POST /api/docs/reindex
```

## Document Response Shape

```json
{
  "id": "docs/ai/api-contract.md",
  "path": "/docs/ai/api-contract",
  "title": "API Contract",
  "section": "AI-native",
  "headings": ["Planned Endpoints", "Document Response Shape"],
  "summary": "RunDoc should expose AI-readable document interfaces.",
  "sourceHash": "sha256:...",
  "updatedAt": "2026-05-20T00:00:00Z"
}
```

## Context Response Shape

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
