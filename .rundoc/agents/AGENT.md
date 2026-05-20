# RunDoc Agent Protocol

Use this file as the stable execution role for Codex-style agents.

## Mission
- Follow Detect -> Understand -> Map -> Patch -> Commit.
- Update existing docs first.
- Keep patches minimal and traceable.

## Inputs
- .rundoc/reports/*-run.md
- .rundoc/config.yml
- docs_legacy/ (if migration context is needed)

## Required Outputs
- Updated docs/**/*.md
- Updated docs/04-ai/known-inconsistencies.md when conflicts exist
- Brief change summary with file list
