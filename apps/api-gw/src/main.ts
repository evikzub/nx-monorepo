/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

//import helmet from 'helmet';
//import compression from 'compression';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AppConfigService, LoggerService, LoggingInterceptor } from '@microservices-app/shared/backend';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new LoggerService(),
  });
    
  // Security
  //app.use(helmet());
  
  // Compression
  //app.use(compression());
  
  // Global prefix
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  const configService = app.get(AppConfigService);
  
  // Apply logging interceptor globally
  app.useGlobalInterceptors(new LoggingInterceptor(configService));
  
  //const gatewayConfig = configService.envConfig.apiGateway;
  const { cors, port, host } = configService.envConfig.apiGateway;
  
  app.enableCors({
    origin: cors.origins,
    credentials: cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
  
  await app.listen(port, host);

  Logger.log(
    `🚀 API GW is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
