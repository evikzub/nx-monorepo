import { ServiceInstance } from "../discovery/types";

export interface IServiceRegistry {
  register(service: ServiceRegistration): Promise<void>;
  deregister(serviceId: string): Promise<void>;
  getService(serviceName: string): Promise<ServiceInstance[]>;
  getAllServices(): Promise<ServiceInstance[]>;
  watchService(serviceName: string, callback: ServiceWatchCallback): void;
}

export interface ServiceRegistration {
  id: string;
  name: string;
  host: string;
  port: number;
  healthCheck?: HealthCheckConfig;
  metadata?: Record<string, string>;
}

export interface HealthCheckConfig {
  path: string;
  interval: string;
  timeout: string;
  deregisterAfter?: string;
}

export type ServiceWatchCallback = (instances: ServiceInstance[]) => void; 