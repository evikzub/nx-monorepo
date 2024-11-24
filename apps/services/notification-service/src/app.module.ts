import { Module } from '@nestjs/common';
import { AppConfigModule } from '@microservices-app/shared/backend';
import { NotificationModule } from './notification/notification.module';
//import { HealthModule } from './health/health.module';

@Module({
  imports: [
    AppConfigModule.forRoot(),
    NotificationModule,
    //HealthModule,
  ],
})
export class AppModule {} 