/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transformIgnorePatterns: [
    // node_modules is excluded by default for ESM support
    // but you might need to include some packages that are ESM
    // and need to be transformed by Babel
    //
    // Modify this pattern to exclude the specific modules you need transformed
    //'/node_modules/(?!(markdownlint|micromark[^/]+|parse\-entities|character[^/]+)/)'
  ],
  // ts-jest doesn't handle .mjs files properly, add a specific transform
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|mjs)$': 'babel-jest'
  },
  // You might also need this for ESM support
  extensionsToTreatAsEsm: ['.ts', '.tsx']
};
