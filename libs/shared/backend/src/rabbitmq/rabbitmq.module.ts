import { DynamicModule, Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { AppConfigModule } from '../config/config.module';
import { RabbitMQSetupService } from './rabbitmq.setup.service';

@Module({})
export class RabbitMQModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: RabbitMQModule,
      imports: [AppConfigModule.forFeature()],
      providers: [RabbitMQService, RabbitMQSetupService],
      exports: [RabbitMQService, RabbitMQSetupService],
    };
  }
} 