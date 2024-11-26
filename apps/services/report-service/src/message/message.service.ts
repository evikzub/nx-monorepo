import { Injectable, Logger } from '@nestjs/common';

import { NotificationPriority, NotificationPayload, NotificationType, AssessmentDto, rabbitmqConfig, ReportDataMessage } from '@microservices-app/shared/types';
import { ProviderService } from '@microservices-app/shared/backend';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly providerService: ProviderService,
  ) {}

  async sendReport(id: string, assessment: AssessmentDto, pdfUrl: string): Promise<void> {
    const routingKey = rabbitmqConfig.queues.notifications.emailReport.routingKey;

    const reportData: ReportDataMessage = {
      id,
      firstName: assessment.firstName,
      lastName: assessment.lastName,
      email: assessment.email,
      //pdfUrl,
      // TODO: Add parameter to get the pdf path from the config
      pdfUrl: "/app/reports/report.pdf"

    };
    
    const notificationPayload: NotificationPayload = {
      type: NotificationType.EMAIL_REPORT,
      recipient: assessment.email,
      templateId: NotificationType.EMAIL_REPORT.toString().toLowerCase(),
      data: reportData,
      priority: NotificationPriority.HIGH,
      correlationId: null, //keep it empty
    };

    try {
        await this.providerService.publishNotificationMessage(
        routingKey,
        notificationPayload,
      );

    } catch (error) {
      this.logger.error(`Failed to queue report: ${error.message}`, {
        ...notificationPayload
      });
      throw error;
    }
  }
}