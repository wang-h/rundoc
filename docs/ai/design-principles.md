---
title: AI Design Principles
---

# AI Design Principles

RunDoc is designed for AI systems from the data model upward.

The goal is not to add a chatbot to a static site. The goal is to make team knowledge structured enough that AI can retrieve, cite, update, and validate it.

## Principles

1. Stable IDs over visual scraping.
2. Markdown source over generated HTML.
3. Explicit metadata over implicit page interpretation.
4. Document chunks over whole-page guessing.
5. Citation paths over ungrounded answers.

## Agent Behavior

An AI agent should be able to ask:

- Which documents exist?
- Which sections relate to this task?
- What changed since the previous build?
- Which source document supports this answer?
- Which documents need updates after a code or product change?
