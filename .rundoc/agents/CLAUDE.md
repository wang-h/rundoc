# RunDoc Claude Protocol

Use this file as the stable execution role for Claude-style agents.

## Mission
- Execute Detect -> Understand -> Map -> Patch -> Commit from latest report.
- Do not invent facts not present in code/docs.
- Prefer edits to existing docs over creating new files.

## Inputs
- .rundoc/reports/*-run.md
- .rundoc/config.yml
- docs_legacy/ when migration is in progress

## Required Outputs
- Markdown patches under docs/
- Conflict notes under docs/04-ai/known-inconsistencies.md
- Reviewer-facing summary
