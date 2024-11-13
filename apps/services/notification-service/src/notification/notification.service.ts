import { Injectable, Logger } from '@nestjs/common';
import { 
  NotificationPayload, 
  NotificationType,
} from '@microservices-app/shared/types';
import { EmailService } from './email.service';
import { AppConfigService } from '@microservices-app/shared/backend';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly emailService: EmailService,
    //private readonly config: AppConfigService,
  ) {}

  // Make this method public
  async handleNotification(payload: NotificationPayload): Promise<void> {
    try {
      this.logger.debug(`Processing notification: ${JSON.stringify(payload)}`);
      await this.processNotification(payload);
    } catch (error) {
      this.logger.error(
        `Error processing notification: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  private async processNotification(payload: NotificationPayload) {
    try {
      switch (payload.type) {
        case NotificationType.EMAIL_VERIFICATION:
        case NotificationType.PASSWORD_RESET:
        case NotificationType.ACCOUNT_CHANGES:
          await this.emailService.sendEmail(payload);
          break;
        case NotificationType.ADMIN_ALERT:
          await this.processAdminAlert(payload);
          break;
        default:
          //TODO: Route to dead letter queue
          this.logger.warn(`Unknown notification type: ${payload.type}`);
      }
    } catch (error) {
      this.logger.error(
        `Error processing notification: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  private async processAdminAlert(payload: NotificationPayload) {
    // Implementation for admin alerts
    // Could include multiple notification channels
    await this.emailService.sendEmail(payload);
  }

  async sendNotification(payload: NotificationPayload): Promise<void> {
    await this.emailService.sendEmail(payload);
  }

  async logFailedNotification(
    payload: NotificationPayload,
    error: any
  ): Promise<void> {
    this.logger.warn(
      `Failed notification logged: ${payload.type} for ${payload.recipient}`,
      {
        correlationId: payload.correlationId,
        error,
        timestamp: new Date().toISOString(),
      }
    );
    
    // TODO: You could store failed notifications in a database
    // or send to a monitoring service
  }
} 