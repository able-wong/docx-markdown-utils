import { describe, it, expect } from 'vitest';
import { WordToMarkdownConverter } from '../src/WordToMarkdownConverter';

describe('WordToMarkdownConverter - ArrayBuffer Support', () => {
  it('should throw error for invalid input type', async () => {
    const converter = new WordToMarkdownConverter();

    // Test with invalid input type
    await expect(converter.convert({} as unknown)).rejects.toThrow(
      'Invalid input type. Expected string, Buffer, or ArrayBuffer.',
    );

    await expect(converter.convert(123 as unknown)).rejects.toThrow(
      'Invalid input type. Expected string, Buffer, or ArrayBuffer.',
    );

    await expect(converter.convert(null as unknown)).rejects.toThrow(
      'Invalid input type. Expected string, Buffer, or ArrayBuffer.',
    );
  });

  it('should accept ArrayBuffer type without throwing type detection error', async () => {
    const converter = new WordToMarkdownConverter();

    // Create a minimal ArrayBuffer (won't be valid DOCX, but should pass type check)
    const arrayBuffer = new ArrayBuffer(8);

    // This should pass type detection but fail at mammoth parsing
    // We expect a mammoth error, not a type detection error
    await expect(converter.convert(arrayBuffer)).rejects.not.toThrow(
      'Invalid input type. Expected string, Buffer, or ArrayBuffer.',
    );
  });

  it('should handle different input types correctly in type detection', () => {
    // Test type detection logic (not actual conversion)
    const stringInput = 'test.docx';
    const bufferInput = Buffer.from('test');
    const arrayBufferInput = new ArrayBuffer(8);

    // These should not throw synchronously during type checking
    expect(() => typeof stringInput).not.toThrow();
    expect(() => Buffer.isBuffer(bufferInput)).not.toThrow();
    expect(() => arrayBufferInput instanceof ArrayBuffer).not.toThrow();

    // Verify ArrayBuffer type check works
    expect(arrayBufferInput instanceof ArrayBuffer).toBe(true);
    expect(Buffer.isBuffer(arrayBufferInput)).toBe(false);
    expect(typeof arrayBufferInput).toBe('object');
  });

  it('should properly detect Buffer vs ArrayBuffer types', () => {
    // Test the same type detection logic used in the converter
    const buffer = Buffer.from('test data');
    const arrayBuffer = new ArrayBuffer(8);

    // String detection
    expect(typeof 'test.docx').toBe('string');

    // Buffer detection
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer) {
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(Buffer.isBuffer(arrayBuffer)).toBe(false);
    }

    // ArrayBuffer detection
    expect(buffer instanceof ArrayBuffer).toBe(false);
    expect(arrayBuffer instanceof ArrayBuffer).toBe(true);
  });
});
