const libPictView = require('pict-view');

/**
 * ContentEditor-SettingsPanel — content of the hidden right-side
 * settings panel managed by the shell. The panel itself is built in
 * Layout._buildShell() with Hidden:true; the gear button in
 * TopBar-User toggles its visibility. This view just renders the
 * panel's interior.
 *
 * Sections (top to bottom):
 *   - Appearance — pict-section-theme controls (Picker / ModeToggle /
 *                  ScaleSelect) mounted via Theme-Section.mount() on
 *                  first render.
 *   - Word Wrap
 *   - Markdown Editor (controls + preview mode + auto-segment + depth)
 *   - Media Preview (image / video / audio auto-preview)
 *   - File Browser (show hidden files)
 *
 * Theme state is owned by pict-section-theme (its own localStorage
 * scope). The editor preferences below persist via the application's
 * saveSettings() into the legacy `retold-content-editor-settings`
 * key.
 */

const _ViewConfiguration =
{
	ViewIdentifier: "ContentEditor-SettingsPanel",

	DefaultRenderable: "ContentEditor-SettingsPanel-Display",
	DefaultDestinationAddress: "#ContentEditor-Settings-Panel",

	AutoRender: false,

	CSS: /*css*/`
		#ContentEditor-Settings-Panel .content-editor-settings-body
		{
			padding: 14px 16px 24px;
			font-size: 0.85rem;
			color: var(--theme-color-text-primary, #3D3229);
		}
		.content-editor-settings-section
		{
			margin-bottom: 18px;
		}
		.content-editor-settings-label
		{
			font-size: 0.72rem;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.6px;
			color: var(--theme-color-text-muted, #8A7F72);
			margin-bottom: 8px;
		}
		.content-editor-settings-row
		{
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 6px 0;
			min-height: 28px;
		}
		.content-editor-settings-checkbox-label,
		.content-editor-settings-select-label
		{
			font-size: 0.85rem;
			color: var(--theme-color-text-primary, #3D3229);
		}
		.content-editor-settings-checkbox
		{
			width: 16px;
			height: 16px;
			cursor: pointer;
			accent-color: var(--theme-color-brand-primary, #2E7D74);
		}
		.content-editor-settings-select
		{
			padding: 4px 8px;
			font-size: 0.82rem;
			border: 1px solid var(--theme-color-border-default, #DDD6CA);
			border-radius: 4px;
			background: var(--theme-color-background-panel, #FFF);
			color: var(--theme-color-text-primary, #3D3229);
			cursor: pointer;
		}
		.content-editor-settings-select:disabled
		{
			opacity: 0.5;
			cursor: not-allowed;
		}
		.content-editor-settings-divider
		{
			height: 1px;
			background: var(--theme-color-border-light, #EDE9E3);
			margin: 12px 0;
		}
		.content-editor-settings-link
		{
			display: inline-flex;
			align-items: center;
			gap: 8px;
			padding: 6px 0;
			color: var(--theme-color-brand-primary, #2E7D74);
			font-size: 0.85rem;
			text-decoration: none;
		}
		.content-editor-settings-link:hover
		{
			text-decoration: underline;
		}
		.content-editor-settings-link svg
		{
			width: 14px;
			height: 14px;
			fill: currentColor;
		}
		/* Theme-controls mount point — leave layout to the views
		   themselves; just stack their rows comfortably. */
		#ContentEditor-Settings-Theme .pict-theme-mount
		{
			display: flex;
			flex-direction: column;
			gap: 10px;
		}
		#ContentEditor-Settings-Theme .pict-theme-mount-row
		{
			display: flex;
			align-items: center;
			justify-content: flex-start;
		}
	`,

	Templates:
	[
		{
			Hash: "ContentEditor-SettingsPanel-Template",
			Template: /*html*/`
<div class="content-editor-settings-body">
	<div class="content-editor-settings-section">
		<div class="content-editor-settings-label">Theme</div>
		<div id="ContentEditor-Settings-Theme"></div>
	</div>
	<div class="content-editor-settings-divider"></div>
	<div class="content-editor-settings-section">
		<div class="content-editor-settings-label">Word Wrap</div>
		<div class="content-editor-settings-row">
			<label class="content-editor-settings-checkbox-label"
				for="ContentEditor-Setting-MarkdownWordWrap">Markdown Word Wrap</label>
			<input type="checkbox" class="content-editor-settings-checkbox"
				id="ContentEditor-Setting-MarkdownWordWrap"
				onchange="{~P~}.views['ContentEditor-SettingsPanel'].onMarkdownWordWrapChanged(this.checked)">
		</div>
		<div class="content-editor-settings-row">
			<label class="content-editor-settings-checkbox-label"
				for="ContentEditor-Setting-CodeWordWrap">Code Word Wrap</label>
			<input type="checkbox" class="content-editor-settings-checkbox"
				id="ContentEditor-Setting-CodeWordWrap"
				onchange="{~P~}.views['ContentEditor-SettingsPanel'].onCodeWordWrapChanged(this.checked)">
		</div>
	</div>
	<div class="content-editor-settings-divider"></div>
	<div class="content-editor-settings-section">
		<div class="content-editor-settings-label">Markdown Editor</div>
		<div class="content-editor-settings-row">
			<label class="content-editor-settings-checkbox-label"
				for="ContentEditor-Setting-EditingControls">Editing Controls</label>
			<input type="checkbox" class="content-editor-settings-checkbox"
				id="ContentEditor-Setting-EditingControls"
				onchange="{~P~}.views['ContentEditor-SettingsPanel'].onEditingControlsChanged(this.checked)">
		</div>
		<div class="content-editor-settings-row">
			<span class="content-editor-settings-select-label">Content Preview</span>
			<select class="content-editor-settings-select"
				id="ContentEditor-Setting-ContentPreviewMode"
				onchange="{~P~}.views['ContentEditor-SettingsPanel'].onContentPreviewModeChanged(this.value)">
				<option value="off">Off</option>
				<option value="bottom">Underneath</option>
				<option value="side">Beside</option>
				<option value="tabbed">Tab</option>
			</select>
		</div>
		<div class="content-editor-settings-row">
			<label class="content-editor-settings-checkbox-label"
				for="ContentEditor-Setting-AutoSegment">Auto Segment Markdown</label>
			<input type="checkbox" class="content-editor-settings-checkbox"
				id="ContentEditor-Setting-AutoSegment"
				onchange="{~P~}.views['ContentEditor-SettingsPanel'].onAutoSegmentChanged(this.checked)">
		</div>
		<div class="content-editor-settings-row">
			<span class="content-editor-settings-select-label">Segment Depth</span>
			<select class="content-editor-settings-select"
				id="ContentEditor-Setting-SegmentDepth"
				disabled
				onchange="{~P~}.views['ContentEditor-SettingsPanel'].onSegmentDepthChanged(this.value)">
				<option value="1">Depth 1: Blocks</option>
				<option value="2">Depth 2: ##</option>
				<option value="3">Depth 3: ###</option>
				<option value="4">Depth 4: ####</option>
				<option value="5">Depth 5: #####</option>
				<option value="6">Depth 6: ######</option>
			</select>
		</div>
	</div>
	<div class="content-editor-settings-divider"></div>
	<div class="content-editor-settings-section">
		<div class="content-editor-settings-label">Media Preview</div>
		<div class="content-editor-settings-row">
			<label class="content-editor-settings-checkbox-label"
				for="ContentEditor-Setting-AutoPreviewImages">Auto-Preview Images</label>
			<input type="checkbox" class="content-editor-settings-checkbox"
				id="ContentEditor-Setting-AutoPreviewImages"
				onchange="{~P~}.views['ContentEditor-SettingsPanel'].onAutoPreviewImagesChanged(this.checked)">
		</div>
		<div class="content-editor-settings-row">
			<label class="content-editor-settings-checkbox-label"
				for="ContentEditor-Setting-AutoPreviewVideo">Auto-Preview Video</label>
			<input type="checkbox" class="content-editor-settings-checkbox"
				id="ContentEditor-Setting-AutoPreviewVideo"
				onchange="{~P~}.views['ContentEditor-SettingsPanel'].onAutoPreviewVideoChanged(this.checked)">
		</div>
		<div class="content-editor-settings-row">
			<label class="content-editor-settings-checkbox-label"
				for="ContentEditor-Setting-AutoPreviewAudio">Auto-Preview Audio</label>
			<input type="checkbox" class="content-editor-settings-checkbox"
				id="ContentEditor-Setting-AutoPreviewAudio"
				onchange="{~P~}.views['ContentEditor-SettingsPanel'].onAutoPreviewAudioChanged(this.checked)">
		</div>
	</div>
	<div class="content-editor-settings-divider"></div>
	<div class="content-editor-settings-section">
		<div class="content-editor-settings-label">File Browser</div>
		<div class="content-editor-settings-row">
			<label class="content-editor-settings-checkbox-label"
				for="ContentEditor-Setting-ShowHiddenFiles">Show Hidden Files</label>
			<input type="checkbox" class="content-editor-settings-checkbox"
				id="ContentEditor-Setting-ShowHiddenFiles"
				onchange="{~P~}.views['ContentEditor-SettingsPanel'].onShowHiddenFilesChanged(this.checked)">
		</div>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "ContentEditor-SettingsPanel-Display",
			TemplateHash: "ContentEditor-SettingsPanel-Template",
			DestinationAddress: "#ContentEditor-Settings-Panel",
			RenderMethod: "replace"
		}
	]
};

class ContentEditorSettingsPanelView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this._themeMounted = false;
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.CSSMap.injectCSS();

		// Mount the pict-section-theme controls on first render. The
		// mount() API renders Picker / ModeToggle / ScaleSelect into
		// host-supplied destinations inside the container we built
		// in the template. Once mounted, subsequent renders of the
		// SettingsPanel will rewrite the template HTML — including
		// erasing the previously-rendered theme views — so we re-mount
		// every render.
		let tmpThemeProvider = this.pict.providers && this.pict.providers['Theme-Section'];
		if (tmpThemeProvider && typeof tmpThemeProvider.mount === 'function')
		{
			tmpThemeProvider.mount(
			{
				Container: '#ContentEditor-Settings-Theme',
				Views: ['Picker', 'ModeToggle', 'ScaleSelect']
			});
		}

		// Sync the editor-preference controls with current AppData
		// state. Each control reflects the persisted setting on first
		// render and after re-render.
		let tmpSettings = this.pict.AppData.ContentEditor || {};

		this._setChecked('#ContentEditor-Setting-MarkdownWordWrap',  !!tmpSettings.MarkdownWordWrap);
		this._setChecked('#ContentEditor-Setting-CodeWordWrap',      !!tmpSettings.CodeWordWrap);
		this._setChecked('#ContentEditor-Setting-EditingControls',   !!tmpSettings.MarkdownEditingControls);
		this._setChecked('#ContentEditor-Setting-AutoSegment',       !!tmpSettings.AutoSegmentMarkdown);
		this._setChecked('#ContentEditor-Setting-AutoPreviewImages', !!tmpSettings.AutoPreviewImages);
		this._setChecked('#ContentEditor-Setting-AutoPreviewVideo',  !!tmpSettings.AutoPreviewVideo);
		this._setChecked('#ContentEditor-Setting-AutoPreviewAudio',  !!tmpSettings.AutoPreviewAudio);
		this._setChecked('#ContentEditor-Setting-ShowHiddenFiles',   !!tmpSettings.ShowHiddenFiles);

		this._setSelect('#ContentEditor-Setting-ContentPreviewMode', tmpSettings.ContentPreviewMode || 'off');
		this._setSelect('#ContentEditor-Setting-SegmentDepth',       String(tmpSettings.AutoSegmentDepth || 1));

		let tmpDepthSelect = this.pict.ContentAssignment.getElement('#ContentEditor-Setting-SegmentDepth');
		if (tmpDepthSelect && tmpDepthSelect[0])
		{
			tmpDepthSelect[0].disabled = !tmpSettings.AutoSegmentMarkdown;
		}

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	_setChecked(pSelector, pBool)
	{
		let tmpEl = this.pict.ContentAssignment.getElement(pSelector);
		if (tmpEl && tmpEl[0]) { tmpEl[0].checked = pBool; }
	}

	_setSelect(pSelector, pValue)
	{
		let tmpEl = this.pict.ContentAssignment.getElement(pSelector);
		if (tmpEl && tmpEl[0]) { tmpEl[0].value = pValue; }
	}

	// ─────────────────────────────────────────────
	//  Setting change handlers — each persists + live-applies
	// ─────────────────────────────────────────────

	onMarkdownWordWrapChanged(pChecked)
	{
		this.pict.AppData.ContentEditor.MarkdownWordWrap = pChecked;
		this.pict.PictApplication.saveSettings();

		let tmpEditorView = this.pict.views['ContentEditor-MarkdownEditor'];
		if (tmpEditorView && this.pict.AppData.ContentEditor.ActiveEditor === 'markdown'
			&& tmpEditorView._segmentEditors)
		{
			for (let tmpKey in tmpEditorView._segmentEditors)
			{
				let tmpEditor = tmpEditorView._segmentEditors[tmpKey];
				if (tmpEditor && tmpEditor.contentDOM)
				{
					if (pChecked) { tmpEditor.contentDOM.classList.add('cm-lineWrapping'); }
					else          { tmpEditor.contentDOM.classList.remove('cm-lineWrapping'); }
				}
			}
		}
	}

	onCodeWordWrapChanged(pChecked)
	{
		this.pict.AppData.ContentEditor.CodeWordWrap = pChecked;
		this.pict.PictApplication.saveSettings();

		let tmpCodeEditorView = this.pict.views['ContentEditor-CodeEditor'];
		if (tmpCodeEditorView && tmpCodeEditorView._editorElement
			&& this.pict.AppData.ContentEditor.ActiveEditor === 'code')
		{
			if (pChecked)
			{
				tmpCodeEditorView._editorElement.style.whiteSpace = 'pre-wrap';
				tmpCodeEditorView._editorElement.style.overflowWrap = 'break-word';
			}
			else
			{
				tmpCodeEditorView._editorElement.style.whiteSpace = 'pre';
				tmpCodeEditorView._editorElement.style.overflowWrap = 'normal';
			}
		}
	}

	onEditingControlsChanged(pChecked)
	{
		this.pict.AppData.ContentEditor.MarkdownEditingControls = pChecked;
		this.pict.PictApplication.saveSettings();

		let tmpEditorView = this.pict.views['ContentEditor-MarkdownEditor'];
		if (tmpEditorView && this.pict.AppData.ContentEditor.ActiveEditor === 'markdown'
			&& typeof tmpEditorView.toggleControls === 'function')
		{
			tmpEditorView.toggleControls(pChecked);
		}
	}

	onContentPreviewModeChanged(pMode)
	{
		this.pict.AppData.ContentEditor.ContentPreviewMode = pMode;
		this.pict.PictApplication.saveSettings();

		let tmpEditorView = this.pict.views['ContentEditor-MarkdownEditor'];
		if (tmpEditorView && this.pict.AppData.ContentEditor.ActiveEditor === 'markdown'
			&& typeof tmpEditorView.setPreviewMode === 'function')
		{
			tmpEditorView.setPreviewMode(pMode);
		}
	}

	onAutoSegmentChanged(pChecked)
	{
		this.pict.AppData.ContentEditor.AutoSegmentMarkdown = pChecked;
		this.pict.PictApplication.saveSettings();

		let tmpSelect = this.pict.ContentAssignment.getElement('#ContentEditor-Setting-SegmentDepth');
		if (tmpSelect && tmpSelect[0]) { tmpSelect[0].disabled = !pChecked; }

		// Re-segment the open document so the editor reflects the new
		// layout immediately. resegmentCurrentMarkdown preserves unsaved
		// edits by joining current segment contents and re-splitting.
		if (this.pict.PictApplication && typeof this.pict.PictApplication.resegmentCurrentMarkdown === 'function')
		{
			this.pict.PictApplication.resegmentCurrentMarkdown();
		}
	}

	onSegmentDepthChanged(pValue)
	{
		this.pict.AppData.ContentEditor.AutoSegmentDepth = parseInt(pValue, 10) || 1;
		this.pict.PictApplication.saveSettings();

		// Re-segment the open document so the editor reflects the new
		// depth immediately. Preserves unsaved edits.
		if (this.pict.PictApplication && typeof this.pict.PictApplication.resegmentCurrentMarkdown === 'function')
		{
			this.pict.PictApplication.resegmentCurrentMarkdown();
		}
	}

	onAutoPreviewImagesChanged(pChecked)
	{
		this.pict.AppData.ContentEditor.AutoPreviewImages = pChecked;
		this.pict.PictApplication.saveSettings();
	}

	onAutoPreviewVideoChanged(pChecked)
	{
		this.pict.AppData.ContentEditor.AutoPreviewVideo = pChecked;
		this.pict.PictApplication.saveSettings();
	}

	onAutoPreviewAudioChanged(pChecked)
	{
		this.pict.AppData.ContentEditor.AutoPreviewAudio = pChecked;
		this.pict.PictApplication.saveSettings();
	}

	onShowHiddenFilesChanged(pChecked)
	{
		this.pict.AppData.ContentEditor.ShowHiddenFiles = pChecked;
		this.pict.PictApplication.saveSettings();

		let tmpSelf = this;
		this.pict.PictApplication.syncHiddenFilesSetting(() =>
		{
			tmpSelf.pict.PictApplication.loadFileList();
		});
	}
}

module.exports = ContentEditorSettingsPanelView;
module.exports.default_configuration = _ViewConfiguration;
