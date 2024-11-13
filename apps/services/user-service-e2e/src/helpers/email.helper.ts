import { Mail } from 'nodemailer';

export class EmailTestHelper {
  private static sentEmails: Mail.Options[] = [];

  static addSentEmail(email: Mail.Options) {
    EmailTestHelper.sentEmails.push(email);
  }

  static getLastSentEmail(): Mail.Options | undefined {
    return EmailTestHelper.sentEmails[EmailTestHelper.sentEmails.length - 1];
  }

  static clearSentEmails() {
    EmailTestHelper.sentEmails = [];
  }
} 