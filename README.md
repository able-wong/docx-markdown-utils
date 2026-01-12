# docx-markdown-utils

[![Lint and Test](https://github.com/able-wong/docx-markdown-utils/actions/workflows/lint_and_test.yml/badge.svg)](https://github.com/able-wong/docx-markdown-utils/actions/workflows/lint_and_test.yml)

A modern, isomorphic library for converting between Microsoft Word (.docx), Markdown, and HTML. It works seamlessly in both Node.js and browser environments.

## Features

- **Isomorphic**: All converter classes work in both Node.js and browser environments.
- **ES Module Only**: Modern ES module package (requires Node.js ≥20.0.0).
- **GitHub Flavored Markdown**: Full GFM support including tables, strikethrough, and task lists.
- **Customizable DOCX Output**: Pass options to control fonts, font sizes, and margins in generated `.docx` files.
- **TypeScript Support**: Full TypeScript definitions included.
- **High Test Coverage**: Comprehensive test suite with dual-environment testing.

### Supported Classes

- **`WordToMarkdownConverter`**: Converts Word documents to Markdown.
- **`MarkdownToWordConverter`**: Converts Markdown to Word documents.
- **`MarkdownToHtmlConverter`**: Converts Markdown to HTML.

## Installation

```bash
npm install docx-markdown-utils
```

**Requirements:**

- Node.js ≥20.0.0 (for server-side use)
- An ES Module-compatible environment.

## Usage

### Convert Word to Markdown

#### Node.js Environment

```typescript
import { WordToMarkdownConverter } from 'docx-markdown-utils';
import fs from 'fs';

const converter = new WordToMarkdownConverter();

// From file path
const markdown = await converter.convert('path/to/input.docx');

// From Buffer
const docxBuffer = fs.readFileSync('path/to/input.docx');
const markdownFromBuffer = await converter.convert(docxBuffer);

console.log(markdown);
```

#### Browser Environment

```typescript
import { WordToMarkdownConverter } from 'docx-markdown-utils';

const converter = new WordToMarkdownConverter();

// From a File input element
const fileInput = document.getElementById('docxFile');
const file = fileInput.files[0];
const arrayBuffer = await file.arrayBuffer();
const markdown = await converter.convert(arrayBuffer);

console.log(markdown);
```

#### Customizing Markdown Output

You can customize the generated markdown formatting:

```typescript
const converter = new WordToMarkdownConverter();

const markdown = await converter.convert('document.docx', {
  bulletListMarker: '*',    // Use '*' instead of '-' for bullet lists
  codeBlockStyle: 'fenced', // Use fenced (```) or 'indented' code blocks
});
```

**WordToMarkdownOptions:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `bulletListMarker` | `'-'` \| `'*'` \| `'+'` | `'-'` | Character for bullet lists |
| `codeBlockStyle` | `'fenced'` \| `'indented'` | `'fenced'` | Code block style |

### Convert Markdown to Word

#### Node.js Environment

```typescript
import { MarkdownToWordConverter } from 'docx-markdown-utils';
import * as fs from 'fs/promises';

const converter = new MarkdownToWordConverter();
const markdownContent = '# Hello World';

// The result is a Buffer
const docx = await converter.convert(markdownContent);
await fs.writeFile('document.docx', docx);
```

#### Browser Environment

```typescript
import { MarkdownToWordConverter } from 'docx-markdown-utils';
import { saveAs } from 'file-saver'; // Example using file-saver

const converter = new MarkdownToWordConverter();
const markdownContent = '## Hello from the browser!';

// The result is a Blob
const docx = await converter.convert(markdownContent);
saveAs(docx, 'document.docx');
```

#### Customizing the .docx Output

You can customize fonts, sizes, colors, spacing, and margins to match your needs:

```typescript
const converter = new MarkdownToWordConverter();

const docx = await converter.convert(markdownContent, {
  styles: {
    // Body text styling
    paragraph: {
      font: 'Arial',
      fontSize: 12,
      lineSpacing: 1.5,
      spacingAfter: 10,
    },
    // Heading styles (h1-h4)
    heading1: {
      font: 'Arial Black',
      fontSize: 24,
      color: '000000',  // hex without #
      bold: true,
    },
    heading2: {
      font: 'Arial',
      fontSize: 18,
      color: '333333',
    },
    // Page margins (inches)
    margins: { top: 1, bottom: 1, left: 1.25, right: 1.25 },
    // Document metadata
    title: 'My Document',
    author: 'John Doe',
  }
});
```

**Default Styles (matching Microsoft Word):**
- Body: Calibri 11pt, black, 1.15 line spacing
- Heading 1: Calibri Light 20pt, blue (#2F5496)
- Heading 2: Calibri Light 16pt, blue
- Heading 3: Calibri Light 14pt, blue
- Heading 4: Calibri Light 12pt, blue, italic
- Margins: 1 inch on all sides

**ParagraphStyle Options:**
| Option | Type | Description |
|--------|------|-------------|
| `font` | string | Font name |
| `fontSize` | number | Size in points |
| `color` | string | Hex color without # |
| `bold` | boolean | Bold text |
| `italic` | boolean | Italic text |
| `alignment` | string | 'left', 'center', 'right', 'justify' |
| `lineSpacing` | number | Multiplier (1.0 = single, 1.5, 2.0 = double) |
| `spacingBefore` | number | Points before paragraph |
| `spacingAfter` | number | Points after paragraph |

**Note:** Generated DOCX files are fully compatible with Microsoft Word. However, Word may prompt to save when closing even if no changes were made - this is normal for programmatically generated files and doesn't affect the document content.

### Convert Markdown to HTML

```typescript
import { MarkdownToHtmlConverter } from 'docx-markdown-utils';

const converter = new MarkdownToHtmlConverter();
const html = converter.convert('# Hello, **world**!');

// With options - allow raw HTML in markdown
const htmlWithRaw = converter.convert('<div>Custom HTML</div>', {
  allowDangerousHtml: true,
  sanitize: false,
});
```

**MdToHtmlConvertOptions:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sanitize` | boolean | `true` | Sanitize HTML output to prevent XSS |
| `allowDangerousHtml` | boolean | `false` | Allow raw HTML in markdown to pass through |

**Supported Markdown features (GFM):**
- Headings, bold, italic, strikethrough
- Links and images
- Ordered and unordered lists
- Tables
- Task lists
- Code blocks and inline code
- Hard breaks (two trailing spaces before newline → `<br>`)

#### Examples

```typescript
const converter = new MarkdownToHtmlConverter();

// Basic formatting
converter.convert('**bold** and _italic_');
// <p><strong>bold</strong> and <em>italic</em></p>

// Tables
converter.convert('| A | B |\n|---|---|\n| 1 | 2 |');
// <table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>

// Task lists
converter.convert('- [x] Done\n- [ ] Todo');
// <ul class="contains-task-list"><li class="task-list-item"><input type="checkbox" checked disabled> Done</li>...</ul>

// Hard breaks (two trailing spaces)
converter.convert('line1  \nline2');
// <p>line1<br>\nline2</p>
```

## Browser Usage

The library is designed to be easily integrated into any modern web project.

#### Framework Integration (Vite, Next.js, etc.)

Modern frameworks will automatically use the correct browser-compatible version of the library.

```typescript
import { WordToMarkdownConverter, MarkdownToWordConverter, MarkdownToHtmlConverter } from 'docx-markdown-utils';
```

**Remix/Vite Configuration (Required)**

For Remix and Vite projects, add this configuration to handle mixed ESM/CommonJS dependencies:

```javascript
// vite.config.js or vite.config.ts
export default {
  optimizeDeps: {
    include: ["docx-markdown-utils"], // Required for CommonJS compatibility
  }
}
```

**Why needed:** While v0.5.0 migrated to ESM-native dependencies, some sub-dependencies remain CommonJS. This requires them to be explicitly included in Vite's `optimizeDeps` for proper module resolution.

#### Standalone Browser Bundle

For use in vanilla JavaScript projects, you can use the standalone bundle which includes all necessary dependencies.

```html
<!-- Latest version via jsDelivr CDN -->
<script src="https://cdn.jsdelivr.net/npm/docx-markdown-utils@latest/dist/browser.bundle.js"></script>
<script>
  const { WordToMarkdownConverter, MarkdownToWordConverter } = window.DocxMarkdownUtils;
  // Use the converters...
</script>
```

To test the browser bundle locally, run `npm run serve` and open `browser-test-bundle.html`.

## What's New

### v0.6.1 (Latest)

- **🐛 Fix: Table header visibility** - Fixed table headers rendering as black bars with invisible text in generated DOCX files

### v0.6.0

**Breaking Changes:**
- `MarkdownToHtmlConverter`: Options moved from constructor to `convert()` method
- `MdToHtmlConvertOptions`: Now uses `sanitize` and `allowDangerousHtml` instead of `html: object`
- `WordToMarkdownOptions`: Renamed from `ConvertOptions`, now uses `bulletListMarker` and `codeBlockStyle` instead of `mammoth` and `remarkStringify`

**New Features:**
- **🎯 Consistent API**: All converters now follow the same pattern: `converter.convert(input, options?)`
- **🎨 Modern Word Styling**: Default output now matches Microsoft Word's styling (Calibri font, proper heading sizes and colors)
- **✨ Customizable Paragraph Styles**: New `ParagraphStyle` interface for fine-grained control over fonts, sizes, colors, alignment, and spacing
- **📝 Heading Styles (H1-H4)**: Individual styling options for each heading level with Word-matching defaults
- **📐 Page Margins**: Configurable page margins in inches
- **📋 Document Metadata**: Set title, author, and description
- **⬆️ Updated Dependencies**: `@m2d/remark-docx` upgraded to v1.2.2

### v0.5.6

- **📚 Enhanced MarkdownToHtmlConverter Docs**: Added supported GFM features list and usage examples
- **🧪 Improved Test Coverage**: Added hard break conversion test with JSDOM validation
- **🔒 Security Fixes**: Updated mammoth and other dependencies to address vulnerabilities

### v0.5.1 - v0.5.4

- **🔒 Security Fix**: Updated happy-dom to v20.0.0 to address vulnerability
- **⚠️ Node.js ≥20.0.0**: Updated minimum Node.js version requirement
- **📦 Dependency Updates**: Updated vulnerable dependencies
- **📚 Vite Usage Docs**: Added Remix/Vite configuration instructions

### v0.5.0

- **🚀 Major Architecture Upgrade**: Replaced `@turbodocx/html-to-docx` with `@m2d/remark-docx` for direct Markdown-to-DOCX conversion
- **🎯 Eliminated CommonJS Issues**: No more bundling problems with `html-to-vdom` - perfect Remix/Vite compatibility
- **📦 60% Smaller DOCX Files**: More efficient DOCX generation (~8KB vs ~20KB for typical documents)
- **⚡ Better Performance**: Direct markdown processing eliminates HTML intermediate step
- **🔧 ESM-Native Dependencies**: Pure ES module dependency chain for modern bundlers
- **✅ Maintained API Compatibility**: Same `convert(markdown, options)` interface as before
- **🌐 Enhanced Browser Bundle**: Still works for vanilla JavaScript with improved reliability

### v0.4.0

- **🚀 `MarkdownToWordConverter` is now Isomorphic**: The `MarkdownToWordConverter` class now works in both Node.js and browser environments, returning a `Buffer` in Node and a `Blob` in the browser.
- **✨ Customizable DOCX Output**: Added the ability to pass options for font, font size, and margins when creating `.docx` files.
- **🔧 Switched to `@turbodocx/html-to-docx`**: Replaced the underlying `html-to-docx` library with the more modern and actively maintained `@turbodocx/html-to-docx`.
- **🧹 Cleaner API**: Removed the `saveToFile` method in favor of returning a standard `Buffer` or `Blob` that can be handled by the user.
- **📚 Improved Documentation**: Updated the README to reflect the new isomorphic nature of all classes and added examples for customizing `.docx` output.

## Previous Releases

### v0.3.1
- **🌐 Dual Environment Support**: `WordToMarkdownConverter` and `MarkdownToHtmlConverter` now work in both Node.js and browsers
- **📦 Conditional Exports**: Automatic browser/Node.js environment detection for frameworks like Remix and Next.js
- **🎯 Browser Bundle**: Standalone bundle for vanilla JavaScript usage via CDN (jsDelivr)
- **📱 Browser File API Integration**: Support for ArrayBuffer input from File API, drag & drop, and file uploads
- **🧪 Enhanced Testing**: Comprehensive dual-environment test suite with browser simulation
- **📚 Improved Documentation**: Multiple browser usage options with framework-specific examples
- **🔍 Better Type Detection**: Enhanced input type validation and error handling

### v0.2.0
- **🚀 ES Module Support**: Complete migration to ES modules
- **🔧 Unified Ecosystem**: Replaced multiple dependencies with unified/remark stack
- **✨ Better Output**: More semantic HTML (`<em>` vs `<i>`) and cleaner markdown formatting
- **🧪 Modern Testing**: Migrated from Jest to Vitest with native ES module support
- **📦 Smaller Bundle**: Consolidated dependencies for better tree-shaking

## License

Apache 2.0
