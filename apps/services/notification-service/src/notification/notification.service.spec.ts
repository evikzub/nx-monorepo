import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { EmailService } from '../email/email.service';
import { Logger } from '@nestjs/common';
import { NotificationPayload, NotificationPriority, NotificationType } from '@microservices-app/shared/types';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { DeadLetterService } from './dead-letter.service';
import { PinoLoggerService } from '@microservices-app/shared/backend';

describe('NotificationService', () => {
  let service: NotificationService;
  //let emailService: EmailService;

  const mockEmailService = {
    sendEmail: jest.fn().mockResolvedValue(undefined),
  };

  const mockAmqpConnection = {
    publish: jest.fn().mockResolvedValue(undefined),
  };

  const mockDeadLetterService = {
    sendToDeadLetter: jest.fn().mockResolvedValue(undefined),
  };

  const mockPinoLoggerService = {
    setContext: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: AmqpConnection,
          useValue: mockAmqpConnection,
        },
        {
          provide: DeadLetterService,
          useValue: mockDeadLetterService,
        },
        {
          provide: PinoLoggerService,
          useValue: mockPinoLoggerService,
        },
        // {
        //   provide: Logger,
        //   useValue: {
        //     log: jest.fn(),
        //     error: jest.fn(),
        //     warn: jest.fn(),
        //     debug: jest.fn(),
        //   },
        // },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    //emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleNotification', () => {
    const mockPayload: NotificationPayload = {
      type: NotificationType.EMAIL_VERIFICATION,
      recipient: 'test@example.com',
      templateId: 'email-verification',
      data: {
        firstName: 'Test',
        verificationUrl: 'http://example.com/verify',
      },
      correlationId: '123',
      priority: NotificationPriority.HIGH,
    };

    it('should process email verification notification', async () => {
      await service.handleNotification(mockPayload);

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
            recipient: mockPayload.recipient,
            templateId: mockPayload.templateId,
            data: mockPayload.data,
        })
      );
    });

    it.skip('should handle email service errors', async () => {
      const error = new Error('Email service error');
      mockEmailService.sendEmail.mockRejectedValueOnce(error);

      await expect(service.handleNotification(mockPayload)).rejects.toThrow(error);
    });

    // TODO
    it.skip('should handle invalid notification type', async () => {
      const invalidPayload = {
        ...mockPayload,
        type: 'INVALID_TYPE' as NotificationType,
      };

      await expect(service.handleNotification(invalidPayload)).rejects.toThrow(
        'Unsupported notification type'
      );
    });
  });
}); 