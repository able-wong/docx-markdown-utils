import { describe, it, expect } from 'vitest';
import { MarkdownToHtmlConverter } from '../src/MarkdownToHtmlConverter';
import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';

describe('MarkdownToHtmlConverter', () => {
  const resourcesDir = path.join(__dirname, 'resources', 'markdown');
  const htmlDir = path.join(__dirname, 'resources', 'html');
  const inputFiles = fs
    .readdirSync(resourcesDir)
    .filter((f) => f.endsWith('.md'));

  inputFiles.forEach((inputFile) => {
    it(`should convert ${inputFile} to HTML`, () => {
      const inputPath = path.join(resourcesDir, inputFile);
      const expectedHtmlPath = path.join(
        htmlDir,
        inputFile.replace(/\.md$/, '.html'),
      );
      const md = fs.readFileSync(inputPath, 'utf-8');
      const converter = new MarkdownToHtmlConverter();
      const html = converter.convert(md);
      const expectedHtml = fs.readFileSync(expectedHtmlPath, 'utf-8');
      expect(html.trim()).toBe(expectedHtml.trim());
    });
  });

  it('should convert a simple markdown string to HTML', () => {
    const md = '# Hello\n\nThis is **bold** and _italic_.';
    const converter = new MarkdownToHtmlConverter();
    const html = converter.convert(md);
    const expectedHtml =
      '<h1>Hello</h1>\n<p>This is <strong>bold</strong> and <em>italic</em>.</p>';
    const domActual = new JSDOM(html);
    const domExpected = new JSDOM(expectedHtml);
    expect(domActual.window.document.body.innerHTML.trim()).toBe(
      domExpected.window.document.body.innerHTML.trim(),
    );
  });

  it('should convert hard breaks (two trailing spaces) to <br> tags', () => {
    // Two trailing spaces before newline creates a hard break per CommonMark spec
    const md = 'line1  \nline2  \nline3  \nline4';
    const converter = new MarkdownToHtmlConverter();
    const html = converter.convert(md);
    const expectedHtml = '<p>line1<br>\nline2<br>\nline3<br>\nline4</p>';
    const domActual = new JSDOM(html);
    const domExpected = new JSDOM(expectedHtml);
    expect(domActual.window.document.body.innerHTML.trim()).toBe(
      domExpected.window.document.body.innerHTML.trim(),
    );
  });
});
