/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    moduleDirectories: ['node_modules', '<rootDir>/node_modules'],
    transformIgnorePatterns: ['node_modules/(?!examples)'],
    moduleNameMapper: {
        '^@copilot$': '<rootDir>/../../src',
        '^@copilot/(.*)$': '<rootDir>/../../src/$1',
        '^@/(.*)$': '<rootDir>/../../src/$1'
    }
};
