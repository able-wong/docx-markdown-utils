import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

/**
 * Options for the Markdown to HTML conversion process.
 */
export interface MdToHtmlConvertOptions {
  /**
   * Whether to sanitize HTML output to prevent XSS.
   * When true (default), potentially dangerous HTML is escaped.
   * @default true
   */
  sanitize?: boolean;

  /**
   * Whether to allow raw HTML in the markdown input to pass through.
   * When false (default), raw HTML tags in markdown are escaped.
   * @default false
   */
  allowDangerousHtml?: boolean;
}

/**
 * Converts Markdown to HTML.
 * This utility class leverages unified with remark for Markdown to HTML conversion,
 * including full GitHub Flavored Markdown support.
 *
 * Example usage:
 * ```typescript
 * const converter = new MarkdownToHtmlConverter();
 * const html = converter.convert('# Hello');
 *
 * // With options
 * const html = converter.convert('<div>Raw HTML</div>', {
 *   allowDangerousHtml: true,
 *   sanitize: false
 * });
 * ```
 */
export class MarkdownToHtmlConverter {
  /**
   * Converts Markdown to HTML using unified processor with GFM support.
   * @param md - The Markdown string to convert.
   * @param options - Optional configuration for the conversion.
   * @returns The converted HTML string.
   */
  convert(md: string, options: MdToHtmlConvertOptions = {}): string {
    const { sanitize = true, allowDangerousHtml = false } = options;

    const result = unified()
      .use(remarkParse) // Parse Markdown
      .use(remarkGfm) // GitHub Flavored Markdown support
      .use(remarkHtml, {
        sanitize,
        allowDangerousHtml,
      })
      .processSync(md);

    return String(result);
  }
}
