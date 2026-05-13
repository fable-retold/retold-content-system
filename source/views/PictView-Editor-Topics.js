const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "ContentEditor-Topics",

	DefaultRenderable: "Topics-Wrap",
	DefaultDestinationAddress: "#ContentEditor-SidebarTopics-Container",

	AutoRender: false,

	CSS: /*css*/`
		.topics-container
		{
			display: flex;
			flex-direction: column;
			height: 100%;
			font-size: 0.82rem;
			color: var(--theme-color-text-primary, var(--theme-color-text-primary, #3D3229));
		}
		.topics-header
		{
			display: flex;
			align-items: center;
			gap: 6px;
			padding: 8px 10px;
			border-bottom: 1px solid var(--theme-color-background-hover, #EDE9E3);
			background: var(--theme-color-background-secondary, #FAF8F4);
			flex-shrink: 0;
		}
		.topics-header-title
		{
			flex: 1;
			font-weight: 600;
			font-size: 0.78rem;
			color: var(--theme-color-text-secondary, var(--theme-color-text-secondary, #5E5549));
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		.topics-header-btn
		{
			background: transparent;
			border: none;
			cursor: pointer;
			font-size: 0.82rem;
			color: var(--theme-color-text-muted, #8A7F72);
			padding: 2px 6px;
			border-radius: 3px;
			line-height: 1;
		}
		.topics-header-btn:hover
		{
			color: var(--theme-color-text-primary, var(--theme-color-text-primary, #3D3229));
			background: var(--theme-color-background-hover, #EDE9E3);
		}
		.topics-list
		{
			flex: 1;
			overflow-y: auto;
			overflow-x: hidden;
		}
		.topics-row
		{
			display: flex;
			align-items: flex-start;
			gap: 6px;
			padding: 8px 10px;
			border-bottom: 1px solid var(--theme-color-background-tertiary, #F0EDE8);
			cursor: pointer;
			transition: background 0.1s;
		}
		.topics-row:hover
		{
			background: var(--theme-color-background-tertiary, #F5F0EA);
		}
		.topics-row-info
		{
			flex: 1;
			min-width: 0;
		}
		.topics-row-code
		{
			font-weight: 600;
			font-size: 0.78rem;
			color: var(--theme-color-brand-primary, #2E7D74);
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		.topics-row-title
		{
			font-size: 0.72rem;
			color: var(--theme-color-text-secondary, var(--theme-color-text-secondary, #5E5549));
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			margin-top: 1px;
		}
		.topics-row-path
		{
			font-size: 0.68rem;
			color: var(--theme-color-text-muted, #8A7F72);
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			margin-top: 1px;
		}
		.topics-row-actions
		{
			flex-shrink: 0;
			display: flex;
			gap: 2px;
			padding-top: 1px;
		}
		.topics-row-btn
		{
			background: transparent;
			border: none;
			cursor: pointer;
			font-size: 0.72rem;
			color: var(--theme-color-text-muted, #8A7F72);
			padding: 2px 4px;
			border-radius: 3px;
			line-height: 1;
		}
		.topics-row-btn:hover
		{
			color: var(--theme-color-text-primary, var(--theme-color-text-primary, #3D3229));
			background: var(--theme-color-background-hover, #EDE9E3);
		}
		.topics-row-btn-delete:hover
		{
			color: var(--theme-color-status-error, #D9534F);
			background: #FDF0EF;
		}
		/* Inline edit form */
		.topics-edit
		{
			padding: 8px 10px;
			border-bottom: 1px solid var(--theme-color-border-default, #DDD6CA);
			background: #FFF9F0;
		}
		.topics-edit-field
		{
			margin-bottom: 6px;
		}
		.topics-edit-label
		{
			display: block;
			font-size: 0.68rem;
			font-weight: 600;
			color: var(--theme-color-text-muted, #8A7F72);
			margin-bottom: 2px;
		}
		.topics-edit-input
		{
			display: block;
			width: 100%;
			box-sizing: border-box;
			padding: 4px 6px;
			font-size: 0.78rem;
			border: 1px solid var(--theme-color-border-default, #DDD6CA);
			border-radius: 3px;
			background: var(--theme-color-background-panel, #FFF);
			color: var(--theme-color-text-primary, var(--theme-color-text-primary, #3D3229));
			font-family: inherit;
		}
		.topics-edit-input:focus
		{
			outline: none;
			border-color: var(--theme-color-brand-primary, #2E7D74);
		}
		.topics-edit-actions
		{
			display: flex;
			gap: 6px;
			margin-top: 8px;
		}
		.topics-edit-save
		{
			background: var(--theme-color-brand-primary, #2E7D74);
			color: var(--theme-color-background-panel, #FFF);
			border: none;
			border-radius: 3px;
			padding: 4px 12px;
			font-size: 0.72rem;
			font-weight: 600;
			cursor: pointer;
		}
		.topics-edit-save:hover
		{
			background: var(--theme-color-brand-primary-hover, #3A9E92);
		}
		.topics-edit-cancel
		{
			background: transparent;
			color: var(--theme-color-text-secondary, var(--theme-color-text-secondary, #5E5549));
			border: 1px solid var(--theme-color-border-default, #DDD6CA);
			border-radius: 3px;
			padding: 4px 12px;
			font-size: 0.72rem;
			font-weight: 600;
			cursor: pointer;
		}
		.topics-edit-cancel:hover
		{
			background: var(--theme-color-background-tertiary, #F0EDE8);
		}
		/* Footer add button */
		.topics-footer
		{
			flex-shrink: 0;
			padding: 8px 10px;
			border-top: 1px solid var(--theme-color-background-hover, #EDE9E3);
			background: var(--theme-color-background-secondary, #FAF8F4);
		}
		.topics-add-btn
		{
			display: block;
			width: 100%;
			padding: 6px 0;
			background: var(--theme-color-brand-primary, #2E7D74);
			color: var(--theme-color-background-panel, #FFF);
			border: none;
			border-radius: 4px;
			font-size: 0.78rem;
			font-weight: 600;
			cursor: pointer;
			text-align: center;
		}
		.topics-add-btn:hover
		{
			background: var(--theme-color-brand-primary-hover, #3A9E92);
		}
		/* Empty state */
		.topics-empty
		{
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 12px;
			padding: 32px 16px;
			text-align: center;
			color: var(--theme-color-text-muted, #8A7F72);
			font-size: 0.82rem;
		}
		.topics-empty-icon
		{
			font-size: 2rem;
			color: #C4BDB3;
		}
		.topics-empty-btn
		{
			display: inline-block;
			padding: 6px 14px;
			background: var(--theme-color-brand-primary, #2E7D74);
			color: var(--theme-color-background-panel, #FFF);
			border: none;
			border-radius: 4px;
			font-size: 0.78rem;
			font-weight: 600;
			cursor: pointer;
		}
		.topics-empty-btn:hover
		{
			background: var(--theme-color-brand-primary-hover, #3A9E92);
		}
		.topics-empty-btn-secondary
		{
			background: transparent;
			color: var(--theme-color-text-secondary, var(--theme-color-text-secondary, #5E5549));
			border: 1px solid var(--theme-color-border-default, #DDD6CA);
		}
		.topics-empty-btn-secondary:hover
		{
			background: var(--theme-color-background-tertiary, #F0EDE8);
			border-color: var(--theme-color-text-muted, #8A7F72);
		}
	`,

	Templates:
	[
		{
			Hash: "Topics-Container-Template",
			Template: /*html*/`
<div class="topics-container" id="ContentEditor-Topics-Container">
	<div class="topics-header">
		<span class="topics-header-title" id="ContentEditor-Topics-HeaderTitle">Topics</span>
		<button class="topics-header-btn" title="Close topics file"
			onclick="pict.views['ContentEditor-Topics'].closeTopicsFile()">&times;</button>
	</div>
	<div class="topics-list" id="ContentEditor-Topics-List"></div>
	<div class="topics-footer" id="ContentEditor-Topics-Footer">
		<button class="topics-add-btn"
			onclick="pict.views['ContentEditor-Topics'].addTopic()">+ Add Topic</button>
	</div>
</div>
`
		},
		{
			Hash: "Topics-Row-Template",
			Template: /*html*/`
<div class="topics-row" ondblclick="{~P~}.views['{~D:Record.ViewHash~}'].startEditTopic('{~D:Record.CodeEscaped~}')">
  <div class="topics-row-info">
    <div class="topics-row-code">{~D:Record.Code~}</div>
    <div class="topics-row-title">{~D:Record.Title~}</div>
    <div class="topics-row-path">{~D:Record.PathDisplay~}</div>
  </div>
  <div class="topics-row-actions">
    <button class="topics-row-btn" title="Edit" onclick="event.stopPropagation();{~P~}.views['{~D:Record.ViewHash~}'].startEditTopic('{~D:Record.CodeEscaped~}')">{~I:Edit~}</button>
    <button class="topics-row-btn topics-row-btn-delete" title="Delete" onclick="event.stopPropagation();{~P~}.views['{~D:Record.ViewHash~}'].removeTopic('{~D:Record.CodeEscaped~}')">{~I:Trash~}</button>
    {~D:Record.NavigateButton~}
  </div>
</div>
`
		},
		{
			Hash: "Topics-EditForm-Template",
			Template: /*html*/`
<div class="topics-edit">
  <div class="topics-edit-field">
    <label class="topics-edit-label">Topic Code</label>
    <input class="topics-edit-input" id="topics-edit-code" type="text" value="{~D:Record.Code~}" placeholder="My-Topic-Code">
  </div>
  <div class="topics-edit-field">
    <label class="topics-edit-label">Title</label>
    <input class="topics-edit-input" id="topics-edit-title" type="text" value="{~D:Record.Title~}" placeholder="Topic title">
  </div>
  <div class="topics-edit-field">
    <label class="topics-edit-label">Help File Path</label>
    <input class="topics-edit-input" id="topics-edit-path" type="text" value="{~D:Record.Path~}" placeholder="path/to/file.md">
  </div>
  <div class="topics-edit-field">
    <label class="topics-edit-label">Line Number (optional)</label>
    <input class="topics-edit-input" id="topics-edit-line" type="number" value="{~D:Record.Line~}" placeholder="e.g. 23" min="1">
  </div>
  <div class="topics-edit-actions">
    <button class="topics-edit-save" onclick="{~P~}.views['{~D:Record.ViewHash~}'].saveEditTopic('{~D:Record.OriginalCode~}')">Save</button>
    <button class="topics-edit-cancel" onclick="{~P~}.views['{~D:Record.ViewHash~}'].cancelEditTopic()">Cancel</button>
  </div>
</div>
`
		},
		{
			Hash: "Topics-Empty-Template",
			Template: /*html*/`
<div class="topics-empty">
  <div class="topics-empty-icon">{~I:FileText~}</div>
  <div>No topics file loaded</div>
  <button class="topics-empty-btn" onclick="{~P~}.views['{~D:Record.ViewHash~}'].loadDefaultTopicsFile()">Load .pict_documentation_topics.json</button>
  <button class="topics-empty-btn topics-empty-btn-secondary" onclick="{~P~}.views['{~D:Record.ViewHash~}'].promptSelectTopicsFile()">Select file...</button>
</div>
`
		},
		{
			Hash: "Topics-EmptyList-Template",
			Template: /*html*/`
<div style="padding:16px;text-align:center;color:var(--theme-color-text-muted, #8A7F72);font-size:0.78rem;">No topics yet. Click "+ Add Topic" to create one.</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Topics-Wrap",
			TemplateHash: "Topics-Container-Template",
			DestinationAddress: "#ContentEditor-SidebarTopics-Container"
		}
	]
};

/**
 * Content Editor Topics View
 *
 * Manages .pict_documentation_topics.json files — JSON manifests that
 * map topic codes to help file paths and titles for built-in
 * application documentation.
 *
 * Supports full CRUD on topic entries with inline editing.
 */
class ContentEditorTopicsView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		// The parsed topics object (keyed by TopicCode)
		this._topics = {};

		// The file path of the currently loaded topics file
		this._topicsFilePath = '';

		// Whether the view has been rendered
		this._hasRendered = false;

		// The TopicCode currently being edited (null if none)
		this._editingTopicCode = null;
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this._hasRendered = true;
		this.pict.CSSMap.injectCSS();

		// Check if we should show the empty state or the topic list
		if (!this._topicsFilePath)
		{
			this._showEmptyState();
		}
		else
		{
			this._updateHeaderTitle();
			this.renderTopicList();
		}

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	/**
	 * Load a topics JSON file from the server.
	 *
	 * @param {string} pPath - Relative path to the topics JSON file
	 * @param {Function} [fCallback] - Optional callback (error)
	 */
	loadTopicsFile(pPath, fCallback)
	{
		let tmpCallback = (typeof (fCallback) === 'function') ? fCallback : () => {};
		let tmpSelf = this;

		if (!pPath)
		{
			return tmpCallback('No path specified');
		}

		let tmpProvider = this.pict.providers['ContentEditor-Provider'];
		if (!tmpProvider)
		{
			return tmpCallback('Provider not available');
		}

		tmpProvider.loadFile(pPath, (pError, pContent) =>
		{
			if (pError)
			{
				// If the default file doesn't exist, that's OK — show empty state
				tmpSelf._topics = {};
				tmpSelf._topicsFilePath = '';
				if (tmpSelf._hasRendered)
				{
					tmpSelf._showEmptyState();
				}
				return tmpCallback(pError);
			}

			try
			{
				let tmpParsed = JSON.parse(pContent);
				if (typeof (tmpParsed) === 'object' && tmpParsed !== null && !Array.isArray(tmpParsed))
				{
					tmpSelf._topics = tmpParsed;
				}
				else
				{
					tmpSelf._topics = {};
				}
			}
			catch (pParseError)
			{
				tmpSelf._topics = {};
				tmpSelf.log.warn('ContentEditor-Topics: Failed to parse topics JSON: ' + pParseError.message);
			}

			tmpSelf._topicsFilePath = pPath;

			// Persist the path in settings
			tmpSelf.pict.AppData.ContentEditor.TopicsFilePath = pPath;
			tmpSelf.pict.PictApplication.saveSettings();

			if (tmpSelf._hasRendered)
			{
				tmpSelf._updateHeaderTitle();
				tmpSelf.renderTopicList();
				tmpSelf._showFooter(true);
			}

			return tmpCallback(null);
		});
	}

	/**
	 * Save the current topics object back to the server.
	 *
	 * @param {Function} [fCallback] - Optional callback (error)
	 */
	saveTopicsFile(fCallback)
	{
		let tmpCallback = (typeof (fCallback) === 'function') ? fCallback : () => {};

		if (!this._topicsFilePath)
		{
			return tmpCallback('No topics file loaded');
		}

		let tmpProvider = this.pict.providers['ContentEditor-Provider'];
		if (!tmpProvider)
		{
			return tmpCallback('Provider not available');
		}

		let tmpContent = JSON.stringify(this._topics, null, '\t');
		tmpProvider.saveFile(this._topicsFilePath, tmpContent, tmpCallback);
	}

	/**
	 * Close the currently loaded topics file.
	 */
	closeTopicsFile()
	{
		this._topics = {};
		this._topicsFilePath = '';
		this._editingTopicCode = null;

		this.pict.AppData.ContentEditor.TopicsFilePath = '';
		this.pict.PictApplication.saveSettings();

		if (this._hasRendered)
		{
			this._showEmptyState();
		}
	}

	/**
	 * Add a new topic entry.
	 *
	 * @param {Object} [pTopicData] - Optional pre-filled topic data
	 */
	addTopic(pTopicData)
	{
		if (!this._topicsFilePath)
		{
			// If no file loaded, create the default one
			this._createDefaultTopicsFile(() =>
			{
				this.addTopic(pTopicData);
			});
			return;
		}

		let tmpData = pTopicData || {};
		let tmpCode = tmpData.TopicCode || this._generateUniqueCode('New-Topic');

		let tmpTopic =
		{
			TopicCode: tmpCode,
			TopicHelpFilePath: tmpData.TopicHelpFilePath || '',
			TopicTitle: tmpData.TopicTitle || ''
		};

		if (typeof (tmpData.RelevantMarkdownLine) === 'number')
		{
			tmpTopic.RelevantMarkdownLine = tmpData.RelevantMarkdownLine;
		}

		this._topics[tmpCode] = tmpTopic;

		let tmpSelf = this;
		this.saveTopicsFile(() =>
		{
			tmpSelf.renderTopicList();
			tmpSelf.startEditTopic(tmpCode);
		});
	}

	/**
	 * Remove a topic entry after confirmation.
	 *
	 * @param {string} pTopicCode - The TopicCode to remove
	 */
	removeTopic(pTopicCode)
	{
		if (!pTopicCode || !this._topics[pTopicCode])
		{
			return;
		}

		if (!confirm('Remove topic "' + pTopicCode + '"?'))
		{
			return;
		}

		delete this._topics[pTopicCode];
		this._editingTopicCode = null;

		let tmpSelf = this;
		this.saveTopicsFile(() =>
		{
			tmpSelf.renderTopicList();
		});
	}

	/**
	 * Switch a topic row into inline edit mode.
	 *
	 * @param {string} pTopicCode - The TopicCode to edit
	 */
	startEditTopic(pTopicCode)
	{
		if (!pTopicCode || !this._topics[pTopicCode])
		{
			return;
		}

		this._editingTopicCode = pTopicCode;
		this.renderTopicList();

		// Focus the first input field
		let tmpInput = this.pict.ContentAssignment.getElement('#topics-edit-code')[0];
		if (tmpInput)
		{
			tmpInput.focus();
			tmpInput.select();
		}
	}

	/**
	 * Save the inline edit form values back into the topics object.
	 *
	 * @param {string} pOriginalCode - The original TopicCode being edited
	 */
	saveEditTopic(pOriginalCode)
	{
		if (!pOriginalCode || !this._topics[pOriginalCode])
		{
			return;
		}

		let tmpCodeInput = this.pict.ContentAssignment.getElement('#topics-edit-code')[0];
		let tmpTitleInput = this.pict.ContentAssignment.getElement('#topics-edit-title')[0];
		let tmpPathInput = this.pict.ContentAssignment.getElement('#topics-edit-path')[0];
		let tmpLineInput = this.pict.ContentAssignment.getElement('#topics-edit-line')[0];

		if (!tmpCodeInput)
		{
			return;
		}

		let tmpNewCode = tmpCodeInput.value.trim();
		let tmpNewTitle = tmpTitleInput ? tmpTitleInput.value.trim() : '';
		let tmpNewPath = tmpPathInput ? tmpPathInput.value.trim() : '';
		let tmpNewLine = tmpLineInput ? parseInt(tmpLineInput.value, 10) : NaN;

		// Validate: TopicCode must not be empty
		if (!tmpNewCode)
		{
			tmpCodeInput.style.borderColor = 'var(--theme-color-status-error, #D9534F)';
			return;
		}

		// Validate: if code changed, it must be unique
		if (tmpNewCode !== pOriginalCode && this._topics[tmpNewCode])
		{
			tmpCodeInput.style.borderColor = 'var(--theme-color-status-error, #D9534F)';
			alert('A topic with code "' + tmpNewCode + '" already exists.');
			return;
		}

		// Remove the old entry if the code changed
		if (tmpNewCode !== pOriginalCode)
		{
			delete this._topics[pOriginalCode];
		}

		let tmpTopic =
		{
			TopicCode: tmpNewCode,
			TopicHelpFilePath: tmpNewPath,
			TopicTitle: tmpNewTitle
		};

		if (!isNaN(tmpNewLine) && tmpNewLine > 0)
		{
			tmpTopic.RelevantMarkdownLine = tmpNewLine;
		}

		this._topics[tmpNewCode] = tmpTopic;
		this._editingTopicCode = null;

		let tmpSelf = this;
		this.saveTopicsFile(() =>
		{
			tmpSelf.renderTopicList();
		});
	}

	/**
	 * Cancel inline editing and re-render the list.
	 */
	cancelEditTopic()
	{
		this._editingTopicCode = null;
		this.renderTopicList();
	}

	/**
	 * Navigate to a topic's file in the editor, scrolling to
	 * RelevantMarkdownLine if present.
	 *
	 * @param {string} pTopicCode - The TopicCode to navigate to
	 */
	navigateToTopic(pTopicCode)
	{
		if (!pTopicCode || !this._topics[pTopicCode])
		{
			return;
		}

		let tmpTopic = this._topics[pTopicCode];
		let tmpFilePath = tmpTopic.TopicHelpFilePath;

		if (!tmpFilePath)
		{
			return;
		}

		this.pict.PictApplication.navigateToFile(tmpFilePath);

		// If there's a RelevantMarkdownLine, scroll to it after a brief delay
		// to allow the editor to render
		if (typeof (tmpTopic.RelevantMarkdownLine) === 'number' && tmpTopic.RelevantMarkdownLine > 0)
		{
			let tmpLine = tmpTopic.RelevantMarkdownLine;
			setTimeout(() =>
			{
				let tmpEditorView = this.pict.views['ContentEditor-MarkdownEditor'];
				if (tmpEditorView && tmpEditorView._segmentEditors)
				{
					// Find the segment and line to scroll to
					let tmpRunningLines = 0;
					for (let tmpKey in tmpEditorView._segmentEditors)
					{
						let tmpEditor = tmpEditorView._segmentEditors[tmpKey];
						if (tmpEditor && tmpEditor.state && tmpEditor.state.doc)
						{
							let tmpSegmentLines = tmpEditor.state.doc.lines;
							if (tmpRunningLines + tmpSegmentLines >= tmpLine)
							{
								// This segment contains the target line
								let tmpLocalLine = tmpLine - tmpRunningLines;
								if (tmpLocalLine < 1) tmpLocalLine = 1;
								if (tmpLocalLine > tmpSegmentLines) tmpLocalLine = tmpSegmentLines;
								let tmpLineInfo = tmpEditor.state.doc.line(tmpLocalLine);
								tmpEditor.dispatch({
									selection: { anchor: tmpLineInfo.from },
									scrollIntoView: true
								});
								tmpEditor.focus();
								break;
							}
							tmpRunningLines += tmpSegmentLines;
						}
					}
				}
			}, 500);
		}
	}

	/**
	 * Rebuild the topic list innerHTML from this._topics.
	 */
	renderTopicList()
	{
		let tmpListEl = this.pict.ContentAssignment.getElement('#ContentEditor-Topics-List')[0];
		if (!tmpListEl)
		{
			return;
		}

		let tmpKeys = Object.keys(this._topics);

		if (tmpKeys.length === 0)
		{
			this.pict.ContentAssignment.assignContent('#ContentEditor-Topics-List', this.pict.parseTemplateByHash('Topics-EmptyList-Template', {}));
			return;
		}

		let tmpHTML = '';
		let tmpViewRef = this.pict.PictApplication.pict_configuration.Pict + '.views[\'' + this.Hash + '\']';

		for (let i = 0; i < tmpKeys.length; i++)
		{
			let tmpCode = tmpKeys[i];
			let tmpTopic = this._topics[tmpCode];

			let tmpEscapedCode = this._escapeHTML(tmpTopic.TopicCode || '');
			let tmpAttrEscaped = this._escapeAttr(tmpTopic.TopicCode || '');
			let tmpEscapedTitle = this._escapeHTML(tmpTopic.TopicTitle || '');
			let tmpEscapedPath = this._escapeHTML(tmpTopic.TopicHelpFilePath || '');
			let tmpLineNum = (typeof (tmpTopic.RelevantMarkdownLine) === 'number') ? tmpTopic.RelevantMarkdownLine : '';
			let tmpLineStr = (typeof (tmpTopic.RelevantMarkdownLine) === 'number') ? ' :' + tmpTopic.RelevantMarkdownLine : '';
			let tmpAttrEscapedPath = this._escapeAttr(tmpTopic.TopicHelpFilePath || '');
			let tmpAttrEscapedOrigCode = this._escapeAttr(tmpTopic.TopicCode || '');

			let tmpNavigateBtnHTML = '';
			if (tmpTopic.TopicHelpFilePath)
			{
				tmpNavigateBtnHTML = '<button class="topics-row-btn" title="Go to file" onclick="event.stopPropagation();' + tmpViewRef + '.navigateToTopic(\'' + tmpAttrEscaped + '\')">' + this.pict.icon('ArrowRight') + '</button>';
			}

			let tmpRecord =
			{
				ViewHash: this.Hash,
				Code: tmpEscapedCode,
				CodeEscaped: tmpAttrEscaped,
				Title: tmpEscapedTitle,
				PathDisplay: tmpEscapedPath + tmpLineStr,
				Path: tmpAttrEscapedPath,
				Line: tmpLineNum,
				OriginalCode: tmpAttrEscapedOrigCode,
				NavigateButton: tmpNavigateBtnHTML
			};

			if (this._editingTopicCode === tmpCode)
			{
				// Render inline edit form
				tmpHTML += this.pict.parseTemplateByHash('Topics-EditForm-Template', tmpRecord);
			}
			else
			{
				// Render topic row
				tmpHTML += this.pict.parseTemplateByHash('Topics-Row-Template', tmpRecord);
			}
		}

		this.pict.ContentAssignment.assignContent('#ContentEditor-Topics-List', tmpHTML);
	}

	/**
	 * Show the empty state (no topics file loaded).
	 */
	_showEmptyState()
	{
		let tmpContainer = this.pict.ContentAssignment.getElement('#ContentEditor-Topics-Container')[0];
		if (!tmpContainer)
		{
			// If the container doesn't exist yet, just render the whole view
			let tmpDestination = this.pict.ContentAssignment.getElement('#ContentEditor-SidebarTopics-Container')[0];
			if (tmpDestination)
			{
				this.pict.ContentAssignment.assignContent('#ContentEditor-SidebarTopics-Container', this.pict.parseTemplateByHash('Topics-Empty-Template', { ViewHash: this.Hash }));
			}
			return;
		}

		this.pict.ContentAssignment.assignContent('#ContentEditor-Topics-Container', this.pict.parseTemplateByHash('Topics-Empty-Template', { ViewHash: this.Hash }));
	}

	/**
	 * Attempt to load the default topics file (.pict_documentation_topics.json).
	 * If it doesn't exist, create it.
	 */
	loadDefaultTopicsFile()
	{
		let tmpSelf = this;
		let tmpDefaultPath = '.pict_documentation_topics.json';

		this.loadTopicsFile(tmpDefaultPath, (pError) =>
		{
			if (pError)
			{
				// File doesn't exist — create it
				tmpSelf._createDefaultTopicsFile();
			}
		});
	}

	/**
	 * Prompt the user for a custom topics file path.
	 */
	promptSelectTopicsFile()
	{
		let tmpPath = prompt('Enter the path to a topics JSON file:', '.pict_documentation_topics.json');
		if (tmpPath && tmpPath.trim())
		{
			let tmpSelf = this;
			this.loadTopicsFile(tmpPath.trim(), (pError) =>
			{
				if (pError)
				{
					// File doesn't exist — offer to create it
					if (confirm('File not found. Create "' + tmpPath.trim() + '"?'))
					{
						tmpSelf._topicsFilePath = tmpPath.trim();
						tmpSelf._topics = {};
						tmpSelf.pict.AppData.ContentEditor.TopicsFilePath = tmpPath.trim();
						tmpSelf.pict.PictApplication.saveSettings();
						tmpSelf.saveTopicsFile(() =>
						{
							if (tmpSelf._hasRendered)
							{
								tmpSelf.render();
							}
						});
					}
				}
			});
		}
	}

	/**
	 * Create the default topics file with empty contents.
	 *
	 * @param {Function} [fCallback] - Optional callback when done
	 */
	_createDefaultTopicsFile(fCallback)
	{
		let tmpCallback = (typeof (fCallback) === 'function') ? fCallback : () => {};
		let tmpSelf = this;
		let tmpDefaultPath = '.pict_documentation_topics.json';

		this._topicsFilePath = tmpDefaultPath;
		this._topics = {};

		this.pict.AppData.ContentEditor.TopicsFilePath = tmpDefaultPath;
		this.pict.PictApplication.saveSettings();

		this.saveTopicsFile(() =>
		{
			if (tmpSelf._hasRendered)
			{
				tmpSelf.render();
			}
			tmpCallback();
		});
	}

	/**
	 * Update the header title bar with the current file name.
	 */
	_updateHeaderTitle()
	{
		let tmpTitle = this.pict.ContentAssignment.getElement('#ContentEditor-Topics-HeaderTitle')[0];
		if (tmpTitle)
		{
			let tmpFileName = this._topicsFilePath.replace(/^.*\//, '');
			tmpTitle.textContent = tmpFileName || 'Topics';
			tmpTitle.title = this._topicsFilePath;
		}
	}

	/**
	 * Show or hide the footer (add button area).
	 *
	 * @param {boolean} pShow
	 */
	_showFooter(pShow)
	{
		let tmpFooter = this.pict.ContentAssignment.getElement('#ContentEditor-Topics-Footer')[0];
		if (tmpFooter)
		{
			tmpFooter.style.display = pShow ? '' : 'none';
		}
	}

	/**
	 * Generate a unique topic code by appending a suffix if needed.
	 *
	 * @param {string} pBase - The base code
	 * @returns {string} A unique code
	 */
	_generateUniqueCode(pBase)
	{
		if (!this._topics[pBase])
		{
			return pBase;
		}

		let tmpCounter = 2;
		while (this._topics[pBase + '-' + tmpCounter])
		{
			tmpCounter++;
		}
		return pBase + '-' + tmpCounter;
	}

	/**
	 * HTML-escape a string for safe insertion.
	 *
	 * @param {string} pStr
	 * @returns {string}
	 */
	_escapeHTML(pStr)
	{
		return String(pStr)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	/**
	 * Escape a string for use in an HTML attribute value.
	 *
	 * @param {string} pStr
	 * @returns {string}
	 */
	_escapeAttr(pStr)
	{
		return String(pStr)
			.replace(/&/g, '&amp;')
			.replace(/'/g, '&#39;')
			.replace(/"/g, '&quot;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}
}

module.exports = ContentEditorTopicsView;

module.exports.default_configuration = _ViewConfiguration;
