import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '@microservices-app/shared/backend';
import { NotificationPayload, NotificationType } from '@microservices-app/shared/types';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly templates: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor(private readonly config: AppConfigService) {
    this.transporter = nodemailer.createTransport({
      // Configure based on your email provider
      host: config.envConfig.emailService.host,
      port: config.envConfig.emailService.port,
      secure: config.envConfig.emailService.secure,
      auth: {
        user: config.envConfig.emailService.user,
        pass: config.envConfig.emailService.password,
      },
    });
    //console.log('config', config);

    this.initializeTemplates();
  }

  private getTemplatesPath(): string {
    // In development
    if (this.config.envConfig.nodeEnv === 'development' || this.config.envConfig.nodeEnv === 'test') {
      return path.join(process.cwd(), 'apps/services/notification-service/src/templates/emails');
    }
    
    // In production (after build)
    return path.join(process.cwd(), 'dist/apps/services/notification-service/templates/emails');
  }

  private initializeTemplates() {
    try {
      const templatesPath = this.getTemplatesPath();
      this.logger.debug(`Loading templates from: ${templatesPath}`);

      // Register partials
      const baseTemplate = fs.readFileSync(
        path.join(templatesPath, 'base.hbs'),
        'utf-8'
      );
      handlebars.registerPartial('base', baseTemplate);
      //const compiledBase = handlebars.compile(baseTemplate);

      // Load and compile templates
      const templateFiles = fs.readdirSync(templatesPath);

      for (const file of templateFiles) {
        if (file === 'base.hbs') continue;
        
        const templateName = path.parse(file).name;
        const templateContent = fs.readFileSync(
          path.join(templatesPath, file),
          'utf-8'
        );
        
        this.templates.set(
          templateName,
          handlebars.compile(templateContent)
        );

        this.logger.debug(`Loaded template: ${templateName}`);
      }

      this.logger.log(`Successfully loaded ${this.templates.size} templates`);
    } catch (error) {
      this.logger.error('Failed to initialize email templates', error);
      throw error;
    }
  }

  // Method for testing
  async initializeTestTemplates(mockTemplates: Record<string, string>) {
    for (const [name, content] of Object.entries(mockTemplates)) {
      this.templates.set(name, handlebars.compile(content));
    }
  }

  getTemplates(): Map<string, handlebars.TemplateDelegate> {
    return this.templates;
  }

  async sendEmail(payload: NotificationPayload): Promise<void> {
    try {
      const template = this.templates.get(payload.templateId);
      if (!template) {
        throw new Error(`Template not found: ${payload.templateId}`);
      }

      const html = template({
        ...payload.data,
        appName: 'Entrepreneur App', //this.config.envConfig.app.Name,
        year: new Date().getFullYear(),
      });

      await this.transporter.sendMail({
        from: this.config.envConfig.emailService.user,
        to: payload.recipient,
        subject: this.getSubject(payload),
        html,
      });

      this.logger.debug(`Email sent to ${payload.recipient}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }

  private getSubject(payload: NotificationPayload): string {
    const subjects = {
      [NotificationType.EMAIL_VERIFICATION]: 'Verify your email',
      [NotificationType.PASSWORD_RESET]: 'Reset your password',
      [NotificationType.ACCOUNT_CHANGES]: 'Account update notification',
      [NotificationType.ADMIN_ALERT]: 'Admin Alert',
    };

    return subjects[payload.type] || 'Notification';
  }
} 