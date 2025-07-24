# docx-markdown-utils

[![Lint and Test](https://github.com/able-wong/docx-markdown-utils/actions/workflows/lint_and_test.yml/badge.svg)](https://github.com/able-wong/docx-markdown-utils/actions/workflows/lint_and_test.yml)

A modern Node.js library for converting between Microsoft Word (.docx) documents and [GitHub Flavored Markdown (GFM)](https://github.github.com/gfm/). Built with ES modules and the unified ecosystem for reliable, high-quality conversions.

## Features

- **ES Module Only**: Modern ES module package (requires Node.js ≥18.0.0)
- **Three Main Classes**: Convert between DOCX, Markdown, and HTML formats
- **GitHub Flavored Markdown**: Full GFM support including tables, strikethrough, and task lists
- **Unified Ecosystem**: Built on [unified](https://unifiedjs.com/) and [remark](https://remark.js.org/) for consistent processing
- **TypeScript Support**: Full TypeScript definitions included
- **High Test Coverage**: Comprehensive test suite with 93%+ coverage

### Supported Classes

- **`WordToMarkdownConverter`**: Converts Word documents to Markdown ✅ **Dual Environment** (Node.js + Browser)
- **`MarkdownToWordConverter`**: Converts Markdown files to Word documents (Node.js only)
- **`MarkdownToHtmlConverter`**: Converts Markdown strings to HTML ✅ **Dual Environment** (Node.js + Browser)

## Browser Compatibility

**Dual Environment Classes**: `WordToMarkdownConverter` and `MarkdownToHtmlConverter` work in both Node.js and browser environments.

**Node.js Only**: `MarkdownToWordConverter` requires Node.js due to file system dependencies. See class documentation for browser alternatives.

### Browser Usage Options

The library provides multiple ways to use it in browser environments:

#### Option 1: Framework Integration (Recommended)
Modern frameworks like Remix, Next.js, or Vite automatically handle conditional exports:

```typescript
// Only imports browser-compatible classes
import { WordToMarkdownConverter, MarkdownToHtmlConverter } from 'docx-markdown-utils';
```

#### Option 2: Direct Browser Import
For ES module environments with a bundler:

```typescript
// Explicit browser import
import { WordToMarkdownConverter, MarkdownToHtmlConverter } from 'docx-markdown-utils/browser';
```

#### Option 3: CDN Usage (Vanilla JavaScript)
For vanilla JavaScript projects without a bundler:

```html
<!-- Latest version via jsDelivr CDN -->
<script src="https://cdn.jsdelivr.net/npm/docx-markdown-utils@latest/dist/browser.bundle.js"></script>
<script>
  const { WordToMarkdownConverter, MarkdownToHtmlConverter } = window.DocxMarkdownUtils;
  // Use the converters...
</script>
```

### Browser Testing

To test the browser compatibility locally:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Start a local HTTP server**:
   ```bash
   npm run serve
   ```

3. **Choose a test page**:
   ```bash
   # Bundle test (standalone, no CDN dependencies)
   open http://localhost:8000/browser-test-bundle.html
   
   # Import maps test (loads dependencies from CDN)
   open http://localhost:8000/browser-test.html
   
   # Simple test (minimal dependencies, fallback)
   open http://localhost:8000/browser-test-simple.html
   ```

**Expected Results**: Both converters work seamlessly in browser environments, with automatic File API integration for `.docx` uploads.

### Known Limitations

- **Strikethrough in Round-trip Conversion**: When converting `~~strikethrough~~` markdown to DOCX and back to markdown, the strikethrough formatting is lost due to limitations in the underlying `html-to-docx` library. The text content is preserved but without formatting.
- **Ordered List Numbering**: In round-trip conversion (Markdown → DOCX → Markdown), sequential ordered list numbering is lost. For example, `1.`, `2.`, `3.` becomes `1.`, `1.`, `1.`. List structure and content are preserved.
- **Underline**: Underline formatting is not supported as it's not part of standard Markdown or GFM.

## Installation

```bash
npm install docx-markdown-utils
```

**Requirements:**

- Node.js ≥18.0.0
- ES Module environment (`"type": "module"` in package.json or `.mjs` files)

## Usage

### Convert Word to Markdown

#### Node.js Environment

```typescript
import { WordToMarkdownConverter } from 'docx-markdown-utils';
import fs from 'fs';

const converter = new WordToMarkdownConverter();

// From file path (Node.js only)
const markdown = await converter.convert('path/to/input.docx');

// From Buffer (Node.js)
const docxBuffer = fs.readFileSync('path/to/input.docx');
const markdown = await converter.convert(docxBuffer);

console.log(markdown);
```

#### Browser Environment

```typescript
import { WordToMarkdownConverter } from 'docx-markdown-utils';

const converter = new WordToMarkdownConverter();

// From File input element
const fileInput = document.getElementById('docxFile') as HTMLInputElement;
const file = fileInput.files[0];
const arrayBuffer = await file.arrayBuffer();
const markdown = await converter.convert(arrayBuffer);

// From drag and drop
const handleDrop = async (event: DragEvent) => {
  const file = event.dataTransfer?.files[0];
  if (file && file.name.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const markdown = await converter.convert(arrayBuffer);
    console.log(markdown);
  }
};
```

### Convert Markdown to Word

```typescript
import { MarkdownToWordConverter } from 'docx-markdown-utils';

const converter = new MarkdownToWordConverter();

// Convert markdown string to DOCX buffer
const markdownContent = '# Hello **World**!\n\nThis is *italic* text.';
const docxBuffer: Buffer = await converter.convert(markdownContent);

// Save to file
await converter.saveToFile(docxBuffer, 'path/to/output.docx');
```

### Convert Markdown to HTML

#### Works in Both Node.js and Browser

```typescript
import { MarkdownToHtmlConverter } from 'docx-markdown-utils';

const converter = new MarkdownToHtmlConverter();
const html = converter.convert('# Hello, **world**!');
console.log(html); // <h1>Hello, <strong>world</strong>!</h1>

// Browser-specific usage
const markdownText = '# Document\n\nFrom **browser** input';
const htmlOutput = converter.convert(markdownText);

// Create downloadable HTML file in browser
const blob = new Blob([htmlOutput], { type: 'text/html' });
const url = URL.createObjectURL(blob);
```

## API

### WordToMarkdownConverter

**Methods:**

- `convert(input: string | Buffer | ArrayBuffer, options?: ConvertOptions): Promise<string>`
  - Converts a DOCX file to Markdown
  - `input`: File path (string, Node.js only), Buffer (Node.js), or ArrayBuffer (browser/Node.js)
  - `options`: Optional conversion options for remarkStringify behavior

**Types:**

- `ConvertOptions`: Configuration for markdown conversion
- `TurndownOptions`: Options for HTML-to-Markdown conversion behavior

### MarkdownToWordConverter

**Methods:**

- `convert(md: string, options?: MdToWordConvertOptions): Promise<Buffer>`
  - Converts Markdown string to DOCX Buffer
  - `md`: Markdown content as string
  - `options`: Optional configuration for conversion
- `saveToFile(buffer: Buffer, outputPath: string): Promise<void>`
  - Saves DOCX Buffer to file

**Types:**

- `MdToWordConvertOptions`: Configuration for markdown-to-word conversion

### MarkdownToHtmlConverter

**Methods:**

- `convert(md: string): string`
  - Converts Markdown string to HTML using unified/remark with GFM support
  - `md`: Markdown content as string
  - Returns HTML string

**Constructor:**

- `constructor(options?: MdToHtmlConvertOptions)`
  - `options`: Optional configuration for the unified processor

**Types:**

- `MdToHtmlConvertOptions`: Configuration for markdown-to-HTML conversion

## What's New in v0.3.0

- **🌐 Dual Environment Support**: `WordToMarkdownConverter` and `MarkdownToHtmlConverter` now work in both Node.js and browsers
- **📦 Conditional Exports**: Automatic browser/Node.js environment detection for frameworks like Remix and Next.js
- **🎯 Browser Bundle**: Standalone bundle for vanilla JavaScript usage via CDN (jsDelivr)
- **📱 Browser File API Integration**: Support for ArrayBuffer input from File API, drag & drop, and file uploads
- **🧪 Enhanced Testing**: Comprehensive dual-environment test suite with browser simulation
- **📚 Improved Documentation**: Multiple browser usage options with framework-specific examples
- **🔍 Better Type Detection**: Enhanced input type validation and error handling

## Previous Releases

### v0.2.0

- **🚀 ES Module Support**: Complete migration to ES modules
- **🔧 Unified Ecosystem**: Replaced multiple dependencies with unified/remark stack
- **✨ Better Output**: More semantic HTML (`<em>` vs `<i>`) and cleaner markdown formatting
- **🧪 Modern Testing**: Migrated from Jest to Vitest with native ES module support
- **📦 Smaller Bundle**: Consolidated dependencies for better tree-shaking

### Migration from v0.1.x

**Breaking Changes:**

1. **ES Modules Only**: Update your project to use ES modules

   ```json
   // package.json
   {
     "type": "module"
   }
   ```

2. **Import Syntax**: Use ES module imports instead of CommonJS

   ```typescript
   // Before (v0.1.x)
   const { WordToMarkdownConverter } = require('docx-markdown-utils');

   // After (v0.2.x)
   import { WordToMarkdownConverter } from 'docx-markdown-utils';
   ```

3. **Node.js Version**: Requires Node.js ≥18.0.0 (previously ≥14.0.0)

4. **Output Format Changes**:
   - Italic text now uses `*italic*` instead of `_italic_`
   - Table formatting has longer separator lines
   - List items have improved spacing

## License

Apache 2.0
