const libPictView = require('pict-view');

/**
 * ContentEditor-Layout — application chrome.
 *
 * Built on pict-section-modal's shell() API. This view owns the shell
 * and the upload-overlay; everything else (TopBar, Sidebar, Doc panel,
 * Settings panel, editor center) lives in panels.
 *
 * Panel layout:
 *
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ #Theme-TopBar  (top, fixed, 48px) — BrandMark + Nav + User   │
 *   ├────────┬─────────────────────────────────┬───────────────────┤
 *   │ #CES-  │ #ContentEditor-Editor-Container │ #CE-Doc-Panel     │
 *   │ Side-  │ (center — the editor area)      │ (right, collapse) │
 *   │ bar-   │                                 │                   │
 *   │ Host   │                                 │                   │
 *   │ (left, │                                 │                   │
 *   │ resiz, │                                 │                   │
 *   │ tabs)  │                                 │                   │
 *   └────────┴─────────────────────────────────┴───────────────────┘
 *
 * Plus #CE-Settings-Panel — a Hidden panel that overlays from the
 * right when the gear button in the user slot toggles it. No edge
 * affordance: collapsed = display: none. Gear is the only way in.
 *
 * The upload overlay (image drag-drop) is rendered outside the shell
 * (position: fixed) so it floats above everything.
 */

const _ViewConfiguration =
{
	ViewIdentifier: "ContentEditor-Layout",

	DefaultRenderable: "ContentEditor-Layout-Shell",
	DefaultDestinationAddress: "#ContentEditor-Application-Container",

	AutoRender: false,

	CSS: /*css*/`
		/* height: 100% (not 100vh) so Theme-Scale's CSS zoom on <html>
		   doesn't push panels off-screen — vh units render against the
		   un-zoomed viewport. 100% cascades through html → body →
		   container and stays in sync at any scale. */
		#ContentEditor-Application-Container
		{
			height: 100%;
			min-height: 0;
			overflow: hidden;
		}
		html, body { height: 100%; margin: 0; padding: 0; }
		body
		{
			background: var(--theme-color-background-primary, #F5F3EE);
			color: var(--theme-color-text-primary, #3D3229);
			font-family: var(--theme-typography-family-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif);
		}

		/* Shell-managed panels inherit themed surfaces from the active theme. */
		.pict-modal-shell-host { height: 100%; }
		.pict-modal-shell { background: var(--theme-color-background-primary, #F5F3EE); }
		.pict-modal-shell-panel { background: var(--theme-color-background-panel, #FAF8F4); }
		.pict-modal-shell-center { background: var(--theme-color-background-primary, #F5F3EE); }

		/* Editor center — content area between left sidebar and right
		   doc panel. Existing editor views (Markdown / Code) write into
		   #ContentEditor-Editor-Container. */
		#ContentEditor-Editor-Container
		{
			height: 100%;
			display: flex;
			flex-direction: column;
			min-height: 0;
			background: var(--theme-color-background-primary, #F5F3EE);
		}
		.content-editor-empty
		{
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;
			color: var(--theme-color-text-muted, #8A7F72);
			font-size: 1.1em;
			font-style: italic;
		}

		/* Doc panel destination — InlineDocumentation provider writes here. */
		#ContentEditor-Documentation-Panel
		{
			height: 100%;
			min-height: 0;
			overflow-y: auto;
			background: var(--theme-color-background-panel, #FAF8F4);
			color: var(--theme-color-text-primary, #3D3229);
		}

		/* Settings panel destination */
		#ContentEditor-Settings-Panel
		{
			height: 100%;
			min-height: 0;
			overflow-y: auto;
			background: var(--theme-color-background-panel, #FAF8F4);
			color: var(--theme-color-text-primary, #3D3229);
			border-left: 1px solid var(--theme-color-border-default, #DDD6CA);
		}

		/* ============================================
		   Image upload overlay (F3 / Ctrl-Shift-U)
		   Lives outside the shell so it floats above everything.
		   ============================================ */
		.content-editor-upload-overlay
		{
			display: none;
			position: fixed;
			top: 0; left: 0; right: 0; bottom: 0;
			z-index: 1100;
			background: rgba(0, 0, 0, 0.35);
			align-items: center;
			justify-content: center;
		}
		.content-editor-upload-overlay.open
		{
			display: flex;
		}
		.content-editor-upload-panel
		{
			background: var(--theme-color-background-panel, #FFF);
			color: var(--theme-color-text-primary, #3D3229);
			border: 1px solid var(--theme-color-border-default, #DDD6CA);
			border-radius: 10px;
			box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
			width: 480px;
			max-width: 90vw;
			overflow: hidden;
		}
		.content-editor-upload-header
		{
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 14px 20px;
			border-bottom: 1px solid var(--theme-color-border-light, #EDE9E3);
		}
		.content-editor-upload-title
		{
			font-size: 0.95rem;
			font-weight: 600;
		}
		.content-editor-upload-close
		{
			border: none;
			background: transparent;
			font-size: 1.4rem;
			cursor: pointer;
			color: var(--theme-color-text-muted, #8A7F72);
			padding: 0 4px;
		}
		.content-editor-upload-close:hover
		{
			color: var(--theme-color-text-primary, #3D3229);
		}
		.content-editor-upload-body
		{
			padding: 18px 20px;
		}
		.content-editor-upload-dropzone
		{
			border: 2px dashed var(--theme-color-border-default, #DDD6CA);
			border-radius: 8px;
			padding: 28px 16px;
			text-align: center;
			cursor: pointer;
			transition: background 120ms ease, border-color 120ms ease;
		}
		.content-editor-upload-dropzone:hover,
		.content-editor-upload-dropzone.dragover
		{
			border-color: var(--theme-color-brand-primary, #2E7D74);
			background: var(--theme-color-background-hover, #F0EDE8);
		}
		.content-editor-upload-dropzone-icon
		{
			font-size: 2rem;
			color: var(--theme-color-text-muted, #8A7F72);
			margin-bottom: 8px;
		}
		.content-editor-upload-dropzone-text
		{
			font-size: 0.92rem;
			color: var(--theme-color-text-secondary, #5E5549);
		}
		.content-editor-upload-dropzone-hint
		{
			font-size: 0.78rem;
			color: var(--theme-color-text-muted, #8A7F72);
			margin-top: 4px;
		}
		.content-editor-upload-file-input
		{
			display: none;
		}
		.content-editor-upload-status
		{
			margin-top: 12px;
			font-size: 0.85rem;
		}
		.content-editor-upload-status-success
		{
			color: var(--theme-color-status-success, #7BC47F);
			font-weight: 600;
		}
		.content-editor-upload-status-error
		{
			color: var(--theme-color-status-error, #D9534F);
			font-weight: 600;
		}
		.content-editor-upload-result
		{
			margin-top: 12px;
			padding: 12px;
			background: var(--theme-color-background-tertiary, #F0EDE8);
			border-radius: 6px;
		}
		.content-editor-upload-result-label
		{
			font-size: 0.72rem;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			color: var(--theme-color-text-muted, #8A7F72);
			margin-bottom: 4px;
		}
		.content-editor-upload-result-url
		{
			display: flex;
			align-items: center;
			gap: 8px;
		}
		.content-editor-upload-result-text
		{
			flex: 1;
			font-family: var(--theme-typography-family-mono, monospace);
			font-size: 0.78rem;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.content-editor-upload-result-copy
		{
			background: var(--theme-color-brand-primary, #2E7D74);
			color: var(--theme-color-text-on-brand, #FFF);
			border: none;
			border-radius: 4px;
			padding: 4px 10px;
			font-size: 0.75rem;
			font-weight: 600;
			cursor: pointer;
		}
		.content-editor-upload-result-copy:hover
		{
			background: var(--theme-color-brand-primary-hover, #3A9E92);
		}
		.content-editor-upload-footer
		{
			padding: 10px 20px;
			border-top: 1px solid var(--theme-color-border-light, #EDE9E3);
			font-size: 0.72rem;
			color: var(--theme-color-text-muted, #8A7F72);
			text-align: center;
		}
		.content-editor-upload-kbd
		{
			display: inline-block;
			padding: 1px 5px;
			font-size: 0.68rem;
			font-family: var(--theme-typography-family-mono, monospace);
			background: var(--theme-color-background-tertiary, #F0EDE8);
			border: 1px solid var(--theme-color-border-default, #DDD6CA);
			border-radius: 3px;
			color: var(--theme-color-text-secondary, #5E5549);
		}
	`,

	Templates:
	[
		{
			Hash: "ContentEditor-Layout-Shell-Template",
			// Minimal template: the shell takes over the mount div and
			// builds its own DOM (top row, middle row with sides + center,
			// bottom row, overlay layer). The upload overlay is rendered
			// here as a fixed-position sibling so it floats above the
			// shell-managed chrome.
			Template: /*html*/`
<div id="ContentEditor-Layout-Mount" style="height:100%"></div>
<div class="content-editor-upload-overlay" id="ContentEditor-UploadOverlay"
	onclick="{~P~}.views['ContentEditor-Layout'].onUploadOverlayClick(event)">
	<div class="content-editor-upload-panel">
		<div class="content-editor-upload-header">
			<span class="content-editor-upload-title">Upload Image</span>
			<button class="content-editor-upload-close"
				onclick="{~P~}.views['ContentEditor-Layout'].toggleUploadForm()">&times;</button>
		</div>
		<div class="content-editor-upload-body">
			<div class="content-editor-upload-dropzone" id="ContentEditor-UploadDropzone"
				onclick="{~P~}.ContentAssignment.getElement('#ContentEditor-UploadFileInput')[0].click()">
				<div class="content-editor-upload-dropzone-icon"><svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5h2l1.5-2h5L12 5h2a1 1 0 011 1v6a1 1 0 01-1 1H2a1 1 0 01-1-1V6a1 1 0 011-1z"/><circle cx="8" cy="9" r="2.5"/></svg></div>
				<div class="content-editor-upload-dropzone-text">Drop an image here or click to browse</div>
				<div class="content-editor-upload-dropzone-hint">PNG, JPG, GIF, WebP, SVG, BMP</div>
			</div>
			<input type="file" class="content-editor-upload-file-input" id="ContentEditor-UploadFileInput"
				accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml,image/bmp"
				onchange="{~P~}.views['ContentEditor-Layout'].onUploadFileSelected(this)">
			<div class="content-editor-upload-status" id="ContentEditor-UploadStatus"></div>
			<div id="ContentEditor-UploadResult"></div>
		</div>
		<div class="content-editor-upload-footer">
			<span class="content-editor-upload-kbd">F3</span> or
			<span class="content-editor-upload-kbd">Ctrl+Shift+U</span> to toggle
		</div>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "ContentEditor-Layout-Shell",
			TemplateHash: "ContentEditor-Layout-Shell-Template",
			DestinationAddress: "#ContentEditor-Application-Container",
			RenderMethod: "replace"
		}
	]
};

class ContentEditorLayoutView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this._shell = null;
		this._shellPanelsBuilt = false;
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.CSSMap.injectCSS();

		// Build the shell on first render. Subsequent re-renders are
		// rare (the chrome is data-free) and shouldn't rebuild the shell.
		if (!this._shellPanelsBuilt)
		{
			this._buildShell();
			this._shellPanelsBuilt = true;
		}

		// Welcome message in the empty editor area until a file is
		// loaded — appears on first paint and is overwritten as soon
		// as navigateToFile() mounts an editor.
		let tmpDest = this.pict.ContentAssignment.getElement('#ContentEditor-Editor-Container');
		if (tmpDest && tmpDest[0] && !(this.pict.AppData.ContentEditor && this.pict.AppData.ContentEditor.CurrentFile))
		{
			this.pict.ContentAssignment.assignContent('#ContentEditor-Editor-Container',
				'<div class="content-editor-empty">Select a file from the sidebar to begin editing</div>');
		}

		this._wireGlobalKeyboardShortcuts();
		this._wireHashChangeListener();

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	_buildShell()
	{
		let tmpModalSection = this.pict.views['Pict-Section-Modal'];
		if (!tmpModalSection || typeof tmpModalSection.shell !== 'function')
		{
			this.pict.log.warn('ContentEditor-Layout: pict-section-modal.shell not available');
			return;
		}

		let tmpMount = document.getElementById('ContentEditor-Layout-Mount');
		if (!tmpMount)
		{
			this.pict.log.warn('ContentEditor-Layout: #ContentEditor-Layout-Mount not in DOM yet');
			return;
		}

		let tmpSettings = (this.pict.AppData && this.pict.AppData.ContentEditor) || {};
		let tmpIsMobile = (typeof window !== 'undefined' && window.innerWidth <= 768);

		this._shell = tmpModalSection.shell(tmpMount, { PersistenceKey: 'ContentEditor-Shell' });

		// Top — theme chrome. Theme-TopBar fills it with BrandMark on the
		// left, host-supplied NavView (ContentEditor-TopBar-Nav) showing
		// the file name + dirty indicator, and host-supplied UserView
		// (ContentEditor-TopBar-User) on the right with save status,
		// stats, action buttons, and the gear that toggles the hidden
		// settings panel.
		this._shell.addPanel(
		{
			Hash: 'topbar',
			Side: 'top',
			Mode: 'fixed',
			Size: 56,
			ContentDestinationId: 'Theme-TopBar',
			ContentView: 'Theme-TopBar'
		});

		// Left — sidebar. 4-tab UI (Files / Reference / Topics / Vocab)
		// hosted by ContentEditor-Sidebar-Tabs. ResponsiveDrawer flips
		// to a top-drawer pattern below 900px wide. Initial collapsed
		// state comes from persisted user settings.
		this._shell.addPanel(
		{
			Hash: 'sidebar',
			Side: 'left',
			Mode: 'resizable',
			Size: (typeof tmpSettings.SidebarWidth === 'number' && tmpSettings.SidebarWidth > 0) ? tmpSettings.SidebarWidth : 250,
			MinSize: 140,
			MaxSize: 600,
			Collapsed: !!tmpSettings.SidebarCollapsed || tmpIsMobile,
			Title: 'Files',
			ContentDestinationId: 'ContentEditor-Sidebar-Host',
			ContentView: 'ContentEditor-Sidebar-Tabs',
			ResponsiveDrawer: 900,
			OnExpand:   () => { this._persistSidebar(false); },
			OnCollapse: () => { this._persistSidebar(true); }
		});

		// Right (visible) — documentation panel. Pict-InlineDocumentation
		// provider initializes content into #ContentEditor-Documentation-
		// Panel later in the app's onAfterInitializeAsync, after this
		// shell has created the destination. Starts collapsed so the
		// user discovers it through the Docs button or the edge tab.
		this._shell.addPanel(
		{
			Hash: 'docpanel',
			Side: 'right',
			Mode: 'resizable',
			Size: 340,
			MinSize: 240,
			MaxSize: 600,
			Collapsed: true,
			Title: 'Docs',
			ContentDestinationId: 'ContentEditor-Documentation-Panel'
		});

		// Right (overlay, Hidden) — settings panel. Hidden:true means
		// no edge affordance when collapsed; the gear button in the
		// User slot is the only way to reveal it. Overlay position
		// floats above the doc panel rather than pushing it aside.
		this._shell.addPanel(
		{
			Hash: 'settings',
			Side: 'right',
			Mode: 'resizable',
			Position: 'overlay',
			Size: 360,
			MinSize: 280,
			MaxSize: 540,
			Hidden: true,
			Collapsed: true,
			ContentDestinationId: 'ContentEditor-Settings-Panel',
			ContentView: 'ContentEditor-SettingsPanel'
		});

		// Center — editor container.
		this._shell.center({ ContentDestinationId: 'ContentEditor-Editor-Container' });
	}

	_persistSidebar(pCollapsed)
	{
		if (!this.pict.AppData || !this.pict.AppData.ContentEditor) { return; }
		this.pict.AppData.ContentEditor.SidebarCollapsed = !!pCollapsed;
		if (this.pict.PictApplication && typeof this.pict.PictApplication.saveSettings === 'function')
		{
			this.pict.PictApplication.saveSettings();
		}
	}

	// ─────────────────────────────────────────────
	//  Public panel accessors used by other views (e.g. the gear button
	//  in TopBar-User → toggleSettingsPanel())
	// ─────────────────────────────────────────────

	getSidebarPanel()  { return this._shell ? this._shell.getPanel('sidebar')  : null; }
	getDocPanel()      { return this._shell ? this._shell.getPanel('docpanel') : null; }
	getSettingsPanel() { return this._shell ? this._shell.getPanel('settings') : null; }

	toggleSidebar()
	{
		let tmpPanel = this.getSidebarPanel();
		if (tmpPanel) { tmpPanel.toggle(); }
	}

	toggleDocPanel()
	{
		let tmpPanel = this.getDocPanel();
		if (!tmpPanel) { return; }
		tmpPanel.toggle();

		// On first expand, ensure the inline-doc provider has loaded
		// something into the panel (it initializes during the app's
		// onAfterInitializeAsync but the user may toggle the panel
		// before that completes, in which case the panel renders
		// empty until the provider catches up).
		if (!tmpPanel.Collapsed && !this._docPanelSeeded)
		{
			this._docPanelSeeded = true;
			let tmpProvider = this.pict.providers && this.pict.providers['Pict-InlineDocumentation'];
			if (tmpProvider && typeof tmpProvider.loadDocument === 'function')
			{
				tmpProvider.loadDocument('README.md');
			}
		}
	}

	toggleSettingsPanel()
	{
		let tmpPanel = this.getSettingsPanel();
		if (tmpPanel) { tmpPanel.toggle(); }
	}

	// ─────────────────────────────────────────────
	//  Sidebar tab switching — called by Sidebar-Tabs view template
	// ─────────────────────────────────────────────

	/**
	 * Handle the sidebar "+" button. Dispatches based on the active
	 * tab: Files → new file, Vocab → new term.
	 */
	onSidebarAddClick()
	{
		let tmpActiveTab = this.getActiveSidebarTab();
		if (tmpActiveTab === 'vocabulary')
		{
			let tmpVocabView = this.pict.views['ContentEditor-Vocabulary'];
			if (tmpVocabView && typeof tmpVocabView.createTerm === 'function')
			{
				tmpVocabView.createTerm();
			}
		}
		else
		{
			this.pict.PictApplication.promptNewFile();
		}
	}

	switchSidebarTab(pTab)
	{
		let tmpPanes =
		{
			files:      this.pict.ContentAssignment.getElement('#ContentEditor-Sidebar-Container')[0],
			reference:  this.pict.ContentAssignment.getElement('#ContentEditor-SidebarReference-Container')[0],
			topics:     this.pict.ContentAssignment.getElement('#ContentEditor-SidebarTopics-Container')[0],
			vocabulary: this.pict.ContentAssignment.getElement('#ContentEditor-Vocabulary-Container')[0]
		};
		let tmpTabs =
		{
			files:      this.pict.ContentAssignment.getElement('#ContentEditor-SidebarTab-Files')[0],
			reference:  this.pict.ContentAssignment.getElement('#ContentEditor-SidebarTab-Reference')[0],
			topics:     this.pict.ContentAssignment.getElement('#ContentEditor-SidebarTab-Topics')[0],
			vocabulary: this.pict.ContentAssignment.getElement('#ContentEditor-SidebarTab-Vocabulary')[0]
		};

		for (let tmpKey in tmpPanes)
		{
			if (tmpPanes[tmpKey]) tmpPanes[tmpKey].style.display = 'none';
			if (tmpTabs[tmpKey])  tmpTabs[tmpKey].classList.remove('active');
		}
		if (tmpPanes[pTab]) tmpPanes[pTab].style.display = '';
		if (tmpTabs[pTab])  tmpTabs[pTab].classList.add('active');

		let tmpAddBtn = this.pict.ContentAssignment.getElement('#ContentEditor-SidebarAddBtn')[0];
		if (tmpAddBtn)
		{
			tmpAddBtn.title = (pTab === 'vocabulary') ? 'New vocabulary term' : 'New file';
		}

		// Lazy-render the Reference / Topics views on first switch.
		if (pTab === 'reference')
		{
			let tmpRefView = this.pict.views['ContentEditor-MarkdownReference'];
			if (tmpRefView && !tmpRefView._hasRendered) { tmpRefView.render(); }
		}
		if (pTab === 'topics')
		{
			let tmpTopicsView = this.pict.views['ContentEditor-Topics'];
			if (tmpTopicsView && !tmpTopicsView._hasRendered) { tmpTopicsView.render(); }
		}
		if (pTab === 'vocabulary')
		{
			let tmpVocabView = this.pict.views['ContentEditor-Vocabulary'];
			if (tmpVocabView && typeof tmpVocabView.refreshTermList === 'function')
			{
				tmpVocabView.refreshTermList();
			}
		}
	}

	getActiveSidebarTab()
	{
		let tmpRef    = this.pict.ContentAssignment.getElement('#ContentEditor-SidebarTab-Reference')[0];
		let tmpTopics = this.pict.ContentAssignment.getElement('#ContentEditor-SidebarTab-Topics')[0];
		let tmpVocab  = this.pict.ContentAssignment.getElement('#ContentEditor-SidebarTab-Vocabulary')[0];
		if (tmpRef    && tmpRef.classList.contains('active'))    return 'reference';
		if (tmpTopics && tmpTopics.classList.contains('active')) return 'topics';
		if (tmpVocab  && tmpVocab.classList.contains('active'))  return 'vocabulary';
		return 'files';
	}

	_handleF1()
	{
		let tmpSidebar = this.getSidebarPanel();
		if (tmpSidebar && tmpSidebar.Collapsed)
		{
			tmpSidebar.expand();
			this.switchSidebarTab('reference');
			return;
		}
		let tmpRef = this.pict.ContentAssignment.getElement('#ContentEditor-SidebarTab-Reference')[0];
		let tmpIsOnRef = tmpRef && tmpRef.classList.contains('active');
		this.switchSidebarTab(tmpIsOnRef ? 'files' : 'reference');
	}

	// ─────────────────────────────────────────────
	//  Upload overlay (F3 / Ctrl-Shift-U)
	// ─────────────────────────────────────────────

	toggleUploadForm()
	{
		let tmpOverlay = this.pict.ContentAssignment.getElement('#ContentEditor-UploadOverlay')[0];
		if (!tmpOverlay) { return; }
		if (tmpOverlay.classList.contains('open')) { this.closeUploadForm(); }
		else                                       { this.openUploadForm();  }
	}

	openUploadForm()
	{
		let tmpOverlay = this.pict.ContentAssignment.getElement('#ContentEditor-UploadOverlay')[0];
		if (tmpOverlay) { tmpOverlay.classList.add('open'); }
		this._wireUploadDropzone();
	}

	closeUploadForm()
	{
		let tmpOverlay = this.pict.ContentAssignment.getElement('#ContentEditor-UploadOverlay')[0];
		if (tmpOverlay) { tmpOverlay.classList.remove('open'); }
		let tmpInput = this.pict.ContentAssignment.getElement('#ContentEditor-UploadFileInput')[0];
		if (tmpInput) { tmpInput.value = ''; }
		this.pict.ContentAssignment.assignContent('#ContentEditor-UploadStatus', '');
		this.pict.ContentAssignment.assignContent('#ContentEditor-UploadResult', '');
	}

	onUploadOverlayClick(pEvent)
	{
		if (pEvent.target.id === 'ContentEditor-UploadOverlay') { this.closeUploadForm(); }
	}

	onUploadFileSelected(pInput)
	{
		if (pInput.files && pInput.files.length > 0) { this._uploadFile(pInput.files[0]); }
	}

	_wireUploadDropzone()
	{
		let tmpDropzone = this.pict.ContentAssignment.getElement('#ContentEditor-UploadDropzone')[0];
		if (!tmpDropzone || tmpDropzone._wired) { return; }
		tmpDropzone._wired = true;

		let tmpSelf = this;
		tmpDropzone.addEventListener('dragover',  (e) => { e.preventDefault(); e.stopPropagation(); tmpDropzone.classList.add('dragover'); });
		tmpDropzone.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); tmpDropzone.classList.remove('dragover'); });
		tmpDropzone.addEventListener('drop',      (e) =>
		{
			e.preventDefault(); e.stopPropagation();
			tmpDropzone.classList.remove('dragover');
			if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0)
			{
				tmpSelf._uploadFile(e.dataTransfer.files[0]);
			}
		});
	}

	_uploadFile(pFile)
	{
		if (!pFile) { return; }
		if (!pFile.type.startsWith('image/'))
		{
			this.pict.ContentAssignment.assignContent('#ContentEditor-UploadStatus',
				'<span class="content-editor-upload-status-error">Only image files are supported.</span>');
			return;
		}
		this.pict.ContentAssignment.assignContent('#ContentEditor-UploadStatus',
			'Uploading <strong>' + pFile.name + '</strong>...');
		this.pict.ContentAssignment.assignContent('#ContentEditor-UploadResult', '');

		let tmpSelf = this;
		let tmpProvider = this.pict.providers['ContentEditor-Provider'];
		if (!tmpProvider)
		{
			this.pict.ContentAssignment.assignContent('#ContentEditor-UploadStatus',
				'<span class="content-editor-upload-status-error">Provider not available.</span>');
			return;
		}

		tmpProvider.uploadImage(pFile, (pError, pURL) =>
		{
			if (pError)
			{
				tmpSelf.pict.ContentAssignment.assignContent('#ContentEditor-UploadStatus',
					'<span class="content-editor-upload-status-error">Upload failed: ' + pError + '</span>');
				return;
			}
			tmpSelf.pict.ContentAssignment.assignContent('#ContentEditor-UploadStatus',
				'<span class="content-editor-upload-status-success">Uploaded successfully!</span>');

			let tmpMarkdown = '![' + pFile.name + '](' + pURL + ')';
			tmpSelf.pict.ContentAssignment.assignContent('#ContentEditor-UploadResult',
				'<div class="content-editor-upload-result">' +
				'<div class="content-editor-upload-result-label">Markdown</div>' +
				'<div class="content-editor-upload-result-url">' +
					'<span class="content-editor-upload-result-text">' + tmpMarkdown + '</span>' +
					'<button class="content-editor-upload-result-copy" onclick="' +
						"navigator.clipboard.writeText('" + tmpMarkdown.replace(/'/g, "\\'") + "').then(function(){this.textContent='Copied!'}.bind(this))" +
					'">Copy</button>' +
				'</div>' +
				'<div class="content-editor-upload-result-label" style="margin-top:8px">URL</div>' +
				'<div class="content-editor-upload-result-url">' +
					'<span class="content-editor-upload-result-text">' + pURL + '</span>' +
					'<button class="content-editor-upload-result-copy" onclick="' +
						"navigator.clipboard.writeText('" + pURL.replace(/'/g, "\\'") + "').then(function(){this.textContent='Copied!'}.bind(this))" +
					'">Copy</button>' +
				'</div>' +
				'</div>');
			tmpSelf.pict.PictApplication.loadFileList();
		});
	}

	// ─────────────────────────────────────────────
	//  Keyboard + hash wiring (one-time)
	// ─────────────────────────────────────────────

	_wireHashChangeListener()
	{
		if (this._hashListenerWired) { return; }
		this._hashListenerWired = true;
		let tmpSelf = this;
		window.addEventListener('hashchange', () =>
		{
			if (tmpSelf.pict.PictApplication && typeof tmpSelf.pict.PictApplication.resolveHash === 'function')
			{
				tmpSelf.pict.PictApplication.resolveHash();
			}
		});
	}

	_wireGlobalKeyboardShortcuts()
	{
		if (this._keysWired) { return; }
		this._keysWired = true;
		let tmpSelf = this;
		window.addEventListener('keydown', (pEvent) =>
		{
			// Cmd/Ctrl-S — save
			if ((pEvent.metaKey || pEvent.ctrlKey) && pEvent.key === 's')
			{
				pEvent.preventDefault();
				tmpSelf.pict.PictApplication.saveCurrentFile();
				return;
			}
			// F1 — Reference / Files toggle
			if (pEvent.key === 'F1')
			{
				pEvent.preventDefault();
				tmpSelf._handleF1();
				return;
			}
			// F2 — sidebar collapse toggle
			if (pEvent.key === 'F2')
			{
				pEvent.preventDefault();
				tmpSelf.toggleSidebar();
				return;
			}
			// F3 / Cmd+Shift+U — upload form toggle
			if (pEvent.key === 'F3' ||
				((pEvent.metaKey || pEvent.ctrlKey) && pEvent.shiftKey && (pEvent.key === 'u' || pEvent.key === 'U')))
			{
				pEvent.preventDefault();
				tmpSelf.toggleUploadForm();
				return;
			}
			// F4 / Cmd+Shift+T — topic action
			if (pEvent.key === 'F4' ||
				((pEvent.metaKey || pEvent.ctrlKey) && pEvent.shiftKey && (pEvent.key === 't' || pEvent.key === 'T')))
			{
				pEvent.preventDefault();
				tmpSelf.pict.PictApplication.handleF4TopicAction();
				return;
			}
			// Escape — close upload overlay → confirm dialog → current file
			if (pEvent.key === 'Escape')
			{
				let tmpUpload = tmpSelf.pict.ContentAssignment.getElement('#ContentEditor-UploadOverlay')[0];
				if (tmpUpload && tmpUpload.classList.contains('open'))
				{
					tmpSelf.closeUploadForm();
					return;
				}
				let tmpConfirm = tmpSelf.pict.ContentAssignment.getElement('#ContentEditor-ConfirmOverlay')[0];
				if (tmpConfirm && tmpConfirm.classList.contains('open')) { return; }
				if (tmpSelf.pict.AppData.ContentEditor && tmpSelf.pict.AppData.ContentEditor.CurrentFile)
				{
					pEvent.preventDefault();
					tmpSelf.pict.PictApplication.closeCurrentFile();
				}
			}
		});
	}
}

module.exports = ContentEditorLayoutView;
module.exports.default_configuration = _ViewConfiguration;
