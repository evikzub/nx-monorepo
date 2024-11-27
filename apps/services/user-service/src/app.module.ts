import { Module } from '@nestjs/common';
import { AppConfigModule, AppConfigService, LoggerModule } from '@microservices-app/shared/backend';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
//import { ConsulModule } from './consul/consul.module';
//import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   load: [loadConfiguration],
    //   isGlobal: true,
    // }),
    AppConfigModule.forRoot(),
    LoggerModule.forRootAsync({
      useFactory: (configService: AppConfigService) => 
        configService.envConfig.userService.name,
    }),
    AuthModule,
    UserModule,
    //ConsulModule,
    //HealthModule,
  ],
})
export class AppModule {} 