/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
// declare const module: any;

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { LoggingInterceptor, PinoLoggerService } from '@microservices-app/shared/backend';
import { AppConfigService } from '@microservices-app/shared/backend';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    //logger: new LoggerService(),
  });
  
  // Use the ConfigService to create the interceptor instance
  const configService = app.get(AppConfigService);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const logger = app.get(PinoLoggerService);
  app.useLogger(logger);
  app.useGlobalInterceptors(new LoggingInterceptor(configService, logger));
  
  const serviceConfig = configService.envConfig.userService;
  await app.listen(serviceConfig.port, serviceConfig.host);
  
  // if (module.hot) {
  //   module.hot.accept();
  //   module.hot.dispose(() => app.close());
  // }
  Logger.log(
    `🚀 User-Service is running on: http://${serviceConfig.host}:${serviceConfig.port}/${globalPrefix}`
  );
}

bootstrap();
