import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import remarkLint from 'remark-lint';
import remarkPresetLintRecommended from 'remark-preset-lint-recommended';
import remarkParse from 'remark-parse';
import * as mammoth from 'mammoth';
import { parse } from 'node-html-parser';

/**
 * Options for the Word to Markdown conversion process.
 */
export interface WordToMarkdownOptions {
  /**
   * The marker character to use for bullet lists.
   * @default '-'
   */
  bulletListMarker?: '-' | '*' | '+';

  /**
   * The style to use for code blocks.
   * @default 'fenced'
   */
  codeBlockStyle?: 'fenced' | 'indented';
}

/**
 * Converts Microsoft Word documents (.docx) to Markdown format.
 * This utility class leverages mammoth.js for DOCX to HTML conversion
 * and the unified ecosystem (remark/rehype) for HTML to Markdown conversion, with additional
 * features like automatic table header detection and Markdown linting.
 *
 * Example usage:
 * ```typescript
 * const converter = new WordToMarkdownConverter();
 * const markdown = await converter.convert('document.docx');
 *
 * // With options
 * const markdown = await converter.convert(buffer, {
 *   bulletListMarker: '*',
 *   codeBlockStyle: 'fenced'
 * });
 * ```
 */
export class WordToMarkdownConverter {
  /**
   * Converts an HTML table's first row `<td>` elements to `<th>` elements.
   * This helps in generating Markdown tables with proper headers.
   * @param html - The HTML string containing tables.
   * @returns The modified HTML string with table headers adjusted.
   */
  private autoTableHeaders(html: string): string {
    const root = parse(html);
    root.querySelectorAll('table').forEach((table) => {
      const firstRow = table.querySelector('tr');
      if (firstRow) {
        firstRow.querySelectorAll('td').forEach((cell) => {
          cell.tagName = 'th';
        });
      }
    });
    return root.toString();
  }

  /**
   * Converts an HTML string to Markdown using unified processor.
   * Applies GFM support and formatting options.
   * @param html - The HTML string to convert.
   * @param options - Formatting options.
   * @returns The converted Markdown string.
   */
  private async htmlToMd(
    html: string,
    options: WordToMarkdownOptions = {},
  ): Promise<string> {
    const { bulletListMarker = '-', codeBlockStyle = 'fenced' } = options;

    const result = await unified()
      .use(rehypeParse, { fragment: true }) // Parse HTML fragment
      .use(rehypeRemark) // Convert HTML → Markdown AST
      .use(remarkGfm) // GitHub Flavored Markdown support
      .use(remarkStringify, {
        bullet: bulletListMarker,
        fences: codeBlockStyle === 'fenced',
        incrementListMarker: false,
      })
      .process(html);

    return String(result).trim();
  }

  /**
   * Lint and format markdown content using unified processor.
   * @param md - The Markdown string to lint and format.
   * @param options - Formatting options to maintain consistency.
   * @returns A Promise resolving to the cleaned Markdown string.
   */
  private async lint(
    md: string,
    options: WordToMarkdownOptions = {},
  ): Promise<string> {
    const { bulletListMarker = '-', codeBlockStyle = 'fenced' } = options;

    const result = await unified()
      .use(remarkParse) // Add the missing parser
      .use(remarkLint)
      .use(remarkPresetLintRecommended)
      .use(remarkStringify, {
        bullet: bulletListMarker,
        fences: codeBlockStyle === 'fenced',
        incrementListMarker: false,
      })
      .process(md);

    return String(result).trim();
  }

  /**
   * Converts a Word document (provided as a file path, Buffer, or ArrayBuffer) to Markdown.
   * The process involves:
   * 1. Converting the DOCX input to HTML using mammoth.js.
   * 2. Automatically detecting and setting table headers in the HTML.
   * 3. Converting the HTML to Markdown using the unified ecosystem with remark plugins.
   * 4. Linting and fixing the generated Markdown using remark-lint.
   *
   * @param input - The path to the .docx file, a Buffer (Node.js), or an ArrayBuffer (browser) containing the file content.
   * @param options - Optional configuration for markdown formatting.
   * @returns A Promise resolving to the cleaned Markdown string.
   * @throws Error if the conversion process fails.
   */
  async convert(
    input: string | Buffer | ArrayBuffer,
    options: WordToMarkdownOptions = {},
  ): Promise<string> {
    let inputObj:
      | { path: string }
      | { buffer: Buffer }
      | { arrayBuffer: ArrayBuffer };
    if (typeof input === 'string') {
      inputObj = { path: input };
    } else if (
      typeof Buffer !== 'undefined' &&
      Buffer.isBuffer &&
      Buffer.isBuffer(input)
    ) {
      inputObj = { buffer: input };
    } else if (input instanceof ArrayBuffer) {
      inputObj = { arrayBuffer: input };
    } else {
      throw new Error(
        'Invalid input type. Expected string, Buffer, or ArrayBuffer.',
      );
    }
    const mammothResult = await mammoth.convertToHtml(inputObj);
    const html = this.autoTableHeaders(mammothResult.value);
    const md = await this.htmlToMd(html, options);
    const cleanedMd = await this.lint(md, options);
    return cleanedMd;
  }
}
