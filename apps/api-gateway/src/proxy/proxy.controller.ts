import { Controller, All, Req, UseGuards, Logger } from '@nestjs/common';
import { Request } from 'express';
import { ProxyService } from './proxy.service';
import { AppConfigService, Roles, JwtAuthGuard, RolesGuard, TraceService } from '@microservices-app/shared/backend';
import { ServiceConfig, UserRole } from '@microservices-app/shared/types';

@Controller()
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);

  constructor(
    private readonly proxyService: ProxyService,
    private readonly config: AppConfigService
  ) {}

  @All(['auth/login', 'auth/register', 'auth/refresh'])
  async publicAuthEndpoints(@Req() request: Request) {
    this.logger.debug(`Handling public auth request: ${request.method} ${request.url}`);
    return this.forwardToService(request, this.config.envConfig.userService);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @All(['users', 'users/*'])
  async protectedUserEndpoints(@Req() request: Request) {
    this.logger.debug(`Handling protected user request: ${request.method} ${request.url}`);
    return this.forwardToService(request, this.config.envConfig.userService);
  }

  @All(['assessments', 'assessments/*'])
  async assessmentEndpoints(@Req() request: Request) {
    this.logger.debug(`Handling assessment request: ${request.method} ${request.url}`);
    return this.forwardToService(request, this.config.envConfig.assessmentService);
  }

  private async forwardToService(request: Request, serviceConfig: ServiceConfig) {
    //const serviceConfig = this.config.envConfig.userService;
    const targetUrl = request.url;
    
    this.logger.debug({
      message: `Forwarding request to ${serviceConfig.name} service`,
      method: request.method,
      originalUrl: request.originalUrl,
      targetUrl,
      serviceHost: serviceConfig.host,
      servicePort: serviceConfig.port,
      headers: request.headers
    });

    const span = TraceService.startSpan('proxy_request', {
      serviceName: serviceConfig.name,
      targetUrl
    });

    try {
      const result = await this.proxyService.forward(
        serviceConfig.name,
        targetUrl,
        {
          method: request.method,
          url: targetUrl,
          headers: request.headers as Record<string, string>,
          body: request.body,
          query: request.query as Record<string, string>,
        }
      );

      this.logger.debug({
        message: 'Proxy request successful',
        targetUrl,
        statusCode: result.statusCode,
        responseHeaders: result.headers
      });

      TraceService.endSpan(span);
      return result;
    } catch (error) {
      this.logger.error({
        message: 'Proxy request failed',
        targetUrl,
        error: error.message,
        stack: error.stack,
        details: error.response || error
      });
      TraceService.endSpan(span, error);
      throw error;
    }
  }
} 
