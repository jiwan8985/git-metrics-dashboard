module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  watchman: false,
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      diagnostics: {
        ignoreCodes: [151002]
      },
      isolatedModules: true
    }
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/extension.ts',
    '!src/dashboardProvider.ts',
    '!src/__tests__/**',
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
  transformIgnorePatterns: [
    'node_modules/(?!(simple-git)/)',
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  testTimeout: 30000,
};
