# Project Guidelines for Claude

## Tech Stack

- **Language**: TypeScript (ES Modules only)
- **Runtime**: Node.js ≥20.0.0, Browser (isomorphic)
- **Build**: TypeScript compiler + Rollup (browser bundle)
- **Testing**: Vitest
- **Linting**: ESLint + Prettier
- **Package Manager**: npm

### Key Dependencies

- `unified` / `remark` ecosystem for markdown processing
- `@m2d/remark-docx` for markdown to DOCX conversion
- `mammoth` for DOCX to markdown conversion
- `docx` for DOCX file generation

## Isomorphic Design (Browser + Node.js)

All converters must work in both environments:

### Entry Points

- `src/index.ts` - Node.js entry
- `src/browser.ts` - Browser entry
- `dist/browser.bundle.js` - Standalone browser bundle

### Environment Detection

```typescript
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
```

### Testing Browser Code

```bash
# Run all tests (includes browser simulation via happy-dom)
npm test

# Browser-specific tests use happy-dom environment
# See: tests/*.browser.test.ts
```

Browser tests use `happy-dom` to simulate browser environment. For manual browser testing:

```bash
npm run serve  # Start local server
# Open browser-test-bundle.html
```

## API Design Guidelines

### Options Interface

Target patterns for new/updated code (see Issues #41, #42 for migration):

1. **Pass options in `convert()` method**, not constructor - allows different options per call
2. **Wrap underlying library options** - don't expose mammoth, remark-html, etc. directly
3. **Use our own interfaces** (e.g., `DocxStyleOptions`, `ParagraphStyle`) that we control

Currently only `MarkdownToWordConverter` fully follows these patterns.

```typescript
// Good - wrapped options
interface DocxStyleOptions {
  paragraph?: ParagraphStyle;
  heading1?: ParagraphStyle;
  margins?: { top: number; bottom: number; left: number; right: number };
}

// Bad - exposing underlying library
interface Options {
  remarkDocx?: object;  // Don't do this
  mammoth?: object;     // Don't do this
}
```

### Naming Conventions

- Converter classes: `{Source}To{Target}Converter`
- Options interfaces: `{Target}Options` or `{Source}To{Target}Options`
- Style interfaces: `{Element}Style` (e.g., `ParagraphStyle`)

## Coding Guidelines

### No Backward Compatibility Concerns

This is a 0.x release - breaking changes are acceptable per semver. Don't add complexity for backward compatibility.

### Error Handling

```typescript
try {
  // conversion logic
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  throw new Error(`{Converter} failed: ${errorMessage}`);
}
```

### Type Safety

- Export all public interfaces from `src/index.ts`
- Use `Required<T>` for default values objects
- Avoid `any` - use proper types or `unknown`

## Testing

```bash
npm test           # Run all tests
npm run test:watch # Watch mode
npm run lint       # Lint check
npm run build      # Build all (TypeScript + browser bundle)
```

### Test File Naming

- `*.test.ts` - Standard tests
- `*.browser.test.ts` - Browser-specific tests (use happy-dom)

## Release Process

1. Update version in `package.json`
2. Update changelog in `README.md`
3. Run `npm run lint && npm run build && npm test`
4. Create PR, merge to main
5. Tag release: `git tag vX.Y.Z && git push --tags`
6. Publish: `npm publish`
