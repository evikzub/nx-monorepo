/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AppConfigService, LoggingInterceptor } from '@microservices-app/shared/backend';
import { PinoLoggerService } from '@microservices-app/shared/backend';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    //logger: new LoggerService(),
  });

  // const consulService = app.get(ConsulService);
  // await consulService.registerService('assessment-service');

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  const configService = app.get(AppConfigService);

  const logger = app.get(PinoLoggerService);
  app.useLogger(logger);
  app.useGlobalInterceptors(new LoggingInterceptor(configService, logger));

  const { port, host } = configService.envConfig.assessmentService;
  
  await app.listen(port, host);
  Logger.log(
    `🚀 Assessment Service is running on: http://${host}:${port}/${globalPrefix}`
  );
}

bootstrap();
