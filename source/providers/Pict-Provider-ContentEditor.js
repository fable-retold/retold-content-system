const libPictProvider = require('pict-provider');

/**
 * Content Editor Provider
 *
 * Handles communication with the server's REST API for content
 * management: reading/saving markdown and uploading images.
 * File listing is handled by pict-section-filebrowser via the FileBrowserService API.
 */
class ContentEditorProvider extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	/**
	 * Load the raw markdown content of a file.
	 *
	 * @param {string} pFilePath - The relative file path
	 * @param {Function} fCallback - Callback receiving (error, contentString)
	 */
	loadFile(pFilePath, fCallback)
	{
		let tmpCallback = (typeof (fCallback) === 'function') ? fCallback : () => {};

		if (!pFilePath)
		{
			return tmpCallback('No file path specified', '');
		}

		fetch('/api/content/read/' + pFilePath.split('/').map(encodeURIComponent).join('/'))
			.then((pResponse) =>
			{
				if (!pResponse.ok)
				{
					return tmpCallback('File not found: ' + pResponse.status, '');
				}
				return pResponse.json();
			})
			.then((pData) =>
			{
				if (pData && pData.Success)
				{
					return tmpCallback(null, pData.Content || '');
				}
				return tmpCallback(pData ? pData.Error : 'Unknown error', '');
			})
			.catch((pError) =>
			{
				this.log.warn(`ContentEditor: Error loading file [${pFilePath}]: ${pError}`);
				return tmpCallback(pError.message, '');
			});
	}

	/**
	 * Save markdown content to a file.
	 *
	 * @param {string} pFilePath - The relative file path
	 * @param {string} pContent - The markdown content to save
	 * @param {Function} fCallback - Callback receiving (error)
	 */
	saveFile(pFilePath, pContent, fCallback)
	{
		let tmpCallback = (typeof (fCallback) === 'function') ? fCallback : () => {};

		if (!pFilePath)
		{
			return tmpCallback('No file path specified');
		}

		fetch('/api/content/save/' + pFilePath.split('/').map(encodeURIComponent).join('/'),
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ Content: pContent })
			})
			.then((pResponse) =>
			{
				if (!pResponse.ok)
				{
					return tmpCallback('Save failed: ' + pResponse.status);
				}
				return pResponse.json();
			})
			.then((pData) =>
			{
				if (pData && pData.Success)
				{
					return tmpCallback(null);
				}
				return tmpCallback(pData ? pData.Error : 'Unknown error');
			})
			.catch((pError) =>
			{
				this.log.warn(`ContentEditor: Error saving file [${pFilePath}]: ${pError}`);
				return tmpCallback(pError.message);
			});
	}

	/**
	 * Upload an image file to the server.
	 *
	 * The image is saved into the content folder the user is currently
	 * browsing, determined from the current file path or browse location.
	 *
	 * @param {File} pFile - The image file to upload
	 * @param {Function} fCallback - Callback receiving (error, url)
	 */
	uploadImage(pFile, fCallback)
	{
		let tmpCallback = (typeof (fCallback) === 'function') ? fCallback : () => {};

		// Determine the target folder from the currently open file
		let tmpUploadPath = '';
		let tmpCurrentFile = this.pict.AppData.ContentEditor.CurrentFile;
		if (tmpCurrentFile)
		{
			let tmpLastSlash = tmpCurrentFile.lastIndexOf('/');
			if (tmpLastSlash > 0)
			{
				tmpUploadPath = tmpCurrentFile.substring(0, tmpLastSlash);
			}
		}
		else if (this.pict.AppData.PictFileBrowser && this.pict.AppData.PictFileBrowser.CurrentLocation)
		{
			tmpUploadPath = this.pict.AppData.PictFileBrowser.CurrentLocation;
		}

		let tmpHeaders =
		{
			'Content-Type': pFile.type,
			'x-filename': pFile.name
		};

		if (tmpUploadPath)
		{
			tmpHeaders['x-upload-path'] = tmpUploadPath;
		}

		fetch('/api/content/upload-image',
			{
				method: 'POST',
				body: pFile,
				headers: tmpHeaders
			})
			.then((pResponse) => pResponse.json())
			.then((pData) =>
			{
				if (pData && pData.Success && pData.URL)
				{
					return tmpCallback(null, pData.URL);
				}
				return tmpCallback(pData ? pData.Error : 'Upload failed');
			})
			.catch((pError) =>
			{
				this.log.warn(`ContentEditor: Image upload failed: ${pError}`);
				return tmpCallback(pError.message);
			});
	}

}

module.exports = ContentEditorProvider;

module.exports.default_configuration =
{
	ProviderIdentifier: "ContentEditor-Provider",

	AutoInitialize: true,
	AutoInitializeOrdinal: 0
};
