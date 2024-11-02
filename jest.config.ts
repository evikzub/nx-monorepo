import { getJestProjectsAsync } from '@nx/jest';

export default async () => ({
  projects: await getJestProjectsAsync(),
  setupFiles: ['<rootDir>/jest.setup.ts'],

  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  collectCoverageFrom: ['<rootDir>/apps/**/src/**/*.ts'],
  //coveragePathIgnorePatterns: ['<rootDir>/apps/services/user-service/src/controllers/__tests__/user.controller.spec.ts'],
  coverageReporters: ['text', 'html'],
});
