import { v4 as uuidv4 } from 'uuid';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

import { NotificationPayload, rabbitmqConfig } from '@microservices-app/shared/types';

import { CorrelationService } from '../correlation/correlation.context';

@Injectable()
export class ProviderService {
  private readonly logger = new Logger(ProviderService.name);

  constructor(
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async publishNotificationMessage(routingKey: string, payload: NotificationPayload): Promise<void> {
    const exchange = rabbitmqConfig.exchanges.notifications;
    const correlationId = CorrelationService.getRequestId() || uuidv4();

    // Add correlationId to the payload
    payload.correlationId = correlationId;

    await this.amqpConnection.publish(
      exchange,
      routingKey,
      payload,
    );

    this.logger.debug(`Message queued for ${routingKey}`, {
      correlationId
    });
  }
}
