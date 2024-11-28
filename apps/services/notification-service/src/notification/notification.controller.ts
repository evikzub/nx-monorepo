import { Controller } from '@nestjs/common';
import {
  RabbitSubscribe,
  MessageHandlerErrorBehavior,
} from '@golevelup/nestjs-rabbitmq';

import { NotificationPayload } from '@microservices-app/shared/types';
import { deadLetterArguments, notificationArguments, rabbitmqConfig } from '@microservices-app/shared/types';

import { NotificationService } from './notification.service';
import { DeadLetterData, DeadLetterService } from './dead-letter.service';
import { PinoLoggerService } from '@microservices-app/shared/backend';

@Controller()
export class NotificationController {
  //private readonly logger = new Logger(NotificationController.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly deadLetterService: DeadLetterService,
    private readonly logger: PinoLoggerService
  ) {}

  @RabbitSubscribe({
    exchange: rabbitmqConfig.exchanges.notifications, //'notifications.exchange',
    routingKey: rabbitmqConfig.queues.notifications.emailVerification.routingKey, //NotificationRoutingKey.EMAIL_VERIFICATION,
    queue: rabbitmqConfig.queues.notifications.name, //'notifications',
    errorBehavior: MessageHandlerErrorBehavior.NACK,
    queueOptions: {
        durable: true,
        arguments: notificationArguments,
    }
  })
  async handleEmailVerification(data: NotificationPayload) {
    this.logger.debug(
      `Received email verification notification for ${data.recipient}`
    );
    await this.notificationService.processNotification(data);
  }

  @RabbitSubscribe({
    exchange: rabbitmqConfig.exchanges.notifications,
    routingKey: rabbitmqConfig.queues.notifications.emailReport.routingKey,
    queue: rabbitmqConfig.queues.notifications.name,
    errorBehavior: MessageHandlerErrorBehavior.NACK,
    queueOptions: {
        durable: true,
        arguments: notificationArguments,
    }
  })
  async handleEmailReport(data: NotificationPayload) {
    this.logger.debug(
      `Received email report notification for ${data.recipient}`
    );
    await this.notificationService.processNotification(data);
  }

  @RabbitSubscribe(
    {
    exchange: rabbitmqConfig.exchanges.deadLetter,
    routingKey: rabbitmqConfig.queues.deadLetter.routingKey,
    //routingKey: 'notification.email.#',
    queue: rabbitmqConfig.queues.deadLetter.name,
    queueOptions: {
      durable: true,
      arguments: deadLetterArguments,
    }
  })
  async handleDeadLetter(data: DeadLetterData) {
    this.logger.log(`Processing dead letter:`, data);
    await this.deadLetterService.handleDeadLetter(data);
  }

  // private async processNotification(
  //   data: NotificationPayload,
  //   type: NotificationType
  // ) {
  //   this.logger.debug(`Message content: ${JSON.stringify(data)}`);
  //   this.logger.debug(
  //     `Processing ${type} notification for ${data.recipient}`
  //   );

  //   try {

  //     await this.notificationService.handleNotification(data);

  //     //channel.ack(message);
  //     this.logger.debug(
  //       `Successfully processed ${type} notification for ${data.recipient}`
  //     );
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to process ${type} notification: ${error.message}`
  //     );

  //     // Prepare error metadata
  //     const errorMetadata = {
  //       payload: data,
  //       error: {
  //         message: error.message,
  //         code: this.getErrorCode(error),
  //         timestamp: new Date().toISOString(),
  //       },
  //     };

  //     // Don't requeue if it's a permanent failure
  //     // const requeue = !this.isPermanentFailure(error);
  //     //TODO: Send to dead letter queue
  //     //channel.nack(message, false, requeue);

  //     // If not requeuing, the message will go to DLQ with error metadata
  //     // if (!requeue) {
  //     //   this.logger.warn(`Sending to DLQ: ${data.correlationId}`);
  //     // }

  //     throw error;
  //   }
  // }

  // private isPermanentFailure(error: Error): boolean {
  //   return [
  //     NotificationErrorCode.INVALID_RECIPIENT,
  //     NotificationErrorCode.TEMPLATE_NOT_FOUND,
  //   ].includes(this.getErrorCode(error));
  // }
}
