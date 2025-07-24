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
  const inputFiles = fs.readdirSync(inputDir).filter((f) => f.endsWith('.md'));
  inputFiles.forEach((inputFile) => {
    it(`should convert ${inputFile} to docx and back to markdown with round-trip fidelity`, async () => {
      const inputPath = path.join(inputDir, inputFile);
      const roundtripPath = path.join(roundtripDir, inputFile);
      const originalMd = fs.readFileSync(inputPath, 'utf-8').trim();
      const expectedMd = fs.readFileSync(roundtripPath, 'utf-8').trim();
      const mdToWord = new MarkdownToWordConverter();
      const docxBuffer = await mdToWord.convert(originalMd);
      expect(Buffer.isBuffer(docxBuffer)).toBe(true);
      expect(docxBuffer.length).toBeGreaterThan(0);

      // Now convert back to markdown
      const wordToMd = new WordToMarkdownConverter();
      const roundTripMd = (await wordToMd.convert(docxBuffer)).trim();

      // Compare after normalizing whitespace
      // expect(roundTripMd).toBe(expectedMd);
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

  it('should save DOCX buffer to a local file using saveToFile', async () => {
    const mdToWord = new MarkdownToWordConverter();
    const testMd = '# Test SaveToFile';
    const docxBuffer = await mdToWord.convert(testMd);
    const tmpFile = path.join(
      os.tmpdir(),
      'test_saveToFile_' + Date.now() + '.docx',
    );
    await mdToWord.saveToFile(docxBuffer, tmpFile);
    expect(fs.existsSync(tmpFile)).toBe(true);
    const stat = fs.statSync(tmpFile);
    expect(stat.size).toBeGreaterThan(0);
    fs.unlinkSync(tmpFile); // Clean up
  });
});
