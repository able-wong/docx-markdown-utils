import MarkdownIt from 'markdown-it';
import htmlToDocx from 'html-to-docx';

/**
 * Options for the Markdown to Word conversion process.
 */
interface MdToWordConvertOptions {
  /** Options passed directly to markdown-it. */
  markdownIt?: object;
  /** Options passed directly to html-to-docx. */
  htmlToDocx?: object;
}

export type { MdToWordConvertOptions };

/**
 * Converts Markdown to Microsoft Word documents (.docx).
 * This utility class leverages markdown-it for Markdown to HTML conversion
 * and html-to-docx for HTML to DOCX conversion.
 *
 * Example usage:
 * ```typescript
 * const converter = new MarkdownToWordConverter();
 * const docxBuffer = await converter.convert('# Hello', {});
 * // Save docxBuffer to a file
 * ```
 */
export class MarkdownToWordConverter {
  /**
   * Converts Markdown to HTML using markdown-it.
   * @param md - The Markdown string to convert.
   * @param options - Custom markdown-it options.
   * @returns The converted HTML string.
   */
  private mdToHtml(md: string, options: object = {}): string {
    const mdIt = new MarkdownIt({ ...options });
    // Override default rules for emphasis to use <i> instead of <em>
    // This is a workaround for the issue with html-to-docx not handling <em> correctly
    // See: https://github.com/privateOmega/html-to-docx/pull/226
    // btw, html-to-docx does not support strikethrough but there is no fix at the moment.
    mdIt.renderer.rules.em_open = () => '<i>';
    mdIt.renderer.rules.em_close = () => '</i>';
    return mdIt.render(md);
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
    const html = this.mdToHtml(md, options.markdownIt);
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
    const fs = require('fs/promises');
    await fs.writeFile(filePath, buffer);
  }
}
