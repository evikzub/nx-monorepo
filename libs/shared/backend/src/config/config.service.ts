import { ENV_KEYS, EnvironmentConfig, environmentSchema } from '@microservices-app/shared/types';

import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { loadConfiguration } from './config.loader';

@Injectable()
export class AppConfigService {
  private readonly config: EnvironmentConfig;

  constructor(private readonly nestConfigService: NestConfigService) {
    // const rawConfig = {
    //   nodeEnv: nestConfigService.get<string>(ENV_KEYS.NODE_ENV) || 'development',
    //   database: {
    //     url: nestConfigService.get<string>(ENV_KEYS.DATABASE_URL),
    //     schemaName: nestConfigService.get<string>(ENV_KEYS.NODE_ENV) === 'test'
    //       ? nestConfigService.get<string>(ENV_KEYS.TEST_DATABASE_SCHEMA)
    //       : nestConfigService.get<string>(ENV_KEYS.DATABASE_SCHEMA) || 'public',
    //     poolMin: nestConfigService.get<string>(ENV_KEYS.DATABASE_POOL_MIN),
    //     poolMax: nestConfigService.get<string>(ENV_KEYS.DATABASE_POOL_MAX),
    //   },
    //   consul: {
    //     host: nestConfigService.get<string>(ENV_KEYS.CONSUL_HOST),
    //     port: nestConfigService.get<string>(ENV_KEYS.CONSUL_PORT),
    //   },
    //   apiGateway: {
    //     id: nestConfigService.get<string>(ENV_KEYS.API_GATEWAY_ID),
    //     name: nestConfigService.get<string>(ENV_KEYS.API_GATEWAY_NAME),
    //     port: nestConfigService.get<string>(ENV_KEYS.API_GATEWAY_PORT),
    //     host: nestConfigService.get<string>(ENV_KEYS.API_GATEWAY_HOST),
    //     timeout: nestConfigService.get<string>(ENV_KEYS.SERVICE_TIMEOUT),
    //   },
    //   userService: {
    //     id: nestConfigService.get<string>(ENV_KEYS.USER_SERVICE_ID),
    //     name: nestConfigService.get<string>(ENV_KEYS.USER_SERVICE_NAME),
    //     port: nestConfigService.get<string>(ENV_KEYS.USER_SERVICE_PORT),
    //     host: nestConfigService.get<string>(ENV_KEYS.USER_SERVICE_HOST),
    //     timeout: nestConfigService.get<string>(ENV_KEYS.SERVICE_TIMEOUT),
    //   },
    //   jwt: {
    //     secret: nestConfigService.get<string>(ENV_KEYS.JWT_SECRET),
    //     expiresIn: nestConfigService.get<string>(ENV_KEYS.JWT_EXPIRES_IN) || '1h',
    //   },
    //   rabbitmq: {
    //     url: nestConfigService.get<string>(ENV_KEYS.RABBITMQ_URL),
    //     queues: {
    //       notifications: nestConfigService.get<string>(ENV_KEYS.RABBITMQ_NOTIFICATION_QUEUE),
    //       deadLetter: nestConfigService.get<string>(ENV_KEYS.RABBITMQ_DEAD_LETTER_QUEUE),
    //     },
    //     exchanges: {
    //       notifications: nestConfigService.get<string>(ENV_KEYS.RABBITMQ_NOTIFICATION_EXCHANGE),
    //     },
    //   },
    //   email: {
    //     provider: nestConfigService.get<string>(ENV_KEYS.EMAIL_PROVIDER),
    //     apiKey: nestConfigService.get<string>(ENV_KEYS.EMAIL_API_KEY),
    //     from: nestConfigService.get<string>(ENV_KEYS.EMAIL_FROM),
    //     templateDir: nestConfigService.get<string>(ENV_KEYS.EMAIL_TEMPLATE_DIR),
    //   },
    //   notificationService: {
    //     host: nestConfigService.get<string>(ENV_KEYS.NOTIFICATION_SERVICE_HOST),
    //     port: nestConfigService.get<string>(ENV_KEYS.NOTIFICATION_SERVICE_PORT),
    //   //   retryAttempts: nestConfigService.get<string>(ENV_KEYS.NOTIFICATION_RETRY_ATTEMPTS),
    //   //   retryDelay: nestConfigService.get<string>(ENV_KEYS.NOTIFICATION_RETRY_DELAY),
    //   },
    // };

    const config = loadConfiguration();
    const parsedConfig = environmentSchema.safeParse(config);
    if (!parsedConfig.success) {
      throw new Error(`Invalid configuration: ${JSON.stringify(parsedConfig.error.issues)}`);
    }
    this.config = parsedConfig.data;
  }

  get envConfig(): EnvironmentConfig {
    return this.config;
  }
}
