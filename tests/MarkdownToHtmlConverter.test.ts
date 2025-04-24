import { MarkdownToHtmlConverter } from '../src/MarkdownToHtmlConverter';
import * as fs from 'fs';
import * as path from 'path';

describe('MarkdownToHtmlConverter', () => {
  const resourcesDir = path.join(__dirname, 'resources', 'markdown');
  const htmlDir = path.join(__dirname, 'resources', 'html');
  const inputFiles = fs.readdirSync(resourcesDir).filter((f) => f.endsWith('.md'));

  inputFiles.forEach((inputFile) => {
    it(`should convert ${inputFile} to HTML`, () => {
      const inputPath = path.join(resourcesDir, inputFile);
      const expectedHtmlPath = path.join(htmlDir, inputFile.replace(/\.md$/, '.html'));
      const md = fs.readFileSync(inputPath, 'utf-8');
      const converter = new MarkdownToHtmlConverter();
      const html = converter.convert(md);
      if (!fs.existsSync(expectedHtmlPath)) {
        fs.writeFileSync(expectedHtmlPath, html); // Populate expected output for user to review
      }
      const expectedHtml = fs.readFileSync(expectedHtmlPath, 'utf-8');
      expect(html.trim()).toBe(expectedHtml.trim());
    });
  });

  it('should convert a simple markdown string to HTML', () => {
    const md = '# Hello\n\nThis is **bold** and _italic_.';
    const converter = new MarkdownToHtmlConverter();
    const html = converter.convert(md);
    // Compare with actual HTML output
    expect(html.trim()).toBe('<h1>Hello</h1>\n<p>This is <strong>bold</strong> and <i>italic</i>.</p>');
  });
});
