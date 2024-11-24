import { v4 as uuidv4 } from 'uuid';
import { Injectable, Logger } from '@nestjs/common';

import { ProviderService } from '@microservices-app/shared/backend';
import { User, NotificationPriority, NotificationPayload, NotificationType, rabbitmqConfig } from '@microservices-app/shared/types';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly providerService: ProviderService,
  ) {}

  async sendVerificationEmail(user: User): Promise<void> {
    const routingKey = rabbitmqConfig.queues.notifications.emailVerification.routingKey;

    const verificationToken = uuidv4(); // In practice, store this token
    const verificationUrl = `http://localhost:4200/verify-email?token=${verificationToken}`;

    const notificationPayload: NotificationPayload = {
      type: NotificationType.EMAIL_VERIFICATION,
      recipient: user.email,
      templateId: 'email-verification',
      data: {
        firstName: user.firstName,
        verificationUrl,
      },
      priority: NotificationPriority.HIGH,
      correlationId: null,
    };


    try {
      await this.providerService.publishNotificationMessage(
        routingKey,
        notificationPayload,
      );
    } catch (error) {
      this.logger.error(`Failed to queue verification email: ${error.message}`, {
        ...notificationPayload
      });
      //throw error;
    }
  }
}