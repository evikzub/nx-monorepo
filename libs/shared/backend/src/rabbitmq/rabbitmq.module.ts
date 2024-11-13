import { DynamicModule, Module } from '@nestjs/common';
import { RabbitMQModule as GolevelupRabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { AppConfigService } from '../config/config.service';

@Module({})
export class RabbitMQModule {
  static forRoot(): DynamicModule {
    return {
      module: RabbitMQModule,
      imports: [
        GolevelupRabbitMQModule.forRootAsync(GolevelupRabbitMQModule, {
          useFactory: (configService: AppConfigService) => ({
            uri: configService.envConfig.rabbitmq.url,
            enableControllerDiscovery: true,
            exchanges: [
              {
                name: configService.envConfig.rabbitmq.exchanges.notifications,
                type: 'topic',
              },
              {
                name: configService.envConfig.rabbitmq.exchanges.deadLetter,
                type: 'topic',
              },
            ],
            queues: [
              {
                name: configService.envConfig.rabbitmq.queues.notifications,
                exchange: configService.envConfig.rabbitmq.exchanges.notifications,
                routingKey: 'notification.email.#',
                options: {
                  durable: true,
                  arguments: {
                    'x-dead-letter-exchange': configService.envConfig.rabbitmq.exchanges.deadLetter,
                    'x-dead-letter-routing-key': 'dead-letter',
                    'x-message-ttl': configService.envConfig.rabbitmq.queueOptions?.messageTtl || 86400000,
                  },
                },
              },
              {
                name: configService.envConfig.rabbitmq.queues.deadLetter,
                exchange: configService.envConfig.rabbitmq.exchanges.deadLetter,
                routingKey: '#',
                options: {
                  durable: true,
                  arguments: {
                    'x-message-ttl': 604800000, // 7 days
                  },
                },
              },
            ],
            prefetchCount: 1,
            connectionInitOptions: { wait: true },
          }),
          inject: [AppConfigService],
        }),
      ],
      exports: [GolevelupRabbitMQModule],
      global: true,
    };
  }
} 