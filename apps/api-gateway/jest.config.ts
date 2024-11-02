export default {
  displayName: 'api-gateway',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api-gateway',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e.spec.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
    '!src/**/*.constants.ts',
    '!src/**/__mocks__/**',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  coverageReporters: ['text', 'html', 'lcov', 'json', 'text-summary'],
};
