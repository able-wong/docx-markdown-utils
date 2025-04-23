import TurndownService from 'turndown';
import * as turndownPluginGfm from '@joplin/turndown-plugin-gfm';
import * as mammoth from 'mammoth';
import { parse } from 'node-html-parser';
import { lint as lintsync } from 'markdownlint/sync';
import { applyFixes } from 'markdownlint';

/**
 * Options for the conversion process.
 */
interface ConvertOptions {
  /** Options passed directly to the mammoth library. */
  mammoth?: object;
  /** Options passed directly to the turndown library. */
  turndown?: object;
}

/**
 * Options specific to the Turndown service configuration.
 */
interface TurndownOptions {
  /** Specifies the heading style ('setext' for H1 and H2, 'atx' for all levels). */
  headingStyle?: 'setext' | 'atx';
  /** Specifies the code block style ('indented' or 'fenced'). */
  codeBlockStyle?: 'indented' | 'fenced';
  /** Specifies the marker for bullet lists ('*', '-', or '+'). */
  bulletListMarker?: '*' | '-' | '+';
}

export type { ConvertOptions, TurndownOptions };

/**
 * Converts Microsoft Word documents (.docx) to Markdown format.
 * This utility class leverages mammoth.js for DOCX to HTML conversion
 * and Turndown for HTML to Markdown conversion, with additional
 * features like automatic table header detection and Markdown linting.
 *
 * Example usage:
 * ```typescript
 * const converter = new WordToMarkdownConverter();
 * converter.convert('tests/resources/input/formats.docx', {}).then(
 *   (result) => {
 *     console.log(result);
 *   },
 *   (error) => {
 *     console.error('Error:', error);
 *   },
 * );
 * ```
 */
export class WordToMarkdownConverter {
  private defaultTurndownOptions: TurndownOptions = {
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  };

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
   * Converts an HTML string to Markdown using TurndownService.
   * Applies default options and GFM plugin.
   * @param html - The HTML string to convert.
   * @param options - Custom Turndown options.
   * @returns The converted Markdown string.
   */
  private htmlToMd(html: string, options: object = {}): string {
    const turndownService = new TurndownService({
      ...options,
      ...this.defaultTurndownOptions,
    });
    // use GFM plugic (GitHub Flavored Markdown) thats supports
    // strikethrough, tables, task lists, and more
    turndownService.use(turndownPluginGfm.gfm);
    return turndownService.turndown(html).trim();
  }

  /**
   * Lints and automatically fixes common issues in a Markdown string
   * using markdownlint.
   * @param md - The Markdown string to lint and fix.
   * @returns The cleaned Markdown string.
   */
  private lint(md: string): string {
    const lintResult = lintsync({ strings: { md } });
    return applyFixes(md, lintResult['md']).trim();
  }

  /**
   * Converts a Word document (provided as a file path or Buffer) to Markdown.
   * The process involves:
   * 1. Converting the DOCX input to HTML using mammoth.js.
   * 2. Automatically detecting and setting table headers in the HTML.
   * 3. Converting the HTML to Markdown using Turndown with GFM plugins.
   * 4. Linting and fixing the generated Markdown using markdownlint.
   *
   * @param input - The path to the .docx file or an Buffer containing the file content.
   * @param options - Optional configuration for mammoth and turndown.
   * @returns A Promise resolving to the cleaned Markdown string.
   * @throws Error if the conversion process fails.
   */
  async convert(
    input: string | Buffer,
    options: ConvertOptions = {},
  ): Promise<string> {
    let inputObj: { path: string } | { buffer: Buffer };
    if (typeof input === 'string') {
      inputObj = { path: input };
    } else {
      inputObj = { buffer: input };
    }
    const mammothResult = await mammoth.convertToHtml(
      inputObj,
      options.mammoth,
    );
    const html = this.autoTableHeaders(mammothResult.value);
    const md = this.htmlToMd(html, options.turndown);
    const cleanedMd = this.lint(md);
    return cleanedMd;
  }
}
