import { WordToMarkdownConverter } from '../src/WordToMarkdownConverter';
import * as fs from 'fs';
import * as path from 'path';

describe('WordToMarkdownConverter', () => {
  const resourcesDir = path.join(__dirname, 'resources');
  const inputDir = path.join(resourcesDir, 'docx');
  const outputDir = path.join(resourcesDir, 'markdown');

  // Dynamically build test cases from input/output files
  const inputFiles = fs
    .readdirSync(inputDir)
    .filter((f) => f.endsWith('.docx'));
  const outputFiles = fs
    .readdirSync(outputDir)
    .filter((f) => f.endsWith('.md'));
  const testCases = inputFiles
    .map((inputFile) => {
      const base = path.parse(inputFile).name;
      const expectedFile = base + '.md';
      if (outputFiles.includes(expectedFile)) {
        return {
          name: base,
          input: inputFile,
          expected: expectedFile,
        };
      }
      return null;
    })
    .filter(
      (tc): tc is { name: string; input: string; expected: string } =>
        tc !== null,
    );

  testCases.forEach(({ name, input, expected }) => {
    it(`should convert ${input} using 'path' to match ${expected}`, async () => {
      const inputPath = path.join(inputDir, input);
      const expectedPath = path.join(outputDir, expected);
      const expectedMd = fs.readFileSync(expectedPath, 'utf-8').trim();
      const converter = new WordToMarkdownConverter();
      const md = (await converter.convert(inputPath)).trim();

      expect(md).toBe(expectedMd);
    });
  });

  testCases.forEach(({ name, input, expected }) => {
    it(`should convert ${input} using 'buffer' to match ${expected}`, async () => {
      const inputPath = path.join(inputDir, input);
      const expectedPath = path.join(outputDir, expected);
      const expectedMd = fs.readFileSync(expectedPath, 'utf-8').trim();
      const buffer = fs.readFileSync(inputPath);
      const converter = new WordToMarkdownConverter();
      const md = (await converter.convert(buffer)).trim();

      expect(md).toBe(expectedMd);
    });
  });
});
