import { Module } from '@nestjs/common';
import { AppConfigModule, AppConfigService, LoggerModule } from '@microservices-app/shared/backend';
import { NotificationModule } from './notification/notification.module';
//import { HealthModule } from './health/health.module';

@Module({
  imports: [
    AppConfigModule.forRoot(),
    LoggerModule.forRootAsync({
      useFactory: (configService: AppConfigService) =>
        configService.envConfig.notificationService.name,
    }),
    NotificationModule,
    //HealthModule,
  ],
})
export class AppModule {} 