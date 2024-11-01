import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConsulDiscoveryService } from './consul-discovery.service';
import { ServiceInstance } from './types';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DiscoveryService implements OnModuleInit {
  private readonly logger = new Logger(DiscoveryService.name);
  private readonly serviceCache: Map<string, ServiceInstance[]> = new Map();

  constructor(
    private readonly consulDiscoveryService: ConsulDiscoveryService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async onModuleInit() {
    // Start watching all registered services
    const services = await this.consulDiscoveryService.getAllServices();
    const serviceNames = [...new Set(services.map(s => s.name))];
    
    for (const serviceName of serviceNames) {
      this.watchService(serviceName);
    }
  }

  async getServiceInstances(serviceName: string): Promise<ServiceInstance[]> {
    if (!this.serviceCache.has(serviceName)) {
      const instances = await this.consulDiscoveryService.getService(serviceName);
      this.serviceCache.set(serviceName, instances);
    }
    return this.serviceCache.get(serviceName) || [];
  }

  private watchService(serviceName: string): void {
    this.consulDiscoveryService.watchService(serviceName, (instances) => {
      const previousInstances = this.serviceCache.get(serviceName) || [];
      this.serviceCache.set(serviceName, instances);

      // Emit events for service changes
      this.emitServiceChanges(serviceName, previousInstances, instances);
    });
  }

  private emitServiceChanges(
    serviceName: string,
    previous: ServiceInstance[],
    current: ServiceInstance[]
  ): void {
    const prevIds = new Set(previous.map(i => i.id));
    const currIds = new Set(current.map(i => i.id));

    // Find new instances
    const added = current.filter(i => !prevIds.has(i.id));
    if (added.length > 0) {
      this.eventEmitter.emit('service.added', { serviceName, instances: added });
    }

    // Find removed instances
    const removed = previous.filter(i => !currIds.has(i.id));
    if (removed.length > 0) {
      this.eventEmitter.emit('service.removed', { serviceName, instances: removed });
    }

    // Find health changes
    const healthChanges = current.filter(curr => {
      const prev = previous.find(p => p.id === curr.id);
      return prev && prev.status !== curr.status;
    });
    if (healthChanges.length > 0) {
      this.eventEmitter.emit('service.health.changed', { 
        serviceName, 
        instances: healthChanges 
      });
    }
  }
} 