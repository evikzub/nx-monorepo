import { Controller, All, Req, Logger } from '@nestjs/common';
import { Request } from 'express';
import { ProxyService } from './proxy.service';
import { AppConfigService, TraceService } from '@microservices-app/shared/backend';

@Controller()
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);

  constructor(
    private readonly proxyService: ProxyService,
    private readonly config: AppConfigService
  ) {}

  @All('users')
  @All('users/*')
  async userService(@Req() request: Request) {
    const serviceConfig = this.config.envConfig.userService;
    
    this.logger.debug(`Proxying request to ${serviceConfig.name}: ${request.url}`);

    // Add trace span for the proxy operation
    const span = TraceService.startSpan('proxy_request', {
        serviceName: serviceConfig.name,
        targetUrl: request.url
        });

    try {
        const result = await this.proxyService.forward(
            serviceConfig.name,
            request.url,
            {
              method: request.method,
              url: request.url,
              headers: request.headers as Record<string, string>,
              body: request.body,
              query: request.query as Record<string, string>,
            }
        );

        TraceService.endSpan(span);
        return result;
    } catch (error) {
        TraceService.endSpan(span, error);
        throw error;
    }
  }
} 
