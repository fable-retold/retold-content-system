const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "ContentEditor-Layout",

	DefaultRenderable: "ContentEditor-Layout-Shell",
	DefaultDestinationAddress: "#ContentEditor-Application-Container",

	AutoRender: false,

	CSS: /*css*/`
		#ContentEditor-Application-Container
		{
			display: flex;
			flex-direction: column;
			height: 100vh;
			background: #F5F3EE;
		}
		#ContentEditor-TopBar-Container
		{
			flex-shrink: 0;
		}
		.content-editor-body
		{
			display: flex;
			flex: 1;
			min-height: 0;
			overflow: hidden;
		}
		/* Sidebar wrapper holds the sidebar content + collapse toggle */
		.content-editor-sidebar-wrap
		{
			display: flex;
			flex-shrink: 0;
			position: relative;
			transition: width 0.2s ease;
		}
		/* Inner wrapper: vertical flex for tab bar + panes */
		.content-editor-sidebar-inner
		{
			display: flex;
			flex-direction: column;
			flex: 1;
			min-width: 0;
			min-height: 0;
			overflow: hidden;
		}
		/* Sidebar tab bar */
		.content-editor-sidebar-tabs
		{
			display: flex;
			flex-shrink: 0;
			border-bottom: 1px solid #DDD6CA;
			background: #F5F0EA;
		}
		.content-editor-sidebar-tab
		{
			flex: 1;
			padding: 7px 0;
			border: none;
			background: transparent;
			font-size: 0.78rem;
			font-weight: 600;
			color: #8A7F72;
			cursor: pointer;
			border-bottom: 2px solid transparent;
			transition: color 0.15s, border-color 0.15s;
		}
		.content-editor-sidebar-tab:hover
		{
			color: #3D3229;
		}
		.content-editor-sidebar-tab.active
		{
			color: #2E7D74;
			border-bottom-color: #2E7D74;
		}
		.content-editor-sidebar-addfile
		{
			flex-shrink: 0;
			width: 30px;
			border: none;
			background: transparent;
			font-size: 1.1rem;
			font-weight: 400;
			color: #8A7F72;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			border-bottom: 2px solid transparent;
			transition: color 0.15s, background 0.15s;
		}
		.content-editor-sidebar-addfile:hover
		{
			color: #2E7D74;
			background: #EDE9E3;
		}
		/* Sidebar panes */
		.content-editor-sidebar-pane
		{
			flex: 1;
			overflow-y: auto;
			overflow-x: hidden;
			min-width: 0;
			min-height: 0;
		}
		#ContentEditor-Sidebar-Container
		{
			background: #FAF8F4;
		}
		/* Vocabulary panel: map the provider's CSS custom
		   properties to the CMS light-theme palette so the
		   shared vocabulary module renders consistently. */
		#ContentEditor-Vocabulary-Container
		{
			--bg-primary: #FAF8F4;
			--bg-secondary: #F5F0EA;
			--bg-hover: #EDE9E3;
			--border-color: #DDD6CA;
			--accent: #2E7D74;
			--text-primary: #3D3229;
			--text-secondary: #5E5549;
			--text-muted: #8A7F72;
		}
		/* File browser layout overrides for sidebar use */
		#ContentEditor-Sidebar-Container .pict-filebrowser
		{
			border: none;
			border-radius: 0;
			background: transparent;
		}
		#ContentEditor-Sidebar-Container .pict-filebrowser-browse-pane
		{
			display: none;
		}
		#ContentEditor-Sidebar-Container .pict-filebrowser-view-pane
		{
			display: none;
		}
		/* Hide size/date columns — the sidebar is too narrow for them */
		#ContentEditor-Sidebar-Container .pict-fb-detail-col-size,
		#ContentEditor-Sidebar-Container .pict-fb-detail-col-modified,
		#ContentEditor-Sidebar-Container .pict-fb-detail-size,
		#ContentEditor-Sidebar-Container .pict-fb-detail-modified
		{
			display: none;
		}
		/* Hide the column header bar in sidebar mode */
		#ContentEditor-Sidebar-Container .pict-fb-detail-header
		{
			display: none;
		}
		/* Breadcrumb bar: flex wrapper with create-folder button */
		.pict-fb-breadcrumb-bar
		{
			display: flex;
			align-items: center;
			background: #F5F0E8;
			border-bottom: 1px solid #DDD6CA;
		}
		.pict-fb-breadcrumb-bar .pict-fb-breadcrumb
		{
			flex: 1;
			border-bottom: none;
		}
		.pict-fb-breadcrumb-addfolder
		{
			flex-shrink: 0;
			background: transparent;
			border: none;
			font-size: 1.1rem;
			font-weight: 600;
			color: #8A7F72;
			cursor: pointer;
			padding: 4px 10px;
			line-height: 1;
			border-radius: 4px;
			margin-right: 4px;
		}
		.pict-fb-breadcrumb-addfolder:hover
		{
			color: #2E7D74;
			background: #EAE3D8;
		}
		#ContentEditor-Editor-Container
		{
			flex: 1;
			overflow-y: auto;
			padding: 44px 16px 16px 16px;
		}
		/* Right-side inline documentation panel */
		.content-editor-doc-panel
		{
			width: 340px;
			min-width: 260px;
			max-width: 500px;
			border-left: 1px solid #DDD6CA;
			overflow-y: auto;
			background: #FAF8F4;
			flex-shrink: 0;
		}
		.content-editor-doc-toggle
		{
			position: absolute;
			top: 6px;
			right: 8px;
			background: #F0EDE8;
			border: 1px solid #DDD6CA;
			border-radius: 4px;
			padding: 3px 8px;
			font-size: 0.72rem;
			font-weight: 600;
			color: #5E5549;
			cursor: pointer;
			z-index: 5;
		}
		.content-editor-doc-toggle:hover
		{
			background: #EAE3D8;
			color: #2E7D74;
		}
		/* Code editor: fill the container and remove outer border */
		#ContentEditor-Editor-Container .pict-code-editor-wrap
		{
			height: calc(100% - 4px);
			border: none;
			border-radius: 0;
		}
		#ContentEditor-Editor-Container .pict-code-editor
		{
			min-height: unset;
			height: 100%;
			background: #FAFAFA;
		}
		/* Binary file preview */
		.binary-preview-image-wrap
		{
			margin-bottom: 20px;
		}
		.binary-preview-image
		{
			display: inline-block;
			background: #FFF;
			border: 1px solid #DDD6CA;
			border-radius: 6px;
			padding: 24px;
		}
		.binary-preview-image img
		{
			display: block;
			max-width: 100%;
			max-height: 400px;
			object-fit: contain;
			border-radius: 4px;
		}
		.binary-preview-card
		{
			display: flex;
			align-items: center;
			gap: 20px;
			background: #FFF;
			border: 1px solid #DDD6CA;
			border-radius: 6px;
			padding: 24px;
			max-width: 600px;
		}
		.binary-preview-icon
		{
			flex-shrink: 0;
			width: 64px;
			height: 64px;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #F0EDE8;
			border-radius: 8px;
			font-size: 0.75rem;
			font-weight: 700;
			color: #5E5549;
			letter-spacing: 0.5px;
		}
		.binary-preview-info
		{
			flex: 1;
			min-width: 0;
		}
		.binary-preview-name
		{
			font-size: 1rem;
			font-weight: 600;
			color: #3D3229;
			margin-bottom: 6px;
			word-break: break-all;
		}
		.binary-preview-meta
		{
			font-size: 0.8rem;
			color: #8A7F72;
			line-height: 1.6;
		}
		.binary-preview-actions
		{
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			gap: 8px;
		}
		.binary-preview-btn
		{
			display: inline-block;
			padding: 8px 16px;
			border-radius: 4px;
			font-size: 0.8rem;
			font-weight: 600;
			text-decoration: none;
			text-align: center;
			cursor: pointer;
			background: #2E7D74;
			color: #FFF;
		}
		.binary-preview-btn:hover
		{
			background: #3A9E92;
		}
		.binary-preview-btn-secondary
		{
			background: transparent;
			color: #5E5549;
			border: 1px solid #DDD6CA;
		}
		.binary-preview-btn-secondary:hover
		{
			border-color: #8A7F72;
			color: #3D3229;
		}
		.binary-preview-btn-preview
		{
			padding: 10px 20px;
			font-size: 0.85rem;
			border: 1px solid #DDD6CA;
			background: #FAF8F4;
			color: #3D3229;
			cursor: pointer;
			border-radius: 6px;
			transition: background 0.15s, border-color 0.15s;
		}
		.binary-preview-btn-preview:hover
		{
			background: #F0EDE8;
			border-color: #8A7F72;
		}
		#ContentEditor-MediaPreviewPlaceholder
		{
			margin-bottom: 20px;
		}
		.binary-preview-media-wrap
		{
			margin-bottom: 20px;
		}
		.binary-preview-video
		{
			display: block;
			max-width: 100%;
			max-height: 500px;
			border-radius: 6px;
			border: 1px solid #DDD6CA;
			background: #000;
		}
		.binary-preview-audio
		{
			display: block;
			width: 100%;
			max-width: 500px;
		}
		/* Image upload overlay */
		.content-editor-upload-overlay
		{
			display: none;
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 1099;
			background: rgba(0, 0, 0, 0.35);
		}
		.content-editor-upload-overlay.open
		{
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.content-editor-upload-panel
		{
			background: #FFF;
			border: 1px solid #DDD6CA;
			border-radius: 10px;
			box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
			width: 420px;
			max-width: 90vw;
			overflow: hidden;
		}
		.content-editor-upload-header
		{
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 14px 18px;
			border-bottom: 1px solid #EDE9E3;
		}
		.content-editor-upload-title
		{
			font-size: 0.95rem;
			font-weight: 600;
			color: #3D3229;
		}
		.content-editor-upload-close
		{
			background: transparent;
			border: none;
			font-size: 1.2rem;
			color: #8A7F72;
			cursor: pointer;
			padding: 2px 6px;
			line-height: 1;
			border-radius: 4px;
		}
		.content-editor-upload-close:hover
		{
			color: #3D3229;
			background: #F0EDE8;
		}
		.content-editor-upload-body
		{
			padding: 18px;
		}
		.content-editor-upload-dropzone
		{
			border: 2px dashed #DDD6CA;
			border-radius: 8px;
			padding: 28px 16px;
			text-align: center;
			cursor: pointer;
			transition: border-color 0.15s, background 0.15s;
			background: #FAF8F4;
		}
		.content-editor-upload-dropzone:hover,
		.content-editor-upload-dropzone.dragover
		{
			border-color: #2E7D74;
			background: #F0FAF8;
		}
		.content-editor-upload-dropzone-icon
		{
			font-size: 2rem;
			color: #8A7F72;
			margin-bottom: 6px;
		}
		.content-editor-upload-dropzone-text
		{
			font-size: 0.82rem;
			color: #5E5549;
		}
		.content-editor-upload-dropzone-hint
		{
			font-size: 0.72rem;
			color: #8A7F72;
			margin-top: 4px;
		}
		.content-editor-upload-file-input
		{
			display: none;
		}
		.content-editor-upload-status
		{
			margin-top: 12px;
			font-size: 0.82rem;
			color: #5E5549;
			min-height: 20px;
		}
		.content-editor-upload-status-error
		{
			color: #D9534F;
		}
		.content-editor-upload-status-success
		{
			color: #2E7D74;
		}
		.content-editor-upload-result
		{
			margin-top: 12px;
			padding: 10px 12px;
			background: #F0EDE8;
			border: 1px solid #DDD6CA;
			border-radius: 6px;
		}
		.content-editor-upload-result-label
		{
			font-size: 0.72rem;
			color: #8A7F72;
			margin-bottom: 4px;
		}
		.content-editor-upload-result-url
		{
			display: flex;
			align-items: center;
			gap: 6px;
		}
		.content-editor-upload-result-text
		{
			flex: 1;
			font-family: monospace;
			font-size: 0.78rem;
			color: #3D3229;
			word-break: break-all;
		}
		.content-editor-upload-result-copy
		{
			flex-shrink: 0;
			background: #2E7D74;
			color: #FFF;
			border: none;
			border-radius: 4px;
			padding: 4px 10px;
			font-size: 0.72rem;
			font-weight: 600;
			cursor: pointer;
		}
		.content-editor-upload-result-copy:hover
		{
			background: #3A9E92;
		}
		.content-editor-upload-kbd
		{
			display: inline-block;
			padding: 1px 5px;
			font-size: 0.68rem;
			font-family: monospace;
			background: #F0EDE8;
			border: 1px solid #DDD6CA;
			border-radius: 3px;
			color: #5E5549;
		}
		.content-editor-upload-footer
		{
			padding: 10px 18px;
			border-top: 1px solid #EDE9E3;
			font-size: 0.72rem;
			color: #8A7F72;
			text-align: center;
		}

		/* File browser row insert button — hidden by default, shown on
		   hover for image file rows via CSS attribute selectors. */
		.pict-fb-insert-btn
		{
			display: none;
			position: absolute;
			right: 6px;
			top: 50%;
			transform: translateY(-50%);
			background: #2E7D74;
			color: #FFF;
			border: none;
			border-radius: 4px;
			font-size: 0.78rem;
			font-weight: 700;
			line-height: 1;
			padding: 2px 7px;
			cursor: pointer;
		}
		.pict-fb-insert-btn:hover
		{
			background: #3A9E92;
		}
		/* Make the row position:relative so the button can be absolutely placed */
		#ContentEditor-Sidebar-Container .pict-fb-detail-row
		{
			position: relative;
		}
		/* Show the insert button on hover for image file extensions.
		   CSS attribute selector [data-name$=".ext" i] matches
		   the end of the data-name attribute, case-insensitive. */
		#ContentEditor-Sidebar-Container .pict-fb-detail-row[data-name$=".png" i]:hover .pict-fb-insert-btn,
		#ContentEditor-Sidebar-Container .pict-fb-detail-row[data-name$=".jpg" i]:hover .pict-fb-insert-btn,
		#ContentEditor-Sidebar-Container .pict-fb-detail-row[data-name$=".jpeg" i]:hover .pict-fb-insert-btn,
		#ContentEditor-Sidebar-Container .pict-fb-detail-row[data-name$=".gif" i]:hover .pict-fb-insert-btn,
		#ContentEditor-Sidebar-Container .pict-fb-detail-row[data-name$=".webp" i]:hover .pict-fb-insert-btn,
		#ContentEditor-Sidebar-Container .pict-fb-detail-row[data-name$=".svg" i]:hover .pict-fb-insert-btn,
		#ContentEditor-Sidebar-Container .pict-fb-detail-row[data-name$=".bmp" i]:hover .pict-fb-insert-btn,
		#ContentEditor-Sidebar-Container .pict-fb-detail-row[data-name$=".avif" i]:hover .pict-fb-insert-btn,
		#ContentEditor-Sidebar-Container .pict-fb-detail-row[data-name$=".apng" i]:hover .pict-fb-insert-btn,
		#ContentEditor-Sidebar-Container .pict-fb-detail-row[data-name$=".ico" i]:hover .pict-fb-insert-btn,
		#ContentEditor-Sidebar-Container .pict-fb-detail-row[data-name$=".tiff" i]:hover .pict-fb-insert-btn,
		#ContentEditor-Sidebar-Container .pict-fb-detail-row[data-name$=".tif" i]:hover .pict-fb-insert-btn,
		#ContentEditor-Sidebar-Container .pict-fb-detail-row[data-name$=".jfif" i]:hover .pict-fb-insert-btn
		{
			display: inline-block;
		}

		/* ============================================
		   RESPONSIVE: Tablet / Phone (max-width: 768px)
		   ============================================ */
		@media (max-width: 768px)
		{
			/* Prevent horizontal scroll on the whole app */
			#ContentEditor-Application-Container
			{
				overflow-x: hidden;
				width: 100%;
				max-width: 100vw;
			}

			/* Stack sidebar ABOVE editor instead of side-by-side */
			.content-editor-body
			{
				flex-direction: column;
			}

			/* Both panels become full-width horizontal strips */
			.content-editor-sidebar-wrap,
			.content-editor-doc-panel
			{
				width: 100% !important;
				max-height: 40vh;
				flex-shrink: 0;
				border-right: none;
			}
			.content-editor-sidebar-wrap
			{
				border-bottom: 1px solid #DDD6CA;
			}
			.content-editor-doc-panel
			{
				border-left: none;
				border-top: 1px solid #DDD6CA;
			}

			/* Give the Reference and Topics tabs much more room on mobile
			   since they contain long scrollable content */
			.content-editor-sidebar-wrap.sidebar-expanded-pane
			{
				max-height: 70vh;
			}

			/* When panels are collapsed on mobile, zero height instead of
			   zero width since the layout is stacked vertically */
			.content-editor-sidebar-wrap.pict-panel-collapsed,
			.content-editor-doc-panel.pict-panel-collapsed
			{
				width: 100% !important;
				max-height: 0;
			}
			.content-editor-sidebar-wrap.pict-panel-collapsed .content-editor-sidebar-inner
			{
				display: none;
			}

			/* Reduce editor container padding (less gutters) */
			#ContentEditor-Editor-Container
			{
				padding: 24px 8px 8px 8px;
			}

			/* Reduce binary preview padding */
			.binary-preview-image
			{
				padding: 12px;
			}
			.binary-preview-card
			{
				padding: 12px;
				gap: 12px;
			}

			/* Upload panel: fill more of the screen */
			.content-editor-upload-panel
			{
				width: 95vw;
				max-width: 95vw;
			}

		}

		/* ============================================
		   RESPONSIVE: Small phone (max-width: 480px)
		   ============================================ */
		@media (max-width: 480px)
		{
			/* Even tighter editor padding */
			#ContentEditor-Editor-Container
			{
				padding: 20px 4px 4px 4px;
			}

			/* Sidebar gets a smaller max height */
			.content-editor-sidebar-wrap
			{
				max-height: 35vh;
			}
			.content-editor-sidebar-wrap.sidebar-expanded-pane
			{
				max-height: 65vh;
			}
		}
	`,

	Templates:
	[
		{
			Hash: "ContentEditor-Layout-Shell-Template",
			Template: /*html*/`
<div id="ContentEditor-TopBar-Container"></div>
<div class="content-editor-body">
	<div class="content-editor-sidebar-wrap" id="ContentEditor-SidebarWrap">
		<div class="content-editor-sidebar-inner">
			<div class="content-editor-sidebar-tabs">
				<button class="content-editor-sidebar-tab active" id="ContentEditor-SidebarTab-Files"
					onclick="{~P~}.views['ContentEditor-Layout'].switchSidebarTab('files')">Files</button>
				<button class="content-editor-sidebar-tab" id="ContentEditor-SidebarTab-Reference"
					onclick="{~P~}.views['ContentEditor-Layout'].switchSidebarTab('reference')">Reference</button>
				<button class="content-editor-sidebar-tab" id="ContentEditor-SidebarTab-Topics"
					onclick="{~P~}.views['ContentEditor-Layout'].switchSidebarTab('topics')">Topics</button>
				<button class="content-editor-sidebar-tab" id="ContentEditor-SidebarTab-Vocabulary"
					onclick="{~P~}.views['ContentEditor-Layout'].switchSidebarTab('vocabulary')">Vocab</button>
				<button class="content-editor-sidebar-addfile" id="ContentEditor-SidebarAddBtn" title="New file"
					onclick="{~P~}.views['ContentEditor-Layout'].onSidebarAddClick()">+</button>
			</div>
			<div id="ContentEditor-Sidebar-Container" class="content-editor-sidebar-pane"></div>
			<div id="ContentEditor-SidebarReference-Container" class="content-editor-sidebar-pane" style="display:none"></div>
			<div id="ContentEditor-SidebarTopics-Container" class="content-editor-sidebar-pane" style="display:none"></div>
			<div id="ContentEditor-Vocabulary-Container" class="content-editor-sidebar-pane" style="display:none"></div>
		</div>
	</div>
	<div id="ContentEditor-Editor-Container"></div>
	<div id="ContentEditor-Documentation-Panel" class="content-editor-doc-panel"></div>
</div>
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

		this._minSidebarWidth = 140;
		this._maxSidebarWidth = 600;
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		// Render child views
		this.pict.views['ContentEditor-TopBar'].render();

		// Show welcome message in editor area if no file loaded
		let tmpEditorContainer = this.pict.ContentAssignment.getElement('#ContentEditor-Editor-Container');
		if (tmpEditorContainer && tmpEditorContainer[0] && !this.pict.AppData.ContentEditor.CurrentFile)
		{
			this.pict.ContentAssignment.assignContent('#ContentEditor-Editor-Container', '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#8A7F72;font-size:1.1em;">Select a file from the sidebar to begin editing</div>');
		}

		// Inject CSS
		this.pict.CSSMap.injectCSS();

		// Attach resizable/collapsible panel behavior to the
		// left sidebar via pict-section-modal's panel system.
		let tmpSelf = this;
		let tmpSettings = this.pict.AppData.ContentEditor;
		let tmpModal = this.pict.views['Pict-Section-Modal'];
		if (tmpModal && typeof tmpModal.panel === 'function')
		{
			let tmpIsMobile = (window.innerWidth <= 768);
			this._sidebarPanel = tmpModal.panel('#ContentEditor-SidebarWrap',
				{
					position: 'left',
					width: tmpSettings.SidebarWidth || 250,
					minWidth: 140,
					maxWidth: 600,
					collapsible: true,
					collapsed: tmpSettings.SidebarCollapsed || tmpIsMobile,
					persist: true,
					persistKey: 'ContentEditor-Sidebar',
					onResize: (pWidth) =>
					{
						tmpSettings.SidebarWidth = pWidth;
						tmpSelf.pict.PictApplication.saveSettings();
					},
					onToggle: (pCollapsed) =>
					{
						tmpSettings.SidebarCollapsed = pCollapsed;
						tmpSelf.pict.PictApplication.saveSettings();
					}
				});
		}

		// Listen for hash changes
		window.addEventListener('hashchange', () =>
		{
			tmpSelf.pict.PictApplication.resolveHash();
		});

		// Keyboard shortcuts
		window.addEventListener('keydown', (pEvent) =>
		{
			// Cmd+S (Mac) / Ctrl+S (Windows/Linux) to save
			if ((pEvent.metaKey || pEvent.ctrlKey) && pEvent.key === 's')
			{
				pEvent.preventDefault();
				tmpSelf.pict.PictApplication.saveCurrentFile();
				return;
			}

			// F1 — Toggle between Reference and Files; open sidebar if collapsed
			if (pEvent.key === 'F1')
			{
				pEvent.preventDefault();
				tmpSelf._handleF1();
				return;
			}

			// F2 — Toggle sidebar collapsed/expanded
			if (pEvent.key === 'F2')
			{
				pEvent.preventDefault();
				tmpSelf.toggleSidebar();
				return;
			}

			// F3 or Cmd+Shift+U / Ctrl+Shift+U — Toggle image upload form
			if (pEvent.key === 'F3')
			{
				pEvent.preventDefault();
				tmpSelf.toggleUploadForm();
				return;
			}
			if ((pEvent.metaKey || pEvent.ctrlKey) && pEvent.shiftKey && (pEvent.key === 'u' || pEvent.key === 'U'))
			{
				pEvent.preventDefault();
				tmpSelf.toggleUploadForm();
				return;
			}

			// F4 — Add topic from cursor / toggle Topics tab
			if (pEvent.key === 'F4')
			{
				pEvent.preventDefault();
				tmpSelf.pict.PictApplication.handleF4TopicAction();
				return;
			}

			// Cmd+Shift+T / Ctrl+Shift+T — Toggle Topics tab
			if ((pEvent.metaKey || pEvent.ctrlKey) && pEvent.shiftKey && (pEvent.key === 't' || pEvent.key === 'T'))
			{
				pEvent.preventDefault();
				tmpSelf.pict.PictApplication.handleF4TopicAction();
				return;
			}

			// Escape — Close the current file (if no overlay is open)
			if (pEvent.key === 'Escape')
			{
				// Don't close if the upload overlay is open (let it close that first)
				let tmpUploadOverlay = tmpSelf.pict.ContentAssignment.getElement('#ContentEditor-UploadOverlay')[0];
				if (tmpUploadOverlay && tmpUploadOverlay.classList.contains('open'))
				{
					tmpSelf.closeUploadForm();
					return;
				}

				// Don't interfere if the confirmation dialog is open
				// (its own Y/N/Esc handler takes precedence)
				let tmpConfirmOverlay = tmpSelf.pict.ContentAssignment.getElement('#ContentEditor-ConfirmOverlay')[0];
				if (tmpConfirmOverlay && tmpConfirmOverlay.classList.contains('open'))
				{
					return;
				}

				// Close the current file
				if (tmpSelf.pict.AppData.ContentEditor.CurrentFile)
				{
					pEvent.preventDefault();
					tmpSelf.pict.PictApplication.closeCurrentFile();
					return;
				}
			}
		});

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	/**
	 * Handle the sidebar "+" button click. Dispatches based on
	 * which tab is currently active: Files → new file, Vocab → new term.
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
			// Default: create a new file
			this.pict.PictApplication.promptNewFile();
		}
	}

	/**
	 * Toggle the right-side documentation panel.
	 *
	 * If the panel was attached via the pict-section-modal panel
	 * system, delegate to the panel handle.  Otherwise fall back
	 * to the legacy display toggle.
	 */
	toggleDocPanel()
	{
		// Use the panel handle if available (resize + collapse system)
		if (this.pict.PictApplication._docPanel)
		{
			let tmpDocPanel = this.pict.PictApplication._docPanel;
			tmpDocPanel.toggle();

			// On first expand, trigger the inline docs provider to
			// load a default document.
			let tmpPanel = this.pict.ContentAssignment.getElement('#ContentEditor-Documentation-Panel')[0];
			if (tmpPanel && !tmpPanel._initialized)
			{
				tmpPanel._initialized = true;
				let tmpDocProvider = this.pict.providers && this.pict.providers['Pict-InlineDocumentation'];
				if (tmpDocProvider && typeof tmpDocProvider.loadDocument === 'function')
				{
					tmpDocProvider.loadDocument('README.md');
				}
			}
			return;
		}

		// Legacy fallback: simple display toggle
		let tmpPanel = this.pict.ContentAssignment.getElement('#ContentEditor-Documentation-Panel')[0];
		if (!tmpPanel) return;

		let tmpVisible = tmpPanel.style.display !== 'none';
		tmpPanel.style.display = tmpVisible ? 'none' : '';

		if (!tmpVisible)
		{
			let tmpDocProvider = this.pict.providers && this.pict.providers['Pict-InlineDocumentation'];
			if (tmpDocProvider && !tmpPanel._initialized)
			{
				tmpPanel._initialized = true;
				if (typeof tmpDocProvider.loadDocument === 'function')
				{
					tmpDocProvider.loadDocument('README.md');
				}
			}
		}
	}

	/**
	 * Toggle the sidebar collapsed/expanded state.
	 */
	toggleSidebar()
	{
		if (this._sidebarPanel)
		{
			this._sidebarPanel.toggle();
			return;
		}
	}

	/**
	 * Switch the active sidebar tab.
	 *
	 * @param {string} pTab - 'files', 'reference', or 'topics'
	 */
	switchSidebarTab(pTab)
	{
		let tmpPanes =
		{
			files: this.pict.ContentAssignment.getElement('#ContentEditor-Sidebar-Container')[0],
			reference: this.pict.ContentAssignment.getElement('#ContentEditor-SidebarReference-Container')[0],
			topics: this.pict.ContentAssignment.getElement('#ContentEditor-SidebarTopics-Container')[0],
			vocabulary: this.pict.ContentAssignment.getElement('#ContentEditor-Vocabulary-Container')[0]
		};

		let tmpTabs =
		{
			files: this.pict.ContentAssignment.getElement('#ContentEditor-SidebarTab-Files')[0],
			reference: this.pict.ContentAssignment.getElement('#ContentEditor-SidebarTab-Reference')[0],
			topics: this.pict.ContentAssignment.getElement('#ContentEditor-SidebarTab-Topics')[0],
			vocabulary: this.pict.ContentAssignment.getElement('#ContentEditor-SidebarTab-Vocabulary')[0]
		};

		// Hide all panes and deactivate all tabs
		for (let tmpKey in tmpPanes)
		{
			if (tmpPanes[tmpKey]) tmpPanes[tmpKey].style.display = 'none';
			if (tmpTabs[tmpKey]) tmpTabs[tmpKey].classList.remove('active');
		}

		// Show the selected pane and activate the selected tab
		if (tmpPanes[pTab]) tmpPanes[pTab].style.display = '';
		if (tmpTabs[pTab]) tmpTabs[pTab].classList.add('active');

		// On mobile, give the Reference and Topics tabs more vertical space
		let tmpWrap = this.pict.ContentAssignment.getElement('#ContentEditor-SidebarWrap')[0];
		if (tmpWrap)
		{
			if (pTab === 'reference' || pTab === 'topics' || pTab === 'vocabulary')
			{
				tmpWrap.classList.add('sidebar-expanded-pane');
			}
			else
			{
				tmpWrap.classList.remove('sidebar-expanded-pane');
			}
		}

		// Update the "+" button tooltip based on active tab
		let tmpAddBtn = this.pict.ContentAssignment.getElement('#ContentEditor-SidebarAddBtn')[0];
		if (tmpAddBtn)
		{
			tmpAddBtn.title = (pTab === 'vocabulary') ? 'New vocabulary term' : 'New file';
		}

		// Lazy-render the Reference view on first switch
		if (pTab === 'reference')
		{
			let tmpRefView = this.pict.views['ContentEditor-MarkdownReference'];
			if (tmpRefView && !tmpRefView._hasRendered)
			{
				tmpRefView.render();
			}
		}

		// Lazy-render the Topics view on first switch
		if (pTab === 'topics')
		{
			let tmpTopicsView = this.pict.views['ContentEditor-Topics'];
			if (tmpTopicsView && !tmpTopicsView._hasRendered)
			{
				tmpTopicsView.render();
			}
		}

		// Lazy-render the Vocabulary view on first switch
		if (pTab === 'vocabulary')
		{
			let tmpVocabView = this.pict.views['ContentEditor-Vocabulary'];
			if (tmpVocabView)
			{
				tmpVocabView.refreshTermList();
			}
		}
	}

	/**
	 * Handle F1: toggle between Reference and Files sidebar tabs.
	 * If the sidebar is collapsed, open it and switch to Reference.
	 */
	_handleF1()
	{
		let tmpSettings = this.pict.AppData.ContentEditor;

		// If sidebar is collapsed, expand it and go to Reference
		if (tmpSettings.SidebarCollapsed)
		{
			this.toggleSidebar();
			this.switchSidebarTab('reference');
			return;
		}

		// Determine which tab is currently active
		let tmpRefTab = this.pict.ContentAssignment.getElement('#ContentEditor-SidebarTab-Reference')[0];
		let tmpIsOnRef = tmpRefTab && tmpRefTab.classList.contains('active');

		// Toggle: if on Reference, go to Files; otherwise go to Reference
		if (tmpIsOnRef)
		{
			this.switchSidebarTab('files');
		}
		else
		{
			this.switchSidebarTab('reference');
		}
	}

	/**
	 * Return the identifier of the currently active sidebar tab.
	 *
	 * @returns {string} 'files', 'reference', or 'topics'
	 */
	getActiveSidebarTab()
	{
		let tmpRefTab = this.pict.ContentAssignment.getElement('#ContentEditor-SidebarTab-Reference')[0];
		let tmpTopicsTab = this.pict.ContentAssignment.getElement('#ContentEditor-SidebarTab-Topics')[0];
		let tmpVocabTab = this.pict.ContentAssignment.getElement('#ContentEditor-SidebarTab-Vocabulary')[0];

		if (tmpRefTab && tmpRefTab.classList.contains('active')) return 'reference';
		if (tmpTopicsTab && tmpTopicsTab.classList.contains('active')) return 'topics';
		if (tmpVocabTab && tmpVocabTab.classList.contains('active')) return 'vocabulary';
		return 'files';
	}

	/**
	 * Toggle the image upload form open/closed.
	 */
	toggleUploadForm()
	{
		let tmpOverlay = this.pict.ContentAssignment.getElement('#ContentEditor-UploadOverlay')[0];
		if (!tmpOverlay)
		{
			return;
		}

		if (tmpOverlay.classList.contains('open'))
		{
			this.closeUploadForm();
		}
		else
		{
			this.openUploadForm();
		}
	}

	/**
	 * Open the image upload form.
	 */
	openUploadForm()
	{
		let tmpOverlay = this.pict.ContentAssignment.getElement('#ContentEditor-UploadOverlay')[0];
		if (tmpOverlay)
		{
			tmpOverlay.classList.add('open');
		}

		// Wire up drag-drop on the dropzone
		this._wireUploadDropzone();
	}

	/**
	 * Close the image upload form and reset its state.
	 */
	closeUploadForm()
	{
		let tmpOverlay = this.pict.ContentAssignment.getElement('#ContentEditor-UploadOverlay')[0];
		if (tmpOverlay)
		{
			tmpOverlay.classList.remove('open');
		}

		// Reset the file input so the same file can be re-selected
		let tmpInput = this.pict.ContentAssignment.getElement('#ContentEditor-UploadFileInput')[0];
		if (tmpInput)
		{
			tmpInput.value = '';
		}

		// Clear status and result
		this.pict.ContentAssignment.assignContent('#ContentEditor-UploadStatus', '');
		this.pict.ContentAssignment.assignContent('#ContentEditor-UploadResult', '');
	}

	/**
	 * Close overlay if the background (not the panel) is clicked.
	 *
	 * @param {MouseEvent} pEvent
	 */
	onUploadOverlayClick(pEvent)
	{
		if (pEvent.target.id === 'ContentEditor-UploadOverlay')
		{
			this.closeUploadForm();
		}
	}

	/**
	 * Handle file selection from the file input.
	 *
	 * @param {HTMLInputElement} pInput
	 */
	onUploadFileSelected(pInput)
	{
		if (pInput.files && pInput.files.length > 0)
		{
			this._uploadFile(pInput.files[0]);
		}
	}

	/**
	 * Wire drag-and-drop events on the upload dropzone.
	 */
	_wireUploadDropzone()
	{
		let tmpDropzone = this.pict.ContentAssignment.getElement('#ContentEditor-UploadDropzone')[0];
		if (!tmpDropzone || tmpDropzone._wired)
		{
			return;
		}
		tmpDropzone._wired = true;

		let tmpSelf = this;

		tmpDropzone.addEventListener('dragover', (pEvent) =>
		{
			pEvent.preventDefault();
			pEvent.stopPropagation();
			tmpDropzone.classList.add('dragover');
		});

		tmpDropzone.addEventListener('dragleave', (pEvent) =>
		{
			pEvent.preventDefault();
			pEvent.stopPropagation();
			tmpDropzone.classList.remove('dragover');
		});

		tmpDropzone.addEventListener('drop', (pEvent) =>
		{
			pEvent.preventDefault();
			pEvent.stopPropagation();
			tmpDropzone.classList.remove('dragover');

			if (pEvent.dataTransfer && pEvent.dataTransfer.files && pEvent.dataTransfer.files.length > 0)
			{
				tmpSelf._uploadFile(pEvent.dataTransfer.files[0]);
			}
		});
	}

	/**
	 * Upload a file using the ContentEditor provider.
	 *
	 * @param {File} pFile - The image file to upload
	 */
	_uploadFile(pFile)
	{
		if (!pFile)
		{
			return;
		}

		// Validate it's an image
		if (!pFile.type.startsWith('image/'))
		{
			this.pict.ContentAssignment.assignContent('#ContentEditor-UploadStatus', '<span class="content-editor-upload-status-error">Only image files are supported.</span>');
			return;
		}

		this.pict.ContentAssignment.assignContent('#ContentEditor-UploadStatus', 'Uploading <strong>' + pFile.name + '</strong>...');
		this.pict.ContentAssignment.assignContent('#ContentEditor-UploadResult', '');

		let tmpSelf = this;
		let tmpProvider = this.pict.providers['ContentEditor-Provider'];

		if (!tmpProvider)
		{
			this.pict.ContentAssignment.assignContent('#ContentEditor-UploadStatus', '<span class="content-editor-upload-status-error">Provider not available.</span>');
			return;
		}

		tmpProvider.uploadImage(pFile, (pError, pURL) =>
		{
			if (pError)
			{
				tmpSelf.pict.ContentAssignment.assignContent('#ContentEditor-UploadStatus', '<span class="content-editor-upload-status-error">Upload failed: ' + pError + '</span>');
				return;
			}

			tmpSelf.pict.ContentAssignment.assignContent('#ContentEditor-UploadStatus', '<span class="content-editor-upload-status-success">Uploaded successfully!</span>');

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

			// Refresh the file list so the uploaded file shows
			tmpSelf.pict.PictApplication.loadFileList();
		});
	}
}

module.exports = ContentEditorLayoutView;

module.exports.default_configuration = _ViewConfiguration;
