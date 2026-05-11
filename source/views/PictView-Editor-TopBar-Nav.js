const libPictView = require('pict-view');

/**
 * PictView-Editor-TopBar-Nav — slot view rendered into Theme-TopBar's
 * NavView slot. Shows the currently-open file name and a dirty indicator.
 * The brand (Retold Content wordmark) is rendered by Theme-TopBar's
 * BrandMark; action buttons live in the User slot.
 *
 * Re-render this view whenever AppData.ContentEditor.CurrentFile or
 * IsDirty changes — typically right after openFile() / save() / close().
 */

const _ViewConfiguration =
{
	ViewIdentifier: "ContentEditor-TopBar-Nav",

	DefaultRenderable: "ContentEditor-TopBar-Nav-Display",
	DefaultDestinationAddress: "#Theme-TopBar-Nav",

	AutoRender: false,

	CSS: /*css*/`
		.content-editor-nav
		{
			display: flex;
			align-items: center;
			height: 100%;
			min-width: 0;
			padding: 0 12px;
			color: var(--theme-color-text-on-brand, var(--theme-color-text-primary, #E8E0D4));
			font-size: 0.9rem;
		}
		.content-editor-nav-filename
		{
			font-weight: 500;
			letter-spacing: 0.2px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			max-width: 60vw;
		}
		.content-editor-nav-dirty
		{
			color: var(--theme-color-status-warning, #E8A94D);
			font-weight: bold;
			margin-left: 6px;
		}
		.content-editor-nav-empty
		{
			color: var(--theme-color-text-muted, #8A7F72);
			font-style: italic;
		}
	`,

	Templates:
	[
		{
			Hash: "ContentEditor-TopBar-Nav-Template",
			Template: /*html*/`
<div class="content-editor-nav">
	{~TS:ContentEditor-TopBar-Nav-File-Row:AppData.ContentEditor.TopBarNav.FileSlot~}
	{~TS:ContentEditor-TopBar-Nav-Empty-Row:AppData.ContentEditor.TopBarNav.EmptySlot~}
</div>`
		},
		{
			Hash: "ContentEditor-TopBar-Nav-File-Row",
			Template: /*html*/`<span class="content-editor-nav-filename" title="{~D:Record.Path~}">{~D:Record.Path~}</span>{~TS:ContentEditor-TopBar-Nav-Dirty-Row:Record.DirtySlot~}`
		},
		{
			Hash: "ContentEditor-TopBar-Nav-Dirty-Row",
			Template: /*html*/`<span class="content-editor-nav-dirty">*</span>`
		},
		{
			Hash: "ContentEditor-TopBar-Nav-Empty-Row",
			Template: /*html*/`<span class="content-editor-nav-empty">No file open</span>`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "ContentEditor-TopBar-Nav-Display",
			TemplateHash: "ContentEditor-TopBar-Nav-Template",
			DestinationAddress: "#Theme-TopBar-Nav",
			RenderMethod: "replace"
		}
	]
};

class ContentEditorTopBarNavView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onBeforeRender(pRenderable, pRenderDestinationAddress, pRecord)
	{
		let tmpEditor = this.pict.AppData.ContentEditor || {};
		let tmpFile = tmpEditor.CurrentFile;
		let tmpDirty = !!tmpEditor.IsDirty;

		this.pict.AppData.ContentEditor.TopBarNav =
		{
			FileSlot:  tmpFile ? [{ Path: tmpFile, DirtySlot: tmpDirty ? [{}] : [] }] : [],
			EmptySlot: tmpFile ? [] : [{}]
		};

		return super.onBeforeRender(pRenderable, pRenderDestinationAddress, pRecord);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.CSSMap.injectCSS();
		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = ContentEditorTopBarNavView;
module.exports.default_configuration = _ViewConfiguration;
