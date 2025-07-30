// Setup file for Vitest to handle Node.js 18+ compatibility issues
import { webcrypto } from 'node:crypto';

// Polyfill crypto for @m2d/remark-docx dependencies that expect global crypto
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as Crypto;
}
