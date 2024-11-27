/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppConfigService, LoggingInterceptor, PinoLoggerService } from '@microservices-app/shared/backend';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    //logger: new LoggerService(),
  });

  // const consulService = app.get(ConsulService);
  // await consulService.registerService('report-service');

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  const configService = app.get(AppConfigService);

  const logger = app.get(PinoLoggerService);
  app.useLogger(logger);
  app.useGlobalInterceptors(new LoggingInterceptor(configService, logger));

  const { port, host } = configService.envConfig.reportService;
  
  await app.listen(port, host);
  Logger.log(
    `🚀 Report Service is running on: http://${host}:${port}/${globalPrefix}`
  );
}

bootstrap();
