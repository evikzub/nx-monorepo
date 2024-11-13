import * as amqp from 'amqplib';
import { NotificationPayload } from '@microservices-app/shared/types';

export class RabbitMQTestHelper {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor() {
    console.log('RabbitMQTestHelper constructor');
  }

  async connect(url: string) {
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();
  }

  async getNextMessage(queueName: string, timeout = 5000): Promise<NotificationPayload | null> {
    return new Promise(async (resolve) => {
      const timeoutId = setTimeout(() => {
        resolve(null);
      }, timeout);

      try {
        await this.channel.assertQueue(queueName, {
          durable: true,
          arguments: {
            'x-message-ttl': 86400000, // 24 hours in milliseconds
            //'x-dead-letter-exchange': 'dead-letter',
            //'x-dead-letter-routing-key': 'dead-letter'
          }
        });
        
        this.channel.consume(queueName, (msg) => {
          if (msg) {
            clearTimeout(timeoutId);
            const content = JSON.parse(msg.content.toString());
            this.channel.ack(msg);
            resolve(content);
          }
        });
      } catch (error) {
        clearTimeout(timeoutId);
        this.logger?.error('Error getting message from queue', error);
        resolve(null);
      }
    });
  }

  async cleanup() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      this.logger?.error('Error during cleanup', error);
    }
  }

  private logger = {
    error: (message: string, error?: any) => {
      console.error(`[RabbitMQTestHelper] ${message}:`, error);
    }
  };
} 