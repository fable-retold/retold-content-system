const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "ContentEditor-SettingsPanel",

	DefaultRenderable: "ContentEditor-SettingsPanel-Display",
	DefaultDestinationAddress: "#ContentEditor-SettingsPanel-Container",

	AutoRender: false,

	CSS: /*css*/`
		.content-editor-settings-wrap
		{
			position: relative;
			display: flex;
			align-items: center;
		}
		.content-editor-settings-gear
		{
			background: transparent;
			border: none;
			cursor: pointer;
			padding: 6px;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 4px;
			color: #B8AFA4;
			transition: color 0.15s;
		}
		.content-editor-settings-gear:hover,
		.content-editor-settings-gear.active
		{
			color: #E8E0D4;
		}
		.content-editor-settings-gear svg
		{
			width: 20px;
			height: 20px;
			fill: currentColor;
		}
		/* Flyout overlay — covers viewport to catch clicks outside */
		.content-editor-settings-overlay
		{
			display: none;
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 999;
		}
		.content-editor-settings-overlay.open
		{
			display: block;
		}
		/* Flyout panel */
		.content-editor-settings-flyout
		{
			position: absolute;
			top: 44px;
			right: 0;
			width: 270px;
			background: var(--theme-color-background-panel, #FFF);
			border: 1px solid #DDD6CA;
			border-radius: 8px;
			box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
			z-index: 1000;
			opacity: 0;
			transform: translateY(-4px);
			pointer-events: none;
			transition: opacity 0.15s ease, transform 0.15s ease;
		}
		.content-editor-settings-flyout.open
		{
			opacity: 1;
			transform: translateY(0);
			pointer-events: auto;
		}
		/* Speech bubble arrow */
		.content-editor-settings-flyout::before
		{
			content: '';
			position: absolute;
			top: -7px;
			right: 12px;
			width: 12px;
			height: 12px;
			background: var(--theme-color-background-panel, #FFF);
			border-left: 1px solid #DDD6CA;
			border-top: 1px solid #DDD6CA;
			transform: rotate(45deg);
		}
		.content-editor-settings-flyout-body
		{
			padding: 8px;
		}
		.content-editor-settings-flyout-link
		{
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 10px 12px;
			border-radius: 6px;
			text-decoration: none;
			color: var(--theme-color-text-primary, #3D3229);
			font-size: 0.85rem;
			font-weight: 500;
			transition: background 0.1s;
		}
		.content-editor-settings-flyout-link:hover
		{
			background: #F5F3EE;
		}
		.content-editor-settings-flyout-link svg
		{
			width: 16px;
			height: 16px;
			flex-shrink: 0;
			fill: #8A7F72;
		}
		.content-editor-settings-divider
		{
			height: 1px;
			background: #EDE9E3;
			margin: 4px 8px;
		}
		/* Settings controls */
		.content-editor-settings-section
		{
			padding: 8px 12px;
		}
		.content-editor-settings-label
		{
			font-size: 0.72rem;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			color: #8A7F72;
			margin-bottom: 8px;
		}
		.content-editor-settings-row
		{
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 8px;
			margin-bottom: 6px;
		}
		.content-editor-settings-row:last-child
		{
			margin-bottom: 0;
		}
		.content-editor-settings-checkbox
		{
			width: 16px;
			height: 16px;
			accent-color: #2E7D74;
			cursor: pointer;
			flex-shrink: 0;
		}
		.content-editor-settings-checkbox-label
		{
			font: inherit;
			font-size: 0.85rem;
			color: var(--theme-color-text-primary, #3D3229);
			cursor: pointer;
			user-select: none;
		}
		.content-editor-settings-select
		{
			width: 140px;
			padding: 5px 8px;
			border: 1px solid #DDD6CA;
			border-radius: 4px;
			background: var(--theme-color-background-panel, #FFF);
			font-size: 0.82rem;
			color: var(--theme-color-text-primary, #3D3229);
			cursor: pointer;
		}
		.content-editor-settings-select:disabled
		{
			opacity: 0.45;
			cursor: not-allowed;
		}
		.content-editor-settings-select-label
		{
			font-size: 0.82rem;
			color: var(--theme-color-text-secondary, #5E5549);
			white-space: nowrap;
		}

		/* ============================================
		   RESPONSIVE: Tablet / Phone (max-width: 768px)
		   ============================================ */
		@media (max-width: 768px)
		{
			/* Settings flyout: position from left edge for more room */
			.content-editor-settings-flyout
			{
				right: -8px;
				width: 260px;
			}
		}

		/* ============================================
		   RESPONSIVE: Small phone (max-width: 480px)
		   ============================================ */
		@media (max-width: 480px)
		{
			/* Full-width settings flyout on small phones */
			.content-editor-settings-flyout
			{
				position: fixed;
				top: 48px;
				right: 0;
				left: 0;
				width: 100%;
				border-radius: 0 0 8px 8px;
			}
			.content-editor-settings-flyout::before
			{
				display: none;
			}
		}
	`,

	Templates:
	[
		{
			Hash: "ContentEditor-SettingsPanel-Template",
			Template: /*html*/`
<div class="content-editor-settings-wrap">
	<button class="content-editor-settings-gear" id="ContentEditor-SettingsGear"
		onclick="{~P~}.views['ContentEditor-SettingsPanel'].togglePanel()">
		<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>
	</button>
	<div class="content-editor-settings-overlay" id="ContentEditor-SettingsOverlay"
		onclick="{~P~}.views['ContentEditor-SettingsPanel'].closePanel()"></div>
	<div class="content-editor-settings-flyout" id="ContentEditor-SettingsFlyout">
		<div class="content-editor-settings-flyout-body">
			<a class="content-editor-settings-flyout-link"
				href="/preview.html{~D:AppData.ContentEditor.ViewerHash~}" target="_blank">
				<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
				Docuserve Preview
			</a>
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
			DestinationAddress: "#ContentEditor-SettingsPanel-Container",
			RenderMethod: "replace"
		}
	]
};

class ContentEditorSettingsPanelView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this._isOpen = false;
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		// Sync the UI controls with current state
		let tmpSettings = this.pict.AppData.ContentEditor;

		let tmpMdWrapCheckbox = this.pict.ContentAssignment.getElement('#ContentEditor-Setting-MarkdownWordWrap');
		if (tmpMdWrapCheckbox && tmpMdWrapCheckbox[0])
		{
			tmpMdWrapCheckbox[0].checked = tmpSettings.MarkdownWordWrap;
		}

		let tmpCodeWrapCheckbox = this.pict.ContentAssignment.getElement('#ContentEditor-Setting-CodeWordWrap');
		if (tmpCodeWrapCheckbox && tmpCodeWrapCheckbox[0])
		{
			tmpCodeWrapCheckbox[0].checked = tmpSettings.CodeWordWrap;
		}

		let tmpControlsCheckbox = this.pict.ContentAssignment.getElement('#ContentEditor-Setting-EditingControls');
		if (tmpControlsCheckbox && tmpControlsCheckbox[0])
		{
			tmpControlsCheckbox[0].checked = tmpSettings.MarkdownEditingControls;
		}

		let tmpPreviewSelect = this.pict.ContentAssignment.getElement('#ContentEditor-Setting-ContentPreviewMode');
		if (tmpPreviewSelect && tmpPreviewSelect[0])
		{
			tmpPreviewSelect[0].value = tmpSettings.ContentPreviewMode || 'off';
		}

		let tmpSegmentCheckbox = this.pict.ContentAssignment.getElement('#ContentEditor-Setting-AutoSegment');
		if (tmpSegmentCheckbox && tmpSegmentCheckbox[0])
		{
			tmpSegmentCheckbox[0].checked = tmpSettings.AutoSegmentMarkdown;
		}

		let tmpSelect = this.pict.ContentAssignment.getElement('#ContentEditor-Setting-SegmentDepth');
		if (tmpSelect && tmpSelect[0])
		{
			tmpSelect[0].value = String(tmpSettings.AutoSegmentDepth);
			tmpSelect[0].disabled = !tmpSettings.AutoSegmentMarkdown;
		}

		let tmpImgCheckbox = this.pict.ContentAssignment.getElement('#ContentEditor-Setting-AutoPreviewImages');
		if (tmpImgCheckbox && tmpImgCheckbox[0])
		{
			tmpImgCheckbox[0].checked = tmpSettings.AutoPreviewImages;
		}

		let tmpVideoCheckbox = this.pict.ContentAssignment.getElement('#ContentEditor-Setting-AutoPreviewVideo');
		if (tmpVideoCheckbox && tmpVideoCheckbox[0])
		{
			tmpVideoCheckbox[0].checked = tmpSettings.AutoPreviewVideo;
		}

		let tmpAudioCheckbox = this.pict.ContentAssignment.getElement('#ContentEditor-Setting-AutoPreviewAudio');
		if (tmpAudioCheckbox && tmpAudioCheckbox[0])
		{
			tmpAudioCheckbox[0].checked = tmpSettings.AutoPreviewAudio;
		}

		let tmpHiddenCheckbox = this.pict.ContentAssignment.getElement('#ContentEditor-Setting-ShowHiddenFiles');
		if (tmpHiddenCheckbox && tmpHiddenCheckbox[0])
		{
			tmpHiddenCheckbox[0].checked = tmpSettings.ShowHiddenFiles;
		}

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	togglePanel()
	{
		if (this._isOpen)
		{
			this.closePanel();
		}
		else
		{
			this.openPanel();
		}
	}

	openPanel()
	{
		this._isOpen = true;

		let tmpFlyout = this.pict.ContentAssignment.getElement('#ContentEditor-SettingsFlyout');
		let tmpOverlay = this.pict.ContentAssignment.getElement('#ContentEditor-SettingsOverlay');
		let tmpGear = this.pict.ContentAssignment.getElement('#ContentEditor-SettingsGear');

		if (tmpFlyout && tmpFlyout[0]) tmpFlyout[0].classList.add('open');
		if (tmpOverlay && tmpOverlay[0]) tmpOverlay[0].classList.add('open');
		if (tmpGear && tmpGear[0]) tmpGear[0].classList.add('active');
	}

	closePanel()
	{
		this._isOpen = false;

		let tmpFlyout = this.pict.ContentAssignment.getElement('#ContentEditor-SettingsFlyout');
		let tmpOverlay = this.pict.ContentAssignment.getElement('#ContentEditor-SettingsOverlay');
		let tmpGear = this.pict.ContentAssignment.getElement('#ContentEditor-SettingsGear');

		if (tmpFlyout && tmpFlyout[0]) tmpFlyout[0].classList.remove('open');
		if (tmpOverlay && tmpOverlay[0]) tmpOverlay[0].classList.remove('open');
		if (tmpGear && tmpGear[0]) tmpGear[0].classList.remove('active');
	}

	onMarkdownWordWrapChanged(pChecked)
	{
		this.pict.AppData.ContentEditor.MarkdownWordWrap = pChecked;
		this.pict.PictApplication.saveSettings();

		// Live-apply to all CodeMirror segment editors if markdown is active
		let tmpEditorView = this.pict.views['ContentEditor-MarkdownEditor'];
		if (tmpEditorView && this.pict.AppData.ContentEditor.ActiveEditor === 'markdown'
			&& tmpEditorView._segmentEditors)
		{
			for (let tmpKey in tmpEditorView._segmentEditors)
			{
				let tmpEditor = tmpEditorView._segmentEditors[tmpKey];
				if (tmpEditor && tmpEditor.contentDOM)
				{
					if (pChecked)
					{
						tmpEditor.contentDOM.classList.add('cm-lineWrapping');
					}
					else
					{
						tmpEditor.contentDOM.classList.remove('cm-lineWrapping');
					}
				}
			}
		}
	}

	onCodeWordWrapChanged(pChecked)
	{
		this.pict.AppData.ContentEditor.CodeWordWrap = pChecked;
		this.pict.PictApplication.saveSettings();

		// Live-apply to the code editor if it's currently active
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

		// Live-apply to the markdown editor if it's currently active
		let tmpEditorView = this.pict.views['ContentEditor-MarkdownEditor'];
		if (tmpEditorView && this.pict.AppData.ContentEditor.ActiveEditor === 'markdown')
		{
			tmpEditorView.toggleControls(pChecked);
		}
	}

	onContentPreviewModeChanged(pMode)
	{
		this.pict.AppData.ContentEditor.ContentPreviewMode = pMode;
		this.pict.PictApplication.saveSettings();

		let tmpEditorView = this.pict.views['ContentEditor-MarkdownEditor'];
		if (tmpEditorView && this.pict.AppData.ContentEditor.ActiveEditor === 'markdown')
		{
			tmpEditorView.setPreviewMode(pMode);
		}
	}

	onAutoSegmentChanged(pChecked)
	{
		this.pict.AppData.ContentEditor.AutoSegmentMarkdown = pChecked;
		this.pict.PictApplication.saveSettings();

		// Enable/disable the depth dropdown
		let tmpSelect = this.pict.ContentAssignment.getElement('#ContentEditor-Setting-SegmentDepth');
		if (tmpSelect && tmpSelect[0])
		{
			tmpSelect[0].disabled = !pChecked;
		}
	}

	onSegmentDepthChanged(pValue)
	{
		this.pict.AppData.ContentEditor.AutoSegmentDepth = parseInt(pValue, 10) || 1;
		this.pict.PictApplication.saveSettings();
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

		// Tell the server to include/exclude hidden files, then refresh
		let tmpSelf = this;
		this.pict.PictApplication.syncHiddenFilesSetting(() =>
		{
			tmpSelf.pict.PictApplication.loadFileList();
		});
	}
}

module.exports = ContentEditorSettingsPanelView;

module.exports.default_configuration = _ViewConfiguration;
