---
title: Content Model
---

# Content Model

RunDoc documents should compile into a structured model.

```text
doc_id
path
title
section
tags
summary
headings
chunks
links
updated_at
source_hash
```

## Why This Matters

The content model is the shared contract between:

- the Markdown authoring workflow
- the rendered documentation site
- search
- future AI retrieval
- future validation jobs

If this model stays stable, teams can evolve the UI and API without changing how documents are written.
