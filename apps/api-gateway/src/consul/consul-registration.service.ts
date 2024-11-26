import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Consul from 'consul';
import { AppConfigService } from '@microservices-app/shared/backend';
import { RegisterOptions } from 'consul/lib/agent/service';

@Injectable()
export class ConsulRegistrationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ConsulRegistrationService.name);
  private readonly consul: Consul;
  private serviceId: string;

  constructor(private readonly configService: AppConfigService) {
    // const consulHost = this.configService.envConfig.consul.host;
    // const consulPort = this.configService.envConfig.consul.port;
    
    // this.logger.log(`Initializing Consul client with host=${consulHost}, port=${consulPort}`);
    
    this.consul = new Consul({
      // host: consulHost,
      // port: consulPort,
    });
  }

  async onModuleInit() {
    await this.registerService();
  }

  async onModuleDestroy() {
    await this.deregisterService();
  }

  private async registerService() {
    try {
      this.serviceId = this.configService.envConfig.apiGateway.id;
      const serviceName = this.configService.envConfig.apiGateway.name;
      const servicePort = this.configService.envConfig.apiGateway.port;
      const serviceHost = this.configService.envConfig.apiGateway.host;
      
      const registration: RegisterOptions= {
        id: this.serviceId,
        name: serviceName,
        port: servicePort,
        address: serviceHost,
        tags: ['api-gateway', process.env.NODE_ENV],
        // check: {
        //   name: 'api-gateway-health',
        //   http: `http://localhost:${servicePort}/health`,
        //   interval: '10s',
        //   timeout: '5s',
        //   deregistercriticalserviceafter: '30s'
        // }
      };

      this.logger.debug('Registration payload:', registration);

      await this.consul.agent.service.register(registration);
      this.logger.log(`Successfully registered service: ${serviceName} (${this.serviceId})`);
    } catch (error) {
      this.logger.error('Failed to register service', {
        error: error.message,
        stack: error.stack,
        details: error.response?.body
      });
      throw error;
    }
  }

  private async deregisterService() {
    if (this.serviceId) {
      try {
        await this.consul.agent.service.deregister({ id: this.serviceId });
        this.logger.log(`Deregistered service: ${this.serviceId}`);
      } catch (error) {
        this.logger.error(`Failed to deregister service: ${this.serviceId}`, error);
      }
    }
  }
} 