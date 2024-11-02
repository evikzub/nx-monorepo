import { ServiceInstance } from "../discovery/types";

export interface ILoadBalancer {
  selectInstance(instances: ServiceInstance[]): ServiceInstance;
  recordSuccess(instance: ServiceInstance): void;
  recordFailure(instance: ServiceInstance): void;
}

export interface LoadBalancerStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
}

export type LoadBalancingStrategy = 'ROUND_ROBIN' | 'LEAST_CONNECTIONS' | 'RANDOM' | 'WEIGHTED'; 