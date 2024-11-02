import { ServiceInstance, HealthStatus } from '../discovery/types';

export const createTestInstance = (
  overrides: Partial<ServiceInstance> = {}
): ServiceInstance => ({
  id: 'test-1',
  name: 'test-service',
  host: 'localhost',
  port: 3000,
  status: 'healthy' as HealthStatus,
  metadata: {},
  ...overrides
});

export const createTestInstances = (count: number, status: HealthStatus = 'healthy'): ServiceInstance[] => {
  return Array.from({ length: count }, (_, index) => createTestInstance({
    id: `test-${index + 1}`,
    host: `host-${index + 1}`,
    status
  }));
}; 