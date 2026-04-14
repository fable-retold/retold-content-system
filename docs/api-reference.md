# API Reference

Every developer-facing method on the content system, grouped by layer. There are three layers that matter:

1. **`ContentEditorApplication`** -- the Pict application class that owns the editor
2. **`ContentEditorProvider`** -- the client-side provider that owns markdown read/save and image upload
3. **REST endpoints** -- the server-side routes the provider calls

## ContentEditorApplication

Extends `pict-application`. The class owns navigation, file listing, save state, and the coordination between views.

### Constructor

```javascript
new ContentEditorApplication(pFable, pOptions, pServiceHash)
```

Normally instantiated by the Pict loader (`Pict.safeLoadPictApplication(PictContentEditor, 2)`) -- you rarely call this directly.

### File Operations

| Method | Purpose |
|---|---|
| `navigateToFile(pFilePath)` | Load a file into the editor by relative path. Determines whether to mount the markdown editor, code editor, or binary preview based on the file extension. |
| `saveCurrentFile()` | Save the currently open file via the provider's `saveFile`. Marks the document clean on success, updates the save status banner. |
| `closeCurrentFile()` | Close the open file. Prompts for confirmation if dirty. |
| `createNewFile(pFilePath)` | Create a new file with default content and open it. Uses the provider's `saveFile` under the hood. |
| `promptNewFile()` | Open a prompt for a new file name (relative to the current folder) and call `createNewFile`. |
| `promptNewFolder()` | Open a prompt for a new folder name and call `POST /api/content/mkdir`. |
| `loadFileList(pPath, fCallback)` | Fetch a folder's contents via the FileBrowserService. `fCallback(pError, pFiles)`. |
| `insertFileReference(pFilename)` | Insert a relative reference to a file into the editor at the cursor. For images, inserts `!\[alt](path)`; for other files, inserts a plain link. |

### Content Helpers

| Method | Purpose |
|---|---|
| `segmentMarkdownContent(pContent)` | Split markdown content into an array of segments based on `AutoSegmentMarkdown` / `AutoSegmentDepth` settings. Returns `[{ Content: '...' }, ...]`. |
| `getEditorTypeForFile(pFilePath)` | Returns `'markdown'`, `'code'`, or `'binary'` based on the file's extension. |
| `loadMediaPreview(pType, pUrl, pName)` | Load and render a binary preview card (`pType` is one of `'image'`, `'video'`, `'audio'`, or `'document'`). |

### UI & State

| Method | Purpose |
|---|---|
| `markDirty()` | Flip `IsDirty` on and update the status banner. Called from every editor change event. |
| `updateStats()` | Recount characters, words, and lines in the active buffer and push the counts to the top bar. |
| `resolveHash()` | Inspect `window.location.hash` and navigate to the referenced file. Called on load so `/edit.html#/edit/path/to/file.md` deep links work. |
| `saveSettings()` | Persist the editor's user-facing settings to `localStorage`. |

### Navigation Between Applications

The editor does not own routing directly -- navigation is driven by URL hash resolution on load. To programmatically open a file from elsewhere in the app, call `navigateToFile(path)` and update `window.location.hash` in the same pass.

## ContentEditorProvider

The client-side persistence provider. This is **the primary extension point** for custom storage on the client. Extend it and register your subclass to redirect all read / save / upload operations to any backend you like.

### Constructor

```javascript
new ContentEditorProvider(pFable, pOptions, pServiceHash)
```

### `loadFile(pFilePath, fCallback)`

Load the raw markdown content of a file.

| Param | Type | Description |
|---|---|---|
| `pFilePath` | `string` | The relative file path |
| `fCallback` | `function(pError, pContent)` | Receives a string error and a string content buffer |

**Default behavior:** `GET /api/content/read/<encodedPath>` and read `{ Success, Content }` from the response.

**To override:** subclass and replace this method with a call to your backend (database, S3, HTTP API, IndexedDB, etc.). The editor does not care where the content comes from, only that the callback is invoked with `(null, content)` on success or `(errorString, '')` on failure.

### `saveFile(pFilePath, pContent, fCallback)`

Save markdown content to a file.

| Param | Type | Description |
|---|---|---|
| `pFilePath` | `string` | The relative file path |
| `pContent` | `string` | The content to persist |
| `fCallback` | `function(pError)` | Receives a string error, or `null` on success |

**Default behavior:** `PUT /api/content/save/<encodedPath>` with body `{ Content }`.

**To override:** write the content wherever you like, then call the callback. The editor will mark the document clean and update the save status banner regardless of the storage backend.

### `uploadImage(pFile, fCallback)`

Upload an image file to storage.

| Param | Type | Description |
|---|---|---|
| `pFile` | `File` | A browser `File` object (the native HTML5 file type) |
| `fCallback` | `function(pError, pUrl)` | Receives a string error and a public URL for the stored image |

**Default behavior:** determines the target folder from `AppData.ContentEditor.CurrentFile` (the directory of the file being edited) or `AppData.PictFileBrowser.CurrentLocation` (if nothing is open), then `POST /api/content/upload-image` with the raw bytes in the body and the filename + upload path in `x-filename` / `x-upload-path` headers.

**To override:** subclass and replace with any upload logic. The returned URL will be inserted directly into the markdown as `!\[alt](url)` -- make sure it is accessible from the browser at that path.

### Default Configuration

```javascript
ContentEditorProvider.default_configuration = {
	ProviderIdentifier:     "ContentEditor-Provider",
	AutoInitialize:          true,
	AutoInitializeOrdinal:   0
};
```

## REST Endpoints

These are the server-side routes the default provider calls. You can replace any of them before `startService()` to point at a different backend without touching the client.

### Content

#### `GET /api/content/read/:filepath`

Return the content of a file.

**Response:**
```json
{ "Success": true, "Content": "markdown string" }
```

**Errors:** 404 if the file does not exist; 400 if the path fails sanitization.

#### `PUT /api/content/save/:filepath`

Save content to a file.

**Request body:**
```json
{ "Content": "markdown string" }
```

**Response:**
```json
{ "Success": true, "Path": "relative/path.md", "Size": 1234 }
```

**Errors:** 400 if the path fails sanitization; 500 on write failure.

#### `POST /api/content/upload-image`

Upload an image. The image bytes are the raw request body.

**Request headers:**
- `Content-Type` -- the image MIME type
- `x-filename` -- the original filename
- `x-upload-path` -- the target folder (relative to content root)

**Response:**
```json
{
	"Success":      true,
	"URL":          "/content/guides/images/screenshot_20260301123045.png",
	"RelativePath": "guides/images/screenshot_20260301123045.png",
	"Filename":     "screenshot_20260301123045.png",
	"Size":         56432
}
```

The server timestamps the filename to avoid collisions. The returned URL is served from the `/content/*` static route.

#### `POST /api/content/mkdir`

Create a folder.

**Request body:**
```json
{ "Path": "relative/path/to/new/folder" }
```

**Response:**
```json
{ "Success": true, "Path": "relative/path/to/new/folder" }
```

### File Browser (from `pict-section-filebrowser`)

#### `GET /api/filebrowser/list?path=...`

List the contents of a folder. Returns an array of entries with `Name`, `Type` (`'file' | 'dir'`), `Size`, and `Modified`.

#### `GET /api/filebrowser/info?path=...`

Return metadata for a single entry.

#### `PUT /api/filebrowser/settings`

Update runtime settings. The editor uses this to push the `ShowHiddenFiles` toggle to the server.

**Request body:**
```json
{ "IncludeHiddenFiles": true }
```

### Static

| Path | Purpose |
|---|---|
| `/` | Reader HTML |
| `/edit.html` | Editor HTML |
| `/preview.html` | Standalone preview HTML |
| `/content/*` | Direct static access to the content folder |

## Ultravisor Beacon Capabilities

When `rcs serve` is run with `--beacon`, the following capabilities are registered with the Ultravisor server:

| Capability | Input | Output |
|---|---|---|
| `ReadFile` | `{ FilePath }` | `{ Content }` |
| `SaveFile` | `{ FilePath, Content }` | `{ Success, Path, Size }` |
| `ListFiles` | `{ Path }` | `{ Files: [...] }` |
| `CreateFolder` | `{ Path }` | `{ Success, Path }` |

These mirror the REST endpoints so a workflow dispatched through Ultravisor has the same access to the content folder as a browser running the editor.

## Subclassing Summary

For reference, the three most commonly overridden classes:

| Class | Location | Override When |
|---|---|---|
| `ContentEditorProvider` | `source/providers/Pict-Provider-ContentEditor.js` | You want to move markdown / image storage off the default filesystem backend on the client side. |
| `ContentEditorApplication` | `source/Pict-Application-ContentEditor.js` | You want to customize navigation, add new views, or integrate with external auth / routing. |
| `ContentReaderApplication` | `source/Pict-Application-ContentReader.js` | You want to customize the reader (e.g. add a tracking script, pre-populate a search index, change the layout). Inherits from `pict-docuserve`. |
