import { ServiceInstance } from '../discovery/types';

export const mockServiceInstance: ServiceInstance = {
  id: 'test-service-1',
  name: 'test-service',
  host: 'localhost',
  port: 3000,
  status: 'healthy',
  metadata: {}
};

export const mockRequest = {
  method: 'GET',
  url: '/api/users',
  headers: {
    'content-type': 'application/json',
    'authorization': 'Bearer test-token'
  },
  body: {},
  query: {}
};

export class MockHttpService {
  request = jest.fn();
  axiosRef = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  };
}

export class MockDiscoveryService {
  getServiceInstances = jest.fn();
  watchServiceChanges = jest.fn();
  onServiceChange = jest.fn();
}

export class MockCircuitBreakerService {
  isOpen = jest.fn();
  recordSuccess = jest.fn();
  recordFailure = jest.fn();
  reset = jest.fn();
}

export class MockRetryService {
  executeWithRetry = jest.fn();
}

export class MockLoadBalancerService {
  selectInstance = jest.fn();
  recordSuccess = jest.fn();
  recordFailure = jest.fn();
}
