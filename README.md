# Retold Content System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

A full-stack markdown content editor and documentation reader. Point it at any folder of markdown files and you get a live documentation site (reader), an in-browser editor with a file browser, syntax-highlighted code editing, live markdown preview with Mermaid and KaTeX, and a drop-in CLI server. Every persistence boundary -- markdown read, markdown save, image upload, file listing -- is a named hook that developers can replace to plug the system into any backend.

## Features

- **Drop-In CLI** -- `npx rcs serve ./my-docs` starts a complete reader + editor server in seconds
- **Dual Applications** -- Reader (`/`) renders documentation via `pict-docuserve`; Editor (`/edit.html`) provides in-browser authoring
- **File Browser Sidebar** -- Tree + list views over your content folder with breadcrumbs, create-file / create-folder, hidden-file toggle, and keyboard-driven navigation
- **Markdown Editor** -- CodeMirror-based editor with formatting toolbar, line numbers, word wrap, and live preview side-by-side
- **Code Editor** -- CodeJar + highlight.js editor with syntax highlighting for 190+ languages (JS, TS, Python, Java, Go, SQL, HTML, CSS, JSON, YAML, ...)
- **Live Preview** -- Renders markdown with GitHub-flavored styling, Mermaid diagrams, and KaTeX equations in real time
- **Image Upload** -- F3 / toolbar upload places images next to the file being edited with smart filename deduping
- **Binary Previews** -- Images, audio, video, and document files get automatic preview cards with download and open-in-new-tab actions
- **Topics Manifest** -- `.pict_documentation_topics.json` links named topics to line ranges in your markdown for API-doc-style cross-references
- **Pluggable Persistence** -- Override `loadFile`, `saveFile`, and `uploadImage` on the client provider or replace the REST endpoints on the server to move content into a database, object store, or any other backend
- **Ultravisor Beacon Support** -- Optional `--beacon` mode exposes the same read / save / list / mkdir operations as workflow capabilities
- **Pict Native** -- Built on `pict-application`, `pict-provider`, `pict-view`, `pict-docuserve`, `pict-section-markdowneditor`, `pict-section-code`, `pict-section-filebrowser`

## Installation

```bash
npm install -g retold-content-system
# or as a project dep
npm install retold-content-system
```

## Quick Start

```bash
# Serve the current directory on a random port
rcs serve

# Serve a specific folder on a specific port
rcs serve ~/Documents/handbook -p 8080

# With Ultravisor beacon mode
rcs serve ./docs -b http://localhost:54321
```

The CLI prints the URL once it's ready:

```
==========================================================
  Retold Content System running on http://localhost:7234
==========================================================
  Content: /Users/steven/Documents/handbook
==========================================================
```

Open `/` for the reader or `/edit.html` for the editor.

## CLI Reference

| Command | Description |
|---|---|
| `rcs serve [path]` | Start the server. `path` defaults to the current directory (or `./content/` if that exists). |
| `-p, --port <port>` | TCP port. Defaults to a random port in 7000-7999. |
| `-b, --beacon <url>` | Connect to an Ultravisor server at `<url>` and register content capabilities. |
| `--beacon-name <name>` | Beacon worker identity (default `content-system-1`). |
| `--beacon-password <password>` | Beacon authentication password. |

See [docs/cli-reference.md](docs/cli-reference.md) for the full reference.

## Pluggable Persistence

Every place the system touches storage is a named, overridable boundary. On the client, `ContentEditorProvider` exposes three methods -- `loadFile`, `saveFile`, `uploadImage` -- that you can replace by registering a subclass. On the server, each REST endpoint (`/api/content/read/*`, `/api/content/save/*`, `/api/content/upload-image`, `/api/content/mkdir`) is a standard Orator route you can swap out for a database, S3, or any HTTP backend.

```javascript
const libPictProvider = require('pict-provider');

class S3ContentProvider extends libPictProvider
{
	loadFile(pFilePath, fCallback)
	{
		this.s3.getObject({ Bucket: 'docs', Key: pFilePath }, (err, data) =>
		{
			if (err) return fCallback(err.message, '');
			return fCallback(null, data.Body.toString('utf8'));
		});
	}

	saveFile(pFilePath, pContent, fCallback)
	{
		this.s3.putObject({ Bucket: 'docs', Key: pFilePath, Body: pContent }, (err) =>
			fCallback(err ? err.message : null));
	}

	uploadImage(pFile, fCallback)
	{
		this.s3.putObject({ Bucket: 'images', Key: pFile.name, Body: pFile }, (err) =>
		{
			if (err) return fCallback(err.message);
			return fCallback(null, `https://cdn.example.com/images/${ pFile.name }`);
		});
	}
}
```

See [docs/persistence-hooks.md](docs/persistence-hooks.md) for every extension point, including image storage strategies, database-backed examples, and server-side middleware patterns.

## Content Folder Conventions

```
my-docs/
├── README.md                             # reader home page
├── cover.md                              # reader splash (optional)
├── _sidebar.md                           # reader navigation (optional)
├── _topbar.md                            # reader top bar (optional)
├── .pict_documentation_topics.json       # topic manifest (optional)
├── guides/
│   ├── getting-started.md
│   └── images/
│       └── screenshot.png
└── api/
    └── reference.md
```

## Documentation

- [Overview](docs/README.md)
- [Quick Start](docs/quickstart.md)
- [Architecture](docs/architecture.md)
- [Configuration](docs/configuration.md)
- [API Reference](docs/api-reference.md)
- [Code Snippets](docs/code-snippets.md)
- [Persistence Hooks](docs/persistence-hooks.md) -- how to plug in custom markdown and image storage
- [CLI Reference](docs/cli-reference.md)

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+S` / `Cmd+S` | Save the current file |
| `Escape` | Close the current file (prompts if dirty) |
| `F1` | Toggle live preview |
| `F2` | Toggle sidebar |
| `F3` | Upload image at cursor |
| `F4` | Toggle settings panel |

## Building

```bash
npm run build-all
```

Produces a browser bundle at `web-application/retold-content-system.min.js` plus the CodeMirror and CodeJar bundles.

## Related Packages

- [pict](https://github.com/stevenvelozo/pict) -- MVC framework
- [pict-application](https://github.com/stevenvelozo/pict-application) -- application host and lifecycle
- [pict-docuserve](https://github.com/stevenvelozo/pict-docuserve) -- documentation reader used for the `/` route
- [pict-section-markdowneditor](https://github.com/stevenvelozo/pict-section-markdowneditor) -- CodeMirror-based markdown editor
- [pict-section-code](https://github.com/stevenvelozo/pict-section-code) -- CodeJar-based code editor
- [pict-section-filebrowser](https://github.com/stevenvelozo/pict-section-filebrowser) -- file browser sidebar
- [orator](https://github.com/stevenvelozo/orator) -- REST server framework

## License

MIT

## Contributing

Pull requests welcome. See the [Retold Contributing Guide](https://github.com/stevenvelozo/retold/blob/main/docs/contributing.md) for the code of conduct, contribution process, and testing requirements.
