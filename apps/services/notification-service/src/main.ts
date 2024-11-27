/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService, LoggingInterceptor, PinoLoggerService } from '@microservices-app/shared/backend';
//import { NotificationModule } from './app/notification.module';

async function bootstrap() {
  //const app = await NestFactory.create(NotificationModule, {
  const app = await NestFactory.create(AppModule, {
    //logger: new LoggerService(),
  });

  const configService = app.get<AppConfigService>(AppConfigService);
  const { port, host } = configService.envConfig.notificationService;

  const logger = app.get(PinoLoggerService);
  app.useLogger(logger);
  //app.useGlobalInterceptors(new LoggingInterceptor(configService, logger));

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  await app.listen(port, host);
  Logger.log(
    `🚀 Notification-Service is running on: http://${host}:${port}/${globalPrefix}`
  );
}

bootstrap();
