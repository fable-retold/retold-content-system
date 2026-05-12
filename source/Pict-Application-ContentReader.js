const libDocuserveApplication = require('pict-docuserve');
const libPictSectionCode      = require('pict-section-code');
const libContentSystemBrand   = require('./ContentSystem-Brand.js');

/**
 * Content Reader Application
 *
 * Extends pict-docuserve to serve standalone markdown content.
 * Overrides DocsBaseURL to point at the /content/ static route
 * so all markdown is fetched from the server's content directory.
 *
 * Also registers pict-section-code's bundled demos with the docuserve
 * Demos provider so they appear under "Demos" in the sidebar when the
 * user navigates to the pict-section-code module.
 */
class ContentReaderApplication extends libDocuserveApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		// Pass the host's brand block through to pict-docuserve so the
		// docs page wears the same wordmark / colors as the main editor.
		// DocuserveApplication's constructor reads pOptions.Brand and
		// hands it to Theme-Section.
		let tmpOptions = Object.assign({}, pOptions || {}, { Brand: libContentSystemBrand });
		super(pFable, tmpOptions, pServiceHash);

		// Register the canary demos.  Silent no-op if Docuserve-Demos
		// provider isn't available (older pict-docuserve versions).
		if (typeof libPictSectionCode.registerWithDocuserve === 'function')
		{
			libPictSectionCode.registerWithDocuserve(this.pict);
		}
	}

	onAfterInitializeAsync(fCallback)
	{
		// Point docuserve at the /content/ path served by Orator
		this.pict.AppData.Docuserve =
		{
			CatalogLoaded: false,
			Catalog: null,
			CoverLoaded: false,
			Cover: null,
			SidebarLoaded: false,
			SidebarGroups: [],
			TopBarLoaded: false,
			TopBar: null,
			ErrorPageLoaded: false,
			ErrorPageHTML: null,
			KeywordIndexLoaded: false,
			KeywordDocumentCount: 0,
			CurrentGroup: '',
			CurrentModule: '',
			CurrentPath: '',
			SidebarVisible: true,
			// Serve content from the /content/ static route
			DocsBaseURL: '/content/',
			// No catalog in standalone mode
			CatalogURL: '/content/retold-catalog.json'
		};

		// Load the catalog (will gracefully fall back to standalone mode)
		let tmpDocProvider = this.pict.providers['Docuserve-Documentation'];
		tmpDocProvider.loadCatalog(() =>
		{
			// Set page title from cover or topbar
			let tmpDocuserve = this.pict.AppData.Docuserve;
			if (tmpDocuserve.CoverLoaded && tmpDocuserve.Cover && tmpDocuserve.Cover.Title)
			{
				document.title = tmpDocuserve.Cover.Title.replace(/<[^>]*>/g, '');
			}
			else if (tmpDocuserve.TopBarLoaded && tmpDocuserve.TopBar && tmpDocuserve.TopBar.Brand)
			{
				document.title = tmpDocuserve.TopBar.Brand.replace(/<[^>]*>/g, '');
			}

			// Inject an "Edit" link into the topbar (shows in ExternalLinks area, top-right)
			if (tmpDocuserve.TopBar)
			{
				if (!Array.isArray(tmpDocuserve.TopBar.ExternalLinks))
				{
					tmpDocuserve.TopBar.ExternalLinks = [];
				}
				tmpDocuserve.TopBar.ExternalLinks.push({ Text: 'Edit', Href: '/' });
			}
			else
			{
				tmpDocuserve.TopBarLoaded = true;
				tmpDocuserve.TopBar =
				{
					Brand: 'Content System',
					NavLinks: [],
					ExternalLinks: [{ Text: 'Edit', Href: '/' }]
				};
			}

			// Render the layout shell
			this.pict.views['Docuserve-Layout'].render();

			// Call the base PictApplication callback (skip docuserve's onAfterInitializeAsync
			// since we already did the catalog loading ourselves)
			return fCallback();
		});
	}
}

module.exports = ContentReaderApplication;

module.exports.default_configuration = require('./Pict-Application-ContentReader-Configuration.json');
