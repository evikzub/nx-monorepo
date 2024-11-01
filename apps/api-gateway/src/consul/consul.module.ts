import { Module } from '@nestjs/common';
import { ConsulRegistrationService } from './consul-registration.service';
import { ConsulDiscoveryService } from '../discovery/consul-discovery.service';
import { AppConfigService } from '@microservices-app/shared/backend';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    ConsulRegistrationService,  // For registering API Gateway
    ConsulDiscoveryService,     // For discovering other services
    AppConfigService,
    ConfigService,
  ],
  exports: [
    ConsulRegistrationService,
    ConsulDiscoveryService,
  ],
})
export class ConsulModule {} 