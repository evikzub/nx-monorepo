import { ENV_KEYS, EnvironmentConfig, environmentSchema } from '@microservices-app/shared/types';
import { ConfigFactory } from '@nestjs/config';

export const loadConfiguration: ConfigFactory = () => {
  const config: EnvironmentConfig = {
    nodeEnv: process.env[ENV_KEYS.NODE_ENV] as 'development' | 'test' | 'production' || 'development',
    database: {
      url: process.env[ENV_KEYS.DATABASE_URL] || '',
      schemaName: (process.env[ENV_KEYS.NODE_ENV] === 'test' 
        ? process.env[ENV_KEYS.TEST_DATABASE_SCHEMA] 
        : process.env[ENV_KEYS.DATABASE_SCHEMA]) || 'public',  // Default to 'public' schema
      poolMin: parseInt(process.env[ENV_KEYS.DATABASE_POOL_MIN] || '0'),
      poolMax: parseInt(process.env[ENV_KEYS.DATABASE_POOL_MAX] || '10'),
    },
    // consul: {
    //   host: process.env[ENV_KEYS.CONSUL_HOST] || '',
    //   port: parseInt(process.env[ENV_KEYS.CONSUL_PORT] || '8500'),
    // },
    apiGateway: {
      id: process.env[ENV_KEYS.API_GATEWAY_ID] || '',
      name: process.env[ENV_KEYS.API_GATEWAY_NAME] || '',
      port: parseInt(process.env[ENV_KEYS.API_GATEWAY_PORT] || '3000'),
      host: process.env[ENV_KEYS.API_GATEWAY_HOST] || '',
      timeout: parseInt(process.env[ENV_KEYS.SERVICE_TIMEOUT] || '30000'),
      cors: {
        origins: process.env[ENV_KEYS.CORS_ORIGINS]?.split(',') || [],
        credentials: process.env[ENV_KEYS.CORS_CREDENTIALS] === 'true',
      },
    },
    userService: {
      id: process.env[ENV_KEYS.USER_SERVICE_ID] || '',
      name: process.env[ENV_KEYS.USER_SERVICE_NAME] || '',
      port: parseInt(process.env[ENV_KEYS.USER_SERVICE_PORT] || '3001'),
      host: process.env[ENV_KEYS.USER_SERVICE_HOST] || '',
      timeout: parseInt(process.env[ENV_KEYS.SERVICE_TIMEOUT] || '30000'),
    },
    elastic: {
      url: process.env[ENV_KEYS.ELASTIC_URL] || '',
      username: process.env[ENV_KEYS.ELASTIC_USERNAME] || '',
      password: process.env[ENV_KEYS.ELASTIC_PASSWORD] || '',
    },
    jwt: {
      secret: process.env[ENV_KEYS.JWT_SECRET] || '',
      expiresIn: process.env[ENV_KEYS.JWT_EXPIRES_IN] || '1h',
    },
    rabbitmq: {
      url: process.env[ENV_KEYS.RABBITMQ_URL] || '',
      queues: {
        notifications: process.env[ENV_KEYS.RABBITMQ_NOTIFICATIONS_QUEUE] || '',
        deadLetter: process.env[ENV_KEYS.RABBITMQ_DEAD_LETTER_QUEUE] || '',
      },
      exchanges: {
        notifications: process.env[ENV_KEYS.RABBITMQ_NOTIFICATION_EXCHANGE] || '',
        deadLetter: process.env[ENV_KEYS.RABBITMQ_DEAD_LETTER_EXCHANGE] || '',
      },
      queueOptions: {
        messageTtl: parseInt(process.env[ENV_KEYS.RABBITMQ_MESSAGE_TTL] || '86400000'),
        deadLetterTtl: parseInt(process.env[ENV_KEYS.RABBITMQ_DLQ_MESSAGE_TTL] || '604800000'),
      },
    },
    emailService: {
      host: process.env[ENV_KEYS.EMAIL_HOST] || '',
      port: parseInt(process.env[ENV_KEYS.EMAIL_PORT] || '587'),
      secure: process.env[ENV_KEYS.EMAIL_SECURE] === 'true',
      user: process.env[ENV_KEYS.EMAIL_USER] || '',
      password: process.env[ENV_KEYS.EMAIL_PASSWORD] || '',
      //provider: process.env[ENV_KEYS.EMAIL_PROVIDER] as 'SENDGRID' | 'MAILGUN' | 'SMTP' || 'SENDGRID',
      //apiKey: process.env[ENV_KEYS.EMAIL_API_KEY] || '',
      //from: process.env[ENV_KEYS.EMAIL_FROM] || '',
      templateDir: process.env[ENV_KEYS.EMAIL_TEMPLATE_DIR] || '',
    },
    notificationService: {
      id: process.env[ENV_KEYS.NOTIFICATION_SERVICE_ID] || '',
      name: process.env[ENV_KEYS.NOTIFICATION_SERVICE_NAME] || '',
      host: process.env[ENV_KEYS.NOTIFICATION_SERVICE_HOST] || '',
      port: parseInt(process.env[ENV_KEYS.NOTIFICATION_SERVICE_PORT] || '3002'),
      timeout: parseInt(process.env[ENV_KEYS.SERVICE_TIMEOUT] || '30000'),
    //   retryAttempts: 5, //parseInt(process.env[ENV_KEYS.NOTIFICATION_RETRY_ATTEMPTS] || '5'),
    //   retryDelay: 1000, //parseInt(process.env[ENV_KEYS.NOTIFICATION_RETRY_DELAY] || '1000'),
    },
    assessmentService: {
      id: process.env[ENV_KEYS.ASSESSMENT_SERVICE_ID] || '',
      name: process.env[ENV_KEYS.ASSESSMENT_SERVICE_NAME] || '',
      port: parseInt(process.env[ENV_KEYS.ASSESSMENT_SERVICE_PORT] || '3004'),
      host: process.env[ENV_KEYS.ASSESSMENT_SERVICE_HOST] || '',
      timeout: parseInt(process.env[ENV_KEYS.SERVICE_TIMEOUT] || '30000'),
    },
    reportService: {
      id: process.env[ENV_KEYS.REPORT_SERVICE_ID] || '',
      name: process.env[ENV_KEYS.REPORT_SERVICE_NAME] || '',
      port: parseInt(process.env[ENV_KEYS.REPORT_SERVICE_PORT] || '3005'),
      host: process.env[ENV_KEYS.REPORT_SERVICE_HOST] || '',
      timeout: parseInt(process.env[ENV_KEYS.SERVICE_TIMEOUT] || '30000'),
    },
  };

  const result = environmentSchema.safeParse(config);

  if (!result.success) {
    console.error('❌ Invalid environment configuration');
    console.error(result.error.format());
    throw new Error('Invalid environment configuration');
  }

  return result.data;
};
