/**
 * PictView-Editor-Login — full-viewport login overlay for retold-content-system
 *
 * Same pattern as facto's PictView-Facto-Login: renders a full-viewport
 * overlay div containing `#Pict-Login-Container` (the default mount
 * point for pict-section-login).  The boot gate in
 * Pict-Application-ContentEditor.js toggles the `.is-active` class to
 * show / hide.  Stacks on top of the editor shell with z-index 9999.
 */

const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: 'ContentEditor-Login',
	AutoInitialize: true,
	AutoRender: false,

	DefaultRenderable: 'ContentEditor-Login-Overlay',
	DefaultDestinationAddress: '#ContentEditor-Login-Overlay',

	Templates:
	[
		{
			Hash: 'ContentEditor-Login-Overlay-Template',
			Template: /*html*/`
<div class="content-editor-login-overlay-card">
	<div id="Pict-Login-Container"></div>
</div>`
		}
	],

	Renderables:
	[
		{
			RenderableHash: 'ContentEditor-Login-Overlay',
			TemplateHash: 'ContentEditor-Login-Overlay-Template',
			ContentDestinationAddress: '#ContentEditor-Login-Overlay',
			RenderMethod: 'replace'
		}
	],

	CSS: /*css*/`
		#ContentEditor-Login-Overlay
		{
			position: fixed;
			inset: 0;
			z-index: 9999;
			display: none;
			background: rgba(15, 19, 26, 0.92);
			align-items: center;
			justify-content: center;
			padding: 24px;
			overflow: auto;
		}
		#ContentEditor-Login-Overlay.is-active { display: flex; }
		.content-editor-login-overlay-card { width: 100%; max-width: 420px; }
	`
};

class ContentEditorLoginView extends libPictView
{
	onAfterRender(pRenderable, pAddress, pRecord, pContent)
	{
		let tmpInner = this.pict && this.pict.views && this.pict.views['Pict-Section-Login'];
		if (tmpInner) { tmpInner.render(); }
		this.pict.CSSMap.injectCSS();
		return super.onAfterRender
			? super.onAfterRender(pRenderable, pAddress, pRecord, pContent)
			: undefined;
	}
}

module.exports = ContentEditorLoginView;
module.exports.default_configuration = _ViewConfiguration;
