import { 
    All, 
    Controller, 
    Req,
    Logger,
    HttpException,
    HttpStatus
  } from '@nestjs/common';
  import { Request } from 'express';
  import { ProxyService } from './proxy.service';
  import { DiscoveryService } from '../discovery/discovery.service';
  
  @Controller()
  export class ProxyController {
    private readonly logger = new Logger(ProxyController.name);
  
    constructor(
      private readonly proxyService: ProxyService,
      private readonly discoveryService: DiscoveryService
    ) {}
  
    @All('users')
    @All('users/*')
    async userService(@Req() request: Request) {
      const serviceName = 'user-service';
      const path = request.url;
      
      this.logger.debug(`Proxying request to ${serviceName}: ${path}`);
  
      try {
        const instances = await this.discoveryService.getServiceInstances(serviceName);
        
        if (instances.length === 0) {
          throw new HttpException(
            `No available instances for service: ${serviceName}`,
            HttpStatus.SERVICE_UNAVAILABLE
          );
        }
  
        const healthyInstance = instances.find(i => i.status === 'healthy');
        if (!healthyInstance) {
          throw new HttpException(
            `No healthy instances for service: ${serviceName}`,
            HttpStatus.SERVICE_UNAVAILABLE
          );
        }
  
        return this.proxyService.forward(serviceName, path, request);
      } catch (error) {
        this.logger.error(`Error proxying request to ${serviceName}:`, error);
        throw error;
      }
    }
  } 
  