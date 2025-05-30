# docx-markdown-utils

[![Lint and Test](https://github.com/able-wong/docx-markdown-utils/actions/workflows/lint_and_test.yml/badge.svg)](https://github.com/able-wong/docx-markdown-utils/actions/workflows/lint_and_test.yml)

A Node.js library for converting between Microsoft Word (.docx) documents and [GitHub Flavored Markdown (GFM)](https://github.github.com/gfm/). Provides three main classes:

- `WordToMarkdownConverter`: Converts Word documents to Markdown.
- `MarkdownToWordConverter`: Converts Markdown files to Word documents.
- `MarkdownToHtmlConverter`: Converts Markdown strings to HTML.

> **Note:** This library is tested in Node.js environments only. Browser support is not currently provided, but adding it should not be difficult.

## Installation

```bash
npm install docx-markdown-utils
```

## Usage

### Convert Word to Markdown

```typescript
import { WordToMarkdownConverter } from 'docx-markdown-utils';

const converter = new WordToMarkdownConverter();
const markdown = await converter.convert('path/to/input.docx', {
  // Optional: conversion options
});
console.log(markdown);
```

### Convert Markdown to Word

```typescript
import { MarkdownToWordConverter } from 'docx-markdown-utils';

const converter = new MarkdownToWordConverter();
const docxBuffer: Buffer = await converter.convert('path/to/input.md', {
  // Optional: conversion options
});
converter.saveToFile(docxBuffer, 'path/to/output.docx');
```

### Convert Markdown to HTML

```typescript
import { MarkdownToHtmlConverter } from 'docx-markdown-utils';

const converter = new MarkdownToHtmlConverter();
const html = converter.convert('# Hello, **world**!');
console.log(html);
```

## API

### WordToMarkdownConverter

- `convert(inputPath: string, options?: ConvertOptions): Promise<string>`

### MarkdownToWordConverter

- `convert(inputPath: string, outputPath: string, options?: MdToWordConvertOptions): Promise<void>`
- `saveToFile(buffer: Buffer, outputPath: string): Promise<void>`

### MarkdownToHtmlConverter

- `convert(md: string): string` — Converts a Markdown string to HTML.
- Constructor optionally accepts `{ markdownIt?: object }` to customize the underlying [markdown-it](https://github.com/markdown-it/markdown-it) instance.

## License

Apache 2.0
