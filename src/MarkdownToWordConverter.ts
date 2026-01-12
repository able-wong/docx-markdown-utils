import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { remarkDocx } from '@m2d/remark-docx';
import { convertInchesToTwip } from 'docx';

/**
 * Paragraph styling options that mirror Word's paragraph formatting.
 */
export interface ParagraphStyle {
  /** Font name. */
  font?: string;
  /** Font size in points. */
  fontSize?: number;
  /** Text color in hex format (without #). */
  color?: string;
  /** Bold text. */
  bold?: boolean;
  /** Italic text. */
  italic?: boolean;
  /** Text alignment. */
  alignment?: 'left' | 'center' | 'right' | 'justify';
  /** Line spacing multiplier (1.0 = single, 1.5 = 1.5 lines, 2.0 = double). */
  lineSpacing?: number;
  /** Spacing before paragraph in points. */
  spacingBefore?: number;
  /** Spacing after paragraph in points. */
  spacingAfter?: number;
}

/**
 * Styling options for DOCX output.
 * These options provide a simplified interface for common styling needs.
 */
export interface DocxStyleOptions {
  /** Body text paragraph style. */
  paragraph?: ParagraphStyle;
  /** Heading 1 style. */
  heading1?: ParagraphStyle;
  /** Heading 2 style. */
  heading2?: ParagraphStyle;
  /** Heading 3 style. */
  heading3?: ParagraphStyle;
  /** Heading 4 style. */
  heading4?: ParagraphStyle;
  /** Page margins in inches. */
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  /** Document title metadata. */
  title?: string;
  /** Document author metadata. */
  author?: string;
  /** Document description/subject metadata. */
  description?: string;
}

/**
 * Options for the Markdown to Word conversion process.
 */
export interface MdToWordConvertOptions {
  /** Styling options for the DOCX output. */
  styles?: DocxStyleOptions;
  /** @deprecated Legacy options for @turbodocx/html-to-docx compatibility. Ignored. */
  htmlToDocx?: object;
}

/** Default body paragraph style matching modern Microsoft Word */
const DEFAULT_PARAGRAPH: Required<ParagraphStyle> = {
  font: 'Calibri',
  fontSize: 11,
  color: '000000',
  bold: false,
  italic: false,
  alignment: 'left',
  lineSpacing: 1.15,
  spacingBefore: 0,
  spacingAfter: 8,
};

/** Default heading styles matching modern Microsoft Word */
const DEFAULT_HEADINGS: Record<string, ParagraphStyle> = {
  heading1: {
    font: 'Calibri Light',
    fontSize: 20,
    color: '2F5496',
    bold: false,
    spacingBefore: 12,
    spacingAfter: 0,
  },
  heading2: {
    font: 'Calibri Light',
    fontSize: 16,
    color: '2F5496',
    bold: false,
    spacingBefore: 8,
    spacingAfter: 0,
  },
  heading3: {
    font: 'Calibri Light',
    fontSize: 14,
    color: '2F5496',
    bold: false,
    spacingBefore: 8,
    spacingAfter: 0,
  },
  heading4: {
    font: 'Calibri Light',
    fontSize: 12,
    color: '2F5496',
    bold: false,
    italic: true,
    spacingBefore: 4,
    spacingAfter: 0,
  },
};

/** Default page margins in inches */
const DEFAULT_MARGINS = {
  top: 1,
  bottom: 1,
  left: 1,
  right: 1,
};

/**
 * Converts a ParagraphStyle to docx.js run properties.
 */
function toRunProps(style: ParagraphStyle) {
  return {
    font: style.font,
    size: style.fontSize ? style.fontSize * 2 : undefined, // half-points
    color: style.color,
    bold: style.bold,
    italics: style.italic,
  };
}

/**
 * Converts a ParagraphStyle to docx.js paragraph properties.
 */
function toParagraphProps(style: ParagraphStyle) {
  const props: Record<string, unknown> = {};

  if (style.alignment) {
    props.alignment = style.alignment === 'justify' ? 'both' : style.alignment;
  }

  const spacing: Record<string, number> = {};
  if (style.lineSpacing) {
    spacing.line = Math.round(style.lineSpacing * 240); // 240ths of a line
  }
  if (style.spacingBefore !== undefined) {
    spacing.before = style.spacingBefore * 20; // twentieths of a point
  }
  if (style.spacingAfter !== undefined) {
    spacing.after = style.spacingAfter * 20; // twentieths of a point
  }
  if (Object.keys(spacing).length > 0) {
    props.spacing = spacing;
  }

  return props;
}

/**
 * Merges user styles with defaults.
 */
function mergeStyles(
  userStyle: ParagraphStyle | undefined,
  defaultStyle: ParagraphStyle,
): ParagraphStyle {
  if (!userStyle) return defaultStyle;
  return { ...defaultStyle, ...userStyle };
}

/**
 * Converts our simplified style options to docx.js IDocxProps format.
 */
function buildDocxProps(styles: DocxStyleOptions = {}) {
  const paragraph = mergeStyles(styles.paragraph, DEFAULT_PARAGRAPH);
  const heading1 = mergeStyles(styles.heading1, DEFAULT_HEADINGS.heading1);
  const heading2 = mergeStyles(styles.heading2, DEFAULT_HEADINGS.heading2);
  const heading3 = mergeStyles(styles.heading3, DEFAULT_HEADINGS.heading3);
  const heading4 = mergeStyles(styles.heading4, DEFAULT_HEADINGS.heading4);

  return {
    title: styles.title,
    creator: styles.author,
    description: styles.description,
    styles: {
      default: {
        document: {
          run: toRunProps(paragraph),
          paragraph: toParagraphProps(paragraph),
        },
        heading1: {
          run: toRunProps(heading1),
          paragraph: toParagraphProps(heading1),
        },
        heading2: {
          run: toRunProps(heading2),
          paragraph: toParagraphProps(heading2),
        },
        heading3: {
          run: toRunProps(heading3),
          paragraph: toParagraphProps(heading3),
        },
        heading4: {
          run: toRunProps(heading4),
          paragraph: toParagraphProps(heading4),
        },
        // h5 and h6 use h4 styling
        heading5: {
          run: toRunProps(heading4),
          paragraph: toParagraphProps(heading4),
        },
        heading6: {
          run: toRunProps(heading4),
          paragraph: toParagraphProps(heading4),
        },
      },
    },
  };
}

/**
 * Builds section properties with page margins.
 */
function buildSectionProps(styles: DocxStyleOptions = {}) {
  const margins = { ...DEFAULT_MARGINS, ...(styles.margins || {}) };

  return {
    properties: {
      page: {
        margin: {
          top: convertInchesToTwip(margins.top ?? 1),
          bottom: convertInchesToTwip(margins.bottom ?? 1),
          left: convertInchesToTwip(margins.left ?? 1),
          right: convertInchesToTwip(margins.right ?? 1),
        },
      },
    },
  };
}

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
 * import { MarkdownToWordConverter } from 'docx-markdown-utils';
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
 * import { MarkdownToWordConverter } from 'docx-markdown-utils';
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
 * ## Custom Styling
 *
 * You can customize the output styling to match your needs:
 *
 * ```typescript
 * const converter = new MarkdownToWordConverter();
 * const docx = await converter.convert('# Document', {
 *   styles: {
 *     paragraph: {
 *       font: 'Arial',
 *       fontSize: 12,
 *       lineSpacing: 1.5
 *     },
 *     heading1: {
 *       font: 'Arial Black',
 *       fontSize: 24,
 *       color: '000000'
 *     },
 *     margins: { top: 0.5, bottom: 0.5, left: 0.75, right: 0.75 }
 *   }
 * });
 * ```
 *
 * ## Features
 *
 * - **Direct Markdown Processing**: No HTML intermediate step
 * - **GitHub Flavored Markdown**: Full GFM support including tables, strikethrough, task lists
 * - **Modern Word Defaults**: Calibri font with proper heading sizes matching Microsoft Word
 * - **Customizable Styling**: Paragraph and heading styles with font, size, color, spacing options
 * - **ESM-Native Dependencies**: No CommonJS compatibility issues
 * - **Smaller Output Files**: More efficient DOCX generation
 * - **Better Remix/Vite Compatibility**: No bundling issues with html-to-vdom
 */
export class MarkdownToWordConverter {
  /**
   * Converts Markdown to a Word document as a `Buffer` in Node.js or a `Blob`
   * in the browser.
   *
   * The process involves:
   * 1. Parsing Markdown to MDAST (Markdown Abstract Syntax Tree).
   * 2. Converting MDAST directly to DOCX using @m2d/remark-docx.
   *
   * @param md - The Markdown string to convert.
   * @param options - Optional configuration for the conversion including styling.
   * @returns A Promise resolving to a `Buffer` or `Blob` containing the DOCX file.
   * @throws Error if the conversion process fails.
   */
  async convert(
    md: string,
    options: MdToWordConvertOptions = {},
  ): Promise<Buffer | Blob> {
    try {
      const docxProps = buildDocxProps(options.styles);
      const sectionProps = buildSectionProps(options.styles);

      // Detect environment for output type
      const isBrowser =
        typeof window !== 'undefined' && typeof window.document !== 'undefined';
      const outputType = isBrowser ? 'blob' : 'nodebuffer';

      // Plugin options to fix table header visibility
      const tableHeaderFixPluginProps = {
        table: {
          firstRowCellProps: {
            shading: undefined, // Remove default gold shading that renders as black
            data: {
              bold: true,
            },
          },
        },
      };

      // Create processor with styling options
      const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(
          remarkDocx,
          outputType,
          docxProps,
          sectionProps,
          tableHeaderFixPluginProps,
        );

      // Process the markdown through the unified pipeline
      const result = await processor.process(md);

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
