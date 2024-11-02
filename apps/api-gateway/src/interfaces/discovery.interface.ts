import { ServiceInstance } from "../discovery/types";

export interface IDiscoveryService {
  getServiceInstances(serviceName: string): Promise<ServiceInstance[]>;
  watchServiceChanges(serviceName: string): void;
  onServiceChange(callback: ServiceChangeCallback): void;
}

export interface ServiceChangeCallback {
  onServiceAdded(service: ServiceInstance): void;
  onServiceRemoved(service: ServiceInstance): void;
  onServiceHealthChanged(service: ServiceInstance): void;
} 