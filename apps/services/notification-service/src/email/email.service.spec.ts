import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { AppConfigService, PinoLoggerService } from '@microservices-app/shared/backend';
import {
  NotificationPayload,
  NotificationType,
  NotificationPriority,
  EmailServiceConfig,
} from '@microservices-app/shared/types';

describe('EmailService', () => {
  let service: EmailService;

  const emailConfig: EmailServiceConfig = {
    host: 'smtp.test.com',
    port: 587,
    secure: false,
    user: 'test@test.com',
    password: 'test',
    templateDir: 'test',
  };

  const mockConfigService = {
    envConfig: {
      nodeEnv: 'test',
      emailService: emailConfig,
    },
  };

  const mockPinoLoggerService = {
    setContext: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(), 
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: AppConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PinoLoggerService,
          useValue: mockPinoLoggerService,
        },
      ],
    }).compile();

    await module.init();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should render email verification template', async () => {
    const payload: NotificationPayload = {
      type: NotificationType.EMAIL_VERIFICATION,
      recipient: 'test@example.com',
      templateId: 'email-verification',
      data: {
        firstName: 'John',
        verificationUrl: 'http://example.com/verify',
      },
      priority: NotificationPriority.MEDIUM,
      correlationId: '1234567890',
    };

    const templates = service.getTemplates();
    //console.log(templates);
    // 4 templates + base
    expect(templates.size).toBe(4);

    // Mock the transporter's sendMail method
    const sendMailMock = jest
      .spyOn(service['transporter'], 'sendMail')
      .mockImplementation(async () => ({ messageId: 'test-id' }));

    //const result =
    await service.sendEmail(payload);
    expect(sendMailMock).toHaveBeenCalled();

    //expect(result).toBeDefined();

    const callArg: any = sendMailMock.mock.calls[0][0];
    //console.log('callArg', callArg);
    expect(callArg.to).toBe(payload.recipient);
    expect(callArg.html).toContain('Hello John');
    expect(callArg.html).toContain('http://example.com/verify');
  });

  describe('sendEmail', () => {
    const testPayload: NotificationPayload = {
      type: NotificationType.EMAIL_VERIFICATION,
      recipient: 'test@example.com',
      templateId: 'email-verification',
      data: {
        firstName: 'John',
        verificationUrl: 'http://example.com/verify',
      },
      priority: NotificationPriority.MEDIUM,
      correlationId: '1234567890',
    };

    it('should send email with correct template', async () => {
      // Mock the transporter's sendMail method
      const sendMailMock = jest
        .spyOn(service['transporter'], 'sendMail')
        .mockResolvedValue({ messageId: 'test-id' });

      await service.sendEmail(testPayload);

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: testPayload.recipient,
          subject: expect.any(String),
          html: expect.stringContaining('Hello John'),
        })
      );
    });

    it('should throw error for invalid template', async () => {
      const invalidPayload = {
        ...testPayload,
        templateId: 'invalid-template',
      };
      await expect(service.sendEmail(invalidPayload)).rejects.toThrow(
        'Template not found'
      );
    });

    it('should handle email sending errors', async () => {
      jest
        .spyOn(service['transporter'], 'sendMail')
        .mockRejectedValue(new Error('SMTP error'));

        await expect(service.sendEmail(testPayload))
        .rejects
        .toThrow('SMTP error');
    });
  });
});
