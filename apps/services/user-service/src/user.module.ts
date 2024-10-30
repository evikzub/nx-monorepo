import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  ConfigService,
  DatabaseModule,
  loadConfiguration,
//  LoggingInterceptor,
} from '@microservices-app/shared/backend';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
//import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [loadConfiguration],
    }),
    DatabaseModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    ConfigService,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: LoggingInterceptor,
    // },
  ],
  exports: [UserService],
})
export class UserModule {}
