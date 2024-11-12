import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { ConfirmChannel, Options, ConsumeMessage } from 'amqplib';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection!: amqp.AmqpConnectionManager;
  private channel!: amqp.ChannelWrapper;
  private connectionStatus = false;

  constructor(private readonly config: AppConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      this.logger.log('Connecting to RabbitMQ...');
      
      this.connection = amqp.connect([this.config.envConfig.rabbitmq.url]);

      // Create and wait for channel to be ready
      this.channel = this.connection.createChannel({
        setup: async (channel: ConfirmChannel) => {
          // Basic setup - specific setup will be done by SetupService
          await channel.prefetch(1); 
        }
      });
      this.logger.log('Channel created');

      // Wait for channel to be ready
      await this.channel.waitForConnect();
      this.logger.log('Channel ready');

      // Monitor connection status
      this.connection.on('connect', () => {
        this.connectionStatus = true;
        this.logger.log('Connected to RabbitMQ');
      });

      this.connection.on('disconnect', (err) => {
        this.connectionStatus = false;
        this.logger.error('Disconnected from RabbitMQ', { err });
      });

      this.logger.log('RabbitMQ connected');

    } catch (error) {
      this.connectionStatus = false;
      this.logger.error('Failed to connect to RabbitMQ', (error as Error).stack);
      throw error;
    }
  }

  async assertExchange(
    exchange: string,
    type: string,
    options?: Options.AssertExchange
  ) {
    try {
        // Ensure channel is ready
        if (!this.channel) {
          await this.connect();
        }
        await this.channel.waitForConnect();
        return await this.channel.assertExchange(exchange, type, options);
      } catch (error) {
        this.logger.error(`Failed to assert exchange ${exchange}`, error);
        throw error;
      }
  }

  async assertQueue(queue: string, options?: Options.AssertQueue) {
    try {
        // Ensure channel is ready
        if (!this.channel) {
          await this.connect();
        }
        await this.channel.waitForConnect();
        return await this.channel.assertQueue(queue, options);
      } catch (error) {
        this.logger.error(`Failed to assert queue ${queue}`, error);
        throw error;
      }
  }

  async bindQueue(queue: string, exchange: string, pattern: string) {
    try {
        // Ensure channel is ready
        if (!this.channel) {
          await this.connect();
        }
        await this.channel.waitForConnect();
        return await this.channel.bindQueue(queue, exchange, pattern);
      } catch (error) {
        this.logger.error(`Failed to bind queue ${queue} to exchange ${exchange}`, error);
        throw error;
      }
  }

  // Add isHealthy method for health checks
  async isHealthy(): Promise<boolean> {
    try {
      // Check if connection exists and is connected
      if (!this.connection?.isConnected()) {
        return false;
      }

      // Check if channel is available
      if (!this.channel) {
        return false;
      }

      // Check if we can publish a test message
      const testExchange = this.config.envConfig.rabbitmq.exchanges.notifications;
      const canPublish = await this.channel.publish(
        testExchange,
        'health.check',
        Buffer.from('health check')
      );

      return canPublish && this.connectionStatus;
    } catch (error) {
      this.logger.error('Health check failed', (error as Error).stack);
      return false;
    }
  }

  private async ensureChannel(){
    if (!this.channel) {
      await this.connect();
    }
    await this.channel.waitForConnect();
    //return this.channel;
  }

  async publishQueue(queue: string, message: any): Promise<boolean> {
    try {
      await this.ensureChannel();
      //const queueInfo = await this.channel.checkQueue(queue);
      //console.log('queueInfo -> ', queueInfo);
      return await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (error) {
      this.logger.error(`Failed to publish message`, (error as Error).stack);
      throw error;
    }
  }

  async publishExchange(exchange: string, routingKey: string, message: any): Promise<boolean> {
    try {
        await this.ensureChannel();
        return await this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
    } catch (error) {
      this.logger.error(`Failed to publish message`, (error as Error).stack);
      throw error;
    }
  }

  async subscribe<T>(
    queue: string,
    handler: (message: T, raw: ConsumeMessage) => Promise<void>
  ): Promise<void> {
    await this.channel.addSetup(async (channel: ConfirmChannel) => {
      await channel.consume(queue, async (msg) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content, msg);
          await channel.ack(msg);
        } catch (error) {
          this.logger.error(`Error processing message`, (error as Error).stack);
          await channel.nack(msg, false, false);
        }
      });
    });
  }

  private async disconnect() {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.connectionStatus = false;
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ', (error as Error).stack);
    }
  }

  async deleteQueue(queue: string) {
    try {
      if (!this.channel) {
        await this.connect();
      }
      await this.channel.waitForConnect();
      await this.channel.deleteQueue(queue);
      this.logger.log(`Queue ${queue} deleted`);
    } catch (error) {
      // Only warn as queue might not exist
      this.logger.warn(`Failed to delete queue [${queue}]`, error);
      // Don't throw error as queue might not exist
    }
  }

  async deleteExchange(exchange: string) {
    try {
      if (!this.channel) {
        await this.connect();
      }
      await this.channel.waitForConnect();
      await this.channel.deleteExchange(exchange);
      this.logger.log(`Exchange ${exchange} deleted`);
    } catch (error) {
      this.logger.warn(`Failed to delete exchange ${exchange}`, error);
      // Don't throw error as exchange might not exist
    }
  }
} 