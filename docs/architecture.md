# Architecture

The Retold Content System is a Node CLI that starts a small Orator HTTP server serving two Pict applications (reader and editor) from the same origin, plus a tiny REST API for content operations. Every layer is designed to be replaced: the filesystem backend is the default but not the only option.

## Process Layout

```mermaid
graph TB
	subgraph "Node Process (rcs serve)"
		CLI["ContentSystem-CLI<br/>serve command"]
		SETUP["ContentSystem-Server-Setup"]

		subgraph "Orator HTTP Server"
			STATIC["Static routes<br/>/ , /edit.html , /content/*"]
			API["REST API<br/>/api/content/* , /api/filebrowser/*"]
			FB["FileBrowserService<br/>(pict-section-filebrowser)"]
		end

		BEACON["Ultravisor Beacon<br/>(optional)"]
	end

	subgraph "Browser -- Reader (/)"
		READER["ContentReaderApplication<br/>(extends pict-docuserve)"]
	end

	subgraph "Browser -- Editor (/edit.html)"
		EDITOR["ContentEditorApplication<br/>(extends pict-application)"]
		PROVIDER["ContentEditorProvider<br/>(client persistence hooks)"]
		LAYOUT["Editor views<br/>Layout / TopBar / MarkdownEditor / CodeEditor / Preview / FileBrowser / Topics / Settings"]
	end

	subgraph "Default Backend"
		FS["Filesystem<br/>(content folder)"]
	end

	CLI --> SETUP
	SETUP --> STATIC
	SETUP --> API
	SETUP --> FB
	SETUP -.->|optional| BEACON

	READER -->|fetch markdown| STATIC
	EDITOR --> PROVIDER
	EDITOR --> LAYOUT
	PROVIDER -->|HTTP| API

	API -->|read / write| FS
	FB -->|list / info| FS
	STATIC -->|serve files| FS
	BEACON -->|read / save / list / mkdir| FS
```

Any of the dashed or solid arrows in the "Default Backend" column can be redirected at a different store. The [Persistence Hooks](persistence-hooks.md) guide walks through each option.

## Class Hierarchy

```mermaid
classDiagram
	class libPictApplication {
		+pict
		+services
		+AppData
		+onAfterInitializeAsync()
	}

	class libDocuserveApplication {
		+showSplash()
		+showPage(pPath)
		+navigate(pPath)
	}

	class libPictProvider {
		+pict
		+options
		+log
	}

	class ContentReaderApplication {
		+defaultConfiguration
	}

	class ContentEditorApplication {
		+navigateToFile(pFilePath)
		+saveCurrentFile()
		+closeCurrentFile()
		+createNewFile(pFilePath)
		+promptNewFile()
		+promptNewFolder()
		+loadFileList(pPath, fCallback)
		+insertFileReference(pFilename)
		+segmentMarkdownContent(pContent)
		+getEditorTypeForFile(pFilePath)
		+markDirty()
		+updateStats()
		+resolveHash()
		+saveSettings()
		+loadMediaPreview(type, url, name)
	}

	class ContentEditorProvider {
		+loadFile(pFilePath, fCallback)
		+saveFile(pFilePath, pContent, fCallback)
		+uploadImage(pFile, fCallback)
	}

	libPictApplication <|-- libDocuserveApplication
	libDocuserveApplication <|-- ContentReaderApplication
	libPictApplication <|-- ContentEditorApplication
	libPictProvider <|-- ContentEditorProvider
	ContentEditorApplication --> ContentEditorProvider : uses
```

## Server Startup

```mermaid
sequenceDiagram
	participant User
	participant CLI as rcs serve
	participant Setup as ContentSystem-Server-Setup
	participant Orator
	participant FB as FileBrowserService
	participant FS as Filesystem

	User->>CLI: rcs serve ./my-docs -p 8080
	CLI->>CLI: resolve content path
	CLI->>Setup: setupContentSystemServer(options)
	Setup->>Orator: create service server
	Setup->>Orator: register static routes (/, /edit.html, /content/*)
	Setup->>Orator: register REST API (/api/content/*, /api/content/upload-image, /api/content/mkdir)
	Setup->>FB: new FileBrowserService(basePath)
	FB->>Orator: connectRoutes() (/api/filebrowser/*)
	Setup->>Orator: startService()
	Orator-->>CLI: listening on port
	CLI->>User: print banner with URL
```

## Editor Load Flow

```mermaid
sequenceDiagram
	participant Browser
	participant Editor as ContentEditorApplication
	participant Provider as ContentEditorProvider
	participant FB as FileBrowserService
	participant API as Content API
	participant FS as Filesystem

	Browser->>Editor: GET /edit.html
	Editor->>Editor: onAfterInitializeAsync()
	Editor->>Editor: register views + provider
	Editor->>FB: GET /api/filebrowser/list?path=/
	FB->>FS: readdir
	FS-->>FB: dir entries
	FB-->>Editor: file list
	Editor->>Editor: render Layout, TopBar, FileBrowser
	Editor->>Editor: resolveHash() -- if URL has #/edit/path
	alt hash has a file
		Editor->>Editor: navigateToFile(path)
		Editor->>Provider: loadFile(path, cb)
		Provider->>API: GET /api/content/read/path
		API->>FS: readFile
		FS-->>API: content
		API-->>Provider: { Success, Content }
		Provider-->>Editor: content
		Editor->>Editor: render MarkdownEditor or CodeEditor with content
	end
```

## Save Flow

```mermaid
sequenceDiagram
	participant User
	participant Editor as ContentEditorApplication
	participant Provider as ContentEditorProvider
	participant API as Content API
	participant FS as Filesystem

	User->>Editor: Ctrl+S
	Editor->>Editor: saveCurrentFile()
	Editor->>Provider: saveFile(path, content, cb)
	Provider->>API: PUT /api/content/save/path { Content }
	API->>API: sanitizePath, bounds check
	API->>FS: writeFile
	FS-->>API: ok
	API-->>Provider: { Success, Path, Size }
	Provider-->>Editor: null (no error)
	Editor->>Editor: markClean(), update save status
```

## Image Upload Flow

```mermaid
sequenceDiagram
	participant User
	participant MDE as MarkdownEditor view
	participant Provider as ContentEditorProvider
	participant API as Content API
	participant FS as Filesystem

	User->>MDE: F3 or drag-and-drop an image
	MDE->>Provider: uploadImage(file, cb)
	Provider->>Provider: determine target folder<br/>(current file's directory or browser location)
	Provider->>API: POST /api/content/upload-image<br/>Headers: x-filename, x-upload-path, Content-Type<br/>Body: raw bytes
	API->>API: sanitizeFilename, sanitizePath
	API->>API: dedupe with timestamp
	API->>FS: writeFile
	FS-->>API: ok
	API-->>Provider: { Success, URL, RelativePath, Filename, Size }
	Provider-->>MDE: url
	MDE->>MDE: insert image markdown at cursor
```

## REST Endpoints

The Orator server exposes a small, overridable set of routes:

### Static

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Reader (`index.html`) |
| GET | `/edit.html` | Editor (`edit.html`) |
| GET | `/preview.html` | Standalone preview |
| GET | `/content/*` | Static access to the content folder (markdown, images, binaries) |

### Content API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/content/read/:filepath` | Return `{ Success, Content }` for a file |
| PUT | `/api/content/save/:filepath` | Save `{ Content }` to a file |
| POST | `/api/content/upload-image` | Upload an image; headers `x-filename` and `x-upload-path`; body is the raw bytes |
| POST | `/api/content/mkdir` | Create a folder from `{ Path }` |

### File Browser API (from `pict-section-filebrowser`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/filebrowser/list` | List the contents of a folder |
| GET | `/api/filebrowser/info` | Return metadata for a single entry |
| PUT | `/api/filebrowser/settings` | Update runtime settings (e.g. `IncludeHiddenFiles`) |

Each of these routes is a plain Orator route defined in `ContentSystem-Server-Setup.js`. You can replace any of them before `startService()` to point at a different backend. See [Persistence Hooks](persistence-hooks.md) for the full recipe.

## File Layout

```
retold-content-system/
├── README.md
├── package.json
├── source/
│   ├── Pict-ContentSystem-Bundle.js               # browser bundle entry
│   ├── Pict-Application-ContentReader.js          # reader application
│   ├── Pict-Application-ContentReader-Configuration.json
│   ├── Pict-Application-ContentEditor.js          # editor application
│   ├── Pict-Application-ContentEditor-Configuration.json
│   ├── cli/
│   │   ├── ContentSystem-CLI-Run.js               # bin entry
│   │   ├── ContentSystem-CLI-Program.js           # command definitions
│   │   ├── ContentSystem-Server-Setup.js          # Orator wiring
│   │   └── commands/
│   │       └── ContentSystem-Command-Serve.js     # serve command
│   ├── providers/
│   │   └── Pict-Provider-ContentEditor.js         # client persistence hooks
│   └── views/
│       ├── PictView-Editor-Layout.js
│       ├── PictView-Editor-TopBar.js
│       ├── PictView-Editor-MarkdownEditor.js
│       ├── PictView-Editor-CodeEditor.js
│       ├── PictView-Editor-MarkdownReference.js
│       ├── PictView-Editor-SettingsPanel.js
│       └── PictView-Editor-Topics.js
├── html/
│   ├── index.html                                 # reader entry
│   ├── edit.html                                  # editor entry
│   └── preview.html
├── web-application/                               # built bundles + CSS
├── content/                                       # example content folder
└── docs/
	├── README.md, _cover.md, _sidebar.md, _topbar.md
	├── quickstart.md
	├── architecture.md
	├── configuration.md
	├── api-reference.md
	├── code-snippets.md
	├── persistence-hooks.md
	└── cli-reference.md
```

## Client State

The editor application keeps its runtime state under `pict.AppData.ContentEditor`:

| Key | Type | Purpose |
|---|---|---|
| `CurrentFile` | `string` | Relative path of the file currently open in the editor |
| `ActiveEditor` | `'markdown' \| 'code'` | Which editor variant is mounted |
| `IsDirty` | `boolean` | Unsaved-changes flag |
| `IsSaving` / `IsLoading` | `boolean` | Async operation flags for UI indicators |
| `Files` | `array` | File list from the browser sidebar |
| `Document.Segments` | `array` | Markdown content broken into one or more segments |
| `CodeContent` | `string` | Raw content buffer for the code editor |
| `SaveStatus` / `SaveStatusClass` | `string` | Save banner text + CSS modifier |
| `AutoSegmentMarkdown` / `AutoSegmentDepth` | mixed | Segmentation settings |
| `ContentPreviewMode` | `'off' \| 'preview' \| 'split'` | Preview pane visibility |
| `MarkdownWordWrap` / `CodeWordWrap` | `boolean` | Editor line-wrap flags |
| `SidebarCollapsed` / `SidebarWidth` | mixed | File browser sidebar state |
| `AutoPreviewImages` / `AutoPreviewVideo` / `AutoPreviewAudio` | `boolean` | Auto-load binary previews |
| `ShowHiddenFiles` | `boolean` | Show dotfiles in the file browser |
| `TopicsFilePath` | `string` | Path to the `.pict_documentation_topics.json` manifest |

The user-facing subset of these is persisted in `localStorage` so settings survive page reloads.

## Path Safety

All server routes use two sanitization helpers:

- `sanitizePath(pPath)` -- rejects absolute paths, strips `..` segments, strips `<>"|?*`, validates with `realpathSync` that the resolved path stays within the content folder
- `sanitizeFilename(pName)` -- strips path separators and unsafe characters from uploaded filenames, and dedupes against existing files with a `_YYYYMMDDHHMMSS` suffix

Any custom persistence backend that exposes a filesystem interface should apply the same rules.
