import { Module } from '@nestjs/common';

import { ProviderService } from './provider.service';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule.forRoot()],
  providers: [ProviderService],
  exports: [ProviderService],
})
export class ProviderModule {}