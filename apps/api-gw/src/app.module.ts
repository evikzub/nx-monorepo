import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';

import { 
  AppConfigModule, 
  JwtAuthGuard, 
  RolesGuard, 
  SharedAuthModule,
  CorrelationMiddleware
} from '@microservices-app/shared/backend';

import { HealthController } from './health/health.controller';
//import { CorrelationMiddleware } from './middleware/correlation.middleware';
//import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    AppConfigModule.forRoot(),
    //AuthModule,
    SharedAuthModule.register(),
    TerminusModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
