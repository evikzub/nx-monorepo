import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { CircuitBreakerService } from './circuit-breaker.service';
import { RetryService } from './retry.service';
import { LoadBalancerService } from './load-balancer.service';
import { DiscoveryModule } from '../discovery/discovery.module';
import { AxiosMetadataInterceptor } from '../interceptors/axios-metadata.interceptor';
import { AppConfigService } from '@microservices-app/shared/backend';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    DiscoveryModule,
  ],
  controllers: [ProxyController],
  providers: [
    ProxyService,
    CircuitBreakerService,
    RetryService,
    LoadBalancerService,
    AxiosMetadataInterceptor,
    AppConfigService,
    ConfigService,
  ],
  exports: [ProxyService],
})
export class ProxyModule {} 