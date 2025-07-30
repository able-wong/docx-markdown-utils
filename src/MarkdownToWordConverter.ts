import htmlToDocx from '@turbodocx/html-to-docx';
import { MarkdownToHtmlConverter } from './MarkdownToHtmlConverter.js';

/**
 * Options for the Markdown to Word conversion process.
 */
interface MdToWordConvertOptions {
  /** Options passed to @turbodocx/html-to-docx. */
  htmlToDocx?: object;
}

export type { MdToWordConvertOptions };

/**
 * Converts Markdown to Microsoft Word documents (.docx).
 * This utility class leverages unified/remark for Markdown to HTML conversion
 * and @turbodocx/html-to-docx for HTML to DOCX conversion.
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
 */
export class MarkdownToWordConverter {
  private htmlConverter: MarkdownToHtmlConverter;

  constructor() {
    this.htmlConverter = new MarkdownToHtmlConverter();
  }

  /**
   * Converts Markdown to HTML using unified processor.
   * @param md - The Markdown string to convert.
   * @returns The converted HTML string.
   */
  private mdToHtml(md: string): string {
    let html = this.htmlConverter.convert(md);

    // @turbodocx/html-to-docx expects older HTML tags, convert semantic tags
    html = html.replace(/<em>/g, '<i>').replace(/<\/em>/g, '</i>');
    html = html.replace(/<del>/g, '<s>').replace(/<\/del>/g, '</s>');

    return html;
  }

  /**
   * Converts Markdown to a Word document as a `Buffer` in Node.js or a `Blob`
   * in the browser.
   *
   * The process involves:
   * 1. Converting Markdown to HTML.
   * 2. Converting HTML to DOCX using @turbodocx/html-to-docx.
   *
   * @param md - The Markdown string to convert.
   * @param options - Optional configuration for the conversion.
   * @returns A Promise resolving to a `Buffer`, `Blob`, or `ArrayBuffer`
   *          containing the DOCX file.
   * @throws Error if the conversion process fails.
   */
  async convert(
    md: string,
    options: MdToWordConvertOptions = {},
  ): Promise<Buffer | Blob | ArrayBuffer> {
    const html = this.mdToHtml(md);
    const docxResult = await htmlToDocx(
      html,
      undefined,
      options.htmlToDocx || {},
    );
    return docxResult;
  }
}
