import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RabbitMQHealthIndicator } from './rabbitmq.health';
import { RabbitMQModule } from '@microservices-app/shared/backend';

@Module({
  imports: [
    TerminusModule,
    RabbitMQModule.forRoot(),
  ],
  controllers: [HealthController],
  providers: [RabbitMQHealthIndicator],
})
export class HealthModule {} 