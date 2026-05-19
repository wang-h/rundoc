---
title: Overview
---

# Overview

RunDoc is an AI-native Markdown documentation system for running teams.

It keeps Markdown as the source of truth and turns a docs repository into a structured documentation site with navigation, search metadata, table of contents, and predictable document routes.

The product direction is simple:

- Keep writing in Markdown.
- Keep collaborating through Git.
- Make docs readable for humans.
- Make docs addressable and reliable for AI agents.

RunDoc should help a team keep decisions, product rules, SOPs, architecture notes, onboarding paths, and AI operating context in one coherent system.

## Why It Exists

Traditional static docs sites are good for publishing pages. Running teams need more than publishing.

They need documents that can be searched, referenced, checked, updated, and passed to AI systems without losing source identity or context.

RunDoc is designed around this boundary.

## Current Scope

The first version is a static React docs app:

- Markdown source in `docs/`
- Build-time content generation
- Search index generation
- Sidebar navigation from config
- Document pages with TOC and previous/next links

The AI API layer is documented before implementation so downstream projects can integrate against a stable model.
