import { Injectable, HttpException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { CircuitBreakerService } from './circuit-breaker.service';
import { RetryService } from './retry.service';
import { LoadBalancerService } from './load-balancer.service';
import { DiscoveryService } from '../discovery/discovery.service';
import { ServiceInstance } from '../discovery/types';
import { IProxyService, ProxyRequest } from '../interfaces/proxy.interface';
import { ExtendedAxiosRequestConfig, ExtendedInternalAxiosRequestConfig } from '../interfaces/axios.interface';

@Injectable()
export class ProxyService implements IProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly discoveryService: DiscoveryService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retryService: RetryService,
    private readonly loadBalancer: LoadBalancerService,
  ) {}

  async forward(serviceName: string, path: string, request: ProxyRequest) {
    this.logger.debug(`Forwarding request to ${serviceName}`, {
        path,
        method: request.method,
        headers: request.headers
      });
    
    // Check circuit breaker first
    if (this.circuitBreaker.isOpen(serviceName)) {
      throw new HttpException(
        `Service ${serviceName} is currently unavailable`,
        503
      );
    }

    try {
      // Get service instances
      const instances = await this.discoveryService.getServiceInstances(serviceName);
      
      // Use retry service with load balancer
      return await this.retryService.executeWithRetry(
        async () => {
          const instance = this.loadBalancer.selectInstance(instances);
          const response = await this.makeRequest(instance, path, request);
          
          // Record success
          this.circuitBreaker.recordSuccess(serviceName);
          this.loadBalancer.recordSuccess(instance);
          
          return response;
        },
        serviceName,
        {
          maxAttempts: 3,
          backoffMs: 1000,
        }
      );
    } catch (error) {
      // Record failure
      this.circuitBreaker.recordFailure(serviceName);
      
      if (error instanceof AxiosError && error.response) {
        const instance = error.config?.['metadata']?.instance as ServiceInstance;
        if (instance) {
          this.loadBalancer.recordFailure(instance);
        }
      }

      throw this.handleProxyError(error);
    }
  }

  private async makeRequest(
    instance: ServiceInstance, 
    path: string, 
    request: ProxyRequest
  ) {
    const baseUrl = `http://${instance.host}:${instance.port}`;
    const url = new URL(path, baseUrl).toString();
    
    this.logger.debug(`Proxying request to: ${url}`, {
      method: request.method,
      headers: request.headers,
    });

    const config: ExtendedAxiosRequestConfig = {
      method: request.method,
      url,
      data: request.body,
      headers: this.filterHeaders(request.headers),
      params: request.query,
      timeout: 5000,
      metadata: { instance },
    };

    const response = await firstValueFrom(
      this.httpService.request(config)
    );

    return response.data;
  }

  private filterHeaders(headers: Record<string, string>) {
    const allowedHeaders = [
      'authorization',
      'content-type',
      'user-agent',
      'x-correlation-id',
    ];
    
    return Object.keys(headers)
      .filter(key => allowedHeaders.includes(key.toLowerCase()))
      .reduce((obj, key) => {
        obj[key] = headers[key];
        return obj;
      }, {} as Record<string, string>);
  }

  private handleProxyError(error: any) {
    if (error instanceof AxiosError) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;
      const config = error.config as ExtendedInternalAxiosRequestConfig;

      this.logger.error(`Proxy request failed: ${message}`, {
        status,
        error: error.message,
        url: config?.url,
        method: config?.method,
        instance: config?.metadata?.instance,
      });

      return new HttpException(message, status);
    }

    return error;
  }
} 