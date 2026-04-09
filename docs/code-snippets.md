# Code Snippets

One runnable snippet per exposed piece of functionality. Persistence hooks get extra coverage because they are the most commonly customized extension points; for deeper patterns and recipes see [Persistence Hooks](persistence-hooks.md).

Most snippets assume:

```javascript
const libPict             = require('pict');
const libPictProvider     = require('pict-provider');
const libContentSystem    = require('retold-content-system');
const libContentEditor    = libContentSystem.ContentEditorApplication;
const libContentProvider  = libContentSystem.ContentEditorProvider;
```

---

## CLI: `rcs serve`

```bash
# Current directory, random port
rcs serve

# Specific folder on a specific port
rcs serve ~/Documents/handbook -p 8080

# With Ultravisor beacon mode
rcs serve ./docs -b http://localhost:54321 --beacon-name edge-1 --beacon-password secret
```

---

## Programmatic Server Start

Embed the server inside your own Node process:

```javascript
const libFable  = require('fable');
const libOrator = require('orator');
const setup     = require('retold-content-system/source/cli/ContentSystem-Server-Setup');

const _Fable  = new libFable({ Product: 'MyContentHost' });
const _Orator = new libOrator({
	Product:         'MyContentHost',
	APIServerPort:   8080
}, _Fable);

setup.setupContentSystemServer(_Orator, {
	ContentPath: '/var/data/docs',
	DistPath:    require.resolve('retold-content-system/web-application')
});

_Orator.startWebServer(() => console.log('content server on :8080'));
```

---

## `ContentEditorApplication.navigateToFile(pFilePath)`

Open a file in the editor programmatically.

```javascript
const view = _Pict.PictApplication;
view.navigateToFile('guides/getting-started.md');
```

---

## `ContentEditorApplication.saveCurrentFile()`

Save the currently open file.

```javascript
_Pict.PictApplication.saveCurrentFile();
```

---

## `ContentEditorApplication.closeCurrentFile()`

Close the open file, prompting if dirty.

```javascript
_Pict.PictApplication.closeCurrentFile();
```

---

## `ContentEditorApplication.createNewFile(pFilePath)`

Create and open a new file with default content.

```javascript
_Pict.PictApplication.createNewFile('guides/new-topic.md');
```

---

## `ContentEditorApplication.promptNewFile()` / `promptNewFolder()`

Pop up the built-in prompt dialogs for creating files or folders.

```javascript
document.querySelector('#btn-new-file').addEventListener('click', () =>
	_Pict.PictApplication.promptNewFile());

document.querySelector('#btn-new-folder').addEventListener('click', () =>
	_Pict.PictApplication.promptNewFolder());
```

---

## `ContentEditorApplication.loadFileList(pPath, fCallback)`

Load a folder listing directly (usually the file browser sidebar does this for you).

```javascript
_Pict.PictApplication.loadFileList('guides/', (pError, pFiles) =>
{
	if (pError) return console.error(pError);
	pFiles.forEach((f) => console.log(f.Type, f.Name, f.Size));
});
```

---

## `ContentEditorApplication.insertFileReference(pFilename)`

Insert a relative reference to a file at the cursor. Used by the file browser's "insert" button.

```javascript
_Pict.PictApplication.insertFileReference('images/diagram.png');
// Inserts: ![diagram](images/diagram.png) into the markdown editor
```

---

## `ContentEditorApplication.segmentMarkdownContent(pContent)`

Split markdown into an array of segments by heading depth.

```javascript
const segments = _Pict.PictApplication.segmentMarkdownContent(fs.readFileSync('guide.md', 'utf8'));
console.log(segments.length, 'segments');
segments.forEach((s, i) => console.log(`segment ${ i }:`, s.Content.slice(0, 40)));
```

---

## `ContentEditorApplication.getEditorTypeForFile(pFilePath)`

Decide which editor variant a file should use.

```javascript
_Pict.PictApplication.getEditorTypeForFile('guides/intro.md');     // 'markdown'
_Pict.PictApplication.getEditorTypeForFile('server.js');            // 'code'
_Pict.PictApplication.getEditorTypeForFile('images/hero.png');      // 'binary'
```

---

## `ContentEditorApplication.resolveHash()`

Resolve the current URL hash and open the referenced file. Runs automatically on load.

```javascript
window.location.hash = '#/edit/guides/getting-started.md';
_Pict.PictApplication.resolveHash();
```

---

## `ContentEditorApplication.saveSettings()`

Persist the editor settings (word wrap, preview mode, hidden files, ...) to `localStorage`.

```javascript
_Pict.AppData.ContentEditor.MarkdownWordWrap = false;
_Pict.PictApplication.saveSettings();
```

---

# Persistence Hooks

These are the most important extension points. Each snippet shows how to override a boundary with a minimal runnable example. For deeper recipes (database, S3, Git, CDN) see [Persistence Hooks](persistence-hooks.md).

## Custom Provider: Load Markdown

Override `loadFile` to read markdown from any backend.

```javascript
class MyContentProvider extends libPictProvider
{
	loadFile(pFilePath, fCallback)
	{
		fetch(`https://api.example.com/docs/${ encodeURIComponent(pFilePath) }`, {
			headers: { 'Authorization': 'Bearer ' + this.pict.AppData.AuthToken }
		})
			.then((r) => r.json())
			.then((data) =>
			{
				if (!data.ok) return fCallback(data.error || 'unknown', '');
				fCallback(null, data.content);
			})
			.catch((err) => fCallback(err.message, ''));
	}
}
```

---

## Custom Provider: Save Markdown

Override `saveFile` to persist markdown wherever you want.

```javascript
class MyContentProvider extends libPictProvider
{
	saveFile(pFilePath, pContent, fCallback)
	{
		fetch(`https://api.example.com/docs/${ encodeURIComponent(pFilePath) }`, {
			method:  'PUT',
			headers: {
				'Content-Type':  'application/json',
				'Authorization': 'Bearer ' + this.pict.AppData.AuthToken
			},
			body: JSON.stringify({ content: pContent })
		})
			.then((r) => r.json())
			.then((data) => fCallback(data.ok ? null : (data.error || 'save failed')))
			.catch((err) => fCallback(err.message));
	}
}
```

---

## Custom Provider: Upload Image

Override `uploadImage` to send image bytes to any storage backend and return a public URL.

```javascript
class MyContentProvider extends libPictProvider
{
	uploadImage(pFile, fCallback)
	{
		const tmpForm = new FormData();
		tmpForm.append('file', pFile, pFile.name);

		fetch('https://api.example.com/uploads', {
			method: 'POST',
			headers: { 'Authorization': 'Bearer ' + this.pict.AppData.AuthToken },
			body:    tmpForm
		})
			.then((r) => r.json())
			.then((data) =>
			{
				if (!data.ok) return fCallback(data.error || 'upload failed');
				fCallback(null, data.url);
			})
			.catch((err) => fCallback(err.message));
	}
}
```

---

## Registering a Custom Provider

Register the subclass under the provider id `ContentEditor-Provider` inside your subclassed application.

```javascript
class MyContentEditorApplication extends libContentEditor
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.pict.addProvider(
			'ContentEditor-Provider',
			MyContentProvider.default_configuration,
			MyContentProvider);
	}
}

module.exports = MyContentEditorApplication;

MyContentProvider.default_configuration =
{
	"ProviderIdentifier":    "ContentEditor-Provider",
	"AutoInitialize":        true,
	"AutoInitializeOrdinal": 0
};
```

Mount the custom application in `edit.html` instead of the default:

```html
<script>
	Pict.safeOnDocumentReady(() => Pict.safeLoadPictApplication(MyContentEditorApplication, 2));
</script>
```

---

## Server-Side Read Override

Replace the default filesystem read with a database-backed handler.

```javascript
server.get('/api/content/read/*', async (pRequest, pResponse) =>
{
	const tmpPath = pRequest.params['*'];
	try
	{
		const tmpRow = await _Db.query(
			'SELECT content FROM files WHERE path = $1',
			[tmpPath]);

		if (tmpRow.rows.length === 0)
		{
			return pResponse.send(404, { Success: false, Error: 'Not found' });
		}
		pResponse.send({ Success: true, Content: tmpRow.rows[0].content });
	}
	catch (pError)
	{
		pResponse.send(500, { Success: false, Error: pError.message });
	}
});
```

---

## Server-Side Save Override

```javascript
server.put('/api/content/save/*', async (pRequest, pResponse) =>
{
	const tmpPath    = pRequest.params['*'];
	const tmpContent = pRequest.body?.Content ?? '';
	try
	{
		await _Db.query(
			`INSERT INTO files (path, content, updated_at)
			 VALUES ($1, $2, NOW())
			 ON CONFLICT (path) DO UPDATE SET content = $2, updated_at = NOW()`,
			[tmpPath, tmpContent]);
		pResponse.send({ Success: true, Path: tmpPath, Size: tmpContent.length });
	}
	catch (pError)
	{
		pResponse.send(500, { Success: false, Error: pError.message });
	}
});
```

---

## Server-Side Image Upload Override (S3)

```javascript
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const _S3 = new S3Client({ region: 'us-east-1' });

server.post('/api/content/upload-image', async (pRequest, pResponse) =>
{
	const tmpFilename   = pRequest.headers['x-filename'];
	const tmpUploadPath = pRequest.headers['x-upload-path'] || '';
	const tmpKey        = (tmpUploadPath ? tmpUploadPath + '/' : '') + tmpFilename;

	try
	{
		await _S3.send(new PutObjectCommand({
			Bucket:       process.env.IMAGE_BUCKET,
			Key:          tmpKey,
			Body:         pRequest.body,
			ContentType:  pRequest.headers['content-type'] || 'application/octet-stream',
			ACL:          'public-read'
		}));

		pResponse.send({
			Success:      true,
			URL:          `https://${ process.env.IMAGE_BUCKET }.s3.amazonaws.com/${ tmpKey }`,
			RelativePath: tmpKey,
			Filename:     tmpFilename,
			Size:         pRequest.body.length
		});
	}
	catch (pError)
	{
		pResponse.send(500, { Success: false, Error: pError.message });
	}
});
```

---

## Server-Side mkdir Override

```javascript
server.post('/api/content/mkdir', async (pRequest, pResponse) =>
{
	const tmpPath = pRequest.body?.Path;
	try
	{
		await _Db.query('INSERT INTO folders (path) VALUES ($1) ON CONFLICT DO NOTHING', [tmpPath]);
		pResponse.send({ Success: true, Path: tmpPath });
	}
	catch (pError)
	{
		pResponse.send(500, { Success: false, Error: pError.message });
	}
});
```

---

## Reading Raw Files via the Static Route

Any file in the content folder is reachable at `/content/<path>`:

```javascript
const tmpImage = await fetch('/content/guides/images/screenshot.png');
const tmpBlob  = await tmpImage.blob();
```

---

## File Browser Settings

The file browser exposes a `PUT /api/filebrowser/settings` endpoint. The editor uses this to push the "Show Hidden Files" toggle to the server:

```javascript
fetch('/api/filebrowser/settings', {
	method:  'PUT',
	headers: { 'Content-Type': 'application/json' },
	body:    JSON.stringify({ IncludeHiddenFiles: true })
}).then(() => _Pict.PictApplication.loadFileList());
```

---

## Reading Session / AppData State

Any view can read the current editor state from `pict.AppData.ContentEditor`:

```javascript
const ed = _Pict.AppData.ContentEditor;
console.log('Open file:',     ed.CurrentFile);
console.log('Dirty:',          ed.IsDirty);
console.log('Active editor:',  ed.ActiveEditor);
console.log('Word wrap on:',   ed.MarkdownWordWrap);
```

---

## Deep-Linking Into a File

You can deep-link to a file by setting the URL hash before load, or by updating it after load and calling `resolveHash()`.

```javascript
window.location.hash = '#/edit/guides/advanced.md';
_Pict.PictApplication.resolveHash();
```

---

## Subclassing the Reader

```javascript
const libContentReader = libContentSystem.ContentReaderApplication;

class MyContentReader extends libContentReader
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterInitializeAsync(fCallback)
	{
		super.onAfterInitializeAsync(() =>
		{
			// e.g. add an analytics script
			const s = document.createElement('script');
			s.src = 'https://analytics.example.com/tracker.js';
			document.head.appendChild(s);
			if (fCallback) fCallback();
		});
	}
}
```
