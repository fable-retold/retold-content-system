const libPictView = require('pict-view');

/**
 * Built-in Markdown reference content.
 *
 * Pre-rendered HTML covering GitHub-Flavored Markdown, KaTeX math,
 * and Mermaid diagrams.  All angle brackets and ampersands inside
 * code blocks are entity-encoded so they render as literal text.
 */
const _MarkdownReferenceContent = /*html*/`
<h2>Headings</h2>
<p>Use <code>#</code> through <code>######</code> for heading levels 1&ndash;6.</p>
<pre><code># Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>Emphasis</h2>
<p>Bold, italic, strikethrough, and combinations.</p>
<pre><code>**bold text**
*italic text*
***bold and italic***
~~strikethrough~~
**bold and ~~strikethrough~~**</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>Inline Code</h2>
<p>Wrap text in backticks for inline code.</p>
<pre><code>Use \`console.log()\` to debug.
Use \`\`double backticks for \`literal\` backticks\`\`.</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>Links</h2>
<p>Inline links, reference links, and autolinks.</p>
<pre><code>[Link text](https://example.com)
[Link with title](https://example.com "Title text")

[Reference link][1]
[1]: https://example.com

Autolink: https://example.com
Email: user@example.com</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>Images</h2>
<pre><code>![Alt text](image.png)
![Alt text](image.png "Image title")

[![Linked image](image.png)](https://example.com)</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>Unordered Lists</h2>
<p>Use <code>-</code>, <code>*</code>, or <code>+</code> for bullet items.</p>
<pre><code>- Item one
- Item two
  - Nested item
  - Another nested
    - Deeply nested
- Item three</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>Ordered Lists</h2>
<pre><code>1. First item
2. Second item
3. Third item
   1. Sub-item A
   2. Sub-item B</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>Task Lists</h2>
<pre><code>- [x] Completed task
- [ ] Incomplete task
- [ ] Another task</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>Blockquotes</h2>
<pre><code>&gt; This is a blockquote.
&gt;
&gt; It can span multiple paragraphs.
&gt;
&gt;&gt; Nested blockquote.</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>Code Blocks</h2>
<p>Use triple backticks with an optional language identifier.</p>
<pre><code>\`\`\`javascript
function hello()
{
    console.log("Hello, world!");
}
\`\`\`

\`\`\`python
def hello():
    print("Hello, world!")
\`\`\`

\`\`\`css
.container {
    display: flex;
    gap: 16px;
}
\`\`\`</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>Tables</h2>
<p>Use pipes and hyphens. Colons control alignment.</p>
<pre><code>| Left Align | Center Align | Right Align |
|:-----------|:------------:|------------:|
| Cell 1     | Cell 2       | Cell 3      |
| Cell 4     | Cell 5       | Cell 6      |</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>Horizontal Rules</h2>
<p>Three or more hyphens, asterisks, or underscores.</p>
<pre><code>---

***

___</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>Footnotes</h2>
<pre><code>Here is a footnote reference[^1] and another[^note].

[^1]: This is the footnote content.
[^note]: Footnotes can have any label.</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>HTML in Markdown</h2>
<p>Raw HTML is allowed in GitHub-Flavored Markdown.</p>
<pre><code>&lt;details&gt;
&lt;summary&gt;Click to expand&lt;/summary&gt;

Hidden content here.

&lt;/details&gt;

&lt;kbd&gt;Ctrl&lt;/kbd&gt; + &lt;kbd&gt;S&lt;/kbd&gt; to save.

&lt;mark&gt;Highlighted text&lt;/mark&gt;

&lt;sup&gt;superscript&lt;/sup&gt; and &lt;sub&gt;subscript&lt;/sub&gt;</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>Escaping Characters</h2>
<p>Backslash-escape special markdown characters.</p>
<pre><code>\\*not italic\\*
\\# not a heading
\\[not a link\\](url)
\\\`not code\\\`</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>Line Breaks</h2>
<pre><code>End a line with two spaces
to create a line break.

Or use a blank line

for a new paragraph.</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>KaTeX &mdash; Inline Math</h2>
<p>Wrap expressions with single dollar signs for inline math.</p>
<pre><code>The equation $E = mc^2$ is famous.

The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.

Greek letters: $\\alpha$, $\\beta$, $\\gamma$, $\\delta$, $\\theta$, $\\pi$.

Subscripts and superscripts: $x_i^2$ and $a_{n+1}$.</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>KaTeX &mdash; Display Math</h2>
<p>Use double dollar signs on their own lines for display (block) math.</p>

<h3>Integral</h3>
<pre><code>$$
\\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}
$$</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h3>Summation</h3>
<pre><code>$$
\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}
$$</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h3>Matrix</h3>
<pre><code>$$
\\begin{bmatrix}
a &amp; b \\\\
c &amp; d
\\end{bmatrix}
\\begin{bmatrix}
x \\\\
y
\\end{bmatrix}
=
\\begin{bmatrix}
ax + by \\\\
cx + dy
\\end{bmatrix}
$$</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h3>Aligned Equations</h3>
<pre><code>$$
\\begin{aligned}
f(x) &amp;= x^2 + 2x + 1 \\\\
     &amp;= (x + 1)^2
\\end{aligned}
$$</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h3>Cases (Piecewise)</h3>
<pre><code>$$
f(x) = \\begin{cases}
x^2  &amp; \\text{if } x \\geq 0 \\\\
-x^2 &amp; \\text{if } x &lt; 0
\\end{cases}
$$</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h3>Fractions &amp; Limits</h3>
<pre><code>$$
\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1
$$</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>Mermaid &mdash; Flowchart</h2>
<pre><code>\`\`\`mermaid
graph TD
    A[Start] --&gt; B{Decision}
    B --&gt;|Yes| C[Do something]
    B --&gt;|No| D[Do something else]
    C --&gt; E[End]
    D --&gt; E
\`\`\`</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>Mermaid &mdash; Sequence Diagram</h2>
<pre><code>\`\`\`mermaid
sequenceDiagram
    participant A as Alice
    participant B as Bob
    A-&gt;&gt;B: Hello Bob
    B--&gt;&gt;A: Hi Alice
    A-&gt;&gt;B: How are you?
    B--&gt;&gt;A: Great!
\`\`\`</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>Mermaid &mdash; Gantt Chart</h2>
<pre><code>\`\`\`mermaid
gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Research    :a1, 2024-01-01, 30d
    Design      :a2, after a1, 20d
    section Phase 2
    Development :b1, after a2, 40d
    Testing     :b2, after b1, 15d
\`\`\`</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>Mermaid &mdash; Class Diagram</h2>
<pre><code>\`\`\`mermaid
classDiagram
    Animal &lt;|-- Duck
    Animal &lt;|-- Fish
    Animal : +int age
    Animal : +String gender
    Animal : +swim()
    Duck : +String beakColor
    Duck : +quack()
    Fish : +int sizeInFeet
    Fish : +canEat()
\`\`\`</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>

<h2>Mermaid &mdash; State Diagram</h2>
<pre><code>\`\`\`mermaid
stateDiagram-v2
    [*] --&gt; Idle
    Idle --&gt; Processing : Start
    Processing --&gt; Done : Complete
    Processing --&gt; Error : Fail
    Error --&gt; Idle : Reset
    Done --&gt; [*]
\`\`\`</code><button class="md-ref-copy-btn" onclick="pict.views['ContentEditor-MarkdownReference'].copyCodeBlock(this)">Copy</button></pre>
`;

const _ViewConfiguration =
{
	ViewIdentifier: "ContentEditor-MarkdownReference",

	DefaultRenderable: "ContentEditor-MarkdownReference-Display",
	DefaultDestinationAddress: "#ContentEditor-SidebarReference-Container",

	AutoRender: false,

	CSS: /*css*/`
		.md-ref-container
		{
			display: flex;
			flex-direction: column;
			height: 100%;
			background: var(--theme-color-background-secondary, #FAF8F4);
		}
		.md-ref-search-bar
		{
			position: sticky;
			top: 0;
			z-index: 5;
			display: flex;
			align-items: center;
			gap: 4px;
			padding: 6px 8px;
			background: var(--theme-color-background-tertiary, #F5F0EA);
			border-bottom: 1px solid var(--theme-color-border-default, #DDD6CA);
			flex-shrink: 0;
		}
		.md-ref-search-input
		{
			flex: 1;
			min-width: 0;
			padding: 5px 8px;
			border: 1px solid var(--theme-color-border-default, #DDD6CA);
			border-radius: 4px;
			font-size: 0.8rem;
			background: var(--theme-color-background-panel, #FFF);
			color: var(--theme-color-text-primary, var(--theme-color-text-primary, #3D3229));
			outline: none;
		}
		.md-ref-search-input:focus
		{
			border-color: var(--theme-color-brand-primary, #2E7D74);
		}
		.md-ref-search-nav
		{
			background: transparent;
			border: 1px solid var(--theme-color-border-default, #DDD6CA);
			border-radius: 4px;
			width: 26px;
			height: 26px;
			cursor: pointer;
			color: var(--theme-color-text-secondary, var(--theme-color-text-secondary, #5E5549));
			font-size: 0.7rem;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
		}
		.md-ref-search-nav:hover
		{
			background: var(--theme-color-background-hover, #EDE9E3);
		}
		.md-ref-search-nav:disabled
		{
			opacity: 0.3;
			cursor: not-allowed;
		}
		.md-ref-search-count
		{
			font-size: 0.7rem;
			color: var(--theme-color-text-muted, #8A7F72);
			white-space: nowrap;
			min-width: 32px;
			text-align: center;
			flex-shrink: 0;
		}
		.md-ref-content
		{
			flex: 1;
			overflow-y: auto;
			padding: 12px;
			font-size: 0.82rem;
			line-height: 1.6;
			color: var(--theme-color-text-primary, var(--theme-color-text-primary, #3D3229));
		}
		.md-ref-content h2
		{
			font-size: 0.95rem;
			margin: 20px 0 8px 0;
			padding-bottom: 4px;
			border-bottom: 1px solid var(--theme-color-background-hover, #EDE9E3);
			color: var(--theme-color-brand-primary, #2E7D74);
		}
		.md-ref-content h2:first-child
		{
			margin-top: 0;
		}
		.md-ref-content h3
		{
			font-size: 0.85rem;
			margin: 14px 0 6px 0;
			color: var(--theme-color-text-secondary, var(--theme-color-text-secondary, #5E5549));
		}
		.md-ref-content p
		{
			margin: 6px 0;
		}
		.md-ref-content code
		{
			background: var(--theme-color-background-tertiary, #F0EDE8);
			padding: 1px 4px;
			border-radius: 3px;
			font-size: 0.78rem;
			font-family: monospace;
		}
		.md-ref-content pre
		{
			background: var(--theme-color-background-tertiary, #F0EDE8);
			border: 1px solid var(--theme-color-border-default, #DDD6CA);
			border-radius: 4px;
			padding: 8px 10px;
			overflow-x: auto;
			font-size: 0.76rem;
			line-height: 1.5;
			margin: 6px 0;
			position: relative;
		}
		.md-ref-content pre code
		{
			background: none;
			padding: 0;
			font-size: inherit;
		}
		.md-ref-copy-btn
		{
			position: absolute;
			top: 4px;
			right: 4px;
			background: var(--theme-color-background-secondary, #FAF8F4);
			border: 1px solid var(--theme-color-border-default, #DDD6CA);
			border-radius: 3px;
			padding: 2px 6px;
			font-size: 0.65rem;
			color: var(--theme-color-text-muted, #8A7F72);
			cursor: pointer;
			opacity: 0;
			transition: opacity 0.15s;
		}
		.md-ref-content pre:hover .md-ref-copy-btn
		{
			opacity: 1;
		}
		.md-ref-copy-btn:hover
		{
			background: var(--theme-color-background-hover, #EDE9E3);
			color: var(--theme-color-text-primary, var(--theme-color-text-primary, #3D3229));
		}
		.md-ref-docs-link
		{
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 6px;
			padding: 8px 10px;
			background: var(--theme-color-background-selected, #F0FAF8);
			border-bottom: 1px solid var(--theme-color-border-default, #DDD6CA);
			font-size: 0.8rem;
			font-weight: 600;
			flex-shrink: 0;
		}
		.md-ref-docs-link a
		{
			color: var(--theme-color-brand-primary, #2E7D74);
			text-decoration: none;
		}
		.md-ref-docs-link a:hover
		{
			text-decoration: underline;
		}
		/* Search highlight */
		mark.md-ref-highlight
		{
			background: #FFEAA7;
			color: inherit;
			padding: 0;
			border-radius: 2px;
		}
		mark.md-ref-highlight-active
		{
			background: var(--theme-color-status-warning, #E8A94D);
			color: var(--theme-color-background-panel, #FFF);
		}
	`,

	Templates:
	[
		{
			Hash: "ContentEditor-MarkdownReference-Template",
			Template: /*html*/`
<div class="md-ref-container">
	<div class="md-ref-docs-link">
		<span><svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3C6.5 1.5 4 1 1 1.5v11c3-.5 5.5 0 7 1.5 1.5-1.5 4-2 7-1.5v-11c-3-.5-5.5 0-7 1.5z"/><line x1="8" y1="3" x2="8" y2="14"/></svg></span>
		<a href="#" onclick="event.preventDefault();pict.views['ContentEditor-Layout'].toggleDocPanel()">Full Documentation</a>
	</div>
	<div class="md-ref-search-bar">
		<input type="text" class="md-ref-search-input"
			id="ContentEditor-MdRef-SearchInput"
			placeholder="Search reference..."
			oninput="{~P~}.views['ContentEditor-MarkdownReference'].onSearchInput(this.value)"
			onkeydown="{~P~}.views['ContentEditor-MarkdownReference'].onSearchKeydown(event)">
		<span class="md-ref-search-count" id="ContentEditor-MdRef-SearchCount"></span>
		<button class="md-ref-search-nav" id="ContentEditor-MdRef-SearchPrev"
			onclick="{~P~}.views['ContentEditor-MarkdownReference'].navigateMatch(-1)" disabled>&#x25B2;</button>
		<button class="md-ref-search-nav" id="ContentEditor-MdRef-SearchNext"
			onclick="{~P~}.views['ContentEditor-MarkdownReference'].navigateMatch(1)" disabled>&#x25BC;</button>
	</div>
	<div class="md-ref-content" id="ContentEditor-MdRef-Content">
` + _MarkdownReferenceContent + `
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "ContentEditor-MarkdownReference-Display",
			TemplateHash: "ContentEditor-MarkdownReference-Template",
			DestinationAddress: "#ContentEditor-SidebarReference-Container",
			RenderMethod: "replace"
		}
	]
};

/**
 * Markdown Reference View
 *
 * A built-in, read-only reference for GitHub-Flavored Markdown, KaTeX
 * math, and Mermaid diagrams.  Provides a fixed search bar with
 * prev/next navigation and copy-to-clipboard buttons on all code blocks.
 */
class ContentEditorMarkdownReferenceView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this._hasRendered = false;
		this._searchMatches = [];
		this._currentMatchIndex = -1;
		this._originalContent = '';
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this._hasRendered = true;

		// Cache the original innerHTML for search restoration
		let tmpContentEl = this.pict.ContentAssignment.getElement('#ContentEditor-MdRef-Content')[0];
		if (tmpContentEl)
		{
			this._originalContent = tmpContentEl.innerHTML;
		}

		// Inject CSS
		this.pict.CSSMap.injectCSS();

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	/**
	 * Copy the text content of a code block to the clipboard.
	 *
	 * @param {HTMLElement} pButton - The copy button element
	 */
	copyCodeBlock(pButton)
	{
		let tmpPre = pButton.closest('pre');
		if (!tmpPre)
		{
			return;
		}
		let tmpCode = tmpPre.querySelector('code');
		if (!tmpCode)
		{
			return;
		}

		let tmpText = tmpCode.textContent;

		if (navigator.clipboard)
		{
			navigator.clipboard.writeText(tmpText).then(() =>
			{
				pButton.textContent = 'Copied!';
				setTimeout(() =>
				{
					pButton.textContent = 'Copy';
				}, 1500);
			});
		}
	}

	/**
	 * Handle search input changes.
	 *
	 * @param {string} pQuery - The search query
	 */
	onSearchInput(pQuery)
	{
		this._performSearch(pQuery);
	}

	/**
	 * Handle keyboard navigation in the search input.
	 *
	 * @param {KeyboardEvent} pEvent
	 */
	onSearchKeydown(pEvent)
	{
		if (pEvent.key === 'Enter')
		{
			pEvent.preventDefault();
			if (pEvent.shiftKey)
			{
				this.navigateMatch(-1);
			}
			else
			{
				this.navigateMatch(1);
			}
		}
		if (pEvent.key === 'Escape')
		{
			pEvent.target.value = '';
			this._clearSearch();
		}
	}

	/**
	 * Navigate to the previous or next search match.
	 *
	 * @param {number} pDirection - -1 for previous, 1 for next
	 */
	navigateMatch(pDirection)
	{
		if (this._searchMatches.length === 0)
		{
			return;
		}

		// Remove active highlight from current
		if (this._currentMatchIndex >= 0 && this._searchMatches[this._currentMatchIndex])
		{
			this._searchMatches[this._currentMatchIndex].classList.remove('md-ref-highlight-active');
		}

		this._currentMatchIndex += pDirection;

		// Wrap around
		if (this._currentMatchIndex >= this._searchMatches.length)
		{
			this._currentMatchIndex = 0;
		}
		if (this._currentMatchIndex < 0)
		{
			this._currentMatchIndex = this._searchMatches.length - 1;
		}

		// Activate and scroll into view
		let tmpMatch = this._searchMatches[this._currentMatchIndex];
		tmpMatch.classList.add('md-ref-highlight-active');
		tmpMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });

		this._updateSearchCount();
	}

	/**
	 * Perform text search using TreeWalker to find and highlight matches.
	 *
	 * @param {string} pQuery - The search term
	 */
	_performSearch(pQuery)
	{
		let tmpContentEl = this.pict.ContentAssignment.getElement('#ContentEditor-MdRef-Content')[0];
		if (!tmpContentEl)
		{
			return;
		}

		// Restore original content to clear previous highlights
		tmpContentEl.innerHTML = this._originalContent;

		this._searchMatches = [];
		this._currentMatchIndex = -1;

		if (!pQuery || pQuery.length < 2)
		{
			this._updateSearchCount();
			this._updateNavButtons();
			return;
		}

		let tmpQueryLower = pQuery.toLowerCase();

		// Walk all text nodes and wrap matches in <mark>
		let tmpWalker = document.createTreeWalker(
			tmpContentEl,
			NodeFilter.SHOW_TEXT,
			null,
			false
		);

		let tmpNodesToProcess = [];
		let tmpNode;
		while ((tmpNode = tmpWalker.nextNode()))
		{
			if (tmpNode.nodeValue.toLowerCase().indexOf(tmpQueryLower) >= 0)
			{
				tmpNodesToProcess.push(tmpNode);
			}
		}

		for (let i = 0; i < tmpNodesToProcess.length; i++)
		{
			this._highlightTextNode(tmpNodesToProcess[i], tmpQueryLower);
		}

		// Collect all mark elements
		this._searchMatches = Array.from(
			tmpContentEl.querySelectorAll('mark.md-ref-highlight')
		);

		// Auto-navigate to first match
		if (this._searchMatches.length > 0)
		{
			this._currentMatchIndex = 0;
			this._searchMatches[0].classList.add('md-ref-highlight-active');
			this._searchMatches[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
		}

		this._updateSearchCount();
		this._updateNavButtons();
	}

	/**
	 * Replace matching text in a text node with <mark> elements.
	 *
	 * @param {Text} pTextNode - The text node to process
	 * @param {string} pQueryLower - The lowercased search query
	 */
	_highlightTextNode(pTextNode, pQueryLower)
	{
		let tmpText = pTextNode.nodeValue;
		let tmpTextLower = tmpText.toLowerCase();
		let tmpParent = pTextNode.parentNode;
		let tmpFragment = document.createDocumentFragment();
		let tmpLastIndex = 0;
		let tmpIndex = tmpTextLower.indexOf(pQueryLower);

		while (tmpIndex >= 0)
		{
			// Text before match
			if (tmpIndex > tmpLastIndex)
			{
				tmpFragment.appendChild(
					document.createTextNode(tmpText.substring(tmpLastIndex, tmpIndex))
				);
			}

			// The match
			let tmpMark = document.createElement('mark');
			tmpMark.className = 'md-ref-highlight';
			tmpMark.textContent = tmpText.substring(tmpIndex, tmpIndex + pQueryLower.length);
			tmpFragment.appendChild(tmpMark);

			tmpLastIndex = tmpIndex + pQueryLower.length;
			tmpIndex = tmpTextLower.indexOf(pQueryLower, tmpLastIndex);
		}

		// Remaining text after last match
		if (tmpLastIndex < tmpText.length)
		{
			tmpFragment.appendChild(
				document.createTextNode(tmpText.substring(tmpLastIndex))
			);
		}

		tmpParent.replaceChild(tmpFragment, pTextNode);
	}

	/**
	 * Update the match count display.
	 */
	_updateSearchCount()
	{
		let tmpCountEl = this.pict.ContentAssignment.getElement('#ContentEditor-MdRef-SearchCount')[0];
		if (!tmpCountEl)
		{
			return;
		}

		if (this._searchMatches.length === 0)
		{
			let tmpInput = this.pict.ContentAssignment.getElement('#ContentEditor-MdRef-SearchInput')[0];
			if (tmpInput && tmpInput.value && tmpInput.value.length >= 2)
			{
				tmpCountEl.textContent = '0';
			}
			else
			{
				tmpCountEl.textContent = '';
			}
		}
		else
		{
			tmpCountEl.textContent = (this._currentMatchIndex + 1) + '/' + this._searchMatches.length;
		}
	}

	/**
	 * Enable/disable navigation buttons based on match count.
	 */
	_updateNavButtons()
	{
		let tmpPrev = this.pict.ContentAssignment.getElement('#ContentEditor-MdRef-SearchPrev')[0];
		let tmpNext = this.pict.ContentAssignment.getElement('#ContentEditor-MdRef-SearchNext')[0];
		let tmpHasMatches = this._searchMatches.length > 0;

		if (tmpPrev) tmpPrev.disabled = !tmpHasMatches;
		if (tmpNext) tmpNext.disabled = !tmpHasMatches;
	}

	/**
	 * Clear search highlights and reset state.
	 */
	_clearSearch()
	{
		let tmpContentEl = this.pict.ContentAssignment.getElement('#ContentEditor-MdRef-Content')[0];
		if (tmpContentEl && this._originalContent)
		{
			tmpContentEl.innerHTML = this._originalContent;
		}
		this._searchMatches = [];
		this._currentMatchIndex = -1;
		this._updateSearchCount();
		this._updateNavButtons();
	}
}

module.exports = ContentEditorMarkdownReferenceView;

module.exports.default_configuration = _ViewConfiguration;
