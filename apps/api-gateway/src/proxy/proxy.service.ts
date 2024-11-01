import { Injectable, HttpException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { CircuitBreakerService } from './circuit-breaker.service';
import { RetryService } from './retry.service';
import { DiscoveryService } from '../discovery/discovery.service';
import { ServiceInstance } from '../discovery/types';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retryService: RetryService,
    private readonly discoveryService: DiscoveryService
  ) {}

  async forward(serviceName: string, path: string, request: any) {
    const instances = await this.discoveryService.getServiceInstances(serviceName);
    
    if (instances.length === 0) {
      throw new ServiceUnavailableException(
        `No available instances for service: ${serviceName}`
      );
    }

    // For now, just use the first healthy instance
    const instance = instances.find(i => i.status === 'healthy');
    if (!instance) {
      throw new ServiceUnavailableException(
        `No healthy instances for service: ${serviceName}`
      );
    }

    this.logger.debug(`Forwarding request to ${instance.host}:${instance.port}${path}`);

    try {
      const response = await this.retryService.executeWithRetry(
        () => this.makeRequest(instance, path, request),
        serviceName
      );

      this.circuitBreaker.recordSuccess(serviceName);
      return response;
    } catch (error) {
      this.circuitBreaker.recordFailure(serviceName);
      throw this.handleProxyError(error as AxiosError, instance);
    }
  }

  private async makeRequest(instance: ServiceInstance, path: string, request: any) {
    const url = `http://${instance.host}:${instance.port}${path}`;
    
    this.logger.debug(`Making request to: ${url}`);
    
    const response = await firstValueFrom(
      this.httpService.request({
        method: request.method,
        url,
        data: request.body,
        headers: this.filterHeaders(request.headers),
        params: request.query,
        timeout: 5000 // 5 second timeout
      })
    );

    return response.data;
  }

  private filterHeaders(headers: Record<string, string>) {
    const allowedHeaders = [
      'authorization',
      'content-type',
      'user-agent',
      'x-correlation-id'
    ];
    
    return Object.keys(headers)
      .filter(key => allowedHeaders.includes(key.toLowerCase()))
      .reduce((obj, key) => {
        obj[key] = headers[key];
        return obj;
      }, {} as Record<string, string>);
  }

  private handleProxyError(error: AxiosError, instance: ServiceInstance) {
    const status = error.response?.status || 500;
    const message = error.response?.data || error.message;

    // Log detailed error information
    this.logger.error({
      message: 'Proxy request failed',
      status,
      error: message,
      url: error.config?.url,
      method: error.config?.method,
      service: {
        name: instance.name,
        id: instance.id,
        host: instance.host,
        port: instance.port
      }
    });

    if (error.code === 'ECONNREFUSED') {
      return new ServiceUnavailableException(
        `Service ${instance.name} is not available at ${instance.host}:${instance.port}`
      );
    }

    return new HttpException(message, status);
  }
} 