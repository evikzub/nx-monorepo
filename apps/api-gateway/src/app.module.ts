import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
//import { ProxyController } from './proxy/proxy.controller';
//import { ProxyService } from './proxy/proxy.service';
import { CircuitBreakerService } from './proxy/circuit-breaker.service';
import { RetryService } from './proxy/retry.service';
//import { DiscoveryService } from './discovery/discovery.service';
import { AppConfigModule, AppConfigService } from '@microservices-app/shared/backend';
import { ConsulModule } from './consul/consul.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { DiscoveryModule } from './discovery/discovery.module';
import { LoadBalancerService } from './proxy/load-balancer.service';
import { ProxyModule } from './proxy/proxy.module';
import { HealthController } from './health/health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { SharedAuthModule } from '@microservices-app/shared/backend';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    HttpModule,
    EventEmitterModule.forRoot(),
    ConsulModule,
    AppConfigModule.forRoot(),
    SharedAuthModule.register(),
    ProxyModule,
    DiscoveryModule,
    TerminusModule, // Add Terminus module for health checks
  ],
  controllers: [HealthController],
  providers: [
    CircuitBreakerService,
    RetryService,
    AppConfigService,
    ConfigService,
    LoadBalancerService,
  ],
})
export class AppModule {} 