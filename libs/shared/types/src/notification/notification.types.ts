export enum NotificationType {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  ACCOUNT_CHANGES = 'ACCOUNT_CHANGES',
  ADMIN_ALERT = 'ADMIN_ALERT',
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface NotificationPayload {
  type: NotificationType;
  recipient: string;
  templateId: string;
  data: Record<string, any>;
  priority: NotificationPriority;
  correlationId: string;
  metadata?: Record<string, any>;
}

export interface NotificationEmailConfig {
  from: string;
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

export enum NotificationErrorCode {
  INVALID_RECIPIENT = 'INVALID_RECIPIENT',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  DELIVERY_FAILED = 'DELIVERY_FAILED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

export enum NotificationRoutingKey {
  EMAIL_VERIFICATION = 'notification.email.verification',
  PASSWORD_RESET = 'notification.email.password-reset',
  ACCOUNT_CHANGES = 'notification.email.account-changes',
  ADMIN_ALERT = 'notification.email.admin-alert',
  SYSTEM_NOTIFICATION = 'notification.email.system-notification'
}

