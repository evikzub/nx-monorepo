import { Controller, Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  NotificationPayload,
  NotificationType,
  NotificationErrorCode,
} from '@microservices-app/shared/types';
import {
  //AmqpConnection,
  RabbitSubscribe,
  MessageHandlerErrorBehavior,
} from '@golevelup/nestjs-rabbitmq';
import { deadLetterArguments, notificationArguments, rabbitmqConfig } from './notifications.config';


@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);
  constructor(
    private readonly notificationService: NotificationService,
    //private readonly amqpConnection: AmqpConnection
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
    await this.processNotification(data, NotificationType.EMAIL_VERIFICATION);
  }

//   @EventPattern('notification.email.password-reset')
//   async handlePasswordReset(
//     @Payload() data: NotificationPayload,
//     @Ctx() context: RmqContext
//   ) {
//     await this.processNotification(
//       data,
//       context,
//       NotificationType.PASSWORD_RESET
//     );
//   }

//   @EventPattern('notification.email.account-changes')
//   async handleAccountChanges(
//     @Payload() data: NotificationPayload,
//     @Ctx() context: RmqContext
//   ) {
//     await this.processNotification(
//       data,
//       context,
//       NotificationType.ACCOUNT_CHANGES
//     );
//   }

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
  async handleDeadLetter(data: { payload: NotificationPayload; error: any }) {
    this.logger.warn(
      `Processing dead letter: ${JSON.stringify(data)}`,
      { correlationId: data?.payload?.correlationId }
    );
//   }
//   @EventPattern('dead-letter')
//   async handleDeadLetter(
//     @Payload() data: { payload: NotificationPayload; error: any },
//     @Ctx() context: RmqContext
//   ) {
    // data: { payload: NotificationPayload; error: any }
    //const channel = context.getChannelRef();
    //const message = context.getMessage();

    try {
      this.logger.warn(
        `Processing dead letter for ${data.payload.type} notification to ${data.payload.recipient}`,
        {
          error: data.error,
          correlationId: data.payload.correlationId,
        }
      );

      // Log the failure for monitoring
      await this.notificationService.logFailedNotification(
        data.payload,
        data.error
      );

      // Always acknowledge dead letter messages
      //channel.ack(message);
    } catch (error) {
      this.logger.error('Failed to process dead letter', error);
      // Still ack the message to prevent infinite loop
      //channel.ack(message);
    }
  }

  private async processNotification(
    data: NotificationPayload,
    //context: RmqContext,
    type: NotificationType
  ) {
    //const channel = context.getChannelRef();
    //const message = context.getMessage();
    //const pattern = context.getPattern(); // Add this line

    //this.logger.debug(`Processing notification with pattern: ${pattern}`);
    this.logger.debug(`Message content: ${JSON.stringify(data)}`);

    try {
      this.logger.debug(
        `Processing ${type} notification for ${data.recipient}`
      );
      await this.notificationService.handleNotification(data);

      //channel.ack(message);
      this.logger.debug(
        `Successfully processed ${type} notification for ${data.recipient}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to process ${type} notification: ${error.message}`
      );

      // Prepare error metadata
      const errorMetadata = {
        payload: data,
        error: {
          message: error.message,
          code: this.getErrorCode(error),
          timestamp: new Date().toISOString(),
        },
      };

      // Don't requeue if it's a permanent failure
      const requeue = !this.isPermanentFailure(error);
      //TODO: Send to dead letter queue
      //channel.nack(message, false, requeue);

      // If not requeuing, the message will go to DLQ with error metadata
      if (!requeue) {
        this.logger.warn(`Sending to DLQ: ${data.correlationId}`);
      }

      throw error;
    }
  }

  private getErrorCode(error: Error): NotificationErrorCode {
    if (error.message.includes('INVALID_RECIPIENT')) {
      return NotificationErrorCode.INVALID_RECIPIENT;
    }
    if (error.message.includes('TEMPLATE_NOT_FOUND')) {
      return NotificationErrorCode.TEMPLATE_NOT_FOUND;
    }
    return NotificationErrorCode.DELIVERY_FAILED;
  }

  private isPermanentFailure(error: Error): boolean {
    return [
      NotificationErrorCode.INVALID_RECIPIENT,
      NotificationErrorCode.TEMPLATE_NOT_FOUND,
    ].includes(this.getErrorCode(error));
  }
}
