import MarkdownIt from 'markdown-it';

/**
 * Options for the Markdown to HTML conversion process.
 */
interface MdToHtmlConvertOptions {
  /** Options passed directly to markdown-it. */
  markdownIt?: object;
}

export type { MdToHtmlConvertOptions };

/**
 * Converts Markdown to HTML.
 * This utility class leverages markdown-it for Markdown to HTML conversion.
 *
 * Example usage:
 * ```typescript
 * const converter = new MarkdownToHtmlConverter();
 * const html = converter.convert('# Hello');
 * ```
 */
export class MarkdownToHtmlConverter {
  private mdIt: MarkdownIt;

  constructor(options: MdToHtmlConvertOptions = {}) {
    this.mdIt = new MarkdownIt({ ...(options.markdownIt || {}) });
    // Optionally, you can add custom rules or plugins here if needed
    // This is a workaround for the issue with html-to-docx not handling <em> correctly
    // See: https://github.com/privateOmega/html-to-docx/pull/226
    // TODO: Investigate and implement strikethrough support for html-to-docx.
    // btw, html-to-docx does not support strikethrough but there is no fix at the moment.
    this.mdIt.renderer.rules.em_open = () => '<i>';
    this.mdIt.renderer.rules.em_close = () => '</i>';
  }

  /**
   * Converts Markdown to HTML using markdown-it.
   * @param md - The Markdown string to convert.
   * @returns The converted HTML string.
   */
  convert(md: string): string {
    return this.mdIt.render(md);
  }
}
