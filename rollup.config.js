import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';

export default {
  input: 'dist/browser.js',
  output: {
    file: 'dist/browser.bundle.js',
    format: 'iife',
    name: 'DocxMarkdownUtils',
    globals: {
      // Map any external dependencies to global variables if needed
    },
  },
  plugins: [
    json(),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    terser({
      compress: {
        drop_console: false, // Keep console.log for debugging
        drop_debugger: true,
        dead_code: true, // Remove unreachable code
        unused: true, // Remove unused variables
        conditionals: true, // Optimize if-else statements
        comparisons: true, // Optimize comparisons
        evaluate: true, // Evaluate constant expressions
        booleans: true, // Optimize boolean expressions
        sequences: true, // Join consecutive simple statements
        join_vars: true, // Join variable declarations
        collapse_vars: true, // Collapse single-use variables
        reduce_vars: true, // Reduce variables to values when possible
        if_return: true, // Optimize if-return and if-throw sequences
        hoist_funs: true, // Hoist function declarations
        side_effects: true, // Remove side-effect-free statements
        passes: 1, // Single pass for safety
      },
      mangle: {
        toplevel: false, // Don't mangle top-level names for safety
        reserved: ['DocxMarkdownUtils'], // Keep our main export name
      },
      format: {
        comments: false, // Remove all comments
        beautify: false, // Don't beautify output
        indent_level: 0, // No indentation
        max_line_len: false, // No line length limit
        semicolons: true, // Always use semicolons
        shorthand: true, // Use shorthand object notation
        preserve_annotations: false, // Remove type annotations
        ecma: 2020,
      },
    }),
  ],
  external: [
    // Keep these as external since they need to be loaded separately
    // or can't be bundled properly
  ],
  onwarn(warning, warn) {
    // Suppress circular dependency warnings from node_modules
    if (
      warning.code === 'CIRCULAR_DEPENDENCY' &&
      warning.id &&
      warning.id.includes('node_modules')
    ) {
      return;
    }
    // Suppress warnings about Node.js built-in modules
    if (
      [
        'fs',
        'fs/promises',
        'path',
        'https',
        'http',
        'stream',
        'zlib',
        'crypto',
        'url',
        'buffer',
      ].includes(warning.code)
    ) {
      return;
    }
    warn(warning);
  },
};
