import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

/**
 * Options for the Markdown to HTML conversion process.
 */
interface MdToHtmlConvertOptions {
  /** Options passed to remark-html for HTML formatting. */
  html?: object;
}

export type { MdToHtmlConvertOptions };

/**
 * Converts Markdown to HTML.
 * This utility class leverages unified with remark for Markdown to HTML conversion,
 * including full GitHub Flavored Markdown support.
 *
 * Example usage:
 * ```typescript
 * const converter = new MarkdownToHtmlConverter();
 * const html = converter.convert('# Hello');
 * ```
 */
export class MarkdownToHtmlConverter {
  private options: MdToHtmlConvertOptions;

  constructor(options: MdToHtmlConvertOptions = {}) {
    this.options = options;
  }

  /**
   * Converts Markdown to HTML using unified processor with GFM support.
   * @param md - The Markdown string to convert.
   * @returns The converted HTML string.
   */
  convert(md: string): string {
    const result = unified()
      .use(remarkParse) // Parse Markdown
      .use(remarkGfm) // GitHub Flavored Markdown support
      .use(remarkHtml, this.options.html || {}) // Convert to HTML with options
      .processSync(md);

    return String(result);
  }
}
