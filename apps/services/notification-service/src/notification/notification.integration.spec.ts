import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NotificationModule } from './notification.module';
import { AppConfigModule } from '@microservices-app/shared/backend';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { NotificationPayload, NotificationPriority, NotificationType } from '@microservices-app/shared/types';
import { NotificationService } from './notification.service';
import { EmailService } from '../email/email.service';

describe('Notification Integration', () => {
  let app: INestApplication;
  let notificationService: NotificationService;
  //let emailService: EmailService;

  const mockEmailService = {
    sendEmail: jest.fn().mockResolvedValue(undefined),
  };

  const mockAmqpConnection = {
    publish: jest.fn().mockResolvedValue(undefined),
    createChannel: jest.fn().mockResolvedValue({}),
    close: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppConfigModule.forRoot(),
        NotificationModule,
      ],
    })
    .overrideProvider(AmqpConnection)
    .useValue(mockAmqpConnection)
    .overrideProvider(EmailService)
    .useValue(mockEmailService)
    .compile();

    app = moduleFixture.createNestApplication();
    notificationService = moduleFixture.get<NotificationService>(NotificationService);
    //emailService = moduleFixture.get<EmailService>(EmailService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Notification Handling', () => {
    const payload: NotificationPayload = {
        type: NotificationType.EMAIL_VERIFICATION,
        recipient: 'test@example.com',
        templateId: 'email-verification',
        data: {
          firstName: 'Test',
          verificationUrl: 'http://example.com/verify',
        },
        correlationId: '123',
        priority: NotificationPriority.MEDIUM,
      };

    it('should handle email verification message', async () => {
      // Process the notification directly through the service
      await notificationService.handleNotification(payload);

      // Verify email was sent with correct data
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: payload.recipient,
          templateId: payload.templateId,
          data: payload.data,
        })
      );
    });

    it('should handle email service errors', async () => {
      const payload: NotificationPayload = {
        type: NotificationType.EMAIL_VERIFICATION,
        recipient: 'test@example.com',
        templateId: 'email-verification',
        data: {
          firstName: 'Test',
          verificationUrl: 'http://example.com/verify',
        },
        correlationId: '123',
        priority: NotificationPriority.MEDIUM,
      };

      // Mock email service failure
      mockEmailService.sendEmail.mockRejectedValueOnce(new Error('SMTP error'));

      // Verify error handling
      await expect(notificationService.handleNotification(payload))
        .rejects
        .toThrow('SMTP error');
    });

    it.skip('should handle invalid notification type', async () => {
      const payload = {
        type: 'INVALID_TYPE' as NotificationType,
        recipient: 'test@example.com',
        templateId: 'email-verification',
        data: {},
        correlationId: '123',
        priority: NotificationPriority.MEDIUM,
      };

      await expect(notificationService.handleNotification(payload))
        .rejects
        .toThrow('Unsupported notification type');
    });

    it('should handle missing template data', async () => {
      const payload: NotificationPayload = {
        type: NotificationType.EMAIL_VERIFICATION,
        recipient: 'test@example.com',
        templateId: 'email-verification',
        data: {}, // Missing required data
        correlationId: '123',
        priority: NotificationPriority.MEDIUM,
      };

      mockEmailService.sendEmail.mockRejectedValueOnce(new Error('Template data missing'));

      await expect(notificationService.handleNotification(payload))
        .rejects
        .toThrow('Template data missing');
    });
  });
}); 