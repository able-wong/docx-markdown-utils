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

- **`WordToMarkdownConverter`**: Converts Word documents to Markdown
- **`MarkdownToWordConverter`**: Converts Markdown files to Word documents
- **`MarkdownToHtmlConverter`**: Converts Markdown strings to HTML

> **Note:** This library is designed for Node.js environments only. Browser support is not currently provided.

## Installation

```bash
npm install docx-markdown-utils
```

**Requirements:**

- Node.js ≥18.0.0
- ES Module environment (`"type": "module"` in package.json or `.mjs` files)

## Usage

### Convert Word to Markdown

```typescript
import { WordToMarkdownConverter } from 'docx-markdown-utils';

const converter = new WordToMarkdownConverter();

// From file path
const markdown = await converter.convert('path/to/input.docx');

// From Buffer
const docxBuffer = fs.readFileSync('path/to/input.docx');
const markdown = await converter.convert(docxBuffer);

console.log(markdown);
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

```typescript
import { MarkdownToHtmlConverter } from 'docx-markdown-utils';

const converter = new MarkdownToHtmlConverter();
const html = converter.convert('# Hello, **world**!');
console.log(html); // <h1>Hello, <strong>world</strong>!</h1>
```

## API

### WordToMarkdownConverter

**Methods:**

- `convert(input: string | Buffer, options?: ConvertOptions): Promise<string>`
  - Converts a DOCX file to Markdown
  - `input`: File path (string) or Buffer containing DOCX data
  - `options`: Optional conversion options for turndown behavior

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

## What's New in v0.2.0

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
