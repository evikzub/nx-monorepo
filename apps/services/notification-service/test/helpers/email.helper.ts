import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';

export class EmailTestHelper {
  private static sentEmails: Mail.Options[] = [];

  static mockTransporter() {
    return createTransport({
      name: 'test',
      host: 'localhost',
      port: 587,
      secure: false,
      auth: {
        user: 'test',
        pass: 'test',
      },
      send: (mail: Mail.Options, callback: (err: Error | null, info: any) => void) => {
        EmailTestHelper.sentEmails.push(mail);
        callback(null, { messageId: 'test-id' });
      },
    });
  }

  static getLastSentEmail(): Mail.Options | undefined {
    return EmailTestHelper.sentEmails[EmailTestHelper.sentEmails.length - 1];
  }

  static clearSentEmails() {
    EmailTestHelper.sentEmails = [];
  }
} 