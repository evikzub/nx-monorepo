/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService, LoggerService } from '@microservices-app/shared/backend';
//import { NotificationModule } from './app/notification.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
  //const app = await NestFactory.create(NotificationModule, {
    logger: new LoggerService(),
  });

  const configService = app.get<AppConfigService>(AppConfigService);
  const config = configService.envConfig;

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  //await app.startAllMicroservices();
  await app.listen(config.notificationService.port);

  Logger.log(
    `🚀 Notification-Service is running on: http://localhost:${config.notificationService.port}/${globalPrefix}`
  );
}

bootstrap();

