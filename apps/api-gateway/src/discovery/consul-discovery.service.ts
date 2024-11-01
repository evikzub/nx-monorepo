import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Consul from 'consul';
import { ConsulHealthService, ServiceInstance, ConsulServiceNode } from './types';
import { AppConfigService } from '@microservices-app/shared/backend';

@Injectable()
export class ConsulDiscoveryService implements OnModuleInit {
  private readonly logger = new Logger(ConsulDiscoveryService.name);
  private readonly consul: Consul;

  constructor(private readonly configService: AppConfigService) {
    this.consul = new Consul({
      host: this.configService.envConfig.consul.host,
      port: this.configService.envConfig.consul.port,
    });
  }

  async onModuleInit() {
    await this.checkConsulConnection();
  }

  async getAllServices(): Promise<ServiceInstance[]> {
    try {
      // First, get list of all service names
      const services = await this.consul.catalog.service.list();
      const instances: ServiceInstance[] = [];

      // Then get details for each service
      for (const serviceName of Object.keys(services)) {
        const serviceInstances = await this.getService(serviceName);
        instances.push(...serviceInstances);
      }

      return instances;
    } catch (error) {
      this.logger.error('Failed to get all services', error);
      throw error;
    }
  }

  async getService(serviceName: string): Promise<ServiceInstance[]> {
    try {
      const result = await this.consul.catalog.service.nodes(serviceName);
      const serviceNodes = result as unknown as ConsulServiceNode[];
      
      if (!Array.isArray(serviceNodes)) {
        this.logger.warn(`Unexpected response format for service: ${serviceName}`);
        return [];
      }

      return serviceNodes.map(node => ({
        id: node.ServiceID,
        name: node.ServiceName,
        // Use localhost when running locally, or the service name in Docker
        //host: this.config.nodeEnv === 'production' ? node.ServiceAddress : 'localhost',
        host: node.ServiceAddress || node.Address,
        port: node.ServicePort,
        status: this.getServiceHealth(node),
        metadata: node.ServiceMeta || {},
      }));
    } catch (error) {
      this.logger.error(`Failed to get service: ${serviceName}`, error);
      throw error;
    }
  }

  async watchService(
    serviceName: string, 
    callback: (instances: ServiceInstance[]) => void
  ): Promise<void> {
    // Initial fetch
    const instances = await this.getService(serviceName);
    callback(instances);

    // Set up watch
    const watch = this.consul.watch({
      method: this.consul.health.service,
      options: {
        service: serviceName,
        passing: 'true'
      }
    });

    watch.on('change', (data: ConsulHealthService[]) => {
      const instances: ServiceInstance[] = data.map(item => ({
        id: item.Service.ID,
        name: item.Service.Service,
        host: item.Service.Address,
        port: item.Service.Port,
        status: this.getHealthStatus(item.Checks),
        metadata: item.Service.Meta || {},
      }));
      callback(instances);
    });

    watch.on('error', (error) => {
      this.logger.error(`Watch error for service ${serviceName}:`, error);
    });
  }

  private getHealthStatus(checks: ConsulHealthService['Checks']): 'healthy' | 'unhealthy' {
    return checks.every(check => check.Status === 'passing')
      ? 'healthy'
      : 'unhealthy';
  }

  private getServiceHealth(node: ConsulServiceNode): 'healthy' | 'unhealthy' {
    return node.Checks?.every(check => check.Status === 'passing')
      ? 'healthy'
      : 'unhealthy';
  }

  private async checkConsulConnection(): Promise<void> {
    try {
      await this.consul.status.leader();
      this.logger.log('Successfully connected to Consul');
    } catch (error) {
      this.logger.error('Failed to connect to Consul', error);
      throw error;
    }
  }
} 