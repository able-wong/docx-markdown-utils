import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { MarkdownToHtmlConverter } from '../src/MarkdownToHtmlConverter';
import { MarkdownToWordConverter } from '../src/MarkdownToWordConverter';
import { WordToMarkdownConverter } from '../src/WordToMarkdownConverter';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('MarkdownToWordConverter', () => {
  const resourcesDir = path.join(__dirname, 'resources');
  const inputDir = path.join(resourcesDir, 'markdown');
  const roundtripDir = path.join(resourcesDir, 'roundtrip_markdown');

  // Use roundtrip_markdown files for test comparison
  // Due to libraries restriction, some details or additions are different.
  const inputFiles = fs.readdirSync(inputDir);
  const mdFiles = inputFiles.filter((f) => f.endsWith('.md'));

  mdFiles.forEach((inputFile) => {
    it(`should convert ${inputFile} to docx and back to markdown with round-trip fidelity`, async () => {
      const inputPath = path.join(inputDir, inputFile);
      const roundtripPath = path.join(roundtripDir, inputFile);
      const originalMd = fs.readFileSync(inputPath, 'utf-8').trim();
      const expectedMd = fs.readFileSync(roundtripPath, 'utf-8').trim();
      const mdToWord = new MarkdownToWordConverter();
      const docxResult = await mdToWord.convert(originalMd);

      let docxBuffer: Buffer;
      if (docxResult instanceof Blob) {
        docxBuffer = Buffer.from(await docxResult.arrayBuffer());
      } else if (docxResult instanceof ArrayBuffer) {
        docxBuffer = Buffer.from(docxResult);
      } else {
        docxBuffer = docxResult;
      }

      expect(Buffer.isBuffer(docxBuffer)).toBe(true);
      expect(docxBuffer.length).toBeGreaterThan(0);

      // Now convert back to markdown
      const wordToMd = new WordToMarkdownConverter();
      const roundTripMd = (await wordToMd.convert(docxBuffer)).trim();

      // Compare as HTML using JSDOM
      const mdToHtml = new MarkdownToHtmlConverter();
      const actualHtml = mdToHtml.convert(roundTripMd);
      const expectedHtml = mdToHtml.convert(expectedMd);
      const domActual = new JSDOM(actualHtml);
      const domExpected = new JSDOM(expectedHtml);
      expect(domActual.window.document.body.innerHTML.trim()).toBe(
        domExpected.window.document.body.innerHTML.trim(),
      );
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
});
