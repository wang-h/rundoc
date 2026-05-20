# Contributing to RunDoc

RunDoc is an AI-native Markdown documentation system. Contributions should be
small, reviewable, and aligned with the existing React + Vite + CLI structure.

## Workflow

1. Create a feature branch from `main`.
2. Keep changes scoped to one topic per branch.
3. Run the relevant checks before opening a merge request.
4. Update documentation in `docs/` when behavior or project conventions change.
5. Merge only after review.

## Local Checks

```bash
npm install
npm run build
npm run check:docs
```

## Commit Style

Use short conventional prefixes:

```txt
feat: add document freshness check
fix: correct section mapping for nested headings
docs: update agent protocol
ci: adjust scan schedule
```

## Protected Content

Do not commit:

- Production secrets or API keys.
- `.env` or local configuration files.
- Temporary build output.
- `.DS_Store`.
