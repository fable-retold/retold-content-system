# CLI Reference

The `retold-content-system` package ships two equivalent executables: `retold-content-system` and `rcs`. They share the same command surface.

## Commands

### `serve [content-path]`

Start the Retold Content System server. Hosts the reader, the editor, and the REST API against a folder of markdown files.

```bash
rcs serve [content-path] [options]
```

**Arguments:**

| Argument | Default | Description |
|---|---|---|
| `content-path` | current working directory (or `./content/` if it exists) | Path to the content folder to serve |

**Options:**

| Flag | Default | Description |
|---|---|---|
| `-p, --port <port>` | random in 7000-7999 | TCP port the HTTP server listens on |
| `-b, --beacon <url>` | off | Enable Ultravisor beacon mode; `<url>` is the Ultravisor server URL |
| `--beacon-name <name>` | `content-system-1` | Beacon worker identity |
| `--beacon-password <password>` | none | Beacon authentication password |

**Behavior:**

- If `content-path` is omitted and a `./content/` folder exists in the current working directory, the CLI uses that automatically. This matches the `docs/` and `content/` layouts common in open-source repos.
- If the content path does not exist, the CLI exits with an error.
- When running in beacon mode, the HTTP server still starts normally -- the beacon adds workflow capabilities on top of the regular REST API.
- The CLI prints a banner with the URL once the server is ready.

**Examples:**

```bash
# Serve the current directory on a random port
rcs serve

# Serve ./content (auto-detected)
cd ~/my-project
rcs serve

# Serve a specific folder on a specific port
rcs serve ~/Documents/handbook -p 8080

# Serve with an Ultravisor beacon
rcs serve ./docs -b http://localhost:54321

# Serve with beacon + custom worker name and password
rcs serve ./docs \
	-b http://ultravisor.internal:54321 \
	--beacon-name docs-edge-1 \
	--beacon-password hunter2
```

**Output on startup:**

```
==========================================================
  Retold Content System running on http://localhost:7234
==========================================================
  Content: /Users/steven/my-docs
==========================================================
```

**Routes exposed:**

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Reader (`pict-docuserve`) |
| GET | `/edit.html` | Editor application |
| GET | `/preview.html` | Standalone preview |
| GET | `/content/*` | Static file access to the content folder |
| GET | `/api/filebrowser/list` | File listing |
| GET | `/api/filebrowser/info` | File metadata |
| PUT | `/api/filebrowser/settings` | File browser settings (hidden files, etc.) |
| GET | `/api/content/read/*` | Read markdown content |
| PUT | `/api/content/save/*` | Save markdown content |
| POST | `/api/content/upload-image` | Upload an image |
| POST | `/api/content/mkdir` | Create a folder |

See [Architecture](architecture.md) for the full request-flow details and [API Reference](api-reference.md) for request/response shapes.

## Exit Codes

| Code | Meaning |
|---|---|
| `0` | Normal exit (Ctrl+C) |
| `1` | Startup failure (content path missing, port in use, etc.) |

## Environment Variables

The CLI itself does not read environment variables directly, but the underlying Orator server respects `NODE_ENV` for log verbosity.

If you are embedding the content system in a larger Node process, you can drive the `setupContentSystemServer` options from environment variables in your wrapper -- see [Persistence Hooks](persistence-hooks.md) for an example wrapper.

## Beacon Mode Details

When `--beacon` is set, the CLI registers these capabilities with the Ultravisor server:

| Capability | Input | Output |
|---|---|---|
| `ReadFile` | `{ FilePath }` | `{ Content }` |
| `SaveFile` | `{ FilePath, Content }` | `{ Success, Path, Size }` |
| `ListFiles` | `{ Path }` | `{ Files: [...] }` |
| `CreateFolder` | `{ Path }` | `{ Success, Path }` |

These mirror the REST endpoints, so a workflow dispatched through Ultravisor has the same access to the content folder as a browser running the editor. Beacon mode is typically used when the content system is deployed as an edge worker and clients drive it through Ultravisor workflows instead of direct HTTP.

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `EADDRINUSE` on startup | Another process is listening on the chosen port | Pass a different `-p` value or kill the other process |
| `ENOENT: no such file or directory` | The content path does not exist | Check the path; use an absolute path if in doubt |
| Browser shows 404 for `/content/file.md` | The file name does not match exactly (case sensitivity) | Check the name on disk -- the static route is case-sensitive |
| Image upload returns 403 | Content folder is not writable by the Node process | Adjust filesystem permissions |
| Beacon never connects | Wrong URL, name, or password | Check the Ultravisor server logs; the CLI prints beacon handshake failures at startup |
| Editor loads but file list is empty | `ShowHiddenFiles` is off and the content folder only contains dotfiles | Toggle "Show Hidden Files" in the settings panel (or pass an appropriate `content-path`) |

## Version

The installed version is visible in:

```bash
rcs --version
```

or from `package.json`:

```bash
npm view retold-content-system version
```
