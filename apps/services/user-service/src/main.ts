/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { LoggerService } from './services/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(UserModule, {
    logger: new LoggerService(),
  });
  
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalInterceptors(new LoggingInterceptor());
  
  const port = process.env.USER_SERVICE_PORT || 3000;
  await app.listen(port);
  
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
