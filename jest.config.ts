import { getJestProjectsAsync } from '@nx/jest';

export default async () => ({
  projects: await getJestProjectsAsync(),
  setupFiles: ['<rootDir>/jest.setup.ts'],
});
