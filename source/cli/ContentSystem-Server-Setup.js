/**
 * Retold Content System -- Shared Orator Server Setup
 *
 * This module encapsulates all server initialization logic so it can be
 * used by both the standalone Simple-Server.js entry point and the CLI serve command.
 *
 * @param {object} pOptions
 * @param {string} pOptions.ContentPath  - Absolute path to the markdown content folder
 * @param {string} pOptions.DistPath     - Absolute path to the built web-application folder
 * @param {number} pOptions.Port         - HTTP port to listen on
 * @param {Function} fCallback           - Callback(pError, { Fable, Orator, Port })
 */

const libFs = require('fs');
const libPath = require('path');

const libFable = require('fable');
const libOrator = require('orator');
const libOratorServiceServerRestify = require('orator-serviceserver-restify');
const libFileBrowserService = require('pict-section-filebrowser').FileBrowserService;

/**
 * Sanitize a file path -- prevent directory traversal attacks.
 *
 * @param {string} pPath - The raw path from the client
 * @returns {string|null} A safe relative path, or null if invalid
 */
function sanitizePath(pPath)
{
	if (!pPath || typeof (pPath) !== 'string')
	{
		return null;
	}

	// Decode URI components
	let tmpPath = decodeURIComponent(pPath);

	// Remove leading slashes
	tmpPath = tmpPath.replace(/^\/+/, '');

	// Block directory traversal
	if (tmpPath.includes('..'))
	{
		return null;
	}

	// Block absolute paths
	if (libPath.isAbsolute(tmpPath))
	{
		return null;
	}

	// Remove dangerous characters
	tmpPath = tmpPath.replace(/[<>"|?*]/g, '_');

	return tmpPath || null;
}

/**
 * Sanitize a filename -- strip path separators and dangerous characters.
 *
 * @param {string} pName - The raw filename from the client
 * @returns {string} A safe filename
 */
function sanitizeFilename(pName)
{
	if (!pName || typeof (pName) !== 'string')
	{
		return 'upload';
	}
	let tmpName = libPath.basename(pName);
	tmpName = tmpName.replace(/[\/\\:*?"<>|]/g, '_');
	if (tmpName.length > 200)
	{
		tmpName = tmpName.substring(0, 200);
	}
	return tmpName || 'upload';
}

/**
 * Set up and start the Retold Content System Orator server.
 */
function setupContentSystemServer(pOptions, fCallback)
{
	let tmpContentPath = pOptions.ContentPath;
	let tmpDistFolder = pOptions.DistPath;
	let tmpPort = pOptions.Port;

	let tmpSettings =
	{
		Product: 'Retold-Content-System',
		ProductVersion: require('../../package.json').version,
		APIServerPort: tmpPort,
		ContentPath: tmpContentPath
	};

	let tmpFable = new libFable(tmpSettings);

	// Ensure the content directory exists
	if (!libFs.existsSync(tmpContentPath))
	{
		libFs.mkdirSync(tmpContentPath, { recursive: true });
	}

	tmpFable.serviceManager.addServiceType('OratorServiceServer', libOratorServiceServerRestify);
	tmpFable.serviceManager.instantiateServiceProvider('OratorServiceServer');
	tmpFable.serviceManager.addServiceType('Orator', libOrator);
	let tmpOrator = tmpFable.serviceManager.instantiateServiceProvider('Orator');

	// Set up the FileBrowserService for the content directory
	let tmpFileBrowser = new libFileBrowserService(tmpFable,
	{
		BasePath: tmpContentPath,
		APIRoutePrefix: '/api/filebrowser',
		ServeWebApp: false,
		IncludeHiddenFiles: false
	});

	tmpOrator.initialize(
		function ()
		{
			let tmpServiceServer = tmpOrator.serviceServer;

			// Enable body parsing for POST/PUT requests
			tmpServiceServer.server.use(tmpServiceServer.bodyParser());

			// Connect the file browser API routes
			tmpFileBrowser.connectRoutes();

			// --- PUT /api/filebrowser/settings ---
			// Toggle file browser options at runtime (e.g. hidden files)
			tmpServiceServer.put('/api/filebrowser/settings',
				(pRequest, pResponse, fNext) =>
				{
					try
					{
						if (pRequest.body && typeof (pRequest.body.IncludeHiddenFiles) === 'boolean')
						{
							tmpFileBrowser.options.IncludeHiddenFiles = pRequest.body.IncludeHiddenFiles;
						}
						pResponse.send({ Success: true });
					}
					catch (pError)
					{
						pResponse.send(500, { Error: pError.message });
					}
					return fNext();
				});

			// --- POST /api/content/mkdir ---
			// Create a new folder inside the content directory.
			// Body: { Path: "relative/path/to/new-folder" }
			tmpServiceServer.post('/api/content/mkdir',
				(pRequest, pResponse, fNext) =>
				{
					try
					{
						let tmpRawPath = (pRequest.body && pRequest.body.Path) ? pRequest.body.Path : null;
						let tmpSafePath = sanitizePath(tmpRawPath);

						if (!tmpSafePath)
						{
							pResponse.send(400, { Success: false, Error: 'Invalid folder path.' });
							return fNext();
						}

						let tmpFullPath = libPath.join(tmpContentPath, tmpSafePath);

						// Ensure the resolved path is within the content directory
						let tmpRealContent = libFs.realpathSync(tmpContentPath);
						let tmpTargetParent = libPath.dirname(tmpFullPath);
						if (libFs.existsSync(tmpTargetParent))
						{
							tmpTargetParent = libFs.realpathSync(tmpTargetParent);
						}
						if (!tmpTargetParent.startsWith(tmpRealContent))
						{
							pResponse.send(403, { Success: false, Error: 'Access denied.' });
							return fNext();
						}

						if (libFs.existsSync(tmpFullPath))
						{
							pResponse.send(409, { Success: false, Error: 'Folder already exists.' });
							return fNext();
						}

						libFs.mkdirSync(tmpFullPath, { recursive: true });

						tmpFable.log.info(`Folder created: ${tmpSafePath}`);
						pResponse.send({ Success: true, Path: tmpSafePath });
					}
					catch (pError)
					{
						tmpFable.log.error(`Folder creation failed: ${pError.message}`);
						pResponse.send(500, { Success: false, Error: pError.message });
					}
					return fNext();
				});

			// --- GET /api/content/read/* ---
			// Read the raw markdown content of a file
			tmpServiceServer.get('/api/content/read/*',
				(pRequest, pResponse, fNext) =>
				{
					try
					{
						let tmpFilePath = sanitizePath(pRequest.params['*']);

						if (!tmpFilePath)
						{
							pResponse.send(400, { Success: false, Error: 'Invalid file path.' });
							return fNext();
						}

						let tmpFullPath = libPath.join(tmpContentPath, tmpFilePath);

						// Ensure the resolved path is within the content directory
						let tmpRealContent = libFs.realpathSync(tmpContentPath);
						if (!tmpFullPath.startsWith(tmpRealContent))
						{
							pResponse.send(403, { Success: false, Error: 'Access denied.' });
							return fNext();
						}

						if (!libFs.existsSync(tmpFullPath))
						{
							pResponse.send(404, { Success: false, Error: 'File not found.' });
							return fNext();
						}

						let tmpContent = libFs.readFileSync(tmpFullPath, 'utf8');
						pResponse.send({ Success: true, Path: tmpFilePath, Content: tmpContent });
					}
					catch (pError)
					{
						pResponse.send(500, { Success: false, Error: pError.message });
					}
					return fNext();
				});

			// --- PUT /api/content/save/* ---
			// Save markdown content to a file (create or overwrite)
			tmpServiceServer.put('/api/content/save/*',
				(pRequest, pResponse, fNext) =>
				{
					try
					{
						let tmpFilePath = sanitizePath(pRequest.params['*']);

						if (!tmpFilePath)
						{
							pResponse.send(400, { Success: false, Error: 'Invalid file path.' });
							return fNext();
						}

						let tmpFullPath = libPath.join(tmpContentPath, tmpFilePath);

						// Ensure the resolved path target is within the content directory
						let tmpRealContent = libFs.realpathSync(tmpContentPath);
						let tmpTargetDir = libPath.dirname(tmpFullPath);
						// The file may not exist yet, but the directory should be within content
						if (!tmpTargetDir.startsWith(tmpRealContent))
						{
							pResponse.send(403, { Success: false, Error: 'Access denied.' });
							return fNext();
						}

						let tmpContent = '';
						if (pRequest.body && typeof (pRequest.body) === 'object' && pRequest.body.Content !== undefined)
						{
							tmpContent = pRequest.body.Content;
						}
						else if (typeof (pRequest.body) === 'string')
						{
							tmpContent = pRequest.body;
						}

						// Ensure the target directory exists
						let tmpDir = libPath.dirname(tmpFullPath);
						if (!libFs.existsSync(tmpDir))
						{
							libFs.mkdirSync(tmpDir, { recursive: true });
						}

						libFs.writeFileSync(tmpFullPath, tmpContent, 'utf8');

						tmpFable.log.info(`Content saved: ${tmpFilePath} (${tmpContent.length} bytes)`);
						pResponse.send({ Success: true, Path: tmpFilePath, Size: tmpContent.length });
					}
					catch (pError)
					{
						tmpFable.log.error(`Content save failed: ${pError.message}`);
						pResponse.send(500, { Success: false, Error: pError.message });
					}
					return fNext();
				});

			// --- POST /api/content/upload-image ---
			// Upload an image file into the content folder the user is browsing.
			// The client sends the target folder via the x-upload-path header.
			tmpServiceServer.post('/api/content/upload-image',
				(pRequest, pResponse, fNext) =>
				{
					try
					{
						let tmpBody = pRequest.body;

						if (!tmpBody)
						{
							pResponse.send(400, { Success: false, Error: 'No image data received.' });
							return fNext();
						}

						let tmpOriginalName = sanitizeFilename(pRequest.headers['x-filename']);
						let tmpContentType = pRequest.headers['content-type'] || 'application/octet-stream';

						// Determine file extension from content-type if needed
						let tmpExt = libPath.extname(tmpOriginalName);
						if (!tmpExt)
						{
							let tmpMimeMap =
							{
								'image/png': '.png',
								'image/jpeg': '.jpg',
								'image/gif': '.gif',
								'image/webp': '.webp',
								'image/svg+xml': '.svg',
								'image/bmp': '.bmp'
							};
							tmpExt = tmpMimeMap[tmpContentType] || '.bin';
							tmpOriginalName += tmpExt;
						}

						// Determine the target folder: use the x-upload-path header
						// (the folder the user is currently browsing), falling back
						// to the content root if none is provided.
						let tmpUploadFolder = tmpContentPath;
						let tmpRelativeFolder = '';
						let tmpRawUploadPath = pRequest.headers['x-upload-path'];
						if (tmpRawUploadPath)
						{
							let tmpSafePath = sanitizePath(tmpRawUploadPath);
							if (tmpSafePath)
							{
								tmpRelativeFolder = tmpSafePath;
								tmpUploadFolder = libPath.join(tmpContentPath, tmpSafePath);

								// Ensure the resolved path is within the content directory
								let tmpRealContent = libFs.realpathSync(tmpContentPath);
								if (!libPath.resolve(tmpUploadFolder).startsWith(tmpRealContent))
								{
									pResponse.send(403, { Success: false, Error: 'Access denied.' });
									return fNext();
								}
							}
						}

						// Ensure the target directory exists
						if (!libFs.existsSync(tmpUploadFolder))
						{
							libFs.mkdirSync(tmpUploadFolder, { recursive: true });
						}

						let tmpUniqueFilename = `${Date.now()}-${tmpOriginalName}`;
						let tmpFilePath = libPath.join(tmpUploadFolder, tmpUniqueFilename);

						let tmpBuffer = Buffer.isBuffer(tmpBody) ? tmpBody : Buffer.from(tmpBody);
						libFs.writeFileSync(tmpFilePath, tmpBuffer);

						// Build the URL.  Use the bare filename so the markdown
						// reference is relative to the document's own directory.
						// This makes images portable — they work in the content
						// system's live server (the preview resolver prepends
						// the base path), on GitHub Pages, or any static host.
						let tmpRelativePath = tmpRelativeFolder
							? (tmpRelativeFolder + '/' + tmpUniqueFilename)
							: tmpUniqueFilename;
						let tmpURL = tmpUniqueFilename;
						tmpFable.log.info(`Image uploaded: ${tmpURL} -> ${tmpRelativePath} (${tmpBuffer.length} bytes)`);

						pResponse.send(
						{
							Success: true,
							URL: tmpURL,
							RelativePath: tmpRelativePath,
							Filename: tmpUniqueFilename,
							Size: tmpBuffer.length
						});
					}
					catch (pError)
					{
						tmpFable.log.error(`Image upload failed: ${pError.message}`);
						pResponse.send(500, { Success: false, Error: pError.message });
					}
					return fNext();
				});

			// --- GET /api/vocabulary/index ---
			// Build a vocabulary index from markdown files in a vocabulary/
			// subfolder of the content tree. Each .md file becomes a term:
			// the filename (minus .md) is the slug, the H1 is the title,
			// and the first paragraph is the short definition for popovers.
			// This endpoint powers pict-provider-vocabulary's auto-linking.
			tmpServiceServer.get('/api/vocabulary/index',
				(pRequest, pResponse, fNext) =>
				{
					try
					{
						let tmpVocabDir = libPath.join(tmpContentPath, 'vocabulary');
						let tmpIndex = {};

						if (libFs.existsSync(tmpVocabDir))
						{
							let tmpFiles = libFs.readdirSync(tmpVocabDir);
							for (let i = 0; i < tmpFiles.length; i++)
							{
								let tmpFile = tmpFiles[i];
								if (!tmpFile.endsWith('.md')) continue;

								let tmpSlug = tmpFile.replace(/\.md$/i, '');
								let tmpBody = '';
								try
								{
									tmpBody = libFs.readFileSync(libPath.join(tmpVocabDir, tmpFile), 'utf8');
								}
								catch (e) { continue; }

								let tmpTitle = tmpSlug;
								let tmpTitleMatch = tmpBody.match(/^#\s+(.+)/m);
								if (tmpTitleMatch) tmpTitle = tmpTitleMatch[1].trim();

								let tmpShort = '';
								let tmpLines = tmpBody.split('\n');
								let tmpPastTitle = false;
								let tmpParaLines = [];
								for (let j = 0; j < tmpLines.length; j++)
								{
									let tmpLine = tmpLines[j];
									if (!tmpPastTitle)
									{
										if (tmpLine.match(/^#\s+/)) tmpPastTitle = true;
										continue;
									}
									if (tmpLine.trim() === '')
									{
										if (tmpParaLines.length > 0) break;
										continue;
									}
									if (tmpLine.match(/^#/)) break;
									tmpParaLines.push(tmpLine.trim());
								}
								tmpShort = tmpParaLines.join(' ');
								if (tmpShort.length > 200) tmpShort = tmpShort.substring(0, 197) + '...';

								tmpIndex[tmpSlug] = { title: tmpTitle, short: tmpShort };
							}
						}

						pResponse.send({ Index: tmpIndex });
					}
					catch (pError)
					{
						pResponse.send(500, { Error: pError.message });
					}
					return fNext();
				});

			// Serve content files (markdown, images, etc.) at /content/
			tmpOrator.addStaticRoute(`${tmpContentPath}/`, 'index.html', '/content/*', '/content/');

			// Serve the built application from dist/ (main static route)
			tmpOrator.addStaticRoute(`${tmpDistFolder}/`, 'index.html');

			// Start the server
			tmpOrator.startService(
				function ()
				{
					// --- Optional Ultravisor Beacon Integration ---
					// When pOptions.Beacon is provided and Enabled is true,
					// register this content system as a beacon worker.
					let tmpBeaconConfig = pOptions.Beacon || {};
					if (tmpBeaconConfig.Enabled)
					{
						_initializeBeacon(tmpFable, tmpContentPath, tmpBeaconConfig);
					}

					return fCallback(null,
					{
						Fable: tmpFable,
						Orator: tmpOrator,
						Port: tmpPort
					});
				});
		});
}

// ═══════════════════════════════════════════════════════════════════
//  Ultravisor Beacon Integration
// ═══════════════════════════════════════════════════════════════════

/**
 * Initialize the Ultravisor beacon service and register ContentSystem
 * capabilities.  This is opt-in — only called when Beacon.Enabled is true.
 *
 * @param {object} pFable - Fable instance
 * @param {string} pContentPath - Resolved content directory path
 * @param {object} pBeaconConfig - Beacon configuration object
 */
function _initializeBeacon(pFable, pContentPath, pBeaconConfig)
{
	let libBeaconService;
	try
	{
		libBeaconService = require('ultravisor-beacon');
	}
	catch (pError)
	{
		pFable.log.warn(`Content System Beacon: ultravisor-beacon not installed. Skipping beacon init.`);
		return;
	}

	pFable.serviceManager.addAndInstantiateServiceType('UltravisorBeacon', libBeaconService, pBeaconConfig);
	let tmpBeacon = pFable.services.UltravisorBeacon;

	tmpBeacon.registerCapability({
		Capability: 'ContentSystem',
		Name: 'ContentSystemProvider',
		actions:
		{
			'ReadFile':
			{
				Description: 'Read a content file',
				SettingsSchema: [
					{ Name: 'FilePath', DataType: 'String', Required: true }
				],
				Handler: function (pWorkItem, pContext, fCallback)
				{
					try
					{
						let tmpFilePath = sanitizePath(pWorkItem.Settings.FilePath);
						if (!tmpFilePath)
						{
							return fCallback(null, {
								Outputs: { Content: '', StdOut: 'Invalid file path.' },
								Log: ['ReadFile: invalid or unsafe path rejected.']
							});
						}

						let tmpFullPath = libPath.join(pContentPath, tmpFilePath);
						let tmpRealContent = libFs.realpathSync(pContentPath);
						if (!tmpFullPath.startsWith(tmpRealContent))
						{
							return fCallback(null, {
								Outputs: { Content: '', StdOut: 'Access denied.' },
								Log: ['ReadFile: path outside content directory.']
							});
						}

						if (!libFs.existsSync(tmpFullPath))
						{
							return fCallback(null, {
								Outputs: { Content: '', StdOut: 'File not found.' },
								Log: [`ReadFile: ${tmpFilePath} not found.`]
							});
						}

						let tmpContent = libFs.readFileSync(tmpFullPath, 'utf8');
						pFable.log.info(`Beacon ReadFile: ${tmpFilePath} (${tmpContent.length} bytes)`);
						return fCallback(null, {
							Outputs: { Content: tmpContent, StdOut: `Read ${tmpContent.length} bytes from ${tmpFilePath}` },
							Log: [`ReadFile: read ${tmpContent.length} bytes from ${tmpFilePath}`]
						});
					}
					catch (pError)
					{
						return fCallback(pError);
					}
				}
			},

			'SaveFile':
			{
				Description: 'Save content to a file',
				SettingsSchema: [
					{ Name: 'FilePath', DataType: 'String', Required: true },
					{ Name: 'Content', DataType: 'String', Required: true }
				],
				Handler: function (pWorkItem, pContext, fCallback)
				{
					try
					{
						let tmpFilePath = sanitizePath(pWorkItem.Settings.FilePath);
						if (!tmpFilePath)
						{
							return fCallback(null, {
								Outputs: { FilePath: '', StdOut: 'Invalid file path.' },
								Log: ['SaveFile: invalid or unsafe path rejected.']
							});
						}

						let tmpFullPath = libPath.join(pContentPath, tmpFilePath);
						let tmpRealContent = libFs.realpathSync(pContentPath);
						let tmpTargetDir = libPath.dirname(tmpFullPath);
						if (!tmpTargetDir.startsWith(tmpRealContent))
						{
							return fCallback(null, {
								Outputs: { FilePath: '', StdOut: 'Access denied.' },
								Log: ['SaveFile: path outside content directory.']
							});
						}

						// Ensure directory exists
						if (!libFs.existsSync(tmpTargetDir))
						{
							libFs.mkdirSync(tmpTargetDir, { recursive: true });
						}

						let tmpContent = pWorkItem.Settings.Content || '';
						libFs.writeFileSync(tmpFullPath, tmpContent, 'utf8');
						pFable.log.info(`Beacon SaveFile: ${tmpFilePath} (${tmpContent.length} bytes)`);
						return fCallback(null, {
							Outputs: { FilePath: tmpFilePath, StdOut: `Saved ${tmpContent.length} bytes to ${tmpFilePath}` },
							Log: [`SaveFile: wrote ${tmpContent.length} bytes to ${tmpFilePath}`]
						});
					}
					catch (pError)
					{
						return fCallback(pError);
					}
				}
			},

			'ListFiles':
			{
				Description: 'List files in a content directory',
				SettingsSchema: [
					{ Name: 'Path', DataType: 'String', Required: false }
				],
				Handler: function (pWorkItem, pContext, fCallback)
				{
					try
					{
						let tmpRelPath = pWorkItem.Settings.Path || '';
						let tmpSafePath = tmpRelPath ? sanitizePath(tmpRelPath) : '';
						let tmpTargetPath = tmpSafePath
							? libPath.join(pContentPath, tmpSafePath)
							: pContentPath;

						let tmpRealContent = libFs.realpathSync(pContentPath);
						if (!tmpTargetPath.startsWith(tmpRealContent))
						{
							return fCallback(null, {
								Outputs: { Files: '[]', StdOut: 'Access denied.' },
								Log: ['ListFiles: path outside content directory.']
							});
						}

						if (!libFs.existsSync(tmpTargetPath))
						{
							return fCallback(null, {
								Outputs: { Files: '[]', StdOut: 'Directory not found.' },
								Log: [`ListFiles: ${tmpSafePath || '/'} not found.`]
							});
						}

						let tmpEntries = libFs.readdirSync(tmpTargetPath, { withFileTypes: true });
						let tmpFiles = tmpEntries.map(function (pEntry)
						{
							return {
								Name: pEntry.name,
								IsDirectory: pEntry.isDirectory()
							};
						});

						pFable.log.info(`Beacon ListFiles: ${tmpSafePath || '/'} (${tmpFiles.length} entries)`);
						return fCallback(null, {
							Outputs: { Files: JSON.stringify(tmpFiles), StdOut: `Found ${tmpFiles.length} entries in ${tmpSafePath || '/'}` },
							Log: [`ListFiles: ${tmpFiles.length} entries in ${tmpSafePath || '/'}`]
						});
					}
					catch (pError)
					{
						return fCallback(pError);
					}
				}
			},

			'CreateFolder':
			{
				Description: 'Create a folder in the content directory',
				SettingsSchema: [
					{ Name: 'Path', DataType: 'String', Required: true }
				],
				Handler: function (pWorkItem, pContext, fCallback)
				{
					try
					{
						let tmpSafePath = sanitizePath(pWorkItem.Settings.Path);
						if (!tmpSafePath)
						{
							return fCallback(null, {
								Outputs: { StdOut: 'Invalid folder path.' },
								Log: ['CreateFolder: invalid or unsafe path rejected.']
							});
						}

						let tmpFullPath = libPath.join(pContentPath, tmpSafePath);
						let tmpRealContent = libFs.realpathSync(pContentPath);
						let tmpTargetParent = libPath.dirname(tmpFullPath);
						if (libFs.existsSync(tmpTargetParent))
						{
							tmpTargetParent = libFs.realpathSync(tmpTargetParent);
						}
						if (!tmpTargetParent.startsWith(tmpRealContent))
						{
							return fCallback(null, {
								Outputs: { StdOut: 'Access denied.' },
								Log: ['CreateFolder: path outside content directory.']
							});
						}

						if (libFs.existsSync(tmpFullPath))
						{
							return fCallback(null, {
								Outputs: { StdOut: 'Folder already exists.' },
								Log: [`CreateFolder: ${tmpSafePath} already exists.`]
							});
						}

						libFs.mkdirSync(tmpFullPath, { recursive: true });
						pFable.log.info(`Beacon CreateFolder: ${tmpSafePath}`);
						return fCallback(null, {
							Outputs: { StdOut: `Created folder ${tmpSafePath}` },
							Log: [`CreateFolder: created ${tmpSafePath}`]
						});
					}
					catch (pError)
					{
						return fCallback(pError);
					}
				}
			}
		}
	});

	tmpBeacon.enable(function (pError)
	{
		if (pError)
		{
			pFable.log.warn(`Content System Beacon: enable failed: ${pError.message}`);
		}
		else
		{
			pFable.log.info('Content System Beacon: enabled and connected to Ultravisor.');
		}
	});
}

module.exports = setupContentSystemServer;
