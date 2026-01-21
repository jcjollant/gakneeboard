export default {
    preset: undefined,
    testEnvironment: 'node',
    transform: {
        '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(@checklist/shared)/)',
    ],
    moduleNameMapper: {
        '^@checklist/shared$': '<rootDir>/../shared/src/index.ts',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testMatch: ['**/test/**/*.test.ts'],
};
