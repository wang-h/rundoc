---
title: Navigation
---

# Navigation

RunDoc navigation is currently configured in `src/locales/zh-CN.json`.

Each navigation section has a title and a list of items.

```json
{
  "title": "AI-native",
  "items": [
    { "title": "API Contract", "path": "/docs/ai/api-contract", "label": "API" }
  ]
}
```

## Route Rules

Markdown files map to routes by path:

```text
docs/overview.md -> /docs/overview
docs/ai/api-contract.md -> /docs/ai/api-contract
```

The home route `/` is reserved for the landing page.
