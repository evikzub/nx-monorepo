import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DiscoveryService } from './discovery.service';
import { ConsulDiscoveryService } from './consul-discovery.service';
import { ConsulRegistrationService } from '../consul/consul-registration.service';
import { AppConfigService } from '@microservices-app/shared/backend';

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule,
  ],
  providers: [
    DiscoveryService,
    ConsulDiscoveryService,
    ConsulRegistrationService,
    AppConfigService,
  ],
  exports: [
    DiscoveryService,
    ConsulDiscoveryService,
    ConsulRegistrationService,
  ],
})
export class DiscoveryModule {} 