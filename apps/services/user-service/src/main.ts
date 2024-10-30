/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { LoggingInterceptor } from '@microservices-app/shared/backend';
import { LoggerService, ConfigService } from '@microservices-app/shared/backend';

async function bootstrap() {
  const app = await NestFactory.create(UserModule, {
    logger: new LoggerService(),
  });
  
  // Use the ConfigService to create the interceptor instance
  const configService = app.get(ConfigService);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalInterceptors(new LoggingInterceptor(configService));
  
  const port = configService.envConfig.userService.port || 3000;
  await app.listen(port);
  
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
