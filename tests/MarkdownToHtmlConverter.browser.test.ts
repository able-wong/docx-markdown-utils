/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest';
import { MarkdownToHtmlConverter } from '../src/MarkdownToHtmlConverter';

describe('MarkdownToHtmlConverter - Browser Environment', () => {
  it('should work in browser environment with DOM globals', () => {
    // Verify we're in browser environment
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
    expect(typeof globalThis).toBe('object');

    const converter = new MarkdownToHtmlConverter();
    const html = converter.convert('# Hello **World**!');

    expect(html).toContain('<h1>');
    expect(html).toContain('<strong>');
  });

  it('should convert markdown to HTML that works with DOM API', () => {
    const converter = new MarkdownToHtmlConverter();
    const html = converter.convert(`
# Test Document

This is a **bold** and *italic* text.

## List Test
- Item 1
- Item 2
- Item 3

### Code Block
\`\`\`javascript
console.log('Hello World');
\`\`\`
    `);

    // Parse HTML with browser DOM API
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Verify DOM structure
    const h1 = doc.querySelector('h1');
    const h2 = doc.querySelector('h2');
    const strong = doc.querySelector('strong');
    const em = doc.querySelector('em');
    const ul = doc.querySelector('ul');
    const pre = doc.querySelector('pre');

    expect(h1?.textContent).toBe('Test Document');
    expect(h2?.textContent).toBe('List Test');
    expect(strong?.textContent).toBe('bold');
    expect(em?.textContent).toBe('italic');
    expect(ul?.children.length).toBe(3);
    expect(pre).toBeTruthy();
  });

  it('should handle GFM features in browser environment', () => {
    const converter = new MarkdownToHtmlConverter();
    const html = converter.convert(`
# GFM Features Test

## Table
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |

## Strikethrough
~~strikethrough text~~

## Task List
- [x] Completed task
- [ ] Incomplete task
    `);

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Check table
    const table = doc.querySelector('table');
    const th = doc.querySelectorAll('th');
    const td = doc.querySelectorAll('td');

    expect(table).toBeTruthy();
    expect(th.length).toBe(2);
    expect(td.length).toBe(2);
    expect(th[0]?.textContent).toBe('Header 1');

    // Check strikethrough
    const del = doc.querySelector('del');
    expect(del?.textContent).toBe('strikethrough text');

    // Check task list
    const checkboxes = doc.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(2);
    expect((checkboxes[0] as HTMLInputElement)?.checked).toBe(true);
    expect((checkboxes[1] as HTMLInputElement)?.checked).toBe(false);
  });

  it('should work with File API simulation for browser use case', () => {
    // Simulate browser File API usage scenario
    const markdownContent = `
# Document from File

This markdown content could come from:
- File input element
- Drag and drop
- Paste operation
- Fetch request

**Content**: Ready for conversion!
    `;

    const converter = new MarkdownToHtmlConverter();
    const html = converter.convert(markdownContent);

    // Simulate creating a Blob (browser File API)
    const blob = new Blob([html], { type: 'text/html' });
    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toBe('text/html');

    // Verify the HTML content
    expect(html).toContain('<h1>Document from File</h1>');
    expect(html).toContain('<strong>Content</strong>');
    expect(html).toContain('<ul>');
  });

  it('should maintain consistent output between Node and browser environments', () => {
    const testCases = [
      '# Simple Heading',
      '**Bold** and *italic*',
      '- List item 1\n- List item 2',
      '`inline code`',
      '> Blockquote text',
      '[Link](https://example.com)',
      '~~strikethrough~~',
    ];

    const converter = new MarkdownToHtmlConverter();

    testCases.forEach((markdown) => {
      const html = converter.convert(markdown);

      // Basic checks that should work in both environments
      expect(typeof html).toBe('string');
      expect(html.length).toBeGreaterThan(0);

      // Should not contain raw markdown syntax in output
      if (markdown.includes('**')) {
        expect(html).toContain('<strong>');
      }
      if (markdown.includes('*') && !markdown.includes('**')) {
        expect(html).toContain('<em>');
      }
      if (markdown.includes('#')) {
        expect(html).toContain('<h');
      }
      if (markdown.includes('-')) {
        expect(html).toContain('<li>');
      }
    });
  });

  it('should handle empty and edge case inputs in browser environment', () => {
    const converter = new MarkdownToHtmlConverter();

    // Empty string
    expect(converter.convert('')).toBe('');

    // Whitespace only
    expect(converter.convert('   \n  \t  ')).toBe('');

    // Single character
    expect(converter.convert('a').trim()).toBe('<p>a</p>');

    // Special characters
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const result = converter.convert(specialChars);
    // HTML should contain the characters (possibly escaped)
    expect(result).toContain('<p>');
    expect(result).toContain('!@#$%^'); // Basic chars should be there
    expect(result.length).toBeGreaterThan(specialChars.length); // Should have HTML tags
  });
});
