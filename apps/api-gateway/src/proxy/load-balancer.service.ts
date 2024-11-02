import { Injectable, Logger } from '@nestjs/common';
import { 
  ILoadBalancer, 
  LoadBalancerStats 
} from '../interfaces/load-balancer.interface';
import { ServiceInstance } from '../discovery/types';

@Injectable()
export class LoadBalancerService implements ILoadBalancer {
  private readonly logger = new Logger(LoadBalancerService.name);
  private readonly stats = new Map<string, LoadBalancerStats>();
  private currentIndex = 0;

  selectInstance(instances: ServiceInstance[]): ServiceInstance {
    if (!instances || instances.length === 0) {
      throw new Error('No instances available');
    }

    // Filter healthy instances
    const healthyInstances = instances.filter(i => i.status === 'healthy');
    if (healthyInstances.length === 0) {
      throw new Error('No healthy instances available');
    }

    // Round-robin selection
    this.currentIndex = (this.currentIndex + 1) % healthyInstances.length;
    const selected = healthyInstances[this.currentIndex];

    this.logger.debug(
      `Selected instance ${selected.id} for service ${selected.name}`
    );

    return selected;
  }

  recordSuccess(instance: ServiceInstance): void {
    const stats = this.getOrCreateStats(instance.id);
    stats.totalRequests++;
    stats.successfulRequests++;
    this.updateAverageResponseTime(stats, Date.now());
  }

  recordFailure(instance: ServiceInstance): void {
    const stats = this.getOrCreateStats(instance.id);
    stats.totalRequests++;
    stats.failedRequests++;
  }

  private getOrCreateStats(instanceId: string): LoadBalancerStats {
    if (!this.stats.has(instanceId)) {
      this.stats.set(instanceId, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.stats.get(instanceId)!;
  }

  private updateAverageResponseTime(stats: LoadBalancerStats, endTime: number): void {
    const newAvg = (stats.averageResponseTime * (stats.successfulRequests - 1) + endTime) 
      / stats.successfulRequests;
    stats.averageResponseTime = newAvg;
  }
} 