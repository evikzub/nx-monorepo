import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { AppConfigService } from '../config/config.service';
import { RabbitMQConfig } from '@microservices-app/shared/types';

@Injectable()
export class RabbitMQSetupService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQSetupService.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly configService: AppConfigService
  ) {}

  async onModuleInit() {
    console.log('RabbitMQSetupService onModuleInit...');
    await this.setupInfrastructure();
  }

  public async setupInfrastructure() {
    try {
      const config: RabbitMQConfig = this.configService.envConfig.rabbitmq;
      this.logger.log(`setupInfrastructure with config ${JSON.stringify(config, null, 2)}`);

      // First, delete any existing infrastructure
      //await this.cleanupInfrastructure(config);

      // Setup exchanges
      await this.setupExchanges(config);

      // Setup queues
      await this.setupQueues(config);

      // Setup bindings
      await this.setupBindings(config);
      this.logger.log('RabbitMQ infrastructure setup completed');
    } catch (error) {
      this.logger.error('Failed to setup RabbitMQ infrastructure', error);
      throw error;
    }
  }
  
  private async cleanupInfrastructure(config: RabbitMQConfig) {
    try {
      // Delete queues
      await this.rabbitMQService.deleteQueue(config.queues.notifications);
      //await this.rabbitMQService.deleteQueue(config.queues.deadLetter);
      await this.rabbitMQService.deleteQueue('default'); // Delete any default queue

      // Delete exchanges
      await this.rabbitMQService.deleteExchange(config.exchanges.notifications);
      //await this.rabbitMQService.deleteExchange(config.exchanges.deadLetter);
    } catch (error) {
      this.logger.warn('Cleanup error (non-fatal)', error);
    }
  }

  private async setupExchanges(config: RabbitMQConfig) {
    this.logger.log(`setupExchanges... ${config.exchanges.notifications}`);
    await this.rabbitMQService.assertExchange(
      config.exchanges.notifications,
      'topic',
      { durable: true }
    );

    await this.rabbitMQService.assertExchange(
      config.exchanges.deadLetter,
      'topic',
      { durable: true }
    );
  }

  private async setupQueues(config: RabbitMQConfig) {
    this.logger.log(`setupQueues... ${config.queues.notifications}`);
    await this.rabbitMQService.assertQueue(
      config.queues.notifications,
      {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': config.exchanges.deadLetter,
          'x-dead-letter-routing-key': 'dead-letter',
          'x-message-ttl': config.queueOptions?.messageTtl || 86400000,
        },
      }
    );

    // Setup dead letter queue
    await this.rabbitMQService.assertQueue(config.queues.deadLetter, {
        durable: true,
        arguments: {
            'x-message-ttl': 604800000 // 7 days
        }
      });
  }

  private async setupBindings(config: RabbitMQConfig) {
    this.logger.log(`setupBindings... ${config.queues.notifications}`);
    await this.rabbitMQService.bindQueue(
      config.queues.notifications,
      config.exchanges.notifications,
      'notification.email.#'
    );

    await this.rabbitMQService.bindQueue(
      config.queues.deadLetter,
      config.exchanges.deadLetter,
      //'dead-letter'
      '#'  // Catch all dead letters
    );
  }
} 