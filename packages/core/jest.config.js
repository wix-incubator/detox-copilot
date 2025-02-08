module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(ora|chalk|strip-ansi|ansi-regex|cli-cursor|restore-cursor|onetime|mimic-fn|is-unicode-supported|is-interactive|get-east-asian-width)/)'
  ],
  moduleDirectories: ['node_modules', 'src', 'examples'],
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/setupTests.ts'],
  silent: true,
  verbose: false
};
