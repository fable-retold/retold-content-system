# Configuration

The Retold Content System is configured at three layers:

1. **CLI flags** -- passed to `rcs serve`
2. **Server setup options** -- the object passed into `setupContentSystemServer(options)` in the Node process
3. **Pict application options** -- passed through each application's default configuration JSON

Most users only need the CLI flags. The deeper layers exist for embedding the content system inside another application.

## CLI Flags

See [CLI Reference](cli-reference.md) for the full list. The commonly-used ones:

| Flag | Default | Purpose |
|---|---|---|
| `[content-path]` | current directory (or `./content/` if present) | Folder to serve |
| `-p, --port <port>` | random 7000-7999 | HTTP port |
| `-b, --beacon <url>` | off | Enable Ultravisor beacon mode against the server at `<url>` |
| `--beacon-name <name>` | `content-system-1` | Beacon worker identity |
| `--beacon-password <password>` | none | Beacon auth password |

## Server Setup Options

When you are embedding the content system in your own Node process, call `setupContentSystemServer(options)` from `source/cli/ContentSystem-Server-Setup.js` with:

| Key | Type | Default | Purpose |
|---|---|---|---|
| `ContentPath` | string | required | Absolute path to the content folder. Must exist. |
| `DistPath` | string | module's `web-application/` | Absolute path to the browser build output (hosts the editor + reader static files). |
| `Port` | number | random 7000-7999 | TCP port for the Orator server. |
| `Beacon` | object | `{ Enabled: false }` | Ultravisor beacon configuration (see below). |

### Beacon Subkeys

| Key | Type | Default | Purpose |
|---|---|---|---|
| `Enabled` | boolean | `false` | Master switch for beacon mode |
| `ServerURL` | string | none | Ultravisor server URL the beacon connects to |
| `Name` | string | `content-system-1` | Beacon identity |
| `Password` | string | none | Beacon auth password |

Beacon mode runs alongside the normal HTTP server -- you still get the reader, editor, and REST API; the beacon just adds workflow capabilities on top.

## Pict Application Configuration

### ContentEditorApplication

`source/Pict-Application-ContentEditor-Configuration.json`:

```json
{
	"Name":                                         "Retold Content Editor",
	"Hash":                                         "ContentEditor",
	"MainViewportViewIdentifier":                   "ContentEditor-Layout",
	"AutoSolveAfterInitialize":                     true,
	"AutoRenderMainViewportViewAfterInitialize":    false,
	"AutoRenderViewsAfterInitialize":               false,
	"pict_configuration":
	{
		"Product": "ContentEditor-Pict-Application"
	}
}
```

These keys come from `pict-application`. The editor registers its own provider and views during construction, so the two `AutoRender*AfterInitialize` flags are `false` -- the application renders its views itself in `onAfterInitializeAsync` so it can control the ordering.

### ContentReaderApplication

`source/Pict-Application-ContentReader-Configuration.json`:

```json
{
	"Name":                                         "Retold Content Reader",
	"Hash":                                         "ContentReader",
	"MainViewportViewIdentifier":                   "Docuserve-Layout",
	"AutoSolveAfterInitialize":                     true,
	"AutoRenderMainViewportViewAfterInitialize":    false,
	"AutoRenderViewsAfterInitialize":               false,
	"pict_configuration":
	{
		"Product": "ContentReader-Pict-Application"
	}
}
```

The reader extends `pict-docuserve` and inherits all of its configuration surface. To customize the reader, pass a different JSON or extend `ContentReaderApplication` and override the relevant docuserve provider settings.

## Runtime State (Editor)

At runtime, the editor stores working state under `pict.AppData.ContentEditor`:

```javascript
{
	"CurrentFile":             "",          // relative path of the open file
	"ActiveEditor":            "markdown",  // 'markdown' or 'code'
	"IsDirty":                 false,
	"IsSaving":                false,
	"IsLoading":               false,

	"Files":                   [],
	"Document":                { "Segments": [{ "Content": "" }] },
	"CodeContent":             "",

	"SaveStatus":              "",          // 'Saving...', 'Saved', 'Error: ...'
	"SaveStatusClass":         "",          // CSS class for status indicator

	"AutoSegmentMarkdown":     false,
	"AutoSegmentDepth":        1,
	"ContentPreviewMode":      "off",       // 'off', 'preview', 'split'
	"MarkdownEditingControls": true,
	"MarkdownWordWrap":        true,
	"CodeWordWrap":            false,
	"SidebarCollapsed":        false,
	"SidebarWidth":            250,
	"AutoPreviewImages":       true,
	"AutoPreviewVideo":        false,
	"AutoPreviewAudio":        false,
	"ShowHiddenFiles":         false,
	"TopicsFilePath":          ".pict_documentation_topics.json"
}
```

The user-facing subset of these is persisted in browser `localStorage` under a per-origin key. Call `this.pict.PictApplication.saveSettings()` to flush manually.

## Provider Configuration

### ContentEditorProvider

```json
{
	"ProviderIdentifier":     "ContentEditor-Provider",
	"AutoInitialize":          true,
	"AutoInitializeOrdinal":   0
}
```

To register a custom provider that replaces the default filesystem-backed one, pass your own configuration object and class when adding the provider:

```javascript
this.pict.addProvider(
	'ContentEditor-Provider',
	{
		"ProviderIdentifier":    "ContentEditor-Provider",
		"AutoInitialize":        true,
		"AutoInitializeOrdinal": 0
		// plus any provider-specific options your subclass reads
	},
	MyCustomContentProvider);
```

See [Persistence Hooks](persistence-hooks.md) for the full pattern.

## Environment Variables

The default CLI does not read environment variables directly, but the underlying Orator server respects `NODE_ENV` for log verbosity. If you embed the content system in a larger Node process, you can drive the server setup options from environment variables in your wrapper.

## Path Sanitization

All filesystem-backed routes apply strict path sanitization:

- Absolute paths are rejected
- `..` segments are stripped
- Dangerous characters (`<>"|?*`) are removed
- `realpathSync` is used to verify the resolved path stays inside `ContentPath`

If you replace the default server-side handlers with custom ones, you are responsible for applying similar rules in your backend. See [Persistence Hooks](persistence-hooks.md).
