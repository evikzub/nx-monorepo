import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { AppConfigModule } from '@microservices-app/shared/backend';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    AppConfigModule.forFeature(),
  ],
  controllers: [HealthController],
})
export class HealthModule {} 