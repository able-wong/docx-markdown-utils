import { describe, it, expect } from 'vitest';
import { MarkdownToWordConverter } from '../src/MarkdownToWordConverter';
import { WordToMarkdownConverter } from '../src/WordToMarkdownConverter';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import JSZip from 'jszip';

const HEADING_LEVELS = [
  { markdown: '# H1', text: 'H1', wordStyle: 'Heading1', depth: 1 },
  { markdown: '## H2', text: 'H2', wordStyle: 'Heading2', depth: 2 },
  { markdown: '### H3', text: 'H3', wordStyle: 'Heading3', depth: 3 },
  { markdown: '#### H4', text: 'H4', wordStyle: 'Heading4', depth: 4 },
  { markdown: '##### H5', text: 'H5', wordStyle: 'Heading5', depth: 5 },
  { markdown: '###### H6', text: 'H6', wordStyle: 'Heading6', depth: 6 },
];

const ALL_HEADINGS_MD = HEADING_LEVELS.map((h) => h.markdown).join('\n\n');

async function toBuffer(docx: Buffer | Blob): Promise<Buffer> {
  return docx instanceof Blob ? Buffer.from(await docx.arrayBuffer()) : docx;
}

async function readDocxPart(docx: Buffer | Blob, part: string) {
  const zip = await JSZip.loadAsync(await toBuffer(docx));
  const file = zip.file(part);
  if (!file) {
    throw new Error(`Missing ${part} in generated DOCX`);
  }
  return file.async('string');
}

/** Maps each paragraph's text to its Word paragraph style ID. */
async function readParagraphStyles(docx: Buffer | Blob) {
  const xml = await readDocxPart(docx, 'word/document.xml');
  const styles = new Map<string, string | undefined>();
  for (const [paragraph] of xml.matchAll(/<w:p>.*?<\/w:p>/gs)) {
    const text = [...paragraph.matchAll(/<w:t[^>]*>([^<]*)</g)]
      .map((match) => match[1])
      .join('');
    styles.set(text, paragraph.match(/<w:pStyle w:val="([^"]+)"/)?.[1]);
  }
  return styles;
}

async function readStyleDefinition(docx: Buffer | Blob, styleId: string) {
  const xml = await readDocxPart(docx, 'word/styles.xml');
  const definition = new RegExp(
    `<w:style [^>]*w:styleId="${styleId}".*?</w:style>`,
    's',
  ).exec(xml);
  if (!definition) {
    throw new Error(`Missing style ${styleId} in generated DOCX`);
  }
  return definition[0];
}

describe('MarkdownToWordConverter', () => {
  const resourcesDir = path.join(__dirname, 'resources');
  const inputDir = path.join(resourcesDir, 'markdown');

  // Use roundtrip_markdown files for test comparison
  // Due to libraries restriction, some details or additions are different.
  const inputFiles = fs.readdirSync(inputDir);
  const mdFiles = inputFiles.filter((f) => f.endsWith('.md'));

  mdFiles.forEach((inputFile) => {
    it(`should convert ${inputFile} to docx successfully`, async () => {
      const inputPath = path.join(inputDir, inputFile);
      const originalMd = fs.readFileSync(inputPath, 'utf-8').trim();
      const mdToWord = new MarkdownToWordConverter();
      const docxResult = await mdToWord.convert(originalMd);

      // Check that we got a valid DOCX result
      expect(docxResult).toBeDefined();

      if (docxResult instanceof Blob) {
        expect(docxResult.size).toBeGreaterThan(1000); // DOCX files should be reasonably sized
        // The new implementation correctly sets MIME type
        expect(docxResult.type).toBe(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        );
      } else if (Buffer.isBuffer(docxResult)) {
        expect(docxResult.length).toBeGreaterThan(1000);
      }

      // Test that the DOCX can be converted back to some markdown
      let docxBuffer: Buffer;
      if (docxResult instanceof Blob) {
        docxBuffer = Buffer.from(await docxResult.arrayBuffer());
      } else if (docxResult instanceof ArrayBuffer) {
        docxBuffer = Buffer.from(docxResult);
      } else {
        docxBuffer = docxResult as Buffer;
      }

      const wordToMd = new WordToMarkdownConverter();
      const roundTripMd = await wordToMd.convert(docxBuffer);

      // Just check we got some markdown back
      expect(typeof roundTripMd).toBe('string');
      expect(roundTripMd.length).toBeGreaterThan(0);
    });
  });

  it('should convert markdown and allow saving the resulting buffer to a file', async () => {
    const mdToWord = new MarkdownToWordConverter();
    const testMd = '# Test File Saving';
    const docxResult = await mdToWord.convert(testMd);
    const tmpFile = path.join(
      os.tmpdir(),
      'test_saveToFile_' + Date.now() + '.docx',
    );

    let docxBuffer: Buffer;
    if (docxResult instanceof Blob) {
      docxBuffer = Buffer.from(await docxResult.arrayBuffer());
    } else if (docxResult instanceof ArrayBuffer) {
      docxBuffer = Buffer.from(docxResult);
    } else {
      docxBuffer = docxResult;
    }

    fs.writeFileSync(tmpFile, docxBuffer);

    const stats = fs.statSync(tmpFile);
    expect(stats.size).toBeGreaterThan(0);
    fs.unlinkSync(tmpFile); // Clean up
  });

  describe('heading levels', () => {
    it.each(HEADING_LEVELS)(
      'should write $markdown as Word style $wordStyle',
      async ({ text, wordStyle }) => {
        const docx = await new MarkdownToWordConverter().convert(
          ALL_HEADINGS_MD,
        );

        const styles = await readParagraphStyles(docx);

        expect(styles.get(text)).toBe(wordStyle);
      },
    );

    it('should not use the Word Title style for any heading', async () => {
      const docx = await new MarkdownToWordConverter().convert(ALL_HEADINGS_MD);

      const styles = await readParagraphStyles(docx);

      expect([...styles.values()]).not.toContain('Title');
    });

    it('should apply styles.heading1 to the style used by a # heading', async () => {
      const docx = await new MarkdownToWordConverter().convert('# H1', {
        styles: { heading1: { color: 'FF0000' } },
      });

      const paragraphStyles = await readParagraphStyles(docx);
      const definition = await readStyleDefinition(
        docx,
        paragraphStyles.get('H1') ?? '',
      );

      expect(definition).toContain('<w:color w:val="FF0000"/>');
    });

    it('should keep heading depth through a Markdown to DOCX round trip', async () => {
      const docx = await new MarkdownToWordConverter().convert(ALL_HEADINGS_MD);

      const roundTripMd = await new WordToMarkdownConverter().convert(
        await toBuffer(docx),
      );

      for (const { text, depth } of HEADING_LEVELS) {
        // Headings come back with an empty []() bookmark anchor before the text.
        expect(roundTripMd).toMatch(
          new RegExp(`^${'#'.repeat(depth)} .*${text}$`, 'm'),
        );
      }
    });
  });
});
