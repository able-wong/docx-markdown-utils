/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { MarkdownToWordConverter } from '../src/MarkdownToWordConverter';

async function readDocumentXml(docx: Buffer | Blob): Promise<string> {
  const data = docx instanceof Blob ? await docx.arrayBuffer() : docx;
  const zip = await JSZip.loadAsync(data);
  const file = zip.file('word/document.xml');
  if (!file) {
    throw new Error('Missing word/document.xml in generated DOCX');
  }
  return file.async('string');
}

describe('MarkdownToWordConverter - Browser Environment', () => {
  it('should return a Blob', async () => {
    const docx = await new MarkdownToWordConverter().convert('# Hello');

    expect(docx).toBeInstanceOf(Blob);
  });

  it('should render inline HTML by default', async () => {
    const docx = await new MarkdownToWordConverter().convert(
      'Some <b>bold</b> text',
    );

    const xml = await readDocumentXml(docx);

    expect(xml).toMatch(/<w:b\/>.*?bold/s);
  });

  it('should convert emoji shortcodes', async () => {
    const docx = await new MarkdownToWordConverter().convert('Hi :rocket:');

    const xml = await readDocumentXml(docx);

    expect(xml).toContain('Hi 🚀');
  });

  it('should write a mermaid block as code text by default', async () => {
    const docx = await new MarkdownToWordConverter().convert(
      '```mermaid\ngraph TD; A-->B;\n```',
    );

    const xml = await readDocumentXml(docx);

    expect(xml).toContain('graph TD; A--&gt;B;');
    expect(xml).not.toContain('<w:drawing');
  });

  it('should load the image plugin when images is enabled', async () => {
    const docx = await new MarkdownToWordConverter().convert('# Images on', {
      features: { images: true },
    });

    const xml = await readDocumentXml(docx);

    expect(xml).toContain('Images on');
  });
});
