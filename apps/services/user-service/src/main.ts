/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { LoggingInterceptor } from '@microservices-app/shared/backend';
import { LoggerService, AppConfigService } from '@microservices-app/shared/backend';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
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
