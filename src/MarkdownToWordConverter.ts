import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { remarkDocx } from '@m2d/remark-docx';

/**
 * Options for the Markdown to Word conversion process.
 */
interface MdToWordConvertOptions {
  /** Options passed to @m2d/remark-docx processor. */
  remarkDocx?: object;
  /** @deprecated Legacy options for @turbodocx/html-to-docx compatibility. Ignored. */
  htmlToDocx?: object;
}

export type { MdToWordConvertOptions };

/**
 * Converts Markdown to Microsoft Word documents (.docx).
 * This utility class leverages unified/remark for direct Markdown to DOCX conversion
 * using @m2d/remark-docx, eliminating the need for HTML intermediate conversion.
 *
 * This class is designed to be isomorphic, meaning it can run in both Node.js
 * and browser environments.
 *
 * ## Node.js Usage
 *
 * In a Node.js environment, the `convert` method returns a `Buffer`.
 *
 * ```typescript
 * import { MarkdownToWordConverter } from './MarkdownToWordConverter.js';
 * import * as fs from 'fs/promises';
 *
 * const converter = new MarkdownToWordConverter();
 * const docx = await converter.convert('# Hello World');
 * await fs.writeFile('hello.docx', docx);
 * ```
 *
 * ## Browser Usage
 *
 * In a browser environment, the `convert` method returns a `Blob`. You can use
 * a library like `file-saver` to offer it as a download to the user.
 *
 * ```typescript
 * import { MarkdownToWordConverter } from './MarkdownToWordConverter.js';
 * import { saveAs } from 'file-saver';
 *
 * const converter = new MarkdownToWordConverter();
 * const docx = await converter.convert('## Browser Conversion');
 *
 * if (docx instanceof Blob) {
 *   saveAs(docx, 'document.docx');
 * }
 * ```
 *
 * ## Features
 *
 * - **Direct Markdown Processing**: No HTML intermediate step
 * - **GitHub Flavored Markdown**: Full GFM support including tables, strikethrough, task lists
 * - **ESM-Native Dependencies**: No CommonJS compatibility issues
 * - **Smaller Output Files**: More efficient DOCX generation
 * - **Better Remix/Vite Compatibility**: No bundling issues with html-to-vdom
 */
export class MarkdownToWordConverter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private processor: any;

  constructor() {
    this.processor = unified()
      .use(remarkParse)
      .use(remarkGfm) // GitHub Flavored Markdown support
      .use(remarkDocx);
  }

  /**
   * Converts Markdown to a Word document as a `Buffer` in Node.js or a `Blob`
   * in the browser.
   *
   * The process involves:
   * 1. Parsing Markdown to MDAST (Markdown Abstract Syntax Tree).
   * 2. Converting MDAST directly to DOCX using @m2d/remark-docx.
   *
   * @param md - The Markdown string to convert.
   * @param options - Optional configuration for the conversion.
   * @returns A Promise resolving to a `Buffer` or `Blob` containing the DOCX file.
   * @throws Error if the conversion process fails.
   */
  async convert(
    md: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: MdToWordConvertOptions = {},
  ): Promise<Buffer | Blob> {
    try {
      // Process the markdown through the unified pipeline
      const result = await this.processor.process(md);

      // The result.result is a Promise that resolves to the DOCX data
      const docx = await result.result;

      // Return the DOCX as Buffer (Node.js) or Blob (browser)
      return docx as Buffer | Blob;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Markdown to Word conversion failed: ${errorMessage}`);
    }
  }
}
