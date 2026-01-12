import { describe, it, expect } from 'vitest';
import { MarkdownToHtmlConverter } from '../src/MarkdownToHtmlConverter.js';

describe('MarkdownToHtmlConverter Options', () => {
  it('should pass options to convert method', () => {
    const converter = new MarkdownToHtmlConverter();

    const markdownWithHtml = 'Hello <span style="color: red;">world</span>!';
    const html = converter.convert(markdownWithHtml, {
      sanitize: false,
      allowDangerousHtml: true,
    });

    // With allowDangerousHtml: true and sanitize: false, raw HTML should pass through
    expect(html).toContain('Hello');
    expect(html).toContain('world');
  });

  it('should work without options (default behavior)', () => {
    const converter = new MarkdownToHtmlConverter();
    const html = converter.convert('**Bold** and *italic* text.');

    expect(html).toContain('<strong>Bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });

  it('should work with empty options object', () => {
    const converter = new MarkdownToHtmlConverter();
    const html = converter.convert('# Hello World', {});

    expect(html).toContain('<h1>Hello World</h1>');
  });

  it('should sanitize by default', () => {
    const converter = new MarkdownToHtmlConverter();
    const markdownWithHtml = 'Hello <script>alert("xss")</script>world';

    // With default sanitize: true, dangerous HTML should be escaped
    const html = converter.convert(markdownWithHtml);

    // Script tags should be escaped or removed
    expect(html).not.toContain('<script>');
    expect(html).toContain('Hello');
    expect(html).toContain('world');
  });

  it('should allow raw HTML when allowDangerousHtml is true', () => {
    const converter = new MarkdownToHtmlConverter();
    const markdownWithHtml = 'Hello <em>inline html</em> world';

    const html = converter.convert(markdownWithHtml, {
      allowDangerousHtml: true,
      sanitize: false,
    });

    expect(html).toContain('<em>inline html</em>');
  });

  it('should use different options for different convert calls', () => {
    const converter = new MarkdownToHtmlConverter();
    const markdown = 'Test <b>bold</b> content';

    // First call with default options (sanitize: true)
    const sanitizedHtml = converter.convert(markdown);
    expect(sanitizedHtml).not.toContain('<b>bold</b>');

    // Second call with allowDangerousHtml
    const unsanitizedHtml = converter.convert(markdown, {
      allowDangerousHtml: true,
      sanitize: false,
    });
    expect(unsanitizedHtml).toContain('<b>bold</b>');
  });
});
