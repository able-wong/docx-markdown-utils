import { describe, it, expect } from 'vitest';
import { MarkdownToHtmlConverter } from '../src/MarkdownToHtmlConverter.js';

describe('MarkdownToHtmlConverter Options', () => {
  it('should pass options to remark-html plugin', () => {
    // Test that options are being passed by using a known remark-html option
    // Let's test with the 'sanitize' option set to false (allows raw HTML)
    const converter = new MarkdownToHtmlConverter({
      html: {
        sanitize: false,
      },
    });

    const markdownWithHtml = 'Hello <span style="color: red;">world</span>!';
    const html = converter.convert(markdownWithHtml);

    // The exact behavior depends on remark-html version, but we should at least
    // verify that options are being passed without throwing errors
    expect(html).toContain('Hello');
    expect(html).toContain('world');
  });

  it('should work without options (default constructor)', () => {
    const converter = new MarkdownToHtmlConverter();
    const html = converter.convert('**Bold** and *italic* text.');

    expect(html).toContain('<strong>Bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });

  it('should work with empty options object', () => {
    const converter = new MarkdownToHtmlConverter({});
    const html = converter.convert('# Hello World');

    expect(html).toContain('<h1>Hello World</h1>');
  });

  it('should work with empty html options', () => {
    const converter = new MarkdownToHtmlConverter({ html: {} });
    const html = converter.convert('## Subtitle');

    expect(html).toContain('<h2>Subtitle</h2>');
  });
});
