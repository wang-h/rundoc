---
title: API Contract
---

# API Contract

RunDoc should expose AI-readable document interfaces.

The first repository version is static, but the API contract is documented early to keep system direction clear.

## Planned Endpoints

```text
GET /api/docs/tree
GET /api/docs/doc/:id
GET /api/docs/search?q=
GET /api/docs/context?path=
GET /api/docs/related?path=
POST /api/docs/reindex
POST /api/rundoc/scan
POST /api/rundoc/write
POST /api/rundoc/check
POST /api/rundoc/commit
```

## RunDoc Engine Response Shape

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
