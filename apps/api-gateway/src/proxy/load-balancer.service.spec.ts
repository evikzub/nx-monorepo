import { Test, TestingModule } from '@nestjs/testing';
import { LoadBalancerService } from './load-balancer.service';
import { ServiceInstance } from '../discovery/types';
import { createTestInstance, createTestInstances } from '../testing/factories';

describe('LoadBalancerService', () => {
  let service: LoadBalancerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoadBalancerService],
    }).compile();

    service = module.get<LoadBalancerService>(LoadBalancerService);
  });

  describe('instance selection', () => {
    const instances: ServiceInstance[] = [
      createTestInstance({ id: '1', host: 'host1' }),
      createTestInstance({ id: '2', host: 'host2' }),
      createTestInstance({ id: '3', host: 'host3', status: 'unhealthy' }),
    ];

    it('should select only healthy instances', () => {
      const selected = service.selectInstance(instances);
      expect(selected.status).toBe('healthy');
    });

    it('should distribute requests across instances', () => {
      const selections = new Set();
      for (let i = 0; i < 10; i++) {
        const instance = service.selectInstance(instances);
        selections.add(instance.id);
      }
      expect(selections.size).toBeGreaterThan(1);
    });

    it('should throw when no healthy instances available', () => {
      const unhealthyInstances = createTestInstances(3, 'unhealthy');
      expect(() => service.selectInstance(unhealthyInstances)).toThrow();
    });
  });
}); 