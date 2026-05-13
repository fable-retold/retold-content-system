const libPictView = require('pict-view');

/**
 * ContentEditor-Sidebar-Tabs — the 4-tab UI that fills the left
 * sidebar panel. Bound to the shell's sidebar panel as its ContentView;
 * the shell auto-renders it on panel creation and on every expand
 * transition.
 *
 * Tabs (left to right): Files / Reference / Topics / Vocab.
 *
 * Each tab's destination div lives inside this view's template:
 *   #ContentEditor-Sidebar-Container          → Pict-FileBrowser
 *   #ContentEditor-SidebarReference-Container → ContentEditor-MarkdownReference
 *   #ContentEditor-SidebarTopics-Container    → ContentEditor-Topics
 *   #ContentEditor-Vocabulary-Container       → ContentEditor-Vocabulary
 *
 * The Layout view owns the tab-switching logic (switchSidebarTab),
 * the "+" button dispatcher (onSidebarAddClick), and the F1 cycling.
 * Click handlers in this template call into ContentEditor-Layout
 * methods so the source of truth for active tab stays in one place.
 */

const _ViewConfiguration =
{
	ViewIdentifier: "ContentEditor-Sidebar-Tabs",

	DefaultRenderable: "ContentEditor-Sidebar-Tabs-Display",
	DefaultDestinationAddress: "#ContentEditor-Sidebar-Host",

	AutoRender: false,

	CSS: /*css*/`
		#ContentEditor-Sidebar-Host
		{
			display: flex;
			flex-direction: column;
			height: 100%;
			min-height: 0;
			background: var(--theme-color-background-secondary, #FAF8F4);
			color: var(--theme-color-text-primary, #3D3229);
		}
		.content-editor-sidebar-inner
		{
			display: flex;
			flex-direction: column;
			flex: 1;
			min-height: 0;
		}
		.content-editor-sidebar-tabs
		{
			display: flex;
			align-items: stretch;
			border-bottom: 1px solid var(--theme-color-border-default, #DDD6CA);
			background: var(--theme-color-background-tertiary, #F0EDE8);
			flex-shrink: 0;
		}
		.content-editor-sidebar-tab
		{
			flex: 1;
			padding: 8px 6px;
			background: transparent;
			border: none;
			border-right: 1px solid var(--theme-color-border-light, #E8E2D7);
			color: var(--theme-color-text-secondary, #5E5549);
			font-size: 0.78rem;
			font-weight: 500;
			cursor: pointer;
			letter-spacing: 0.3px;
			transition: background 120ms ease, color 120ms ease;
		}
		.content-editor-sidebar-tab:last-of-type
		{
			border-right: none;
		}
		.content-editor-sidebar-tab:hover
		{
			background: var(--theme-color-background-hover, #EDE9E3);
			color: var(--theme-color-text-primary, #3D3229);
		}
		.content-editor-sidebar-tab.active
		{
			background: var(--theme-color-background-panel, #FAF8F4);
			color: var(--theme-color-brand-primary, #2E7D74);
			font-weight: 600;
			box-shadow: inset 0 -2px 0 0 var(--theme-color-brand-primary, #2E7D74);
		}
		.content-editor-sidebar-addfile
		{
			width: 32px;
			background: var(--theme-color-brand-primary, #2E7D74);
			color: var(--theme-color-text-on-brand, #FFF);
			border: none;
			cursor: pointer;
			font-size: 1.1rem;
			font-weight: 700;
			flex-shrink: 0;
		}
		.content-editor-sidebar-addfile:hover
		{
			background: var(--theme-color-brand-primary-hover, #3A9E92);
		}
		.content-editor-sidebar-pane
		{
			flex: 1;
			min-height: 0;
			overflow-y: auto;
			background: var(--theme-color-background-secondary, #FAF8F4);
		}
	`,

	Templates:
	[
		{
			Hash: "ContentEditor-Sidebar-Tabs-Template",
			Template: /*html*/`
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
	<div id="ContentEditor-Sidebar-Container"            class="content-editor-sidebar-pane"></div>
	<div id="ContentEditor-SidebarReference-Container"   class="content-editor-sidebar-pane" style="display:none"></div>
	<div id="ContentEditor-SidebarTopics-Container"      class="content-editor-sidebar-pane" style="display:none"></div>
	<div id="ContentEditor-Vocabulary-Container"         class="content-editor-sidebar-pane" style="display:none"></div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "ContentEditor-Sidebar-Tabs-Display",
			TemplateHash: "ContentEditor-Sidebar-Tabs-Template",
			DestinationAddress: "#ContentEditor-Sidebar-Host",
			RenderMethod: "replace"
		}
	]
};

class ContentEditorSidebarTabsView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.CSSMap.injectCSS();

		// Re-render every child view into its (just-recreated) tab pane.
		//
		// This view IS the sidebar panel's bound ContentView, which means
		// the modal shell auto-re-renders this template on every
		// collapsed→expanded transition.  Each re-render replaces the
		// four empty tab-pane containers; any child view that had
		// previously painted into one of them needs to be told to
		// repaint, or its tab goes blank.
		//
		// Order matters: the FileBrowser shell must render BEFORE
		// FileBrowser-ListDetail because the latter paints into a
		// container the former creates (#Pict-FileBrowser-ListPane).
		// Topics, Vocabulary, and MarkdownReference are independent.
		//
		// Each call is wrapped so a single view's render failure doesn't
		// take down the rest — a tab going blank for one reason is
		// recoverable; a tab going blank because another tab threw is
		// not.
		let tmpRerender = (pHash) =>
		{
			let tmpView = this.pict.views[pHash];
			if (tmpView && typeof tmpView.render === 'function')
			{
				try { tmpView.render(); } catch (pErr) { /* swallow */ }
			}
		};
		tmpRerender('Pict-FileBrowser');                 // shell (sets up panes)
		tmpRerender('Pict-FileBrowser-ListDetail');      // file list (paints into shell)
		tmpRerender('ContentEditor-MarkdownReference');
		tmpRerender('ContentEditor-Topics');
		tmpRerender('ContentEditor-Vocabulary');

		// Restore the previously-active tab.  The shell template
		// hardcodes `active` on the Files button (default first-mount
		// state), so every re-render — including the one that fires on
		// every collapsed→expanded transition — visually resets the
		// user back to Files.  Reading the saved tab from AppData and
		// calling the layout's switchSidebarTab() flips the active
		// class + display:none/block pair to where the user left them.
		let tmpSaved = this.pict.AppData.ContentEditor
			&& this.pict.AppData.ContentEditor.ActiveSidebarTab;
		if (tmpSaved && tmpSaved !== 'files')
		{
			let tmpLayout = this.pict.views['ContentEditor-Layout'];
			if (tmpLayout && typeof tmpLayout.switchSidebarTab === 'function')
			{
				try { tmpLayout.switchSidebarTab(tmpSaved); } catch (pErr) { /* swallow */ }
			}
		}

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = ContentEditorSidebarTabsView;
module.exports.default_configuration = _ViewConfiguration;
