import { AppConfigService } from '@microservices-app/shared/backend';
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Consul from 'consul';
import { RegisterOptions } from 'consul/lib/agent/service';

@Injectable()
export class ConsulService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ConsulService.name);
  private readonly consul: Consul;
  private serviceId: string;
  private readonly CHECK_INTERVAL = 10000; // 10 seconds  

  constructor(private readonly configService: AppConfigService) {
    this.consul = new Consul({
      host: this.configService.envConfig.consul.host,
      port: Number(this.configService.envConfig.consul.port),
    });
  }

  async onModuleInit() {
    await this.registerService();
  }

  async onModuleDestroy() {
    await this.deregisterService();
  }

  private async registerService() {
    this.serviceId = this.configService.envConfig.userService.id;
    const serviceName = this.configService.envConfig.userService.name;
    const servicePort = this.configService.envConfig.userService.port;
    const serviceHost = this.configService.envConfig.userService.host;

    const registerOptions: RegisterOptions = {
      id: this.serviceId,
      name: serviceName,
      port: servicePort,
      address: serviceHost,
      tags: ['api', 'user-service'],
      meta: {
        version: '1.0.0',
        environment: this.configService.envConfig.nodeEnv,
      },
    };
    
    try {
      await this.consul.agent.service.register(registerOptions);
      
      // Add periodic check of registration status
      //this.startHealthCheckMonitoring(serviceName);

      this.logger.log(`Registered service: ${serviceName} (${this.serviceId})`);
    } catch (error) {
        const errorData = {
            error: error.message,
            stack: error.stack,
            consulHost: this.configService.envConfig.consul.host,
            consulPort: this.configService.envConfig.consul.port,
        };
      this.logger.error('Failed to register service', JSON.stringify(errorData, null, 2));
      throw error;
    }
  }

  private async startHealthCheckMonitoring(serviceName: string) {
    setInterval(async () => {
      try {
        const healthChecks = await this.consul.health.service(serviceName);
        const ourCheck = healthChecks.find(check => 
          check.Service.ID === this.serviceId
        );

        if (ourCheck) {
          const status = ourCheck.Checks.every(c => c.Status === 'passing')
            ? 'healthy'
            : 'unhealthy';

          this.logger.debug(`Health check status: ${status}`);
          
          if (status === 'unhealthy') {
            this.logger.warn(
              `Service health check failing. Check output: ${
                ourCheck.Checks.map(c => c.Output).join(', ')
              }`
            );
          }
        } else {
          this.logger.warn('Service not found in Consul, attempting to re-register');
          await this.registerService();
        }
      } catch (error) {
        this.logger.error('Health check monitoring failed:', error);
      }
    }, this.CHECK_INTERVAL); // Check every 5 seconds
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