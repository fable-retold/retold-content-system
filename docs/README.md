# Retold Content System

> A full-stack markdown content editor and documentation reader

The Retold Content System is a Node application and a pair of Pict browser applications that turn any folder of markdown files into both a live documentation site and an in-browser editing environment. The CLI (`rcs serve`) boots an Orator server that hosts:

- **Reader** (`/`) -- a `pict-docuserve` documentation reader that renders markdown with Mermaid, KaTeX, and a cover / sidebar / topbar navigation shell
- **Editor** (`/edit.html`) -- a full authoring environment with a file browser sidebar, a CodeMirror markdown editor, a CodeJar code editor, live preview, image upload, and a topics manifest panel
- **REST API** (`/api/content/*`, `/api/filebrowser/*`) -- a small, overridable set of endpoints that handle every read, write, listing, and upload operation
- **Static content** (`/content/*`) -- direct access to the underlying files for images, attachments, and binary previews

The server is a thin wrapper around three well-factored layers:

1. An Orator HTTP server with a small set of REST endpoints
2. A `pict-section-filebrowser` service that owns file listing and metadata
3. A `ContentEditorProvider` on the client that owns the read / save / upload operations the editor views call

Every one of those layers is replaceable. The system is shipped as a filesystem-backed default, but its real purpose is to be the **authoring front-end** for a content repository that lives wherever you want it to live -- on disk, in a database, in object storage, in a Git server, or behind an HTTP API. See [Persistence Hooks](persistence-hooks.md) for the full pattern.

## Features

- **Drop-In CLI** -- `npx rcs serve ./my-docs` gives you a reader, an editor, and a REST API in one command
- **Dual Applications** -- Reader and editor share the same content folder and the same URL origin
- **File Browser Sidebar** -- Tree + list views, breadcrumbs, create-file / create-folder, hidden-file toggle
- **Markdown Editor** -- CodeMirror-based editor with formatting toolbar, line numbers, word wrap, and an optional side-by-side preview
- **Code Editor** -- CodeJar + highlight.js editor with syntax highlighting for 190+ languages
- **Live Preview** -- GitHub-flavored markdown rendered with Mermaid diagrams and KaTeX equations in real time
- **Image Upload** -- F3 / toolbar upload places images next to the file being edited with timestamped filename deduping
- **Binary Previews** -- Images, audio, video, and document files get automatic preview cards with download and open-in-new-tab actions
- **Topics Manifest** -- `.pict_documentation_topics.json` links named topics to line ranges in your markdown for API-doc-style cross-references
- **Settings Panel** -- Word wrap, preview mode, hidden files, auto-segment, segmentation depth, and more, persisted in localStorage
- **Pluggable Persistence** -- Every read / write / upload boundary is a named hook you can replace without forking
- **Ultravisor Beacon Support** -- Optional `--beacon` mode exposes the same read / save / list / mkdir operations as workflow capabilities

## When to Use It

Reach for the Retold Content System when you need:

- A zero-config way to edit and preview a folder of markdown locally
- A documentation site that you can host behind a static file server (`rcs serve` produces an identical structure to `pict-docuserve inject`)
- An authoring front-end for a markdown repository that lives in a database, object store, or API
- A reference application for how to assemble `pict-application`, `pict-docuserve`, and the `pict-section-*` components into a real product
- A CLI that can run in Ultravisor beacon mode so content operations become workflow capabilities

Skip it if you need a multi-user authoring system with row-level auth, comments, revisions, or WYSIWYG editing -- those are outside the scope of this module, though you can layer them on top of the REST API.

## Learn More

- [Quick Start](quickstart.md) -- Install, serve, edit, and configure your first content folder
- [Persistence Hooks](persistence-hooks.md) -- **Start here** if you need to store markdown or images somewhere other than the filesystem
- [Architecture](architecture.md) -- Process layout, class hierarchy, and request flow diagrams
- [Configuration](configuration.md) -- Every application and server configuration option
- [API Reference](api-reference.md) -- Every developer-facing method and REST endpoint
- [Code Snippets](code-snippets.md) -- Runnable snippets for every exposed function, with extra coverage of persistence hook points
- [CLI Reference](cli-reference.md) -- Every command, flag, and environment variable
