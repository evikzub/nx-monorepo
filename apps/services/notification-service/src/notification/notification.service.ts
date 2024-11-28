import { Injectable, Logger } from '@nestjs/common';

import { 
  NotificationErrorCode,
  NotificationPayload, 
  NotificationType,
} from '@microservices-app/shared/types';

import { EmailService } from '../email/email.service';
import { DeadLetterService } from './dead-letter.service';
import { PinoLoggerService } from '@microservices-app/shared/backend';

@Injectable()
export class NotificationService {
  //private readonly logger = new Logger(NotificationService.name);
  private readonly maxRetries = 3;

  constructor(
    private readonly emailService: EmailService,
    private readonly deadLetterService: DeadLetterService,
    private readonly logger: PinoLoggerService
  ) {
    //this.logger.setContext(NotificationService.name);
  }

  // Make this method public
  async handleNotification(payload: NotificationPayload, retryCount = 0): Promise<void> {
    try {
      //this.logger.debug(`Processing notification: ${JSON.stringify(payload)}`);
      this.validatePayload(payload);
      await this.processNotification(payload);
    } catch (error) {
      // this.logger.error(
      //   `Error processing notification: ${error.message}`,
      //   error.stack
      // );
      // throw error;
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        await this.retryNotification(payload, retryCount);
      } else {
        await this.deadLetterService.sendToDeadLetter({payload, error});
      }
    }
  }

  private validatePayload(payload: NotificationPayload): void {
    if (!payload.recipient || !payload.type || !payload.templateId) {
      throw new Error('Invalid notification payload');
    }
  }

  private async retryNotification(payload: NotificationPayload, retryCount: number): Promise<void> {
    const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, delay));
    await this.handleNotification(payload, retryCount + 1);
  }

  private isRetryableError(error: Error): boolean {
    return ![
      NotificationErrorCode.INVALID_RECIPIENT,
      NotificationErrorCode.TEMPLATE_NOT_FOUND,
    ].includes(this.getErrorCode(error));
  }

  async processNotification(payload: NotificationPayload) {
    try {
      switch (payload.type) {
        case NotificationType.EMAIL_VERIFICATION:
        case NotificationType.PASSWORD_RESET:
        case NotificationType.ACCOUNT_CHANGES:
          await this.emailService.sendEmail(payload);
          break;
        // case NotificationType.ADMIN_ALERT:
        //   await this.processAdminAlert(payload);
        //   break;
        case NotificationType.EMAIL_REPORT:
          await this.emailService.sendReport(payload);
          break;
        default:
          // Send to dead letter queue with unknown type error
          await this.deadLetterService.sendToDeadLetter({
            payload,
            error: {
              code: NotificationErrorCode.INVALID_TYPE,
              message: `Unknown notification type: ${payload.type}`,
              stack: new Error().stack,
              timestamp: new Date().toISOString(),
            },
          });
      }
    } catch (error) {
      this.logger.error(
        `Error processing notification: ${error.message}`,
        error.stack
      );
      // Send to dead letter queue with processing error
      await this.deadLetterService.sendToDeadLetter({payload, error});
      //throw error;
    }
  }

  // private async processAdminAlert(payload: NotificationPayload) {
  //   // Implementation for admin alerts
  //   // Could include multiple notification channels
  //   await this.emailService.sendEmail(payload);
  // }

  // async sendNotification(payload: NotificationPayload): Promise<void> {
  //   await this.emailService.sendEmail(payload);
  // }

  private getErrorCode(error: Error): NotificationErrorCode {
    if (error.message.includes('INVALID_RECIPIENT')) {
      return NotificationErrorCode.INVALID_RECIPIENT;
    }
    if (error.message.includes('TEMPLATE_NOT_FOUND')) {
      return NotificationErrorCode.TEMPLATE_NOT_FOUND;
    }
    return NotificationErrorCode.DELIVERY_FAILED;
  }
} 