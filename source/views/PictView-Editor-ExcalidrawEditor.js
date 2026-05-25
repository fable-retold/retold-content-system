const libPictSectionExcalidraw = require('pict-section-excalidraw');

/**
 * Content Editor Excalidraw Editor View
 *
 * Wraps pict-section-excalidraw for editing Excalidraw scenes stored in the
 * content tree under retold-content-system's "2-file mode":
 *
 *   - <name>.excalidraw.svg    Primary file.  Standard SVG that any markdown
 *                              renderer or image viewer can display, plus
 *                              the full Excalidraw scene embedded inside
 *                              the SVG as <metadata> (via Excalidraw's
 *                              exportEmbedScene option).  Markdown
 *                              references it via standard
 *                              `![](foo.excalidraw.svg)`.
 *   - <name>.excalidraw.json   Readable JSON sidecar.  Same scene data as a
 *                              pretty-printed JSON file — diffable and
 *                              consumable by external tooling.
 *
 * The shared `.excalidraw.` infix lets retold-content-system route on
 * filename alone (no content sniffing): both extensions open this editor.
 * Saving always writes both files in sync.
 *
 * Backward compatibility: bare `.excalidraw` files (single-extension legacy
 * naming) are still recognized and edited; on save, the canonical
 * `.excalidraw.svg` + `.excalidraw.json` pair is produced alongside.
 *
 * Wiring lives in Pict-Application-ContentEditor.js — when navigateToFile
 * sees a .excalidraw extension or a probed-Excalidraw .svg, it sets
 * ActiveEditor='excalidraw', renders this view, and dispatches to its
 * load()/save() methods on action.
 */

const _ViewConfiguration =
{
	ViewIdentifier: "ContentEditor-ExcalidrawEditor",

	DefaultRenderable: "Excalidraw-Wrap",
	DefaultDestinationAddress: "#ContentEditor-Editor-Container",
	TargetElementAddress: "#ContentEditor-Editor-Container",

	EmbedMode: "react",
	Theme: "auto",
	AssetBaseURL: "/js/excalidraw-assets/",

	// Don't autobind to AppData — we drive load/save via the content
	// provider explicitly so the file path can change between renders.
	DrawingDataAddress: false,
	AutoRender: false,

	Renderables:
	[
		{
			RenderableHash: "Excalidraw-Wrap",
			TemplateHash: "Excalidraw-Container",
			DestinationAddress: "#ContentEditor-Editor-Container"
		}
	]
};

class ContentEditorExcalidrawEditorView extends libPictSectionExcalidraw.ReactView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this._activeFilePath = null;
		this._sceneLoadedFor = null;
	}

	/**
	 * Bind this view to a specific file path.  Called by navigateToFile in
	 * the content app before render().  The path may be one of:
	 *   - <stem>.excalidraw.svg    (primary, scene embedded as <metadata>)
	 *   - <stem>.excalidraw.json   (readable JSON sidecar)
	 *   - <stem>.excalidraw        (legacy single-extension naming)
	 * Both branches resolve to the same scene; the difference only matters
	 * when computing sibling paths on save.
	 *
	 * @param {string} pFilePath
	 */
	bindToFile(pFilePath)
	{
		this._activeFilePath = pFilePath;
		this._sceneLoadedFor = null;
	}

	/**
	 * Derive both file paths for the 2-file mode given whichever file the
	 * user opened.  Always returns { svgPath, jsonPath } using the canonical
	 * `<stem>.excalidraw.svg` + `<stem>.excalidraw.json` naming.
	 *
	 *   foo.excalidraw.svg   ->  svgPath=foo.excalidraw.svg, jsonPath=foo.excalidraw.json
	 *   foo.excalidraw.json  ->  svgPath=foo.excalidraw.svg, jsonPath=foo.excalidraw.json
	 *   foo.excalidraw       ->  svgPath=foo.excalidraw.svg, jsonPath=foo.excalidraw.json
	 *                            (legacy file becomes the json sibling; once saved,
	 *                             the canonical pair lives alongside it)
	 */
	_resolveBothPaths(pPath)
	{
		if (!pPath) return null;
		let tmpLower = pPath.toLowerCase();

		// Canonical 2-extension forms first.
		if (tmpLower.endsWith('.excalidraw.svg'))
		{
			let tmpStem = pPath.replace(/\.excalidraw\.svg$/i, '');
			return {
				svgPath:  tmpStem + '.excalidraw.svg',
				jsonPath: tmpStem + '.excalidraw.json'
			};
		}
		if (tmpLower.endsWith('.excalidraw.json'))
		{
			let tmpStem = pPath.replace(/\.excalidraw\.json$/i, '');
			return {
				svgPath:  tmpStem + '.excalidraw.svg',
				jsonPath: tmpStem + '.excalidraw.json'
			};
		}
		// Legacy bare `.excalidraw` — produce the canonical pair.
		if (tmpLower.endsWith('.excalidraw'))
		{
			let tmpStem = pPath.replace(/\.excalidraw$/i, '');
			return {
				svgPath:  tmpStem + '.excalidraw.svg',
				jsonPath: tmpStem + '.excalidraw.json'
			};
		}
		// Unknown extension — append the canonical suffixes.
		return {
			svgPath:  pPath + '.excalidraw.svg',
			jsonPath: pPath + '.excalidraw.json'
		};
	}

	onAfterInitialRender()
	{
		super.onAfterInitialRender();
		if (this._activeFilePath && this._sceneLoadedFor !== this._activeFilePath)
		{
			this._loadFromContent();
		}
	}

	_loadFromContent()
	{
		let tmpPath = this._activeFilePath;
		if (!tmpPath) return;
		let tmpProvider = this.pict.providers['ContentEditor-Provider'];
		if (!tmpProvider) return;

		this._sceneLoadedFor = tmpPath;
		tmpProvider.loadFile(tmpPath, (pErr, pContent) =>
		{
			if (pErr)
			{
				this.log.error(`ExcalidrawEditor load failed: ${pErr && pErr.message || pErr}`);
				return;
			}
			// Dispatch by extension.  Only `.excalidraw.svg` ends in `.svg`
			// among the routed extensions (the content app's
			// getEditorTypeForFile sees to that), so the SVG check is
			// straightforward.  `.excalidraw.json` and legacy `.excalidraw`
			// fall through to JSON parsing.
			let tmpIsSvg = /\.svg$/i.test(tmpPath);
			if (tmpIsSvg)
			{
				// SVG path: scene + dataURLs are embedded directly in
				// <metadata>, so the file is fully self-contained.  No
				// sidecar hydration needed.
				this._parseSvgScene(pContent).then((pScene) =>
				{
					if (pScene) this.setScene(pScene);
				}).catch((pSceneErr) =>
				{
					this.log.error(`ExcalidrawEditor SVG scene extract failed: ${pSceneErr && pSceneErr.message}`);
				});
				return;
			}

			// JSON path: scene may reference image sidecars by filename.
			// Hydrate dataURLs from the .excalidraw-files/ folder before
			// setting the scene so Excalidraw can render them.
			let tmpScene = this._parseJsonScene(pContent);
			let tmpFolder = this._sidecarFolderFor(tmpPath);
			this._inlineImagesFromSidecars(tmpScene.files, tmpFolder, (pErr, pHydratedFiles) =>
			{
				tmpScene.files = pHydratedFiles || tmpScene.files;
				this.setScene(tmpScene);
			});
		});
	}

	_parseJsonScene(pContent)
	{
		if (!pContent) return { elements: [], appState: {}, files: {} };
		try
		{
			let tmpParsed = JSON.parse(pContent);
			return {
				elements: tmpParsed.elements || [],
				appState: tmpParsed.appState || {},
				files:    tmpParsed.files    || {}
			};
		}
		catch (pErr)
		{
			this.log.error(`ExcalidrawEditor JSON parse failed: ${pErr.message}`);
			return { elements: [], appState: {}, files: {} };
		}
	}

	/**
	 * Sidecar folder for a given diagram path: `<stem>.excalidraw-files/`.
	 * Images embedded in the scene get extracted here and referenced by
	 * filename in the slim JSON, so the `.excalidraw.json` stays diffable.
	 */
	_sidecarFolderFor(pPath)
	{
		let tmpPaths = this._resolveBothPaths(pPath);
		if (!tmpPaths) return null;
		// Strip `.excalidraw.svg` to get the stem (works because both paths
		// share the same stem by construction).
		return tmpPaths.svgPath.replace(/\.excalidraw\.svg$/i, '.excalidraw-files');
	}

	/**
	 * Walk scene.files, peel out base64 dataURLs into write-tasks, return a
	 * slim copy of the files map suitable for the diffable JSON sidecar.
	 *
	 *   Input file entry:  { id, dataURL: "data:image/png;base64,…", mimeType, created }
	 *   Output (slim):     { id, mimeType, created, _sidecar: "<id>.png" }
	 *   Output (writes):   [ { path: "<folder>/<id>.png", base64: "…", mimeType } ]
	 */
	_extractImagesToSidecars(pFiles, pFolder)
	{
		let tmpSlim = {};
		let tmpWrites = [];
		if (!pFiles || !pFolder) return { slim: tmpSlim, writes: tmpWrites };

		let tmpKeys = Object.keys(pFiles);
		for (let i = 0; i < tmpKeys.length; i++)
		{
			let tmpKey = tmpKeys[i];
			let tmpFile = pFiles[tmpKey];
			if (!tmpFile || typeof tmpFile !== 'object')
			{
				tmpSlim[tmpKey] = tmpFile;
				continue;
			}

			let tmpDataURL = tmpFile.dataURL || '';
			let tmpMatch = /^data:([^;]+);base64,(.*)$/.exec(tmpDataURL);
			if (!tmpMatch)
			{
				// Already slim, or non-data URL — leave it alone.
				tmpSlim[tmpKey] = Object.assign({}, tmpFile);
				continue;
			}

			let tmpMime = tmpMatch[1] || tmpFile.mimeType || 'application/octet-stream';
			let tmpB64  = tmpMatch[2] || '';
			let tmpExt  = this._mimeToExtension(tmpMime);
			let tmpSidecarFilename = (tmpFile.id || tmpKey) + tmpExt;

			tmpSlim[tmpKey] = {
				id:        tmpFile.id        || tmpKey,
				mimeType:  tmpMime,
				created:   tmpFile.created   || Date.now(),
				_sidecar:  tmpSidecarFilename
			};
			tmpWrites.push({
				path:     pFolder + '/' + tmpSidecarFilename,
				base64:   tmpB64,
				mimeType: tmpMime
			});
		}

		return { slim: tmpSlim, writes: tmpWrites };
	}

	/**
	 * Inverse of _extractImagesToSidecars: walk the slim files map, fetch
	 * each sidecar via the content provider, and restore dataURLs so
	 * Excalidraw can render the images.
	 *
	 * @param {object} pFiles - the slim files map (post-extraction)
	 * @param {string} pFolder - the sidecar folder path
	 * @param {Function} fCallback - signature (pErr, pHydratedFilesMap)
	 */
	_inlineImagesFromSidecars(pFiles, pFolder, fCallback)
	{
		let tmpCallback = (typeof fCallback === 'function') ? fCallback : () => {};
		if (!pFiles || !pFolder) return tmpCallback(null, pFiles || {});

		let tmpKeys = Object.keys(pFiles);
		let tmpSidecarKeys = tmpKeys.filter((k) =>
		{
			return pFiles[k] && pFiles[k]._sidecar && !pFiles[k].dataURL;
		});

		if (tmpSidecarKeys.length === 0) return tmpCallback(null, pFiles);

		let tmpProvider = this.pict.providers['ContentEditor-Provider'];
		if (!tmpProvider) return tmpCallback(null, pFiles);

		let tmpHydrated = Object.assign({}, pFiles);
		let tmpPending = tmpSidecarKeys.length;
		let tmpFirstErr = null;

		let tmpDone = () =>
		{
			tmpPending--;
			if (tmpPending > 0) return;
			tmpCallback(tmpFirstErr, tmpHydrated);
		};

		for (let i = 0; i < tmpSidecarKeys.length; i++)
		{
			let tmpKey  = tmpSidecarKeys[i];
			let tmpMeta = pFiles[tmpKey];
			let tmpURL  = pFolder + '/' + tmpMeta._sidecar;
			// Use fetch directly — the file is binary and the content provider
			// is text-oriented.  Same /content/ static route serves both.
			fetch('/content/' + tmpURL).then((pRes) =>
			{
				if (!pRes.ok) throw new Error(`HTTP ${pRes.status} fetching ${tmpURL}`);
				return pRes.blob();
			}).then((pBlob) =>
			{
				return new Promise((fResolve, fReject) =>
				{
					let tmpReader = new FileReader();
					tmpReader.onload  = () => fResolve(tmpReader.result);
					tmpReader.onerror = () => fReject(new Error('FileReader failed'));
					tmpReader.readAsDataURL(pBlob);
				});
			}).then((pDataURL) =>
			{
				tmpHydrated[tmpKey] = Object.assign({}, tmpMeta, { dataURL: pDataURL });
				delete tmpHydrated[tmpKey]._sidecar;
				tmpDone();
			}).catch((pErr) =>
			{
				if (!tmpFirstErr) tmpFirstErr = pErr;
				this.log.warn(`Excalidraw sidecar fetch failed for ${tmpURL}: ${pErr.message}`);
				tmpDone();
			});
		}
	}

	_mimeToExtension(pMime)
	{
		let tmpMap = {
			'image/png':  '.png',
			'image/jpeg': '.jpg',
			'image/jpg':  '.jpg',
			'image/gif':  '.gif',
			'image/webp': '.webp',
			'image/svg+xml': '.svg',
			'image/bmp':  '.bmp',
			'image/avif': '.avif'
		};
		return tmpMap[pMime] || '.bin';
	}

	/**
	 * Base64 → raw bytes → write through the content provider.  The content
	 * server's /api/content/save endpoint takes a JSON body with a Content
	 * string field, so we send the base64 directly with a binary marker —
	 * the server detects and decodes via the BinaryEncoding hint.
	 */
	_writeSidecarFile(pPath, pBase64, pMimeType, fCallback)
	{
		let tmpCallback = (typeof fCallback === 'function') ? fCallback : () => {};
		fetch('/api/content/save/' + pPath.split('/').map(encodeURIComponent).join('/'),
		{
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				Content: pBase64,
				BinaryEncoding: 'base64',
				MimeType: pMimeType
			})
		}).then((pRes) =>
		{
			if (!pRes.ok) throw new Error(`HTTP ${pRes.status} writing ${pPath}`);
			return pRes.json().catch(() => ({}));
		}).then(() => tmpCallback(null))
		  .catch((pErr) => tmpCallback(pErr));
	}

	/**
	 * Extract the Excalidraw scene embedded inside an SVG via
	 * Excalidraw's own loadFromBlob.  Returns a Promise that resolves to
	 * the scene data or rejects if no embed is found.
	 */
	_parseSvgScene(pSvgContent)
	{
		let tmpVendor = this._resolveVendor();
		if (!tmpVendor || !tmpVendor.loadFromBlob)
		{
			return Promise.reject(new Error('Excalidraw loadFromBlob unavailable'));
		}
		try
		{
			let tmpBlob = new Blob([pSvgContent || ''], { type: 'image/svg+xml' });
			return tmpVendor.loadFromBlob(tmpBlob, null, null).then((pData) =>
			{
				return {
					elements: (pData && pData.elements) || [],
					appState: (pData && pData.appState) || {},
					files:    (pData && pData.files)    || {}
				};
			});
		}
		catch (pErr)
		{
			return Promise.reject(pErr);
		}
	}

	/**
	 * Save the current scene to BOTH files (2-file mode): the .svg with
	 * the scene embedded inline, and the .excalidraw JSON sidecar.
	 *
	 * Called from the content app's saveCurrentFile() when ActiveEditor is
	 * 'excalidraw'.  Reports through fCallback when both writes are complete
	 * (or earlier if either fails fatally).
	 */
	saveToContent(fCallback)
	{
		let tmpCallback = (typeof fCallback === 'function') ? fCallback : () => {};
		let tmpPath = this._activeFilePath;
		if (!tmpPath) return tmpCallback(new Error('no active file'));

		let tmpScene = this.getScene();
		if (!tmpScene) return tmpCallback(new Error('Excalidraw not mounted yet'));

		let tmpPaths = this._resolveBothPaths(tmpPath);
		if (!tmpPaths) return tmpCallback(new Error('could not derive sidecar paths'));

		let tmpProvider = this.pict.providers['ContentEditor-Provider'];
		if (!tmpProvider) return tmpCallback(new Error('content provider missing'));

		// 1. Build the SVG with the scene embedded inside it.  Keeps full
		//    dataURLs for self-contained portability.
		this.exportSvg({ exportEmbedScene: true }).then((pSvgEl) =>
		{
			if (!pSvgEl)
			{
				return tmpCallback(new Error('SVG export returned nothing'));
			}
			let tmpSvgString = new XMLSerializer().serializeToString(pSvgEl);

			// 2. Extract base64 image dataURLs out of scene.files into the
			//    sidecar folder, leaving the slim files map (with _sidecar
			//    filename refs) in the JSON.  Keeps the .excalidraw.json
			//    diffable — base64 noise doesn't grow the source-control
			//    diff every time someone moves a shape.
			let tmpSidecarFolder = this._sidecarFolderFor(tmpPath);
			let tmpRelativeSidecar = tmpSidecarFolder.replace(/^.*\//, ''); // basename
			let tmpExtracted = this._extractImagesToSidecars(tmpScene.files, tmpRelativeSidecar);

			// 3. Build the JSON sidecar with the slim files map.
			let tmpJson = JSON.stringify({
				type:     'excalidraw',
				version:  2,
				source:   'retold-content-system',
				elements: tmpScene.elements,
				appState: tmpScene.appState,
				files:    tmpExtracted.slim
			}, null, 2);

			// 4. Write everything in parallel:
			//      - SVG primary
			//      - JSON sidecar
			//      - One file per extracted image
			let tmpSvgErr = null;
			let tmpJsonErr = null;
			let tmpPending = 2 + tmpExtracted.writes.length;
			let tmpComplete = () =>
			{
				tmpPending--;
				if (tmpPending > 0) return;
				if (tmpSvgErr) return tmpCallback(tmpSvgErr);
				if (tmpJsonErr)
				{
					this.log.warn(`ExcalidrawEditor JSON sidecar write failed: ${tmpJsonErr.message || tmpJsonErr}`);
				}
				return tmpCallback(null);
			};

			tmpProvider.saveFile(tmpPaths.svgPath, tmpSvgString, (pErr) =>
			{
				tmpSvgErr = pErr || null;
				tmpComplete();
			});
			tmpProvider.saveFile(tmpPaths.jsonPath, tmpJson, (pErr) =>
			{
				tmpJsonErr = pErr || null;
				tmpComplete();
			});

			// The extracted sidecar paths in tmpExtracted.writes are
			// relative (just folder/filename) — prefix with the diagram's
			// parent directory to get the full content-tree path.
			let tmpParentDir = tmpPaths.svgPath.replace(/\/[^/]*$/, '');
			if (tmpParentDir === tmpPaths.svgPath) tmpParentDir = '';
			let tmpDirPrefix  = tmpParentDir ? tmpParentDir + '/' : '';

			for (let i = 0; i < tmpExtracted.writes.length; i++)
			{
				let tmpWrite = tmpExtracted.writes[i];
				let tmpFullPath = tmpDirPrefix + tmpWrite.path;
				this._writeSidecarFile(tmpFullPath, tmpWrite.base64, tmpWrite.mimeType, (pErr) =>
				{
					if (pErr)
					{
						this.log.warn(`ExcalidrawEditor sidecar image write failed: ${pErr.message || pErr}`);
					}
					tmpComplete();
				});
			}
		}).catch((pErr) =>
		{
			tmpCallback(pErr || new Error('SVG export failed'));
		});
	}

	/**
	 * Synchronously sniff a string for the Excalidraw scene-embed signature.
	 * Used by the content app's pre-flight probe so it can decide whether to
	 * route a .svg file to this editor or to the binary preview.
	 *
	 * @param {string} pSvgContent
	 * @returns {boolean}
	 */
	static svgHasEmbeddedScene(pSvgContent)
	{
		if (!pSvgContent || typeof pSvgContent !== 'string') return false;
		// Excalidraw embeds the scene under <metadata><excalidraw-data>...
		// We do a substring sniff rather than parsing — fast and reliable
		// enough for the routing decision (the actual extraction goes
		// through loadFromBlob which validates structure).
		return pSvgContent.indexOf('excalidraw') !== -1 &&
			(pSvgContent.indexOf('payload-type') !== -1 ||
			 pSvgContent.indexOf('payload-version') !== -1 ||
			 pSvgContent.indexOf('excalidraw-data') !== -1);
	}
}

module.exports = ContentEditorExcalidrawEditorView;
module.exports.default_configuration = _ViewConfiguration;
module.exports.svgHasEmbeddedScene = ContentEditorExcalidrawEditorView.svgHasEmbeddedScene;
