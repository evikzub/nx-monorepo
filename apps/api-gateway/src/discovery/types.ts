export type HealthStatus = 'healthy' | 'unhealthy';

export interface ServiceInstance {
  id: string;
  name: string;
  host: string;
  port: number;
  status: HealthStatus;
  metadata: Record<string, string>;
}

export interface ConsulHealthService {
  Service: {
    ID: string;
    Service: string;
    Address: string;
    Port: number;
    Meta: Record<string, string>;
  };
  Checks: Array<{
    Node: string;
    CheckID: string;
    Name: string;
    Status: string;
    Notes: string;
    Output: string;
    ServiceID: string;
    ServiceName: string;
  }>;
}

export interface ConsulServiceNode {
  Node: string;
  Address: string;
  ServiceID: string;
  ServiceName: string;
  ServiceAddress: string;
  ServicePort: number;
  ServiceMeta: Record<string, string>;
  ServiceTags: string[];
  Checks: Array<{
    Node: string;
    CheckID: string;
    Name: string;
    Status: string;
    Notes: string;
    Output: string;
    ServiceID: string;
    ServiceName: string;
  }>;
}

export interface ServiceRegistry {
  register(service: ServiceInstance): Promise<void>;
  deregister(serviceId: string): Promise<void>;
  getService(serviceName: string): Promise<ServiceInstance[]>;
  getAllServices(): Promise<ServiceInstance[]>;
  watchService(serviceName: string, callback: (instances: ServiceInstance[]) => void): void;
} 