# docx-markdown-utils

[![Lint and Test](https://github.com/able-wong/docx-markdown-utils/actions/workflows/lint_and_test.yml/badge.svg)](https://github.com/able-wong/docx-markdown-utils/actions/workflows/lint_and_test.yml)

A modern, isomorphic library for converting between Microsoft Word (.docx), Markdown, and HTML. It works seamlessly in both Node.js and browser environments.

## Features

- **Isomorphic**: All converter classes work in both Node.js and browser environments.
- **ES Module Only**: Modern ES module package (requires Node.js ≥18.0.0).
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

- Node.js ≥18.0.0 (for server-side use)
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

You can pass options to customize the appearance of the generated `.docx` file. This is useful for setting default fonts, font sizes, and page margins.

```typescript
const options = {
  htmlToDocx: {
    font: 'Arial',
    fontSize: 24, // 12pt
    margins: {
      top: 1440,    // 1 inch
      right: 1440,  // 1 inch
      bottom: 1440, // 1 inch
      left: 1440,   // 1 inch
    },
  },
};

const docx = await converter.convert(markdownContent, options);
```

### Convert Markdown to HTML

```typescript
import { MarkdownToHtmlConverter } from 'docx-markdown-utils';

const converter = new MarkdownToHtmlConverter();
const html = converter.convert('# Hello, **world**!');
console.log(html); // <h1>Hello, <strong>world</strong>!</h1>
```

## Browser Usage

The library is designed to be easily integrated into any modern web project.

#### Framework Integration (Vite, Next.js, etc.)

Modern frameworks will automatically use the correct browser-compatible version of the library.

```typescript
import { WordToMarkdownConverter, MarkdownToWordConverter, MarkdownToHtmlConverter } from 'docx-markdown-utils';
```

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

### v0.4.0 (Latest)

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
