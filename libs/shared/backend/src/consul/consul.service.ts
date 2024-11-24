import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Consul from 'consul';
import { RegisterOptions } from 'consul/lib/agent/service';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class ConsulService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ConsulService.name);
  private readonly consul: Consul;
  private serviceId: string | null = null;
  private readonly CHECK_INTERVAL = 10000; // 10 seconds

  constructor(private readonly configService: AppConfigService) {
    this.consul = new Consul({
      // host: this.configService.envConfig.consul.host,
      // port: Number(this.configService.envConfig.consul.port),
    });
  }

  async onModuleInit() {
    await this.registerService();
  }

  async onModuleDestroy() {
    await this.deregisterService();
  }

  async registerService(serviceName?: string) {
    let serviceConfig;
    switch (serviceName) {
      case 'assessment-service':
        serviceConfig = this.configService.envConfig.assessmentService;
        break;
      case 'user-service':
        serviceConfig = this.configService.envConfig.userService;
        break;
      default:
        throw new Error(`Consul Service cannot register: ${serviceName}`);
    }

    this.serviceId = serviceConfig.id;
    const registerOptions: RegisterOptions = {
      id: this.serviceId,
      name: serviceConfig.name,
      port: serviceConfig.port,
      address: serviceConfig.host,
      tags: ['api', serviceName || 'user-service'],
      meta: {
        version: '1.0.0',
        environment: this.configService.envConfig.nodeEnv,
      },
    };
    
    try {
      await this.consul.agent.service.register(registerOptions);
      this.logger.log(`Registered service: ${serviceConfig.name} (${this.serviceId})`);
    } catch (error) {
      const errorData = {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        //consulHost: this.configService.envConfig.consul.host,
        //consulPort: this.configService.envConfig.consul.port,
      };
      this.logger.error('Failed to register service', JSON.stringify(errorData, null, 2));
      throw error;
    }
  }

  private async deregisterService() {
    if (this.serviceId) {
      try {
        await this.consul.agent.service.deregister(this.serviceId);
        this.logger.log(`Deregistered service: ${this.serviceId}`);
      } catch (error) {
        this.logger.error(`Failed to deregister service: ${this.serviceId}`, error);
      }
    }
  }
} 