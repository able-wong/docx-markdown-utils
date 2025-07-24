import htmlToDocx from 'html-to-docx';
import * as fs from 'fs/promises';
import { MarkdownToHtmlConverter } from './MarkdownToHtmlConverter.js';

/**
 * Options for the Markdown to Word conversion process.
 */
interface MdToWordConvertOptions {
  /** Options passed to html-to-docx. */
  htmlToDocx?: object;
}

export type { MdToWordConvertOptions };

/**
 * Converts Markdown to Microsoft Word documents (.docx).
 * This utility class leverages unified/remark for Markdown to HTML conversion
 * and html-to-docx for HTML to DOCX conversion.
 *
 * **Node.js Only**: This class is designed for Node.js environments and uses
 * Node.js-specific dependencies (html-to-docx, fs/promises) that are not
 * available in browsers.
 *
 * ## Browser Alternatives
 *
 * For browser-based Markdown to DOCX conversion, consider these alternatives:
 *
 * ### 1. html-docx-js (Browser Compatible)
 * ```typescript
 * import htmlDocx from 'html-docx-js';
 *
 * // Convert markdown to HTML first, then to DOCX
 * const html = markdownToHtmlConverter.convert(markdown);
 * const docxBlob = htmlDocx.asBlob(html);
 * ```
 *
 * **Pros**: Works in browsers, simple API
 * **Cons**:
 * - Security vulnerabilities (JSZip, lodash.merge - 9 years old)
 * - Compatibility issues (uses altChunks - only works in MS Word, not Google Docs/LibreOffice)
 * - Abandoned project (last updated 2016)
 *
 * ### 2. docx.js (Modern Alternative)
 * ```typescript
 * import { Document, Packer } from 'docx';
 *
 * // Requires manual HTML parsing and docx element construction
 * const doc = new Document({ sections: [...parsedElements] });
 * const buffer = await Packer.toBuffer(doc);
 * ```
 *
 * **Pros**: Modern, actively maintained, works in browsers and Node.js
 * **Cons**: Requires implementing HTML-to-DOCX parsing logic yourself
 *
 * **Recommendation**: For simple browser use cases with basic formatting needs,
 * html-docx-js may suffice despite security concerns. For production use,
 * consider implementing a custom solution with docx.js or keeping conversion
 * server-side with this class.
 *
 * Example usage:
 * ```typescript
 * const converter = new MarkdownToWordConverter();
 * const docxBuffer = await converter.convert('# Hello', {});
 * // Save docxBuffer to a file
 * ```
 */
export class MarkdownToWordConverter {
  private htmlConverter: MarkdownToHtmlConverter;

  constructor() {
    // Runtime check for browser environment
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      throw new Error(
        'MarkdownToWordConverter is not supported in browser environments. ' +
          'This class requires Node.js dependencies (html-to-docx, fs/promises). ' +
          'For browser-based DOCX conversion, consider using html-docx-js or docx.js. ' +
          'See the class documentation for browser alternatives.',
      );
    }

    this.htmlConverter = new MarkdownToHtmlConverter();
  }

  /**
   * Converts Markdown to HTML using unified processor.
   * @param md - The Markdown string to convert.
   * @returns The converted HTML string.
   */
  private mdToHtml(md: string): string {
    let html = this.htmlConverter.convert(md);

    // html-to-docx expects older HTML tags, convert semantic tags
    html = html.replace(/<em>/g, '<i>').replace(/<\/em>/g, '</i>');
    html = html.replace(/<del>/g, '<s>').replace(/<\/del>/g, '</s>');

    return html;
  }

  /**
   * Converts Markdown to a Word document Buffer.
   * The process involves:
   * 1. Converting Markdown to HTML using markdown-it.
   * 2. Converting HTML to DOCX using html-to-docx.
   *
   * @param md - The Markdown string to convert.
   * @param options - Optional configuration for markdown-it and html-to-docx.
   * @returns A Promise resolving to a Buffer containing the DOCX file.
   * @throws Error if the conversion process fails.
   */
  async convert(
    md: string,
    options: MdToWordConvertOptions = {},
  ): Promise<Buffer> {
    const html = this.mdToHtml(md);
    const docxResult = await htmlToDocx(
      html,
      undefined,
      options.htmlToDocx || {},
    );
    let buffer: Buffer;
    if (docxResult instanceof ArrayBuffer) {
      buffer = Buffer.from(docxResult);
    } else if (docxResult instanceof Blob) {
      const arrayBuffer = await docxResult.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else if (Buffer.isBuffer(docxResult)) {
      buffer = docxResult;
    } else {
      throw new Error('Unexpected return type from htmlToDocx');
    }
    return buffer;
  }

  /**
   * Saves a DOCX buffer to a local file.
   * @param buffer - The DOCX buffer to save.
   * @param filePath - The destination file path.
   * @returns A Promise that resolves when the file is written.
   */
  async saveToFile(buffer: Buffer, filePath: string): Promise<void> {
    await fs.writeFile(filePath, buffer);
  }
}
