import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

import { NotificationErrorCode, NotificationPayload, rabbitmqConfig } from '@microservices-app/shared/types';
import { PinoLoggerService } from '@microservices-app/shared/backend';

export type DeadLetterError = {
  message: string;
  code: NotificationErrorCode;
  stack: string;
  timestamp: string;
}

export type DeadLetterData = {
  payload: NotificationPayload;
  error: DeadLetterError;
}

@Injectable()
export class DeadLetterService {
  //private readonly logger = new Logger(DeadLetterService.name);

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly logger: PinoLoggerService
  ) {}

  async handleDeadLetter(data: DeadLetterData): Promise<void> {
    try {
      await this.logFailedNotification('Dead letter handler', data);
    } catch (error) {
      this.logError(
        'Failed to process dead letter',
        error,
        data
      );
    }
  }

  async sendToDeadLetter(data: DeadLetterData): Promise<void> {
    try {
      await this.logFailedNotification('Dead letter sender', data);

      //this.amqpConnection.channel.nack(message, false, true);
      await this.amqpConnection.publish(
        rabbitmqConfig.exchanges.deadLetter,
        rabbitmqConfig.queues.deadLetter.routingKey,
        data
      );      
    } catch (publishError) {
      this.logError(
        `Failed to publish to dead letter queue: ${publishError.message}`,
        publishError,
        data
      );
    }
  }

  private logError(message: string, error: Error, data: DeadLetterData): void {
    this.logger.error(message, {
      data,
      error,
    });
  }

  async logFailedNotification(
    source: string,
    data: DeadLetterData
  ): Promise<void> {
    this.logger.warn(`${source} failed notification logged`, {
      data: {
        type: data?.payload?.type,
        recipient: data?.payload?.recipient,
        correlationId: data?.payload?.correlationId,
        payload: data?.payload,
        error: data?.error,
        timestamp: new Date().toISOString(),
      },
    });
    
    // TODO: You could store failed notifications in a database
    // or send to a monitoring service
    // TODO: Implement storing failed notifications in a database
    // Example:
    // await this.failedNotificationsRepository.create({
    //   payload,
    //   error,
    //   timestamp: new Date(),
    // });
  }
} 