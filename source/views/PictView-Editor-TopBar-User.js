const libPictView = require('pict-view');

/**
 * PictView-Editor-TopBar-User — slot view rendered into Theme-TopBar's
 * UserView slot. Hosts save status, word-count stats, action buttons
 * (Save / Close / Docs) and the gear button that toggles the hidden
 * settings panel.
 *
 * The close-confirmation overlay (used when closing a dirty file)
 * lives inside this view's template — it's `position: fixed` so it
 * works regardless of where it sits in the DOM.
 *
 * Re-render whenever save state, dirty state, or current file
 * changes.
 */

const _ViewConfiguration =
{
	ViewIdentifier: "ContentEditor-TopBar-User",

	DefaultRenderable: "ContentEditor-TopBar-User-Display",
	DefaultDestinationAddress: "#Theme-TopBar-User",

	AutoRender: false,

	CSS: /*css*/`
		.content-editor-user
		{
			display: flex;
			align-items: center;
			height: 100%;
			gap: 8px;
			padding: 0 12px;
			color: var(--theme-color-text-on-brand, var(--theme-color-text-primary, #E8E0D4));
			font-size: 0.78rem;
		}
		.content-editor-user-status
		{
			padding: 0 6px;
			white-space: nowrap;
		}
		.content-editor-user-status.saving { color: var(--theme-color-status-warning, #E8A94D); }
		.content-editor-user-status.saved  { color: var(--theme-color-status-success, #7BC47F); }
		.content-editor-user-status.error  { color: var(--theme-color-status-error,   #D9534F); }
		.content-editor-user-stats
		{
			font-size: 0.72rem;
			color: var(--theme-color-text-muted, #8A7F72);
			white-space: nowrap;
			letter-spacing: 0.2px;
		}
		.content-editor-user-btn
		{
			/* Explicit height + flex centering so every button (real
			   <button> AND the <a> Preview link with an SVG inside) ends
			   up the same physical height, with even padding above and
			   below regardless of content. Without this, the SVG-bearing
			   button computes a taller line-box than the text-only ones
			   and the row becomes ragged. */
			height: 32px;
			padding: 0 14px;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 6px;
			line-height: 1;
			border: none;
			border-radius: 4px;
			cursor: pointer;
			font-size: 0.8rem;
			font-weight: 600;
			box-sizing: border-box;
			text-decoration: none;
		}
		.content-editor-user-btn-save
		{
			background: var(--theme-color-brand-primary, #2E7D74);
			color: var(--theme-color-text-on-brand, var(--theme-color-background-panel, #FFF));
		}
		.content-editor-user-btn-save:hover
		{
			background: var(--theme-color-brand-primary-hover, #3A9E92);
		}
		.content-editor-user-btn-save:disabled
		{
			background: var(--theme-color-text-secondary, #5E5549);
			color: var(--theme-color-text-muted, #8A7F72);
			cursor: not-allowed;
		}
		.content-editor-user-btn-close,
		.content-editor-user-btn-docs,
		.content-editor-user-btn-gear,
		.content-editor-user-btn-preview
		{
			background: transparent;
			color: var(--theme-color-text-on-brand, var(--theme-color-text-secondary, #B8AFA4));
			border: 1px solid var(--theme-color-border-default, #5E5549);
		}
		.content-editor-user-btn-close:hover,
		.content-editor-user-btn-docs:hover,
		.content-editor-user-btn-gear:hover,
		.content-editor-user-btn-preview:hover
		{
			color: var(--theme-color-text-on-brand, var(--theme-color-text-primary, #E8E0D4));
			border-color: var(--theme-color-brand-primary, #8A7F72);
			background: var(--theme-color-background-hover, rgba(255, 255, 255, 0.05));
		}
		/* Sizing for pict-icon glyphs inside topbar buttons.  Icons are
		   rendered via the {~I:Name~} template tag which wraps the svg
		   in a span whose inner svg is 1em by 1em — so font-size on the
		   wrapper drives icon size.  Slightly larger than the button
		   text for visual weight parity. */
		.content-editor-user-btn .pict-icon { font-size: 1.1em; }
		.content-editor-user-btn-gear
		{
			/* Icon-only button — square-ish padding so the glyph sits centered. */
			padding: 0 8px;
		}
		.content-editor-user-btn-gear .pict-icon { font-size: 1.25em; }

		/* Close-confirmation overlay (dirty-close prompt). Kept in-tree so
		   the user view owns its own dialog state for the close button. */
		.content-editor-confirm-overlay
		{
			display: none;
			position: fixed;
			top: 0; left: 0; right: 0; bottom: 0;
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
			color: var(--theme-color-text-primary, #3D3229);
			border: 1px solid var(--theme-color-border-default, #DDD6CA);
			border-radius: 10px;
			box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
			width: 360px;
			max-width: 90vw;
			overflow: hidden;
		}
		.content-editor-confirm-body  { padding: 24px 22px 16px; text-align: center; }
		.content-editor-confirm-icon  { font-size: 2rem; margin-bottom: 8px; color: var(--theme-color-status-warning, #E8A94D); }
		.content-editor-confirm-title { font-size: 0.95rem; font-weight: 600; margin-bottom: 6px; }
		.content-editor-confirm-message { font-size: 0.82rem; color: var(--theme-color-text-secondary, #5E5549); margin-bottom: 16px; line-height: 1.5; }
		.content-editor-confirm-actions { display: flex; gap: 10px; justify-content: center; }
		.content-editor-confirm-btn
		{
			padding: 8px 20px; border: none; border-radius: 5px;
			font-size: 0.82rem; font-weight: 600; cursor: pointer;
		}
		.content-editor-confirm-btn-discard { background: var(--theme-color-status-error, #D9534F); color: var(--theme-color-background-panel, #FFF); }
		.content-editor-confirm-btn-discard:hover { filter: brightness(0.92); }
		.content-editor-confirm-btn-cancel  { background: transparent; color: var(--theme-color-text-secondary, #5E5549); border: 1px solid var(--theme-color-border-default, #DDD6CA); }
		.content-editor-confirm-btn-cancel:hover { background: var(--theme-color-background-hover, #F0EDE8); }
		.content-editor-confirm-footer { padding: 10px 22px; border-top: 1px solid var(--theme-color-border-light, #EDE9E3); font-size: 0.72rem; color: var(--theme-color-text-muted, #8A7F72); text-align: center; }
		.content-editor-confirm-kbd
		{
			display: inline-block; padding: 1px 5px;
			font-size: 0.68rem; font-family: var(--theme-typography-family-mono, monospace);
			background: var(--theme-color-background-tertiary, #F0EDE8);
			border: 1px solid var(--theme-color-border-default, #DDD6CA);
			border-radius: 3px;
			color: var(--theme-color-text-secondary, #5E5549);
		}

		@media (max-width: 768px)
		{
			.content-editor-user-stats { display: none; }
			.content-editor-user-btn { height: 28px; padding: 0 10px; font-size: 0.75rem; }
		}
	`,

	Templates:
	[
		{
			Hash: "ContentEditor-TopBar-User-Template",
			Template: /*html*/`
<div class="content-editor-user">
	<div class="content-editor-user-status {~D:AppData.ContentEditor.SaveStatusClass~}">
		{~D:AppData.ContentEditor.SaveStatus~}
	</div>
	<span class="content-editor-user-stats" id="ContentEditor-Stats"></span>
	<button class="content-editor-user-btn content-editor-user-btn-save"
		onclick="{~P~}.PictApplication.saveCurrentFile()"
		{~D:AppData.ContentEditor.SaveDisabledAttr~} {~D:AppData.ContentEditor.SaveVisibilityAttr~}>Save</button>
	<button class="content-editor-user-btn content-editor-user-btn-close"
		onclick="{~P~}.PictApplication.closeCurrentFile()"
		{~D:AppData.ContentEditor.CloseVisibilityAttr~}>Close</button>
	<a class="content-editor-user-btn content-editor-user-btn-preview"
		href="/preview.html{~D:AppData.ContentEditor.ViewerHash~}" target="_blank" rel="noopener"
		title="Open this document in the Docuserve preview (new tab)" aria-label="Open in Preview">
		{~I:ExternalLink~}
		<span>Preview</span>
	</a>
	<button class="content-editor-user-btn content-editor-user-btn-docs" id="ContentEditor-DocsToggle"
		onclick="{~P~}.views['ContentEditor-Layout'].toggleDocPanel()"
		title="Toggle documentation panel">Docs</button>
	<button class="content-editor-user-btn content-editor-user-btn-gear"
		onclick="{~P~}.views['ContentEditor-Layout'].toggleSettingsPanel()"
		title="Settings" aria-label="Settings">{~I:Settings~}</button>
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
			RenderableHash: "ContentEditor-TopBar-User-Display",
			TemplateHash: "ContentEditor-TopBar-User-Template",
			DestinationAddress: "#Theme-TopBar-User",
			RenderMethod: "replace"
		}
	]
};

class ContentEditorTopBarUserView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onBeforeRender(pRenderable, pRenderDestinationAddress, pRecord)
	{
		let tmpEditor = this.pict.AppData.ContentEditor || (this.pict.AppData.ContentEditor = {});

		tmpEditor.SaveDisabledAttr = (!tmpEditor.CurrentFile || tmpEditor.IsSaving) ? 'disabled' : '';
		tmpEditor.SaveVisibilityAttr = (tmpEditor.IsDirty || tmpEditor.IsSaving || tmpEditor.SaveStatus)
			? '' : 'style="display:none"';
		tmpEditor.CloseVisibilityAttr = tmpEditor.CurrentFile ? '' : 'style="display:none"';

		// Build the Docuserve preview hash so the Preview link in the
		// template resolves to /preview.html#/page/<doc-path>. Empty
		// when no file is open (the template still renders the link,
		// just with an empty fragment). Must NEVER be undefined —
		// Pict's template parser strips elements whose {~D:~}
		// interpolation resolves to undefined.
		if (tmpEditor.CurrentFile)
		{
			tmpEditor.ViewerHash = '#/page/' + tmpEditor.CurrentFile.replace(/\.md$/, '');
		}
		else
		{
			tmpEditor.ViewerHash = '';
		}

		return super.onBeforeRender(pRenderable, pRenderDestinationAddress, pRecord);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.CSSMap.injectCSS();
		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = ContentEditorTopBarUserView;
module.exports.default_configuration = _ViewConfiguration;
