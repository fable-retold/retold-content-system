/*
	Unit tests for the retold-content-system Excalidraw editor view wiring.

	These tests focus on the pure-data helpers — path resolution, scene
	parsing, image extraction/inlining, embed-signature sniffing.  Methods
	that touch the DOM or React (mount, render, destroy) are exercised at
	the pict-section-excalidraw level; here we just verify the content-system
	wrapping is correct.
*/

const Chai = require('chai');
const Expect = Chai.expect;

const libView = require('../source/views/PictView-Editor-ExcalidrawEditor.js');

// Many helpers can be exercised against a stand-in `this` via .call() —
// they use `this` only for log access and for cross-calling sibling
// helpers.  Provide a stand-in that exposes the helpers as bound methods.
const fakeLogger = { trace: () => {}, info: () => {}, warn: () => {}, error: () => {} };
const ctx = {
	log: fakeLogger,
	_mimeToExtension: libView.prototype._mimeToExtension,
	_resolveBothPaths: libView.prototype._resolveBothPaths,
	_parseJsonScene:   libView.prototype._parseJsonScene
};

suite
(
	'PictView-Editor-ExcalidrawEditor (retold-content-system wrapping)',
	() =>
	{
		setup(() => { });

		suite
		(
			'Module Exports',
			() =>
			{
				test('Default export is a class', (fDone) =>
				{
					Expect(libView).to.be.a('function');
					return fDone();
				});

				test('default_configuration is published', (fDone) =>
				{
					Expect(libView.default_configuration).to.be.an('object');
					Expect(libView.default_configuration).to.have.property('ViewIdentifier', 'ContentEditor-ExcalidrawEditor');
					Expect(libView.default_configuration).to.have.property('EmbedMode', 'react');
					Expect(libView.default_configuration).to.have.property('AssetBaseURL');
					return fDone();
				});

				test('svgHasEmbeddedScene is exposed as a static helper', (fDone) =>
				{
					Expect(libView.svgHasEmbeddedScene).to.be.a('function');
					return fDone();
				});
			}
		);

		suite
		(
			'_resolveBothPaths',
			() =>
			{
				const resolve = libView.prototype._resolveBothPaths;

				test('canonical .excalidraw.svg input → canonical pair', (fDone) =>
				{
					let tmp = resolve.call(ctx, 'docs/architecture.excalidraw.svg');
					Expect(tmp).to.deep.equal({
						svgPath:  'docs/architecture.excalidraw.svg',
						jsonPath: 'docs/architecture.excalidraw.json'
					});
					return fDone();
				});

				test('canonical .excalidraw.json input → canonical pair', (fDone) =>
				{
					let tmp = resolve.call(ctx, 'docs/architecture.excalidraw.json');
					Expect(tmp).to.deep.equal({
						svgPath:  'docs/architecture.excalidraw.svg',
						jsonPath: 'docs/architecture.excalidraw.json'
					});
					return fDone();
				});

				test('legacy bare .excalidraw input → canonical pair', (fDone) =>
				{
					let tmp = resolve.call(ctx, 'docs/architecture.excalidraw');
					Expect(tmp).to.deep.equal({
						svgPath:  'docs/architecture.excalidraw.svg',
						jsonPath: 'docs/architecture.excalidraw.json'
					});
					return fDone();
				});

				test('case-insensitive extension matching', (fDone) =>
				{
					let tmp = resolve.call(ctx, 'docs/Foo.EXCALIDRAW.SVG');
					Expect(tmp.svgPath).to.equal('docs/Foo.excalidraw.svg');
					Expect(tmp.jsonPath).to.equal('docs/Foo.excalidraw.json');
					return fDone();
				});

				test('paths in subdirectories keep their parents', (fDone) =>
				{
					let tmp = resolve.call(ctx, 'a/b/c/diagram.excalidraw.svg');
					Expect(tmp.svgPath).to.equal('a/b/c/diagram.excalidraw.svg');
					Expect(tmp.jsonPath).to.equal('a/b/c/diagram.excalidraw.json');
					return fDone();
				});

				test('unknown extension → appended canonical suffixes', (fDone) =>
				{
					let tmp = resolve.call(ctx, 'docs/whatever.txt');
					Expect(tmp.svgPath).to.equal('docs/whatever.txt.excalidraw.svg');
					Expect(tmp.jsonPath).to.equal('docs/whatever.txt.excalidraw.json');
					return fDone();
				});

				test('null / empty input → null', (fDone) =>
				{
					Expect(resolve.call(ctx, null)).to.equal(null);
					Expect(resolve.call(ctx, '')).to.equal(null);
					return fDone();
				});
			}
		);

		suite
		(
			'_parseJsonScene',
			() =>
			{
				const parse = libView.prototype._parseJsonScene;

				test('valid scene JSON → parsed scene', (fDone) =>
				{
					let tmpRaw = JSON.stringify({
						type: 'excalidraw', version: 2,
						elements: [{ id: 'a' }, { id: 'b' }],
						appState: { theme: 'dark' },
						files: { fileA: { id: 'fileA' } }
					});
					let tmp = parse.call(ctx, tmpRaw);
					Expect(tmp.elements).to.have.length(2);
					Expect(tmp.appState).to.have.property('theme', 'dark');
					Expect(tmp.files).to.have.property('fileA');
					return fDone();
				});

				test('empty input → empty scene', (fDone) =>
				{
					let tmp = parse.call(ctx, '');
					Expect(tmp.elements).to.deep.equal([]);
					Expect(tmp.appState).to.deep.equal({});
					Expect(tmp.files).to.deep.equal({});
					return fDone();
				});

				test('malformed JSON → empty scene + logged error', (fDone) =>
				{
					let tmp = parse.call(ctx, '{not json');
					Expect(tmp.elements).to.deep.equal([]);
					return fDone();
				});

				test('scene with missing fields fills defaults', (fDone) =>
				{
					let tmp = parse.call(ctx, JSON.stringify({ type: 'excalidraw' }));
					Expect(tmp.elements).to.deep.equal([]);
					Expect(tmp.appState).to.deep.equal({});
					Expect(tmp.files).to.deep.equal({});
					return fDone();
				});
			}
		);

		suite
		(
			'_mimeToExtension',
			() =>
			{
				const m = libView.prototype._mimeToExtension;

				test('known image types', (fDone) =>
				{
					Expect(m.call(ctx, 'image/png')).to.equal('.png');
					Expect(m.call(ctx, 'image/jpeg')).to.equal('.jpg');
					Expect(m.call(ctx, 'image/gif')).to.equal('.gif');
					Expect(m.call(ctx, 'image/webp')).to.equal('.webp');
					Expect(m.call(ctx, 'image/svg+xml')).to.equal('.svg');
					return fDone();
				});

				test('unknown mime → .bin', (fDone) =>
				{
					Expect(m.call(ctx, 'application/x-weird')).to.equal('.bin');
					Expect(m.call(ctx, undefined)).to.equal('.bin');
					return fDone();
				});
			}
		);

		suite
		(
			'_extractImagesToSidecars',
			() =>
			{
				const extract = libView.prototype._extractImagesToSidecars;

				test('files with base64 dataURLs are extracted to writes', (fDone) =>
				{
					let tmpFiles = {
						'fileA':
						{
							id: 'fileA',
							dataURL: 'data:image/png;base64,iVBORw0KGgo=',
							mimeType: 'image/png',
							created: 100
						}
					};
					let tmp = extract.call(ctx, tmpFiles, 'mydiagram.excalidraw-files');
					Expect(tmp.writes).to.have.length(1);
					Expect(tmp.writes[0].path).to.equal('mydiagram.excalidraw-files/fileA.png');
					Expect(tmp.writes[0].base64).to.equal('iVBORw0KGgo=');
					Expect(tmp.writes[0].mimeType).to.equal('image/png');
					Expect(tmp.slim.fileA).to.have.property('_sidecar', 'fileA.png');
					Expect(tmp.slim.fileA).to.not.have.property('dataURL');
					return fDone();
				});

				test('files without dataURLs pass through untouched', (fDone) =>
				{
					let tmpFiles = {
						'fileB':
						{
							id: 'fileB',
							_sidecar: 'fileB.png',
							mimeType: 'image/png',
							created: 100
						}
					};
					let tmp = extract.call(ctx, tmpFiles, 'mydiagram.excalidraw-files');
					Expect(tmp.writes).to.have.length(0);
					Expect(tmp.slim.fileB).to.have.property('_sidecar', 'fileB.png');
					return fDone();
				});

				test('multiple files extract independently', (fDone) =>
				{
					let tmpFiles = {
						'A': { id: 'A', dataURL: 'data:image/png;base64,XXX', mimeType: 'image/png', created: 1 },
						'B': { id: 'B', dataURL: 'data:image/jpeg;base64,YYY', mimeType: 'image/jpeg', created: 2 }
					};
					let tmp = extract.call(ctx, tmpFiles, 'folder');
					Expect(tmp.writes).to.have.length(2);
					let tmpExts = tmp.writes.map(w => w.path.replace(/^.*\./, '')).sort();
					Expect(tmpExts).to.deep.equal(['jpg', 'png']);
					return fDone();
				});

				test('empty / missing inputs return empty results', (fDone) =>
				{
					let tmpEmpty = extract.call(ctx, {}, 'folder');
					Expect(tmpEmpty.writes).to.have.length(0);
					Expect(tmpEmpty.slim).to.deep.equal({});

					let tmpNull = extract.call(ctx, null, 'folder');
					Expect(tmpNull.writes).to.have.length(0);

					let tmpNoFolder = extract.call(ctx, { 'x': { dataURL: 'data:image/png;base64,ZZZ' } }, null);
					Expect(tmpNoFolder.writes).to.have.length(0);
					return fDone();
				});
			}
		);

		suite
		(
			'svgHasEmbeddedScene',
			() =>
			{
				const sniff = libView.svgHasEmbeddedScene;

				test('SVG with excalidraw-data signature → true', (fDone) =>
				{
					let tmp = '<svg><metadata><excalidraw-data payload-version="2">' +
						'{"type":"excalidraw"}</excalidraw-data></metadata></svg>';
					Expect(sniff(tmp)).to.equal(true);
					return fDone();
				});

				test('SVG with payload-type / payload-version markers → true', (fDone) =>
				{
					let tmp = '<svg><metadata><something payload-type="excalidraw">…</something></metadata></svg>';
					Expect(sniff(tmp)).to.equal(true);
					return fDone();
				});

				test('plain SVG without Excalidraw signature → false', (fDone) =>
				{
					let tmp = '<svg viewBox="0 0 100 100"><rect width="50" height="50"/></svg>';
					Expect(sniff(tmp)).to.equal(false);
					return fDone();
				});

				test('non-string input → false', (fDone) =>
				{
					Expect(sniff(null)).to.equal(false);
					Expect(sniff(undefined)).to.equal(false);
					Expect(sniff(42)).to.equal(false);
					return fDone();
				});

				test('empty input → false', (fDone) =>
				{
					Expect(sniff('')).to.equal(false);
					return fDone();
				});
			}
		);
	}
);
