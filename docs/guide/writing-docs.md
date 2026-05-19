---
title: Writing Docs
---

# Writing Docs

Write documents in plain Markdown.

Use a single `#` heading for the page title. Use frontmatter when the navigation or search title should differ from the visible heading.

```md
---
title: Pricing Rules
---

# Pricing Rules
```

## Good Team Documents

Good RunDoc documents should be:

- Sourceable: every rule has a clear owner or origin.
- Addressable: each document has a stable path.
- Chunkable: headings divide content into useful sections.
- Actionable: explain what someone should do, not only what exists.
- AI-readable: avoid vague references such as "this", "that", or "above" when a named concept is clearer.

## Markdown Links

Prefer relative links between documents:

```md
[Architecture](../architecture.md)
```

RunDoc resolves internal Markdown links into documentation routes.
