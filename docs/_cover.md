# Retold Content System

> A full-stack markdown content editor and documentation reader

Point it at any folder of markdown files. Get a live documentation site, an in-browser editor with a file browser, syntax-highlighted code editing, and real-time markdown preview. Every persistence boundary is a named hook you can replace to move content into your own backend.

- **Drop-In CLI** -- `npx rcs serve ./my-docs` starts a complete reader + editor server in seconds
- **Dual Applications** -- Reader at `/`, editor at `/edit.html`, both driven by the same content folder
- **Pluggable Persistence** -- Override `loadFile`, `saveFile`, and `uploadImage` to plug in your own backend for markdown and images
- **Live Preview** -- Mermaid, KaTeX, and GitHub-flavored markdown rendered as you type
- **190+ Languages** -- Syntax-highlighted code editing for every file in your content folder
- **Topics Manifest** -- Link named topics to line ranges in markdown for API-doc-style cross-references

[Overview](README.md)
[Quick Start](quickstart.md)
[Persistence Hooks](persistence-hooks.md)
[Architecture](architecture.md)
[GitHub](https://github.com/fable-retold/retold-content-system)
