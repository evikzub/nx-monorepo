/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { LoggingInterceptor } from '@microservices-app/shared/backend';
import { LoggerService, AppConfigService } from '@microservices-app/shared/backend';

async function bootstrap() {
  const app = await NestFactory.create(UserModule, {
    logger: new LoggerService(),
  });
  
  // Use the ConfigService to create the interceptor instance
  const configService = app.get(AppConfigService);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalInterceptors(new LoggingInterceptor(configService));
  
  const serviceConfig = configService.envConfig.userService;
  await app.listen(serviceConfig.port, serviceConfig.host);
  
  Logger.log(
    `🚀 User-Service is running on: http://${serviceConfig.host}:${serviceConfig.port}/${globalPrefix}`
  );
}

bootstrap();
