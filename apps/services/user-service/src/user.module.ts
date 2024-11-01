import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  AppConfigService,
  DatabaseModule,
  loadConfiguration,
//  LoggingInterceptor,
} from '@microservices-app/shared/backend';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { HealthController } from './health/health.controller';
import { ConsulService } from './consul/consul.service';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
//import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [loadConfiguration],
    }),
    DatabaseModule,
    TerminusModule, // Add Terminus module for health checks
    HttpModule, // Required by Terminus for HTTP health checks
  ],
  controllers: [UserController, HealthController],
  providers: [
    UserService,
    UserRepository,
    AppConfigService,
    ConsulService,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: LoggingInterceptor,
    // },
  ],
  exports: [UserService],
})
export class UserModule {}
