const libPictApplication = require('pict-application');

// File browser
const libPictSectionFileBrowser = require('pict-section-filebrowser');

// Vocabulary auto-linking + popover system (shared with retold-labs)
const libPictProviderVocabulary = require('pict-provider-vocabulary');

// Inline documentation (right-side panel)
const libPictSectionInlineDocumentation = require('pict-section-inlinedocumentation');

// Modal system (panels, dialogs, tooltips, toasts)
const libPictSectionModal = require('pict-section-modal');

// Theme system (provider + picker / mode toggle / scale select / topbar
// chrome with BrandMark + NavView / UserView slots).
const libPictSectionTheme = require('pict-section-theme');

// Content rendering
const libPictSectionContent = require('pict-section-content');

// Login section + beacon-side auth helper (opt-in via the ultravisor-
// beacon SDK).  When the upstream UV is in non-promiscuous mode the
// helper's boot gate forces the user through a login overlay before
// the editor shell becomes interactive.
const libPictSectionLogin = require('pict-section-login');
const libBeaconWebAuthClient = require('ultravisor-beacon/webinterface/Pict-Beacon-WebAuth-Client.js');

// Provider
const libContentEditorProvider = require('./providers/Pict-Provider-ContentEditor.js');

// Brand block (precomputed by `npm run brand` from Retold-Modules-Manifest.json)
const libContentSystemBrand = require('./ContentSystem-Brand.js');

// Views
const libViewLayout = require('./views/PictView-Editor-Layout.js');
const libViewLogin = require('./views/PictView-Editor-Login.js');
const libViewSidebarTabs = require('./views/PictView-Editor-Sidebar-Tabs.js');
const libViewTopBarNav = require('./views/PictView-Editor-TopBar-Nav.js');
const libViewTopBarUser = require('./views/PictView-Editor-TopBar-User.js');
const libViewMarkdownEditor = require('./views/PictView-Editor-MarkdownEditor.js');
const libViewCodeEditor = require('./views/PictView-Editor-CodeEditor.js');
const libViewExcalidrawEditor = require('./views/PictView-Editor-ExcalidrawEditor.js');
const libViewSettingsPanel = require('./views/PictView-Editor-SettingsPanel.js');
const libViewMarkdownReference = require('./views/PictView-Editor-MarkdownReference.js');
const libViewTopics = require('./views/PictView-Editor-Topics.js');

/**
 * Content Editor Application
 *
 * A Pict application for editing markdown files served by the
 * retold-content-system Orator server. Uses pict-section-markdowneditor
 * for the editing experience and pict-section-filebrowser for file browsing.
 */
class ContentEditorApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		// Register the content editor provider
		this.pict.addProvider('ContentEditor-Provider', libContentEditorProvider.default_configuration, libContentEditorProvider);

		// Register the vocabulary provider. The content system can
		// load terms from a vocabulary/ folder in the content tree
		// via the same API shape retold-labs uses, or from any URL.
		// Terms auto-link in rendered markdown previews via
		// pict-section-content's parseMarkdown vocabulary resolver.
		this.pict.addProvider('Vocabulary',
			libPictProviderVocabulary.default_configuration,
			libPictProviderVocabulary);

		// Register the vocabulary management view from the provider.
		// Mount it at the vocabulary panel container in the sidebar.
		// The onEditTerm callback opens the term file in the main
		// markdown editor instead of rendering an inline textarea.
		let tmpPictRef = this.pict;
		this.pict.addView('ContentEditor-Vocabulary',
			Object.assign({}, libPictProviderVocabulary.VocabularyManagerView.default_configuration,
				{
					DefaultDestinationAddress: '#ContentEditor-Vocabulary-Container',
					VocabularyRoute: '#/vocabulary',
					VocabularyFolderPath: 'vocabulary/',
					onEditTerm: function (pSlug, pFilePath)
					{
						// Open the vocabulary term file in the main editor
						if (tmpPictRef && tmpPictRef.PictApplication && typeof tmpPictRef.PictApplication.navigateToFile === 'function')
						{
							tmpPictRef.PictApplication.navigateToFile(pFilePath);
						}
					}
				}),
			libPictProviderVocabulary.VocabularyManagerView);

		// Inline documentation provider — powers the right-side
		// documentation panel. Renders markdown docs from the content
		// tree's docs/ folder with topic navigation, editing, and
		// vocabulary auto-linking.
		this.pict.addProvider('Pict-InlineDocumentation',
			libPictSectionInlineDocumentation.default_configuration,
			libPictSectionInlineDocumentation);

		// Content rendering provider (for markdown parsing with
		// vocabulary resolver in the documentation panel).
		this.pict.addProvider('Pict-Content',
			libPictSectionContent.PictContentProvider.default_configuration,
			libPictSectionContent.PictContentProvider);

		// Register the modal system (panels, dialogs, tooltips, toasts)
		this.pict.addView('Pict-Section-Modal', libPictSectionModal.default_configuration, libPictSectionModal);

		// Register views
		this.pict.addView('ContentEditor-Layout', libViewLayout.default_configuration, libViewLayout);
		this.pict.addView('ContentEditor-Sidebar-Tabs', libViewSidebarTabs.default_configuration, libViewSidebarTabs);
		this.pict.addView('ContentEditor-TopBar-Nav',  libViewTopBarNav.default_configuration,  libViewTopBarNav);
		this.pict.addView('ContentEditor-TopBar-User', libViewTopBarUser.default_configuration, libViewTopBarUser);

		// Theme section provider — registers the pict-provider-theme
		// runtime, the bundled catalog (including the new
		// retold-content-system theme), and the Picker / ModeToggle /
		// ScaleSelect / BrandMark / TopBar views. The TopBar mounts the
		// two slot views above (ContentEditor-TopBar-Nav for the file
		// label, ContentEditor-TopBar-User for the actions + gear).
		//
		// Default theme: retold-content-system (preserves the existing
		// warm beige / teal palette). The picker still exposes every
		// other bundled theme; users pick from the gear-opened settings
		// panel (see PictView-Editor-SettingsPanel which mounts the
		// theme controls via Theme-Section.mount()).
		//
		// 'Button' is intentionally omitted from Views — the gear in the
		// User slot opens the settings panel which hosts the picker, so
		// we don't need a separate top-bar Theme-Button popover.
		this.pict.addProvider('Theme-Section',
		{
			ApplyDefault: 'retold-content-system',
			DefaultMode:  'system',
			DefaultScale: 1.0,
			Brand:        libContentSystemBrand,
			Views: ['Picker', 'ModeToggle', 'ScaleSelect', 'BrandMark', 'TopBar'],
			ViewOptions:
			{
				// Height matches the Size: 48 on the topbar panel in the
				// Layout view's addPanel call. Keep the two in sync.
				TopBar: { NavView: 'ContentEditor-TopBar-Nav', UserView: 'ContentEditor-TopBar-User', Height: 48 }
			}
		}, libPictSectionTheme);

		this.pict.addView('ContentEditor-MarkdownEditor', libViewMarkdownEditor.default_configuration, libViewMarkdownEditor);
		this.pict.addView('ContentEditor-CodeEditor', libViewCodeEditor.default_configuration, libViewCodeEditor);
		this.pict.addView('ContentEditor-ExcalidrawEditor', libViewExcalidrawEditor.default_configuration, libViewExcalidrawEditor);
		this.pict.addView('ContentEditor-SettingsPanel', libViewSettingsPanel.default_configuration, libViewSettingsPanel);
		this.pict.addView('ContentEditor-MarkdownReference', libViewMarkdownReference.default_configuration, libViewMarkdownReference);
		this.pict.addView('ContentEditor-Topics', libViewTopics.default_configuration, libViewTopics);
		this.pict.addView('ContentEditor-Login', libViewLogin.default_configuration, libViewLogin);

		// Beacon-side login section + boot-gate helper.  See
		// ultravisor-beacon/webinterface/Pict-Beacon-WebAuth-Client.js
		// for the contract.  The helper hooks
		// onLoginSuccess/onLogout/onSessionChecked back into
		// `_showLoginOverlay()` / `_hideLoginOverlay()` which toggle
		// the fixed-position overlay div mounted in
		// onAfterInitializeAsync.
		this._WebAuthClient = libBeaconWebAuthClient.install(this.pict,
			{
				Section:              libPictSectionLogin,
				AuthStateAddress:     'AppData.ContentEditor.Auth',
				LoginRoute:           'ContentEditor-Login',
				HomeRoute:            'ContentEditor-Layout',
				StatusURL:            '/status',
				LoginEndpoint:        '/1.0/Authenticate',
				LogoutEndpoint:       '/1.0/Deauthenticate',
				CheckSessionEndpoint: '/1.0/CheckSession',
				OnAfterLogin:         () => this._hideLoginOverlay(),
				OnAfterLogout:        () => this._showLoginOverlay(),
				OnSessionChecked:     (pSess) => { if (!(pSess && pSess.LoggedIn)) { this._showLoginOverlay(); } else { this._hideLoginOverlay(); } }
			});

		// Register the file browser -- override destination and layout for sidebar use
		let tmpFileBrowserConfig = JSON.parse(JSON.stringify(libPictSectionFileBrowser.default_configuration));
		tmpFileBrowserConfig.DefaultDestinationAddress = '#ContentEditor-Sidebar-Container';
		tmpFileBrowserConfig.DefaultState.Layout = 'list-only';
		this.pict.addView('Pict-FileBrowser', tmpFileBrowserConfig, libPictSectionFileBrowser);

		// Register the list detail sub-view for the file list pane.
		// Override templates to:
		//   - Add a "create folder" button to the breadcrumb bar
		//   - Add a hover-visible "+" insert button on each file row
		let tmpListDetailConfig = JSON.parse(JSON.stringify(
			libPictSectionFileBrowser.PictViewListDetail.default_configuration));
		for (let i = 0; i < tmpListDetailConfig.Templates.length; i++)
		{
			if (tmpListDetailConfig.Templates[i].Hash === 'FileBrowser-ListDetail-Container-Template')
			{
				tmpListDetailConfig.Templates[i].Template = /*html*/`
<div class="pict-fb-detail" id="Pict-FileBrowser-DetailList">
	<div class="pict-fb-breadcrumb-bar">
		<div class="pict-fb-breadcrumb" id="Pict-FileBrowser-Breadcrumb"></div>
		<button class="pict-fb-breadcrumb-addfolder" onclick="pict.PictApplication.promptNewFolder()" title="New folder">+</button>
	</div>
	<div class="pict-fb-detail-header">
		<div class="pict-fb-detail-header-cell pict-fb-detail-col-name" onclick="pict.views['{~D:Record.ViewHash~}'].sortBy('Name')">Name</div>
		<div class="pict-fb-detail-header-cell pict-fb-detail-col-size" onclick="pict.views['{~D:Record.ViewHash~}'].sortBy('Size')">Size</div>
		<div class="pict-fb-detail-header-cell pict-fb-detail-col-modified" onclick="pict.views['{~D:Record.ViewHash~}'].sortBy('Modified')">Modified</div>
	</div>
	<div id="Pict-FileBrowser-DetailRows"></div>
</div>
`;
			}
			if (tmpListDetailConfig.Templates[i].Hash === 'FileBrowser-ListDetail-Row-Template')
			{
				tmpListDetailConfig.Templates[i].Template = /*html*/`
<div class="pict-fb-detail-row{~D:Record.SelectedClass~}" data-index="{~D:Record.Index~}" data-name="{~D:Record.Name~}" onclick="{~P~}.views['{~D:Record.ViewHash~}'].selectEntry({~D:Record.Index~})" ondblclick="{~P~}.views['{~D:Record.ViewHash~}'].openEntry({~D:Record.Index~})">
	<span class="pict-fb-detail-icon">{~D:Record.Icon~}</span>
	<span class="pict-fb-detail-name">{~D:Record.Name~}</span>
	<span class="pict-fb-detail-size">{~D:Record.SizeFormatted~}</span>
	<span class="pict-fb-detail-modified">{~D:Record.ModifiedFormatted~}</span>
	<button class="pict-fb-insert-btn" onclick="event.stopPropagation(); pict.PictApplication.insertFileReference(this.parentElement.getAttribute('data-name'))" title="Insert into editor">+</button>
</div>
`;
			}
		}
		this.pict.addView('Pict-FileBrowser-ListDetail', tmpListDetailConfig,
			libPictSectionFileBrowser.PictViewListDetail);
	}

	onAfterInitializeAsync(fCallback)
	{
		// Expose the pict instance as window.pict for inline onclick handlers
		// (pict-section-filebrowser templates reference pict.views[...])
		if (typeof (window) !== 'undefined')
		{
			window.pict = this.pict;

			// Warn the user before closing the tab/window with unsaved changes
			let tmpPictRef = this.pict;
			window.addEventListener('beforeunload', function (pEvent)
			{
				if (tmpPictRef.AppData.ContentEditor && tmpPictRef.AppData.ContentEditor.IsDirty)
				{
					pEvent.preventDefault();
					pEvent.returnValue = '';
				}
			});
		}

		// Initialize application state
		this.pict.AppData.ContentEditor =
		{
			CurrentFile: '',
			ActiveEditor: 'markdown', // 'markdown' or 'code'
			IsDirty: false,
			IsSaving: false,
			IsLoading: false,
			Files: [],
			Document:
			{
				Segments: [{ Content: '' }]
			},
			CodeContent: '',
			SaveStatus: '',
			SaveStatusClass: '',

			// Settings
			AutoSegmentMarkdown: false,
			AutoSegmentDepth: 1,
			ContentPreviewMode: 'off',
			MarkdownEditingControls: true,
			MarkdownWordWrap: true,
			CodeWordWrap: false,
			SidebarCollapsed: false,
			SidebarWidth: 250,
			AutoPreviewImages: true,
			AutoPreviewVideo: false,
			AutoPreviewAudio: false,
			ShowHiddenFiles: false,
			TopicsFilePath: '.pict_documentation_topics.json'
		};

		// Restore persisted settings from localStorage
		this._loadSettings();

		// Make sure the login overlay mount point exists before any
		// render path on the wrapper view touches it.
		this._ensureLoginOverlayMount();

		// Render the layout shell
		this.pict.views['ContentEditor-Layout'].render();

		// Boot gate: poll /status to learn the UV's auth mode.  In
		// authenticated mode show the overlay; pict-section-login's
		// CheckSessionOnLoad will hide it again if there's a valid
		// cookie.  Failure is non-fatal — defaults leave us in
		// promiscuous mode and the editor is fully interactive.
		this._WebAuthClient.loadAuthStatus((pStatusErr) =>
			{
				if (pStatusErr)
				{
					this.pict.log.warn('ContentEditor: /status fetch failed during boot: ' + pStatusErr.message);
				}
				let tmpAuth = (this.pict.AppData.ContentEditor && this.pict.AppData.ContentEditor.Auth) || {};
				if (tmpAuth.Mode === 'authenticated')
				{
					this._showLoginOverlay();
					this.pict.views['ContentEditor-Login'].render();
				}
			});

		// Wire up file selection from the file browser
		let tmpSelf = this;
		let tmpListProvider = this.pict.providers['Pict-FileBrowser-List'];
		if (tmpListProvider)
		{
			let tmpOriginalSelectFile = tmpListProvider.selectFile.bind(tmpListProvider);
			tmpListProvider.selectFile = function (pFileEntry)
			{
				tmpOriginalSelectFile(pFileEntry);
				if (pFileEntry && pFileEntry.Type === 'file')
				{
					tmpSelf.navigateToFile(pFileEntry.Path);
				}
			};
		}

		// Wire up folder navigation to fetch subfolder contents from the server
		let tmpBrowseProvider = this.pict.providers['Pict-FileBrowser-Browse'];
		if (tmpBrowseProvider)
		{
			let tmpOriginalNavigate = tmpBrowseProvider.navigateToFolder.bind(tmpBrowseProvider);
			tmpBrowseProvider.navigateToFolder = function (pPath)
			{
				// Update the CurrentLocation state (breadcrumb, etc.)
				tmpOriginalNavigate(pPath);
				// Fetch the new folder's contents from the server
				tmpSelf.loadFileList(pPath);
			};
		}

		// Sync the hidden files setting to the server before loading files
		this.syncHiddenFilesSetting(() =>
		{
			// Load the file list into the file browser
			tmpSelf.loadFileList(null, () =>
			{
				// Check if there is a hash route to load
				tmpSelf.resolveHash();
			});
		});

		// Silently attempt to load the topics file
		let tmpTopicsPath = this.pict.AppData.ContentEditor.TopicsFilePath;
		if (tmpTopicsPath)
		{
			let tmpTopicsView = this.pict.views['ContentEditor-Topics'];
			if (tmpTopicsView)
			{
				tmpTopicsView.loadTopicsFile(tmpTopicsPath, () =>
				{
					// Silently ignore errors — the file may not exist yet
				});
			}
		}

		// Load vocabulary index for auto-linking. If the content tree
		// has a vocabulary/ folder, terms auto-link in markdown
		// previews with hover popovers. No-op if the folder doesn't
		// exist or the endpoint isn't available — the provider
		// handles both gracefully.
		let tmpVocabProvider = this.pict.providers && this.pict.providers.Vocabulary;
		if (tmpVocabProvider)
		{
			tmpVocabProvider.loadFromURL('/api/vocabulary/index');
		}

		// Initialize the inline documentation panel into the shell's
		// right-side docpanel destination. The shell built that
		// destination in Layout._buildShell(); we only need to wire
		// the provider's container and restore the last-viewed doc.
		// Panel resize/collapse chrome comes from the shell — no
		// legacy `tmpModal.panel()` attachment needed.
		let tmpDocProvider = this.pict.providers && this.pict.providers['Pict-InlineDocumentation'];
		if (tmpDocProvider && typeof tmpDocProvider.initializeDocumentation === 'function')
		{
			let tmpSelfApp = this;
			tmpDocProvider.initializeDocumentation(
				{
					DocsBaseURL: '/content/',
					ContainerAddress: '#ContentEditor-Documentation-Panel',
					SearchIndexURL: '/content/retold-keyword-index.json',
					ExternalDocBaseURL: 'https://fable-retold.io/#/doc/',
					EditEnabled: false,
					TopicManagerEnabled: false
				},
				function ()
				{
					let tmpInlineDoc = tmpSelfApp.pict.providers['Pict-InlineDocumentation'];
					if (tmpInlineDoc && typeof tmpInlineDoc.loadDocument === 'function')
					{
						let tmpLastDoc = 'README.md';
						try
						{
							let tmpStored = localStorage.getItem('ContentEditor-DocPanel-LastDoc');
							if (tmpStored) tmpLastDoc = tmpStored;
						}
						catch (e) { /* ignore */ }
						tmpInlineDoc.loadDocument(tmpLastDoc);

						// Persist the current document path on each navigation
						let tmpOrigLoad = tmpInlineDoc.loadDocument.bind(tmpInlineDoc);
						tmpInlineDoc.loadDocument = function (pPath, fCb)
						{
							try { localStorage.setItem('ContentEditor-DocPanel-LastDoc', pPath); }
							catch (e) { /* ignore */ }
							return tmpOrigLoad(pPath, fCb);
						};
					}
				});
		}

		return super.onAfterInitializeAsync(fCallback);
	}

	/**
	 * Push the ShowHiddenFiles setting to the server so the file
	 * browser API includes or excludes dotfiles accordingly.
	 *
	 * @param {Function} [fCallback] - Optional callback when done
	 */
	syncHiddenFilesSetting(fCallback)
	{
		let tmpCallback = (typeof (fCallback) === 'function') ? fCallback : () => {};
		let tmpShow = this.pict.AppData.ContentEditor.ShowHiddenFiles;

		fetch('/api/filebrowser/settings',
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ IncludeHiddenFiles: !!tmpShow })
			})
			.then(() => tmpCallback())
			.catch(() => tmpCallback());
	}

	/**
	 * Load the file list from the server into the file browser.
	 *
	 * @param {string} [pPath] - Optional relative path to list (defaults to root)
	 * @param {Function} [fCallback] - Optional callback when done
	 */
	loadFileList(pPath, fCallback)
	{
		let tmpCallback = (typeof (fCallback) === 'function') ? fCallback :
			(typeof (pPath) === 'function') ? pPath : () => {};
		let tmpSelf = this;

		// Use the provided path, or fall back to the current browse location
		let tmpPath = (typeof (pPath) === 'string') ? pPath : null;
		if (tmpPath === null && this.pict.AppData.PictFileBrowser && this.pict.AppData.PictFileBrowser.CurrentLocation)
		{
			tmpPath = this.pict.AppData.PictFileBrowser.CurrentLocation;
		}

		let tmpURL = '/api/filebrowser/list';
		if (tmpPath && tmpPath.length > 0)
		{
			tmpURL += '?path=' + encodeURIComponent(tmpPath);
		}

		fetch(tmpURL)
			.then((pResponse) => pResponse.json())
			.then((pFileList) =>
			{
				// FileBrowserService returns an array directly
				tmpSelf.pict.AppData.PictFileBrowser =
					tmpSelf.pict.AppData.PictFileBrowser || {};
				tmpSelf.pict.AppData.PictFileBrowser.FileList = pFileList || [];

				// Render the file browser container (creates pane structure)
				let tmpFileBrowserView = tmpSelf.pict.views['Pict-FileBrowser'];
				if (tmpFileBrowserView)
				{
					tmpFileBrowserView.render();
				}

				// Render the list detail sub-view (populates the list pane with file rows)
				let tmpListDetailView = tmpSelf.pict.views['Pict-FileBrowser-ListDetail'];
				if (tmpListDetailView)
				{
					tmpListDetailView.render();
				}

				return tmpCallback();
			})
			.catch((pError) =>
			{
				tmpSelf.log.error(`Failed to load file list: ${pError.message}`);
				return tmpCallback();
			});
	}

	/**
	 * Resolve the current hash route.
	 *
	 * Supports:
	 *   #/edit/<filepath>  — Load a file for editing
	 *   (empty)            — Show welcome state
	 */
	resolveHash()
	{
		let tmpHash = (window.location.hash || '').replace(/^#\/?/, '');

		if (!tmpHash)
		{
			return;
		}

		let tmpParts = tmpHash.split('/');

		if (tmpParts[0] === 'edit' && tmpParts.length >= 2)
		{
			let tmpFilePath = tmpParts.slice(1).join('/');
			// Guard against duplicate navigation when navigateToFile()
			// programmatically sets the hash and triggers hashchange.
			if (this.pict.AppData.ContentEditor.CurrentFile === tmpFilePath)
			{
				return;
			}
			this.navigateToFile(tmpFilePath);
		}
	}

	/**
	 * Determine whether a file should use the markdown editor, the code
	 * editor, or the binary file preview.
	 *
	 * @param {string} pFilePath - The file path
	 * @returns {string} 'markdown', 'code', or 'binary'
	 */
	getEditorTypeForFile(pFilePath)
	{
		if (!pFilePath)
		{
			return 'markdown';
		}
		let tmpExt = pFilePath.replace(/^.*\./, '').toLowerCase();
		if (tmpExt === 'md' || tmpExt === 'markdown')
		{
			return 'markdown';
		}
		// 2-file Excalidraw naming: <stem>.excalidraw.svg + <stem>.excalidraw.json
		// share the `.excalidraw.` infix so we can route on filename alone
		// without sniffing file content.  Plain `.svg` and `.json` files fall
		// through to binary preview / code editor respectively, which is what
		// users expect for logos, icons, and configuration files.
		let tmpLowerPath = pFilePath.toLowerCase();
		if (tmpLowerPath.endsWith('.excalidraw.svg') ||
			tmpLowerPath.endsWith('.excalidraw.json') ||
			tmpLowerPath.endsWith('.excalidraw'))
		{
			return 'excalidraw';
		}

		// Known binary / non-editable file extensions
		let tmpBinaryExtensions =
		{
			// Images
			'png': true, 'jpg': true, 'jpeg': true, 'gif': true, 'bmp': true,
			'webp': true, 'ico': true, 'svg': true, 'tiff': true, 'tif': true,
			'avif': true, 'heic': true, 'heif': true,
			// Audio
			'mp3': true, 'wav': true, 'ogg': true, 'flac': true, 'aac': true,
			'm4a': true, 'wma': true,
			// Video
			'mp4': true, 'avi': true, 'mkv': true, 'mov': true, 'wmv': true,
			'webm': true, 'flv': true, 'm4v': true,
			// Documents / archives
			'pdf': true, 'doc': true, 'docx': true, 'xls': true, 'xlsx': true,
			'ppt': true, 'pptx': true, 'odt': true, 'ods': true, 'odp': true,
			'zip': true, 'tar': true, 'gz': true, 'bz2': true, 'xz': true,
			'7z': true, 'rar': true,
			// Fonts
			'ttf': true, 'otf': true, 'woff': true, 'woff2': true, 'eot': true,
			// Executables / compiled
			'exe': true, 'dll': true, 'so': true, 'dylib': true, 'o': true,
			'class': true, 'pyc': true, 'wasm': true
		};

		if (tmpBinaryExtensions[tmpExt])
		{
			return 'binary';
		}

		return 'code';
	}

	/**
	 * Tear down whichever editor is currently active so the container
	 * is clean before showing a different view.
	 */
	/**
	 * Common routing path to the Excalidraw editor.  Both `.excalidraw.svg`
	 * and `.excalidraw.json` open the same scene — the editor view derives
	 * the sibling path internally on save.
	 *
	 * @param {string} pFilePath
	 */
	_routeToExcalidrawEditor(pFilePath)
	{
		let tmpExcView = this.pict.views['ContentEditor-ExcalidrawEditor'];
		if (!tmpExcView) return;
		tmpExcView.initialRenderComplete = false;
		tmpExcView.bindToFile(pFilePath);
		tmpExcView.render();
	}

	_cleanupEditors()
	{
		let tmpCodeEditorView = this.pict.views['ContentEditor-CodeEditor'];
		if (tmpCodeEditorView)
		{
			if (tmpCodeEditorView.codeJar)
			{
				tmpCodeEditorView.destroy();
			}
			// Always reset so the next render() triggers onAfterInitialRender
			tmpCodeEditorView.initialRenderComplete = false;
		}

		let tmpExcView = this.pict.views['ContentEditor-ExcalidrawEditor'];
		if (tmpExcView && typeof tmpExcView.destroy === 'function' && tmpExcView._reactRoot)
		{
			tmpExcView.destroy();
		}

		// Clear the container
		let tmpEditorContainer = this.pict.ContentAssignment.getElement('#ContentEditor-Editor-Container');
		if (tmpEditorContainer && tmpEditorContainer[0])
		{
			tmpEditorContainer[0].innerHTML = '';
		}
	}

	/**
	 * Format a byte count into a human-readable size string.
	 *
	 * @param {number} pBytes - The byte count
	 * @returns {string} Formatted string (e.g. "1.4 MB")
	 */
	_formatFileSize(pBytes)
	{
		if (pBytes === 0) return '0 B';
		let tmpUnits = ['B', 'KB', 'MB', 'GB', 'TB'];
		let tmpIndex = Math.floor(Math.log(pBytes) / Math.log(1024));
		if (tmpIndex >= tmpUnits.length) tmpIndex = tmpUnits.length - 1;
		let tmpSize = pBytes / Math.pow(1024, tmpIndex);
		return tmpSize.toFixed(tmpIndex === 0 ? 0 : 1) + ' ' + tmpUnits[tmpIndex];
	}

	/**
	 * Show the binary file preview card for a file that cannot be edited.
	 *
	 * @param {string} pFilePath - The relative path
	 */
	/**
	 * Determine the media type of a binary file.
	 *
	 * @param {string} pExtension - Lowercase file extension
	 * @returns {string} 'image', 'video', 'audio', or 'other'
	 */
	_getMediaType(pExtension)
	{
		let tmpImageExtensions = { 'png': true, 'jpg': true, 'jpeg': true, 'gif': true, 'webp': true, 'svg': true, 'bmp': true, 'ico': true, 'avif': true };
		let tmpVideoExtensions = { 'mp4': true, 'webm': true, 'mov': true, 'mkv': true, 'avi': true, 'wmv': true, 'flv': true, 'm4v': true, 'ogv': true };
		let tmpAudioExtensions = { 'mp3': true, 'wav': true, 'ogg': true, 'flac': true, 'aac': true, 'm4a': true, 'wma': true, 'oga': true };

		if (tmpImageExtensions[pExtension]) return 'image';
		if (tmpVideoExtensions[pExtension]) return 'video';
		if (tmpAudioExtensions[pExtension]) return 'audio';
		return 'other';
	}

	/**
	 * Build the inline media preview HTML for image, video, or audio.
	 *
	 * @param {string} pMediaType - 'image', 'video', or 'audio'
	 * @param {string} pContentURL - The URL to the media file
	 * @param {string} pFileName - The display file name
	 * @returns {string} HTML string
	 */
	_buildMediaPreviewHTML(pMediaType, pContentURL, pFileName)
	{
		if (pMediaType === 'image')
		{
			return '<div class="binary-preview-image-wrap"><div class="binary-preview-image"><img src="' + pContentURL + '" alt="' + pFileName + '"></div></div>';
		}
		if (pMediaType === 'video')
		{
			return '<div class="binary-preview-media-wrap"><video class="binary-preview-video" controls preload="metadata"><source src="' + pContentURL + '">Your browser does not support the video tag.</video></div>';
		}
		if (pMediaType === 'audio')
		{
			return '<div class="binary-preview-media-wrap"><audio class="binary-preview-audio" controls preload="metadata"><source src="' + pContentURL + '">Your browser does not support the audio tag.</audio></div>';
		}
		return '';
	}

	/**
	 * Load a media preview into the placeholder container.
	 * Called when the user clicks the Preview button on a media card.
	 *
	 * @param {string} pMediaType - 'image', 'video', or 'audio'
	 * @param {string} pContentURL - The URL to the media file
	 * @param {string} pFileName - The display file name
	 */
	loadMediaPreview(pMediaType, pContentURL, pFileName)
	{
		let tmpContainer = this.pict.ContentAssignment.getElement('#ContentEditor-MediaPreviewPlaceholder')[0];
		if (!tmpContainer)
		{
			return;
		}
		tmpContainer.innerHTML = this._buildMediaPreviewHTML(pMediaType, pContentURL, pFileName);
	}

	_showBinaryPreview(pFilePath)
	{
		let tmpSelf = this;
		let tmpFileName = pFilePath.replace(/^.*\//, '');
		let tmpExtension = pFilePath.replace(/^.*\./, '').toLowerCase();
		let tmpContentURL = '/content/' + encodeURIComponent(pFilePath);

		let tmpMediaType = this._getMediaType(tmpExtension);
		let tmpSettings = this.pict.AppData.ContentEditor;

		// Determine whether to auto-preview based on settings
		let tmpAutoPreview = false;
		if (tmpMediaType === 'image') tmpAutoPreview = tmpSettings.AutoPreviewImages;
		if (tmpMediaType === 'video') tmpAutoPreview = tmpSettings.AutoPreviewVideo;
		if (tmpMediaType === 'audio') tmpAutoPreview = tmpSettings.AutoPreviewAudio;

		// Fetch file info from the file browser API
		fetch('/api/filebrowser/info?path=' + encodeURIComponent(pFilePath))
			.then((pResponse) => pResponse.json())
			.then((pInfo) =>
			{
				let tmpSize = (pInfo && typeof (pInfo.Size) === 'number') ? tmpSelf._formatFileSize(pInfo.Size) : 'Unknown';
				let tmpModified = (pInfo && pInfo.Modified) ? new Date(pInfo.Modified).toLocaleString() : 'Unknown';

				let tmpEditorContainer = tmpSelf.pict.ContentAssignment.getElement('#ContentEditor-Editor-Container');
				if (!tmpEditorContainer || !tmpEditorContainer[0])
				{
					return;
				}

				let tmpPreviewHTML = '';

				if (tmpMediaType !== 'other')
				{
					if (tmpAutoPreview)
					{
						tmpPreviewHTML += tmpSelf._buildMediaPreviewHTML(tmpMediaType, tmpContentURL, tmpFileName);
					}
					else
					{
						// Placeholder with a Preview button
						tmpPreviewHTML += '<div id="ContentEditor-MediaPreviewPlaceholder">';
						tmpPreviewHTML += '<button class="binary-preview-btn binary-preview-btn-preview"';
						tmpPreviewHTML += ' onclick="pict.PictApplication.loadMediaPreview(';
						tmpPreviewHTML += "'" + tmpMediaType + "','" + tmpContentURL + "','" + tmpFileName.replace(/'/g, "\\'") + "'";
						tmpPreviewHTML += ')">Preview ' + tmpMediaType.charAt(0).toUpperCase() + tmpMediaType.slice(1) + '</button>';
						tmpPreviewHTML += '</div>';
					}
				}

				tmpPreviewHTML += '<div class="binary-preview-card">';
				tmpPreviewHTML += '<div class="binary-preview-icon">' + tmpExtension.toUpperCase() + '</div>';
				tmpPreviewHTML += '<div class="binary-preview-info">';
				tmpPreviewHTML += '<div class="binary-preview-name">' + tmpFileName + '</div>';
				tmpPreviewHTML += '<div class="binary-preview-meta">Size: ' + tmpSize + '</div>';
				tmpPreviewHTML += '<div class="binary-preview-meta">Modified: ' + tmpModified + '</div>';
				tmpPreviewHTML += '<div class="binary-preview-meta">Type: .' + tmpExtension + '</div>';
				tmpPreviewHTML += '</div>';
				tmpPreviewHTML += '<div class="binary-preview-actions">';
				tmpPreviewHTML += '<a class="binary-preview-btn" href="' + tmpContentURL + '" download="' + tmpFileName + '">Download</a>';
				tmpPreviewHTML += '<a class="binary-preview-btn binary-preview-btn-secondary" href="' + tmpContentURL + '" target="_blank">Open in New Tab</a>';
				tmpPreviewHTML += '</div>';
				tmpPreviewHTML += '</div>';

				tmpEditorContainer[0].innerHTML = tmpPreviewHTML;
			})
			.catch(() =>
			{
				// Fallback if info fetch fails
				let tmpEditorContainer = tmpSelf.pict.ContentAssignment.getElement('#ContentEditor-Editor-Container');
				if (tmpEditorContainer && tmpEditorContainer[0])
				{
					tmpEditorContainer[0].innerHTML =
						'<div class="binary-preview-card">' +
						'<div class="binary-preview-icon">' + tmpExtension.toUpperCase() + '</div>' +
						'<div class="binary-preview-info">' +
						'<div class="binary-preview-name">' + tmpFileName + '</div>' +
						'<div class="binary-preview-meta">Binary file — cannot be edited in the browser</div>' +
						'</div>' +
						'<div class="binary-preview-actions">' +
						'<a class="binary-preview-btn" href="' + tmpContentURL + '" download="' + tmpFileName + '">Download</a>' +
						'<a class="binary-preview-btn binary-preview-btn-secondary" href="' + tmpContentURL + '" target="_blank">Open in New Tab</a>' +
						'</div></div>';
				}
			});
	}

	/**
	 * Segment markdown content based on the Auto Segment settings.
	 *
	 * When AutoSegmentMarkdown is enabled, splits the content into
	 * segments at the configured heading depth.
	 *
	 * Depth 1 splits every top-level block (paragraphs, code fences,
	 * headings, etc.) into its own segment.  Depth 2+ splits at the
	 * corresponding heading level, keeping everything between two
	 * headings of that level (or higher) in the same segment.
	 *
	 * @param {string} pContent - Raw markdown text
	 * @returns {Array} Array of { Content: string } segment objects
	 */
	segmentMarkdownContent(pContent)
	{
		let tmpSettings = this.pict.AppData.ContentEditor;

		if (!tmpSettings.AutoSegmentMarkdown || !pContent)
		{
			return [{ Content: pContent || '' }];
		}

		let tmpDepth = parseInt(tmpSettings.AutoSegmentDepth, 10) || 1;

		if (tmpDepth === 1)
		{
			// Depth 1: every block is its own segment.
			// Split on blank lines, preserving fenced code blocks as
			// single units.
			let tmpLines = pContent.split('\n');
			let tmpSegments = [];
			let tmpCurrent = [];
			let tmpInFence = false;

			for (let i = 0; i < tmpLines.length; i++)
			{
				let tmpLine = tmpLines[i];

				// Detect fenced code block boundaries
				if (/^(`{3,}|~{3,})/.test(tmpLine.trim()))
				{
					tmpInFence = !tmpInFence;
					tmpCurrent.push(tmpLine);
					continue;
				}

				if (tmpInFence)
				{
					tmpCurrent.push(tmpLine);
					continue;
				}

				// Outside a fence, a blank line ends the current block
				if (tmpLine.trim() === '')
				{
					if (tmpCurrent.length > 0)
					{
						tmpSegments.push({ Content: tmpCurrent.join('\n') });
						tmpCurrent = [];
					}
					continue;
				}

				tmpCurrent.push(tmpLine);
			}

			// Push any trailing content
			if (tmpCurrent.length > 0)
			{
				tmpSegments.push({ Content: tmpCurrent.join('\n') });
			}

			return tmpSegments.length > 0 ? tmpSegments : [{ Content: '' }];
		}

		// Depth 2+: split at headings of that level or higher.
		// A heading like "## Foo" is depth 2.  We split when we see a
		// heading whose depth is <= the configured depth.
		let tmpHeadingPattern = new RegExp('^(#{1,' + tmpDepth + '})\\s');
		let tmpLines = pContent.split('\n');
		let tmpSegments = [];
		let tmpCurrent = [];

		for (let i = 0; i < tmpLines.length; i++)
		{
			let tmpLine = tmpLines[i];

			if (tmpHeadingPattern.test(tmpLine.trim()) && tmpCurrent.length > 0)
			{
				tmpSegments.push({ Content: tmpCurrent.join('\n') });
				tmpCurrent = [];
			}

			tmpCurrent.push(tmpLine);
		}

		if (tmpCurrent.length > 0)
		{
			tmpSegments.push({ Content: tmpCurrent.join('\n') });
		}

		return tmpSegments.length > 0 ? tmpSegments : [{ Content: '' }];
	}

	/**
	 * Navigate to a file for editing.
	 *
	 * Automatically selects the markdown editor for .md files, the code
	 * editor (with highlight.js) for text files, or a binary preview
	 * card for images, archives, and other non-editable files.
	 *
	 * @param {string} pFilePath - The relative path of the file to edit
	 */
	navigateToFile(pFilePath)
	{
		if (!pFilePath)
		{
			return;
		}

		// Guard: if the current file has unsaved changes, confirm
		// before navigating away.  This catches all entry points —
		// file browser clicks, vocabulary edits, topic navigation,
		// hash changes, and new file creation.
		if (this.pict.AppData.ContentEditor.IsDirty)
		{
			let tmpSelf = this;
			let tmpModal = this.pict.views['Pict-Section-Modal'];
			if (tmpModal && typeof tmpModal.confirm === 'function')
			{
				tmpModal.confirm(
					'You have unsaved changes to ' + this.pict.AppData.ContentEditor.CurrentFile + '. Discard and open a different file?',
					{ title: 'Unsaved Changes', confirmLabel: 'Discard', dangerous: true })
					.then(function (pConfirmed)
					{
						if (pConfirmed)
						{
							tmpSelf.pict.AppData.ContentEditor.IsDirty = false;
							tmpSelf.navigateToFile(pFilePath);
						}
					});
				return;
			}
			// Fallback: native confirm
			if (typeof confirm !== 'undefined' && !confirm('You have unsaved changes. Discard and open a different file?'))
			{
				return;
			}
			this.pict.AppData.ContentEditor.IsDirty = false;
		}

		let tmpSelf = this;

		// Determine which editor to use before fetching content
		let tmpEditorType = this.getEditorTypeForFile(pFilePath);

		this.pict.AppData.ContentEditor.SaveStatus = '';
		this.pict.AppData.ContentEditor.SaveStatusClass = '';

		// Update the hash without triggering resolveHash again
		window.location.hash = '#/edit/' + pFilePath;

		// Set the current file and editor type
		this.pict.AppData.ContentEditor.CurrentFile = pFilePath;
		this.pict.AppData.ContentEditor.IsDirty = false;
		this.pict.AppData.ContentEditor.ActiveEditor = tmpEditorType;

		// Clean up existing editors
		this._cleanupEditors();

		// Re-render top bar
		this.renderTopBar();

		// Binary files: show preview card without loading content.  Plain
		// `.svg` files (icons, logos, screenshots) live here — only files
		// matching the `.excalidraw.svg` naming convention route to the
		// Excalidraw editor, and that decision was already made by
		// getEditorTypeForFile above.
		if (tmpEditorType === 'binary')
		{
			this._showBinaryPreview(pFilePath);
			this.updateStats();
			return;
		}

		// Excalidraw files (`.excalidraw.svg`, `.excalidraw.json`, or the
		// legacy bare `.excalidraw`): hand off to the embedded drawing
		// editor.  The view manages its own load/save through the content
		// provider, so we don't need to fetch content here.
		if (tmpEditorType === 'excalidraw')
		{
			this._routeToExcalidrawEditor(pFilePath);
			this.updateStats();
			return;
		}

		// Text files: load content from the server
		let tmpProvider = this.pict.providers['ContentEditor-Provider'];

		this.pict.AppData.ContentEditor.IsLoading = true;

		tmpProvider.loadFile(pFilePath, (pError, pContent) =>
		{
			tmpSelf.pict.AppData.ContentEditor.IsLoading = false;

			if (pError)
			{
				tmpSelf.pict.AppData.ContentEditor.SaveStatus = 'Error loading file: ' + pError;
				tmpSelf.pict.AppData.ContentEditor.SaveStatusClass = 'content-editor-status-error';
				tmpSelf.renderTopBar();
				return;
			}

			if (tmpEditorType === 'markdown')
			{
				// Markdown editor: uses segments (auto-segment if enabled)
				tmpSelf.pict.AppData.ContentEditor.Document.Segments = tmpSelf.segmentMarkdownContent(pContent);

				let tmpEditorView = tmpSelf.pict.views['ContentEditor-MarkdownEditor'];
				if (tmpEditorView)
				{
					// Set the image base URL so relative image references
					// resolve through the /content/ static route.
					let tmpImageBase = '/content/';
					let tmpLastSlash = pFilePath.lastIndexOf('/');
					if (tmpLastSlash > 0)
					{
						tmpImageBase = '/content/' + pFilePath.substring(0, tmpLastSlash) + '/';
					}
					tmpEditorView.options.ImageBaseURL = tmpImageBase;

					tmpEditorView.render();
					tmpEditorView.marshalToView();

					// Apply the Content Preview Mode setting
					tmpEditorView.setPreviewMode(tmpSelf.pict.AppData.ContentEditor.ContentPreviewMode || 'off');

					// Apply the Editing Controls setting (line numbers
					// and right sidebar) via the library's toggleControls.
					tmpEditorView.toggleControls(tmpSelf.pict.AppData.ContentEditor.MarkdownEditingControls);
				}

				tmpSelf.updateStats();
			}
			else
			{
				// Code editor: uses CodeContent
				tmpSelf.pict.AppData.ContentEditor.CodeContent = pContent;

				// Detect language from file extension
				let tmpExtension = pFilePath.replace(/^.*\./, '').toLowerCase();
				let tmpLanguage = libViewCodeEditor.getLanguageForExtension
					? libViewCodeEditor.getLanguageForExtension(tmpExtension)
					: (libViewCodeEditor.ExtensionLanguageMap[tmpExtension] || 'plaintext');

				let tmpCodeEditorView = tmpSelf.pict.views['ContentEditor-CodeEditor'];
				if (tmpCodeEditorView)
				{
					tmpCodeEditorView.initialRenderComplete = false;
					tmpCodeEditorView._language = tmpLanguage;

					// Suppress the dirty signal from the initial content push
					tmpCodeEditorView._suppressNextDirty = true;
					tmpCodeEditorView.render();
					tmpCodeEditorView.marshalToView();

					// Apply Code Word Wrap setting
					if (tmpSelf.pict.AppData.ContentEditor.CodeWordWrap && tmpCodeEditorView._editorElement)
					{
						tmpCodeEditorView._editorElement.style.whiteSpace = 'pre-wrap';
						tmpCodeEditorView._editorElement.style.overflowWrap = 'break-word';
					}
				}

				tmpSelf.updateStats();
			}
		});
	}

	/**
	 * Save the currently edited file.
	 */
	saveCurrentFile()
	{
		let tmpFilePath = this.pict.AppData.ContentEditor.CurrentFile;
		if (!tmpFilePath)
		{
			return;
		}

		let tmpProvider = this.pict.providers['ContentEditor-Provider'];
		let tmpSelf = this;

		let tmpContent = '';
		let tmpActiveEditor = this.pict.AppData.ContentEditor.ActiveEditor;

		// Excalidraw editor handles its own save path (writes JSON + SVG
		// sidecar) — short-circuit the markdown/code marshaling logic.
		if (tmpActiveEditor === 'excalidraw')
		{
			let tmpExcView = this.pict.views['ContentEditor-ExcalidrawEditor'];
			if (!tmpExcView) return;
			let tmpSelfX = this;
			this.pict.AppData.ContentEditor.IsSaving = true;
			this.pict.AppData.ContentEditor.SaveStatus = 'Saving...';
			this.pict.AppData.ContentEditor.SaveStatusClass = 'content-editor-status-saving';
			this.renderTopBar();
			tmpExcView.saveToContent((pErr) =>
			{
				tmpSelfX.pict.AppData.ContentEditor.IsSaving = false;
				if (pErr)
				{
					tmpSelfX.pict.AppData.ContentEditor.SaveStatus = 'Error: ' + pErr.message;
					tmpSelfX.pict.AppData.ContentEditor.SaveStatusClass = 'content-editor-status-error';
				}
				else
				{
					tmpSelfX.pict.AppData.ContentEditor.IsDirty = false;
					tmpSelfX.pict.AppData.ContentEditor.SaveStatus = 'Saved';
					tmpSelfX.pict.AppData.ContentEditor.SaveStatusClass = 'content-editor-status-saved';
					tmpSelfX.loadFileList();
					setTimeout(() =>
					{
						if (tmpSelfX.pict.AppData.ContentEditor.SaveStatus === 'Saved')
						{
							tmpSelfX.pict.AppData.ContentEditor.SaveStatus = '';
							tmpSelfX.pict.AppData.ContentEditor.SaveStatusClass = '';
							tmpSelfX.renderTopBar();
						}
					}, 3000);
				}
				tmpSelfX.renderTopBar();
			});
			return;
		}

		if (tmpActiveEditor === 'code')
		{
			// Marshal content from the code editor
			let tmpCodeEditorView = this.pict.views['ContentEditor-CodeEditor'];
			if (tmpCodeEditorView)
			{
				tmpCodeEditorView.marshalFromView();
			}
			tmpContent = this.pict.AppData.ContentEditor.CodeContent || '';
		}
		else
		{
			// Marshal content from the markdown editor
			let tmpEditorView = this.pict.views['ContentEditor-MarkdownEditor'];
			if (tmpEditorView)
			{
				tmpEditorView.marshalFromView();
			}

			// Combine all segments into a single content string
			let tmpSegments = this.pict.AppData.ContentEditor.Document.Segments;
			if (tmpSegments && tmpSegments.length > 0)
			{
				let tmpParts = [];
				for (let i = 0; i < tmpSegments.length; i++)
				{
					tmpParts.push(tmpSegments[i].Content || '');
				}
				tmpContent = tmpParts.join('\n\n');
			}
		}

		this.pict.AppData.ContentEditor.IsSaving = true;
		this.pict.AppData.ContentEditor.SaveStatus = 'Saving...';
		this.pict.AppData.ContentEditor.SaveStatusClass = 'content-editor-status-saving';
		this.renderTopBar();

		tmpProvider.saveFile(tmpFilePath, tmpContent, (pError) =>
		{
			tmpSelf.pict.AppData.ContentEditor.IsSaving = false;

			if (pError)
			{
				tmpSelf.pict.AppData.ContentEditor.SaveStatus = 'Error: ' + pError;
				tmpSelf.pict.AppData.ContentEditor.SaveStatusClass = 'content-editor-status-error';
			}
			else
			{
				tmpSelf.pict.AppData.ContentEditor.IsDirty = false;
				tmpSelf.pict.AppData.ContentEditor.SaveStatus = 'Saved';
				tmpSelf.pict.AppData.ContentEditor.SaveStatusClass = 'content-editor-status-saved';

				// Refresh the file list after saving
				tmpSelf.loadFileList();

				// Clear the save status after a delay
				setTimeout(() =>
				{
					if (tmpSelf.pict.AppData.ContentEditor.SaveStatus === 'Saved')
					{
						tmpSelf.pict.AppData.ContentEditor.SaveStatus = '';
						tmpSelf.pict.AppData.ContentEditor.SaveStatusClass = '';
						tmpSelf.renderTopBar();
					}
				}, 3000);
			}

			tmpSelf.renderTopBar();
		});
	}

	/**
	 * Close the currently open file.
	 *
	 * If the document has unsaved changes, shows a confirmation dialog.
	 * Otherwise closes immediately.
	 */
	closeCurrentFile()
	{
		if (!this.pict.AppData.ContentEditor.CurrentFile)
		{
			return;
		}

		if (this.pict.AppData.ContentEditor.IsDirty)
		{
			this._showCloseConfirmation();
			return;
		}

		this._doCloseFile();
	}

	/**
	 * Perform the actual close: reset editor state to the welcome screen.
	 */
	_doCloseFile()
	{
		this._hideCloseConfirmation();

		this._cleanupEditors();

		this.pict.AppData.ContentEditor.CurrentFile = '';
		this.pict.AppData.ContentEditor.ActiveEditor = 'markdown';
		this.pict.AppData.ContentEditor.IsDirty = false;
		this.pict.AppData.ContentEditor.SaveStatus = '';
		this.pict.AppData.ContentEditor.SaveStatusClass = '';
		this.pict.AppData.ContentEditor.Document.Segments = [{ Content: '' }];
		this.pict.AppData.ContentEditor.CodeContent = '';

		// Clear the hash
		window.location.hash = '';

		// Re-render top bar (hides save/close buttons)
		this.renderTopBar();

		// Show the welcome message
		let tmpEditorContainer = this.pict.ContentAssignment.getElement('#ContentEditor-Editor-Container');
		if (tmpEditorContainer && tmpEditorContainer[0])
		{
			tmpEditorContainer[0].innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#8A7F72;font-size:1.1em;">Select a file from the sidebar to begin editing</div>';
		}

		this.updateStats();
	}

	/**
	 * Confirm closing a file with unsaved changes (discard and close).
	 */
	confirmCloseFile()
	{
		this._doCloseFile();
	}

	/**
	 * Cancel the close confirmation dialog.
	 */
	cancelCloseFile()
	{
		this._hideCloseConfirmation();
	}

	/**
	 * Show the unsaved-changes confirmation overlay.
	 */
	_showCloseConfirmation()
	{
		let tmpOverlay = this.pict.ContentAssignment.getElement('#ContentEditor-ConfirmOverlay')[0];
		if (tmpOverlay)
		{
			tmpOverlay.classList.add('open');
		}

		// Set up keyboard listener for Y/N/Esc
		if (!this._confirmKeyHandler)
		{
			let tmpSelf = this;
			this._confirmKeyHandler = (pEvent) =>
			{
				let tmpKey = pEvent.key.toLowerCase();
				if (tmpKey === 'y')
				{
					pEvent.preventDefault();
					tmpSelf.confirmCloseFile();
				}
				else if (tmpKey === 'n' || pEvent.key === 'Escape')
				{
					pEvent.preventDefault();
					tmpSelf.cancelCloseFile();
				}
			};
		}

		window.addEventListener('keydown', this._confirmKeyHandler);
	}

	/**
	 * Hide the unsaved-changes confirmation overlay and remove the keyboard listener.
	 */
	_hideCloseConfirmation()
	{
		let tmpOverlay = this.pict.ContentAssignment.getElement('#ContentEditor-ConfirmOverlay')[0];
		if (tmpOverlay)
		{
			tmpOverlay.classList.remove('open');
		}

		if (this._confirmKeyHandler)
		{
			window.removeEventListener('keydown', this._confirmKeyHandler);
		}
	}

	/**
	 * Create a new file.
	 *
	 * @param {string} pFilePath - The path for the new file
	 */
	createNewFile(pFilePath)
	{
		if (!pFilePath)
		{
			return;
		}

		// Only add .md extension if the user did not provide any extension
		let tmpBaseName = pFilePath.replace(/^.*\//, '');
		if (tmpBaseName.indexOf('.') < 0)
		{
			pFilePath = pFilePath + '.md';
		}

		let tmpProvider = this.pict.providers['ContentEditor-Provider'];
		let tmpSelf = this;

		// Generate sensible default content based on file type
		let tmpDefaultContent = '';
		let tmpLower = pFilePath.toLowerCase();
		if (tmpLower.endsWith('.md'))
		{
			tmpDefaultContent = '# ' + pFilePath.replace(/\.[^.]+$/, '').replace(/^.*\//, '') + '\n\n';
		}
		else if (tmpLower.endsWith('.excalidraw.json') ||
				 tmpLower.endsWith('.excalidraw'))
		{
			// Empty-but-valid Excalidraw scene.  Opens with a blank canvas;
			// saving once produces the matching `.excalidraw.svg` sibling
			// (2-file mode).  The .excalidraw.svg path isn't supported as a
			// direct creation target because rendering an empty Excalidraw
			// SVG requires the wrapper bundle — users create the .json
			// (or the bare `.excalidraw`), open it, and save once to produce
			// the SVG sibling.
			tmpDefaultContent = JSON.stringify({
				type: 'excalidraw',
				version: 2,
				source: 'retold-content-system',
				elements: [],
				appState: {},
				files: {}
			}, null, 2);
		}
		else
		{
			tmpDefaultContent = '// ' + pFilePath.replace(/^.*\//, '') + '\n';
		}

		tmpProvider.saveFile(pFilePath, tmpDefaultContent, (pError) =>
		{
			if (!pError)
			{
				// Reload the file list and navigate to the new file
				tmpSelf.loadFileList(null, () =>
				{
					tmpSelf.navigateToFile(pFilePath);
				});
			}
		});
	}

	/**
	 * Prompt the user for a new file name and create it.
	 */
	promptNewFile()
	{
		let tmpFileName = prompt('Enter a name for the new file (e.g. my-page.md, script.js, style.css):');
		if (tmpFileName && tmpFileName.trim())
		{
			this.createNewFile(tmpFileName.trim());
		}
	}

	/**
	 * Prompt the user for a folder name and create it in the current
	 * browse location via the server API.
	 */
	promptNewFolder()
	{
		let tmpFolderName = prompt('Enter a name for the new folder:');
		if (!tmpFolderName || !tmpFolderName.trim())
		{
			return;
		}
		tmpFolderName = tmpFolderName.trim();

		// Build the full relative path inside the current browse location
		let tmpCurrentLocation = '';
		if (this.pict.AppData.PictFileBrowser && this.pict.AppData.PictFileBrowser.CurrentLocation)
		{
			tmpCurrentLocation = this.pict.AppData.PictFileBrowser.CurrentLocation;
		}
		let tmpPath = tmpCurrentLocation
			? (tmpCurrentLocation + '/' + tmpFolderName)
			: tmpFolderName;

		let tmpSelf = this;

		fetch('/api/content/mkdir',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ Path: tmpPath })
		})
			.then((pResponse) => pResponse.json())
			.then((pData) =>
			{
				if (pData && pData.Success)
				{
					tmpSelf.log.info(`Folder created: ${tmpPath}`);
					// Refresh the file list to show the new folder
					tmpSelf.loadFileList();
				}
				else
				{
					alert('Could not create folder: ' + (pData ? pData.Error : 'Unknown error'));
				}
			})
			.catch((pError) =>
			{
				alert('Error creating folder: ' + pError.message);
			});
	}

	/**
	 * Insert a file reference into the active markdown editor segment.
	 *
	 * Called from the "+" button on file browser rows.  For image files
	 * this inserts markdown image syntax; for other files a markdown link.
	 *
	 * @param {string} pFilename - The filename to insert
	 */
	insertFileReference(pFilename)
	{
		if (!pFilename)
		{
			return;
		}

		let tmpEditorView = this.pict.views['ContentEditor-MarkdownEditor'];
		if (!tmpEditorView || this.pict.AppData.ContentEditor.ActiveEditor !== 'markdown')
		{
			return;
		}

		// Determine the active segment (the one with focus, or the last one)
		let tmpSegmentIndex = tmpEditorView._activeSegmentIndex;
		if (tmpSegmentIndex < 0)
		{
			// Fall back to the first segment
			let tmpIndices = tmpEditorView._getOrderedSegmentIndices();
			if (tmpIndices.length > 0)
			{
				tmpSegmentIndex = tmpIndices[0];
			}
		}
		if (tmpSegmentIndex < 0)
		{
			return;
		}

		// Build alt text from the filename (strip extension and timestamp prefix)
		let tmpAltText = pFilename.replace(/\.[^.]+$/, '');
		tmpAltText = tmpAltText.replace(/^\d{10,}-/, '');
		tmpAltText = tmpAltText.replace(/[-_]+/g, ' ').trim() || 'image';

		// Check if this is an image file
		let tmpExt = pFilename.substring(pFilename.lastIndexOf('.')).toLowerCase();
		let tmpImageExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.avif', '.apng', '.ico', '.tiff', '.tif', '.jfif'];

		if (tmpImageExts.indexOf(tmpExt) >= 0)
		{
			// Insert markdown image syntax — relative filename resolved by ImageBaseURL
			tmpEditorView._insertImageMarkdown(tmpSegmentIndex, pFilename, tmpAltText);
		}
		else
		{
			// Insert a markdown link for non-image files
			let tmpEditor = tmpEditorView._segmentEditors[tmpSegmentIndex];
			if (tmpEditor)
			{
				let tmpInsert = '[' + tmpAltText + '](' + pFilename + ')';
				let tmpCursorPos = tmpEditor.state.selection.main.head;
				tmpEditor.dispatch(
				{
					changes: { from: tmpCursorPos, insert: tmpInsert },
					selection: { anchor: tmpCursorPos + tmpInsert.length }
				});
				tmpEditor.focus();
			}
		}
	}

	/**
	 * Handle F4 / Cmd+Shift+T: context-aware topic creation.
	 *
	 * If the markdown editor is active and has focus, creates a new
	 * topic linked to the current file and cursor line, then switches
	 * to the Topics tab with the new entry in edit mode.
	 *
	 * Otherwise, just toggles the Topics sidebar tab.
	 */
	handleF4TopicAction()
	{
		let tmpLayoutView = this.pict.views['ContentEditor-Layout'];
		let tmpTopicsView = this.pict.views['ContentEditor-Topics'];

		if (!tmpLayoutView || !tmpTopicsView)
		{
			return;
		}

		let tmpSettings = this.pict.AppData.ContentEditor;
		let tmpActiveEditor = tmpSettings.ActiveEditor;
		let tmpCurrentFile = tmpSettings.CurrentFile;

		// Check if we're in the markdown editor with a file open
		let tmpInMarkdownEditor = (tmpActiveEditor === 'markdown' && tmpCurrentFile);
		let tmpLineNumber = 0;
		let tmpFoundFocus = false;

		if (tmpInMarkdownEditor)
		{
			// Try to get the cursor line from the focused CodeMirror editor
			let tmpEditorView = this.pict.views['ContentEditor-MarkdownEditor'];
			if (tmpEditorView && tmpEditorView._segmentEditors)
			{
				let tmpRunningLines = 0;
				for (let tmpKey in tmpEditorView._segmentEditors)
				{
					let tmpEditor = tmpEditorView._segmentEditors[tmpKey];
					if (tmpEditor && tmpEditor.hasFocus)
					{
						let tmpPos = tmpEditor.state.selection.main.head;
						let tmpLine = tmpEditor.state.doc.lineAt(tmpPos);
						tmpLineNumber = tmpRunningLines + tmpLine.number;
						tmpFoundFocus = true;
						break;
					}
					if (tmpEditor && tmpEditor.state)
					{
						tmpRunningLines += tmpEditor.state.doc.lines;
					}
				}
			}
		}

		// Expand sidebar if collapsed
		if (tmpSettings.SidebarCollapsed)
		{
			tmpLayoutView.toggleSidebar();
		}

		// Switch to the Topics tab
		tmpLayoutView.switchSidebarTab('topics');

		// If we found a focused editor, create a topic from context
		if (tmpFoundFocus && tmpCurrentFile)
		{
			// Extract the document's first biggest heading for a default title
			let tmpDefaultTitle = this._extractFirstHeading();

			let tmpTopicData =
			{
				TopicCode: 'New-Topic',
				TopicHelpFilePath: tmpCurrentFile,
				TopicTitle: tmpDefaultTitle || 'New Topic'
			};

			if (tmpLineNumber > 0)
			{
				tmpTopicData.RelevantMarkdownLine = tmpLineNumber;
			}

			tmpTopicsView.addTopic(tmpTopicData);
		}
	}

	/**
	 * Extract the first (highest-level) heading from the markdown
	 * content currently loaded in the editor.
	 *
	 * Scans all segment editors for heading lines (# ... through
	 * ###### ...) and returns the text of the highest-level one
	 * found (preferring H1, then H2, etc.).  If multiple headings
	 * share the same level, the first one wins.
	 *
	 * @returns {string} The heading text, or '' if none found
	 */
	_extractFirstHeading()
	{
		let tmpEditorView = this.pict.views['ContentEditor-MarkdownEditor'];
		if (!tmpEditorView || !tmpEditorView._segmentEditors)
		{
			return '';
		}

		let tmpBestLevel = 7; // lower is better (1 = H1)
		let tmpBestText = '';

		for (let tmpKey in tmpEditorView._segmentEditors)
		{
			let tmpEditor = tmpEditorView._segmentEditors[tmpKey];
			if (!tmpEditor || !tmpEditor.state || !tmpEditor.state.doc)
			{
				continue;
			}

			let tmpDoc = tmpEditor.state.doc;
			for (let i = 1; i <= tmpDoc.lines; i++)
			{
				let tmpLine = tmpDoc.line(i).text;
				let tmpMatch = tmpLine.match(/^(#{1,6})\s+(.+)/);
				if (tmpMatch)
				{
					let tmpLevel = tmpMatch[1].length;
					if (tmpLevel < tmpBestLevel)
					{
						tmpBestLevel = tmpLevel;
						tmpBestText = tmpMatch[2].trim();

						// Can't do better than H1
						if (tmpBestLevel === 1)
						{
							return tmpBestText;
						}
					}
				}
			}
		}

		return tmpBestText;
	}

	/**
	 * Update the document stats display (lines, words, chars).
	 *
	 * Reads directly from the active editor instances so there is no
	 * need to marshal first.  CodeMirror exposes line and character
	 * counts on its document model at near-zero cost.
	 */
	updateStats()
	{
		let tmpStatsEl = this.pict.ContentAssignment.getElement('#ContentEditor-Stats')[0];
		if (!tmpStatsEl)
		{
			return;
		}

		let tmpActiveEditor = this.pict.AppData.ContentEditor.ActiveEditor;
		let tmpLines = 0;
		let tmpChars = 0;
		let tmpWords = 0;

		if (tmpActiveEditor === 'markdown')
		{
			let tmpEditorView = this.pict.views['ContentEditor-MarkdownEditor'];
			if (tmpEditorView && tmpEditorView._segmentEditors)
			{
				for (let tmpKey in tmpEditorView._segmentEditors)
				{
					let tmpEditor = tmpEditorView._segmentEditors[tmpKey];
					if (tmpEditor && tmpEditor.state && tmpEditor.state.doc)
					{
						tmpLines += tmpEditor.state.doc.lines;
						tmpChars += tmpEditor.state.doc.length;
						let tmpText = tmpEditor.state.doc.toString();
						let tmpMatches = tmpText.match(/\S+/g);
						if (tmpMatches)
						{
							tmpWords += tmpMatches.length;
						}
					}
				}
			}
		}
		else if (tmpActiveEditor === 'code')
		{
			let tmpCodeEditorView = this.pict.views['ContentEditor-CodeEditor'];
			if (tmpCodeEditorView && tmpCodeEditorView.codeJar)
			{
				let tmpText = tmpCodeEditorView.codeJar.toString();
				tmpChars = tmpText.length;
				tmpLines = tmpText.split('\n').length;
				let tmpMatches = tmpText.match(/\S+/g);
				if (tmpMatches)
				{
					tmpWords = tmpMatches.length;
				}
			}
		}
		else
		{
			// Binary or no file — clear stats
			tmpStatsEl.textContent = '';
			return;
		}

		tmpStatsEl.textContent = tmpLines + ' lines \u00B7 ' + tmpWords + ' words \u00B7 ' + tmpChars + ' chars';
	}

	/**
	 * Re-render the top bar — both Theme-TopBar slot views (Nav + User).
	 * The chrome row itself (BrandMark + slot containers) is data-free
	 * and managed by pict-section-theme; only the slot views need
	 * refreshing when AppData.ContentEditor state changes.
	 */
	renderTopBar()
	{
		let tmpNav  = this.pict.views['ContentEditor-TopBar-Nav'];
		let tmpUser = this.pict.views['ContentEditor-TopBar-User'];
		if (tmpNav)  { tmpNav.render();  }
		if (tmpUser) { tmpUser.render(); }
	}

	/**
	 * Mark the document as dirty (unsaved changes).
	 */
	markDirty()
	{
		if (!this.pict.AppData.ContentEditor.IsDirty)
		{
			this.pict.AppData.ContentEditor.IsDirty = true;
			this.renderTopBar();
		}
	}

	/**
	 * Re-segment the currently open markdown document in place,
	 * preserving any unsaved edits.
	 *
	 * Called from the settings panel when the user toggles
	 * AutoSegmentMarkdown or picks a new AutoSegmentDepth. The flow:
	 *
	 *   1. Pull the current segments from AppData (they already include
	 *      live in-memory edits because the markdown editor writes back
	 *      via _onSegmentContentChange on every keystroke).
	 *   2. Rejoin into a single string. We use '\n\n' between segments
	 *      because:
	 *        - At depth 1, segments were split BY blank lines, so the
	 *          original separator was a blank line.
	 *        - At depth >=2, segments start with a heading and conventional
	 *          markdown puts a blank line before each heading anyway.
	 *      The result is bit-stable across re-segmentation cycles.
	 *   3. Re-segment with the current settings.
	 *   4. Re-render the markdown editor; marshalToView pulls the new
	 *      segments into the per-segment editor instances.
	 *
	 * No-ops when the active editor isn't markdown or no file is open.
	 */
	resegmentCurrentMarkdown()
	{
		let tmpEditorState = this.pict.AppData.ContentEditor;
		if (!tmpEditorState || tmpEditorState.ActiveEditor !== 'markdown' || !tmpEditorState.CurrentFile)
		{
			return;
		}

		let tmpSegments = (tmpEditorState.Document && tmpEditorState.Document.Segments) || [];
		if (tmpSegments.length < 1)
		{
			return;
		}

		// Capture dirty state so re-segmentation doesn't clear it. The
		// rebuilt-from-segments raw content is identical to what the
		// markdown editor would marshal back on save, so flipping
		// segmentation is a layout-only change from the user's POV.
		let tmpWasDirty = !!tmpEditorState.IsDirty;

		let tmpRawContent = tmpSegments.map((s) => (s && typeof s.Content === 'string') ? s.Content : '').join('\n\n');
		tmpEditorState.Document.Segments = this.segmentMarkdownContent(tmpRawContent);

		let tmpEditorView = this.pict.views['ContentEditor-MarkdownEditor'];
		if (tmpEditorView)
		{
			tmpEditorView.render();
			tmpEditorView.marshalToView();
			// Re-apply the preview mode + controls toggles after a render
			// (same dance navigateToFile does) so they survive the segment
			// rebuild.
			if (typeof tmpEditorView.setPreviewMode === 'function')
			{
				tmpEditorView.setPreviewMode(tmpEditorState.ContentPreviewMode || 'off');
			}
			if (typeof tmpEditorView.toggleControls === 'function')
			{
				tmpEditorView.toggleControls(!!tmpEditorState.MarkdownEditingControls);
			}
		}

		// Restore dirty state — render() above doesn't change it but the
		// editor's marshalToView might fire content-change handlers; be
		// defensive about it.
		tmpEditorState.IsDirty = tmpWasDirty;
		this.renderTopBar();
		this.updateStats();
	}

	/**
	 * The localStorage key used for persisting editor settings.
	 */
	get _settingsKey()
	{
		return 'retold-content-editor-settings';
	}

	/**
	 * Persist the current editor settings to localStorage.
	 */
	saveSettings()
	{
		if (typeof (window) === 'undefined' || !window.localStorage)
		{
			return;
		}

		let tmpSettings = this.pict.AppData.ContentEditor;

		let tmpData =
		{
			AutoSegmentMarkdown: tmpSettings.AutoSegmentMarkdown,
			AutoSegmentDepth: tmpSettings.AutoSegmentDepth,
			ContentPreviewMode: tmpSettings.ContentPreviewMode,
			MarkdownEditingControls: tmpSettings.MarkdownEditingControls,
			MarkdownWordWrap: tmpSettings.MarkdownWordWrap,
			CodeWordWrap: tmpSettings.CodeWordWrap,
			SidebarCollapsed: tmpSettings.SidebarCollapsed,
			SidebarWidth: tmpSettings.SidebarWidth,
			AutoPreviewImages: tmpSettings.AutoPreviewImages,
			AutoPreviewVideo: tmpSettings.AutoPreviewVideo,
			AutoPreviewAudio: tmpSettings.AutoPreviewAudio,
			ShowHiddenFiles: tmpSettings.ShowHiddenFiles,
			TopicsFilePath: tmpSettings.TopicsFilePath
		};

		try
		{
			window.localStorage.setItem(this._settingsKey, JSON.stringify(tmpData));
		}
		catch (pError)
		{
			this.log.warn('Failed to save settings: ' + pError.message);
		}
	}

	/**
	 * Load editor settings from localStorage, overwriting the
	 * current defaults for any keys that are present.
	 */
	_loadSettings()
	{
		if (typeof (window) === 'undefined' || !window.localStorage)
		{
			return;
		}

		try
		{
			let tmpRaw = window.localStorage.getItem(this._settingsKey);
			if (!tmpRaw)
			{
				return;
			}

			let tmpStored = JSON.parse(tmpRaw);
			let tmpSettings = this.pict.AppData.ContentEditor;

			if (typeof (tmpStored.AutoSegmentMarkdown) === 'boolean')
			{
				tmpSettings.AutoSegmentMarkdown = tmpStored.AutoSegmentMarkdown;
			}
			if (typeof (tmpStored.AutoSegmentDepth) === 'number')
			{
				tmpSettings.AutoSegmentDepth = tmpStored.AutoSegmentDepth;
			}
			if (typeof (tmpStored.ContentPreviewMode) === 'string')
			{
				tmpSettings.ContentPreviewMode = tmpStored.ContentPreviewMode;
			}
			else if (typeof (tmpStored.AutoContentPreview) === 'boolean')
			{
				// Backward compat: migrate old boolean setting
				tmpSettings.ContentPreviewMode = tmpStored.AutoContentPreview ? 'bottom' : 'off';
			}
			if (typeof (tmpStored.MarkdownEditingControls) === 'boolean')
			{
				tmpSettings.MarkdownEditingControls = tmpStored.MarkdownEditingControls;
			}
			if (typeof (tmpStored.MarkdownWordWrap) === 'boolean')
			{
				tmpSettings.MarkdownWordWrap = tmpStored.MarkdownWordWrap;
			}
			if (typeof (tmpStored.CodeWordWrap) === 'boolean')
			{
				tmpSettings.CodeWordWrap = tmpStored.CodeWordWrap;
			}
			if (typeof (tmpStored.SidebarCollapsed) === 'boolean')
			{
				tmpSettings.SidebarCollapsed = tmpStored.SidebarCollapsed;
			}
			if (typeof (tmpStored.SidebarWidth) === 'number')
			{
				tmpSettings.SidebarWidth = tmpStored.SidebarWidth;
			}
			if (typeof (tmpStored.AutoPreviewImages) === 'boolean')
			{
				tmpSettings.AutoPreviewImages = tmpStored.AutoPreviewImages;
			}
			if (typeof (tmpStored.AutoPreviewVideo) === 'boolean')
			{
				tmpSettings.AutoPreviewVideo = tmpStored.AutoPreviewVideo;
			}
			if (typeof (tmpStored.AutoPreviewAudio) === 'boolean')
			{
				tmpSettings.AutoPreviewAudio = tmpStored.AutoPreviewAudio;
			}
			if (typeof (tmpStored.ShowHiddenFiles) === 'boolean')
			{
				tmpSettings.ShowHiddenFiles = tmpStored.ShowHiddenFiles;
			}
			if (typeof (tmpStored.TopicsFilePath) === 'string')
			{
				tmpSettings.TopicsFilePath = tmpStored.TopicsFilePath;
			}
		}
		catch (pError)
		{
			this.log.warn('Failed to load settings: ' + pError.message);
		}
	}

	// ── Login overlay (boot gate) ───────────────────────────────────────
	/**
	 * Append `<div id="ContentEditor-Login-Overlay">` to <body> once at
	 * boot so the wrapper view has a stable mount point.  Idempotent.
	 */
	_ensureLoginOverlayMount()
	{
		if (typeof document === 'undefined') { return; }
		if (document.getElementById('ContentEditor-Login-Overlay')) { return; }
		let tmpDiv = document.createElement('div');
		tmpDiv.id = 'ContentEditor-Login-Overlay';
		document.body.appendChild(tmpDiv);
	}

	_showLoginOverlay()
	{
		let tmpEl = (typeof document !== 'undefined') && document.getElementById('ContentEditor-Login-Overlay');
		if (tmpEl) { tmpEl.classList.add('is-active'); }
	}

	_hideLoginOverlay()
	{
		let tmpEl = (typeof document !== 'undefined') && document.getElementById('ContentEditor-Login-Overlay');
		if (tmpEl) { tmpEl.classList.remove('is-active'); }
	}
}

module.exports = ContentEditorApplication;

module.exports.default_configuration = require('./Pict-Application-ContentEditor-Configuration.json');
