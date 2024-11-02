import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ProxyService } from './proxy.service';
import { DiscoveryService } from '../discovery/discovery.service';
import { CircuitBreakerService } from './circuit-breaker.service';
import { RetryService } from './retry.service';
import { LoadBalancerService } from './load-balancer.service';
import {
  MockHttpService,
  MockDiscoveryService,
  MockCircuitBreakerService,
  MockRetryService,
  MockLoadBalancerService,
  mockServiceInstance,
  mockRequest
} from '../testing/mocks';

describe('ProxyService', () => {
  let service: ProxyService;
  let httpService: MockHttpService;
  let discoveryService: MockDiscoveryService;
  let circuitBreaker: MockCircuitBreakerService;
  let retryService: MockRetryService;
  let loadBalancer: MockLoadBalancerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProxyService,
        { provide: HttpService, useClass: MockHttpService },
        { provide: DiscoveryService, useClass: MockDiscoveryService },
        { provide: CircuitBreakerService, useClass: MockCircuitBreakerService },
        { provide: RetryService, useClass: MockRetryService },
        { provide: LoadBalancerService, useClass: MockLoadBalancerService },
      ],
    }).compile();

    service = module.get<ProxyService>(ProxyService);
    httpService = module.get(HttpService);
    discoveryService = module.get(DiscoveryService);
    circuitBreaker = module.get(CircuitBreakerService);
    retryService = module.get(RetryService);
    loadBalancer = module.get(LoadBalancerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('forward', () => {
    const serviceName = 'test-service';
    const path = '/api/users';
    
    beforeEach(() => {
      circuitBreaker.isOpen.mockReturnValue(false);
      discoveryService.getServiceInstances.mockResolvedValue([mockServiceInstance]);
      loadBalancer.selectInstance.mockReturnValue(mockServiceInstance);
      retryService.executeWithRetry.mockImplementation(cb => cb());
      httpService.request.mockReturnValue(of({ data: { success: true } }));
    });

    it('should successfully forward request', async () => {
      const result = await service.forward(serviceName, path, mockRequest);
      
      expect(result).toEqual({ success: true });
      expect(circuitBreaker.recordSuccess).toHaveBeenCalledWith(serviceName);
      expect(loadBalancer.recordSuccess).toHaveBeenCalledWith(mockServiceInstance);
    });

    it('should throw when circuit breaker is open', async () => {
      circuitBreaker.isOpen.mockReturnValue(true);
      
      await expect(service.forward(serviceName, path, mockRequest))
        .rejects
        .toThrow('Service test-service is currently unavailable');
    });

    it('should handle request failure', async () => {
      const error = new Error('Request failed');
      retryService.executeWithRetry.mockRejectedValue(error);
      
      await expect(service.forward(serviceName, path, mockRequest))
        .rejects
        .toThrow('Request failed');
        
      expect(circuitBreaker.recordFailure).toHaveBeenCalledWith(serviceName);
    });
  });
}); 