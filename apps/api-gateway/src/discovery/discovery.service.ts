import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConsulDiscoveryService } from './consul-discovery.service';
import { ServiceInstance } from './types';
import { IDiscoveryService, ServiceChangeCallback } from '../interfaces/discovery.interface';

@Injectable()
export class DiscoveryService implements OnModuleInit, IDiscoveryService {
  private readonly logger = new Logger(DiscoveryService.name);
  private readonly serviceCache: Map<string, ServiceInstance[]> = new Map();
  private readonly watchedServices: Set<string> = new Set();

  constructor(
    private readonly consulDiscovery: ConsulDiscoveryService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async onModuleInit() {
    try {
      // Initial service discovery
      const services = await this.consulDiscovery.getAllServices();
      const serviceNames = [...new Set(services.map(s => s.name))];
      
      this.logger.log(`Discovered services: ${serviceNames.join(', ')}`);
      
      // Start watching all services
      for (const serviceName of serviceNames) {
        await this.watchService(serviceName);
      }
    } catch (error) {
      this.logger.error('Failed to initialize service discovery', error);
      throw error;
    }
  }

  async getServiceInstances(serviceName: string): Promise<ServiceInstance[]> {
    try {
      // Check cache first
      if (!this.serviceCache.has(serviceName)) {
        const instances = await this.consulDiscovery.getService(serviceName);
        this.serviceCache.set(serviceName, instances);
        
        // Start watching if not already watching
        if (!this.watchedServices.has(serviceName)) {
          await this.watchService(serviceName);
        }
      }
      
      return this.serviceCache.get(serviceName) || [];
    } catch (error) {
      this.logger.error(`Failed to get instances for service: ${serviceName}`, error);
      throw error;
    }
  }

  async watchServiceChanges(serviceName: string): Promise<void> {
    if (!this.watchedServices.has(serviceName)) {
      await this.watchService(serviceName);
    }
  }

  onServiceChange(callback: ServiceChangeCallback): void {
    this.eventEmitter.on('service.added', callback.onServiceAdded);
    this.eventEmitter.on('service.removed', callback.onServiceRemoved);
    this.eventEmitter.on('service.health.changed', callback.onServiceHealthChanged);
  }

  private async watchService(serviceName: string): Promise<void> {
    if (this.watchedServices.has(serviceName)) {
      return;
    }

    this.watchedServices.add(serviceName);
    
    this.consulDiscovery.watchService(serviceName, (instances) => {
      const previousInstances = this.serviceCache.get(serviceName) || [];
      this.serviceCache.set(serviceName, instances);

      // Emit events for service changes
      this.emitServiceChanges(serviceName, previousInstances, instances);
    });

    this.logger.log(`Started watching service: ${serviceName}`);
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
      this.logger.debug(`New instances found for ${serviceName}:`, added);
      this.eventEmitter.emit('service.added', { serviceName, instances: added });
    }

    // Find removed instances
    const removed = previous.filter(i => !currIds.has(i.id));
    if (removed.length > 0) {
      this.logger.debug(`Instances removed from ${serviceName}:`, removed);
      this.eventEmitter.emit('service.removed', { serviceName, instances: removed });
    }

    // Find health changes
    const healthChanges = current.filter(curr => {
      const prev = previous.find(p => p.id === curr.id);
      return prev && prev.status !== curr.status;
    });
    
    if (healthChanges.length > 0) {
      this.logger.debug(`Health changes for ${serviceName}:`, healthChanges);
      this.eventEmitter.emit('service.health.changed', { 
        serviceName, 
        instances: healthChanges 
      });
    }
  }
} 