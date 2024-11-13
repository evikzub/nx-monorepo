import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import {
  AppConfigService,
} from '@microservices-app/shared/backend';
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
      nodeEnv: 'development',
      emailService: emailConfig,
      //   app: {
      //     name: 'Test App'
      //   }
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: AppConfigService,
          useValue: mockConfigService
        }
      ],
    }).compile();

    await module.init();

    service = module.get<EmailService>(EmailService);
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
    expect(templates.size).toBe(3);

    // Mock the transporter's sendMail method
    const sendMailMock = jest
      .spyOn(service['transporter'], 'sendMail')
      .mockImplementation(async () => ({ messageId: 'test-id' }));

    //const result =
    await service.sendEmail(payload);
    expect(sendMailMock).toHaveBeenCalled();

    //expect(result).toBeDefined();

    const callArg: any = sendMailMock.mock.calls[0][0];
    console.log('callArg', callArg);
    expect(callArg.to).toBe(payload.recipient);
    expect(callArg.html).toContain('Hello John');
    expect(callArg.html).toContain('http://example.com/verify');
  });
});
