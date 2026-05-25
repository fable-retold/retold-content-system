# Excalidraw integration in retold-content-system

How `pict-section-excalidraw` is wired into the content editor.

## File layout: 2-file mode with embedded scene (default)

Every Excalidraw diagram in the content tree is stored as **two files** sharing the `.excalidraw.` infix:

| File | Role |
|---|---|
| `<stem>.excalidraw.svg` | **Primary artifact.** A standard SVG that any markdown renderer or image viewer can display, **with the full Excalidraw scene embedded inside it** as `<metadata>` (via Excalidraw's `exportEmbedScene` option). Markdown references this file with `![](foo.excalidraw.svg)` — no special tooling needed by the consumer. |
| `<stem>.excalidraw.json` | **Readable JSON sidecar.** Pretty-printed JSON of the same scene. Diffable, scriptable, consumable by external tooling. Not required for rendering — present for git-history readability. |

The shared `.excalidraw.` infix is the routing signal: both extensions open the embedded drawing editor, no content sniffing required. Plain `.svg` files (logos, icons, screenshots) and plain `.json` files (configuration, manifests) stay on their existing paths — binary preview and code editor respectively.

The SVG is self-sufficient: even if the `.excalidraw.json` sidecar is lost, the scene round-trips because it's embedded in the SVG's metadata. retold-content-system uses Excalidraw's `loadFromBlob` to re-extract it.

This convention matches the Excalidraw VS Code extension and the Obsidian Excalidraw plugin, so diagrams created elsewhere drop into the content tree with no rename step.

## What's wired today

### Opening a diagram

- `.excalidraw.svg`, `.excalidraw.json`, or legacy `.excalidraw` → `getEditorTypeForFile` returns `'excalidraw'` and `navigateToFile` routes to the embedded editor. All decisions are synchronous from the filename alone.
- The editor's `_loadFromContent` inspects the extension on bind: `.excalidraw.svg` goes through `loadFromBlob` to extract the embedded scene, `.json` / legacy `.excalidraw` parses directly.
- Plain `.svg` → existing binary preview (unchanged). Users who have a non-conventionally-named Excalidraw SVG can rename it to `.excalidraw.svg` to opt in.

### Editing

- The editor view (`PictView-Editor-ExcalidrawEditor.js`) extends `pict-section-excalidraw.ReactView`.
- On bind, it inspects the active file's extension and dispatches to either `_parseJsonScene` (for `.excalidraw`) or `_parseSvgScene` (for `.svg`, via `loadFromBlob`).
- Both branches feed `setScene` to populate the Excalidraw canvas.

### Saving

- `saveCurrentFile()` short-circuits to `view.saveToContent()` when `ActiveEditor === 'excalidraw'`.
- `saveToContent`:
  1. Calls `exportSvg({ exportEmbedScene: true })` to produce an SVG with the scene embedded inline
  2. Serializes the scene to canonical JSON
  3. PUTs both files in parallel via `/api/content/save/<path>` (existing endpoint)
  4. Treats the SVG write as primary — its failure fails the save. JSON-sidecar failures log a warning but don't fail the save.
- Regardless of which file the user opened, both files are written using the canonical `<stem>.excalidraw.svg` + `<stem>.excalidraw.json` naming derived by `_resolveBothPaths(activePath)`. A user who opens a legacy bare `.excalidraw` file therefore ends up with the canonical 2-file pair next to it after saving once.

### Creating a new diagram

- `createNewFile()` produces an empty-but-valid Excalidraw JSON scene when the filename ends in `.excalidraw.json` or the legacy `.excalidraw`. The user opens the JSON file, the editor renders an empty canvas, and the first save produces the `.excalidraw.svg` sibling.
- `.excalidraw.svg` is not a supported direct creation target — rendering an empty SVG requires the wrapper bundle and adds no value over the create-then-save flow.

### Wrapper bundle

- `vendor/excalidraw-built/excalidraw-wrapper.min.js` from `pict-section-excalidraw` is copied to `web-application/js/` via `package.json#copyFiles`.
- CSS to `web-application/css/excalidraw-wrapper.css`.
- Fonts + locale chunks to `web-application/js/excalidraw-assets/`.
- `html/edit.html` loads the wrapper bundle and stylesheet alongside CodeJar/CodeMirror.

## Markdown fence rendering (`\`\`\`excalidraw`)

**Not wired** — and arguably less important now that the SVG-with-embedded-scene is the canonical file. Standard markdown `![diagram](./foo.svg)` works in any preview because the file *is* a valid SVG.

If a future need surfaces (e.g. one-off diagrams that don't justify their own file), the path is:

1. Register a markdown-it plugin in `pict-section-content` that matches `\`\`\`excalidraw` fenced code blocks. The plugin parses the JSON payload and emits a `<div class="excalidraw-fence" data-scene="{...}"></div>` placeholder.
2. In `pict-section-content`'s post-render hook (same place mermaid + katex initialize), iterate `.excalidraw-fence` placeholders and call `window.PictSectionExcalidrawVendor.exportToSvg(JSON.parse(div.dataset.scene), { exportEmbedScene: true })` to swap each placeholder for the rendered SVG.

## Files involved

- `source/views/PictView-Editor-ExcalidrawEditor.js` — the editor wrapper view + `svgHasEmbeddedScene` probe helper.
- `source/Pict-Application-ContentEditor.js` — view registration, editor-type branch, `_probeForExcalidrawSvg`, `_routeToExcalidrawEditor`, save dispatcher, cleanup hook.
- `html/edit.html` — wrapper-bundle script tag + stylesheet.
- `package.json` — `pict-section-excalidraw` dependency + `copyFiles` for the wrapper artifacts.
