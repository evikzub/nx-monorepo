import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProxyController } from './proxy/proxy.controller';
import { ProxyService } from './proxy/proxy.service';
import { CircuitBreakerService } from './proxy/circuit-breaker.service';
import { RetryService } from './proxy/retry.service';
import { DiscoveryService } from './discovery/discovery.service';
import { AppConfigService } from '@microservices-app/shared/backend';
import { ConsulModule } from './consul/consul.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    HttpModule,
    EventEmitterModule.forRoot(),
    ConsulModule,
  ],
  controllers: [ProxyController],
  providers: [
    ProxyService,
    CircuitBreakerService,
    RetryService,
    DiscoveryService,
    AppConfigService,
    ConfigService,
  ],
})
export class AppModule {} 