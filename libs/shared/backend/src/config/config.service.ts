import { EnvironmentConfig, environmentSchema } from '@microservices-app/shared/types';

import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { loadConfiguration } from './config.loader';

@Injectable()
export class AppConfigService {
  private readonly config: EnvironmentConfig;

  constructor(private readonly nestConfigService: NestConfigService) {
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
