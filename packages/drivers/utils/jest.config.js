module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(jsdom|puppeteer)/)',
  ],
  moduleDirectories: ['node_modules', 'src'],
  silent: true,
  verbose: false,
  setupFilesAfterEnv: ['./jest.image-snapshot.ts']
};
