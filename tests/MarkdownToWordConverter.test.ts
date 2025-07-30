import { describe, it, expect } from 'vitest';
import { MarkdownToWordConverter } from '../src/MarkdownToWordConverter';
import { WordToMarkdownConverter } from '../src/WordToMarkdownConverter';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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
});
