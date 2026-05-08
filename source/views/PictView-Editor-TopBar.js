const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "ContentEditor-TopBar",

	DefaultRenderable: "ContentEditor-TopBar-Display",
	DefaultDestinationAddress: "#ContentEditor-TopBar-Container",

	AutoRender: false,

	CSS: /*css*/`
		.content-editor-topbar
		{
			display: flex;
			align-items: center;
			background: var(--theme-color-text-primary, #3D3229);
			color: #E8E0D4;
			padding: 0;
			height: 48px;
			border-bottom: 3px solid #2E7D74;
			position: relative;
		}
		.content-editor-topbar-brand
		{
			padding: 0 16px;
			font-size: 1rem;
			font-weight: 600;
			color: #E8E0D4;
			white-space: nowrap;
			flex-shrink: 0;
		}
		/* Centered file name — absolutely positioned so it stays
		   centered in the full bar regardless of left/right content */
		.content-editor-topbar-file
		{
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			max-width: 50%;
			text-align: center;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			pointer-events: none;
		}
		.content-editor-topbar-filename
		{
			font-size: 0.9rem;
			font-weight: 500;
			color: #E8E0D4;
			letter-spacing: 0.2px;
		}
		.content-editor-topbar-file .content-editor-dirty-indicator
		{
			color: #E8A94D;
			font-weight: bold;
		}
		/* Left spacer pushes actions to the right */
		.content-editor-topbar-spacer
		{
			flex: 1;
		}
		.content-editor-topbar-status
		{
			padding: 0 12px;
			font-size: 0.78rem;
			flex-shrink: 0;
		}
		.content-editor-status-saving
		{
			color: #E8A94D;
		}
		.content-editor-status-saved
		{
			color: #7BC47F;
		}
		.content-editor-status-error
		{
			color: #D9534F;
		}
		.content-editor-topbar-stats
		{
			font-size: 0.72rem;
			color: #8A7F72;
			white-space: nowrap;
			padding: 0 8px;
			flex-shrink: 0;
			letter-spacing: 0.2px;
		}
		.content-editor-topbar-actions
		{
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 0 12px;
			flex-shrink: 0;
		}
		.content-editor-topbar-btn
		{
			padding: 6px 14px;
			border: none;
			border-radius: 4px;
			cursor: pointer;
			font-size: 0.8rem;
			font-weight: 600;
		}
		.content-editor-topbar-btn-save
		{
			background: #2E7D74;
			color: var(--theme-color-background-panel, #FFF);
		}
		.content-editor-topbar-btn-save:hover
		{
			background: #3A9E92;
		}
		.content-editor-topbar-btn-save:disabled
		{
			background: var(--theme-color-text-secondary, #5E5549);
			color: #8A7F72;
			cursor: not-allowed;
		}
		.content-editor-topbar-btn-close
		{
			background: transparent;
			color: #B8AFA4;
			border: 1px solid var(--theme-color-text-secondary, #5E5549);
		}
		.content-editor-topbar-btn-close:hover
		{
			color: #E8E0D4;
			border-color: #8A7F72;
			background: rgba(255, 255, 255, 0.05);
		}
		/* Close-file confirmation overlay */
		.content-editor-confirm-overlay
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
		.content-editor-confirm-overlay.open
		{
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.content-editor-confirm-panel
		{
			background: var(--theme-color-background-panel, #FFF);
			border: 1px solid #DDD6CA;
			border-radius: 10px;
			box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
			width: 360px;
			max-width: 90vw;
			overflow: hidden;
		}
		.content-editor-confirm-body
		{
			padding: 24px 22px 16px;
			text-align: center;
		}
		.content-editor-confirm-icon
		{
			font-size: 2rem;
			margin-bottom: 8px;
			color: #E8A94D;
		}
		.content-editor-confirm-title
		{
			font-size: 0.95rem;
			font-weight: 600;
			color: var(--theme-color-text-primary, #3D3229);
			margin-bottom: 6px;
		}
		.content-editor-confirm-message
		{
			font-size: 0.82rem;
			color: var(--theme-color-text-secondary, #5E5549);
			margin-bottom: 16px;
			line-height: 1.5;
		}
		.content-editor-confirm-actions
		{
			display: flex;
			gap: 10px;
			justify-content: center;
		}
		.content-editor-confirm-btn
		{
			padding: 8px 20px;
			border: none;
			border-radius: 5px;
			font-size: 0.82rem;
			font-weight: 600;
			cursor: pointer;
		}
		.content-editor-confirm-btn-discard
		{
			background: #D9534F;
			color: var(--theme-color-background-panel, #FFF);
		}
		.content-editor-confirm-btn-discard:hover
		{
			background: #C9302C;
		}
		.content-editor-confirm-btn-cancel
		{
			background: transparent;
			color: var(--theme-color-text-secondary, #5E5549);
			border: 1px solid #DDD6CA;
		}
		.content-editor-confirm-btn-cancel:hover
		{
			background: #F0EDE8;
		}
		.content-editor-confirm-footer
		{
			padding: 10px 22px;
			border-top: 1px solid #EDE9E3;
			font-size: 0.72rem;
			color: #8A7F72;
			text-align: center;
		}
		.content-editor-confirm-kbd
		{
			display: inline-block;
			padding: 1px 5px;
			font-size: 0.68rem;
			font-family: monospace;
			background: #F0EDE8;
			border: 1px solid #DDD6CA;
			border-radius: 3px;
			color: var(--theme-color-text-secondary, #5E5549);
		}

		/* ============================================
		   RESPONSIVE: Tablet / Phone (max-width: 768px)
		   ============================================ */
		@media (max-width: 768px)
		{
			.content-editor-topbar
			{
				height: auto;
				min-height: 44px;
				flex-wrap: wrap;
				padding: 4px 0;
			}

			/* Brand text: shrink */
			.content-editor-topbar-brand
			{
				padding: 0 8px;
				font-size: 0.85rem;
			}

			/* File name: switch from absolute centering to flow layout */
			.content-editor-topbar-file
			{
				position: static;
				transform: none;
				max-width: none;
				flex: 1;
				min-width: 0;
				padding: 0 4px;
			}

			/* Hide the spacer (not needed when file is in-flow) */
			.content-editor-topbar-spacer
			{
				display: none;
			}

			/* Hide word/line count stats on mobile to save space */
			.content-editor-topbar-stats
			{
				display: none;
			}

			/* Compact action buttons */
			.content-editor-topbar-actions
			{
				gap: 4px;
				padding: 0 6px;
			}

			.content-editor-topbar-btn
			{
				padding: 5px 10px;
				font-size: 0.75rem;
			}

			/* Status text */
			.content-editor-topbar-status
			{
				padding: 0 6px;
				font-size: 0.72rem;
			}

			/* Confirm dialog: tighter for mobile */
			.content-editor-confirm-panel
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
			/* Hide brand text entirely on very small screens */
			.content-editor-topbar-brand
			{
				display: none;
			}

			.content-editor-topbar-filename
			{
				font-size: 0.8rem;
			}

			.content-editor-topbar-actions
			{
				padding: 0 4px;
			}
		}
	`,

	Templates:
	[
		{
			Hash: "ContentEditor-TopBar-Template",
			Template: /*html*/`
<div class="content-editor-topbar">
	<div class="content-editor-topbar-brand">Content Editor</div>
	<div class="content-editor-topbar-file">
		<span class="content-editor-topbar-filename">{~D:AppData.ContentEditor.CurrentFile~}</span>{~D:AppData.ContentEditor.DirtyIndicatorHTML~}
	</div>
	<div class="content-editor-topbar-spacer"></div>
	<div class="content-editor-topbar-status {~D:AppData.ContentEditor.SaveStatusClass~}">
		{~D:AppData.ContentEditor.SaveStatus~}
	</div>
	<span class="content-editor-topbar-stats" id="ContentEditor-Stats"></span>
	<div class="content-editor-topbar-actions">
		<button class="content-editor-topbar-btn content-editor-topbar-btn-save"
			onclick="{~P~}.PictApplication.saveCurrentFile()"
			{~D:AppData.ContentEditor.SaveDisabledAttr~} {~D:AppData.ContentEditor.SaveVisibilityAttr~}>Save</button>
		<button class="content-editor-topbar-btn content-editor-topbar-btn-close"
			onclick="{~P~}.PictApplication.closeCurrentFile()"
			{~D:AppData.ContentEditor.CloseVisibilityAttr~}>Close</button>
		<button class="content-editor-topbar-btn" id="ContentEditor-DocsToggle"
			onclick="{~P~}.views['ContentEditor-Layout'].toggleDocPanel()"
			title="Toggle documentation panel (right side)">Docs</button>
		<div id="ContentEditor-SettingsPanel-Container"></div>
	</div>
</div>
<div class="content-editor-confirm-overlay" id="ContentEditor-ConfirmOverlay"
	onclick="{~P~}.PictApplication.cancelCloseFile()">
	<div class="content-editor-confirm-panel" onclick="event.stopPropagation()">
		<div class="content-editor-confirm-body">
			<div class="content-editor-confirm-icon"><svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1L1 14h14z"/><line x1="8" y1="6" x2="8" y2="9"/><circle cx="8" cy="11.5" r="0.5" fill="currentColor" stroke="none"/></svg></div>
			<div class="content-editor-confirm-title">Unsaved Changes</div>
			<div class="content-editor-confirm-message">
				This file has unsaved changes.<br>Close without saving?
			</div>
			<div class="content-editor-confirm-actions">
				<button class="content-editor-confirm-btn content-editor-confirm-btn-discard"
					onclick="{~P~}.PictApplication.confirmCloseFile()">Discard &amp; Close</button>
				<button class="content-editor-confirm-btn content-editor-confirm-btn-cancel"
					onclick="{~P~}.PictApplication.cancelCloseFile()">Cancel</button>
			</div>
		</div>
		<div class="content-editor-confirm-footer">
			<span class="content-editor-confirm-kbd">Y</span> to discard &middot;
			<span class="content-editor-confirm-kbd">N</span> or
			<span class="content-editor-confirm-kbd">Esc</span> to cancel
		</div>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "ContentEditor-TopBar-Display",
			TemplateHash: "ContentEditor-TopBar-Template",
			DestinationAddress: "#ContentEditor-TopBar-Container",
			RenderMethod: "replace"
		}
	]
};

class ContentEditorTopBarView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onBeforeRender(pRenderable, pRenderDestinationAddress, pRecord)
	{
		let tmpEditor = this.pict.AppData.ContentEditor;

		// Dirty indicator
		tmpEditor.DirtyIndicatorHTML = tmpEditor.IsDirty
			? ' <span class="content-editor-dirty-indicator">*</span>'
			: '';

		// Disable save button if no file or currently saving
		tmpEditor.SaveDisabledAttr = (!tmpEditor.CurrentFile || tmpEditor.IsSaving)
			? 'disabled'
			: '';

		// Hide save button entirely until the user makes an edit
		tmpEditor.SaveVisibilityAttr = (tmpEditor.IsDirty || tmpEditor.IsSaving || tmpEditor.SaveStatus)
			? ''
			: 'style="display:none"';

		// Hide close button when no file is open
		tmpEditor.CloseVisibilityAttr = tmpEditor.CurrentFile
			? ''
			: 'style="display:none"';

		// Build viewer hash link
		if (tmpEditor.CurrentFile)
		{
			let tmpViewerPath = tmpEditor.CurrentFile.replace(/\.md$/, '');
			tmpEditor.ViewerHash = '#/page/' + tmpViewerPath;
		}
		else
		{
			tmpEditor.ViewerHash = '';
		}

		return super.onBeforeRender(pRenderable, pRenderDestinationAddress, pRecord);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		// Render the settings panel inside our container
		let tmpSettingsPanel = this.pict.views['ContentEditor-SettingsPanel'];
		if (tmpSettingsPanel)
		{
			tmpSettingsPanel.render();
		}

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = ContentEditorTopBarView;

module.exports.default_configuration = _ViewConfiguration;
