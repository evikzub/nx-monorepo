import { Module } from '@nestjs/common';
import { AppConfigModule, AppConfigService, LoggerModule } from '@microservices-app/shared/backend';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    AppConfigModule.forRoot(),
    LoggerModule.forRootAsync({
      useFactory: (configService: AppConfigService) =>
        configService.envConfig.reportService.name,
    }),
    ReportModule,
  ],
  //providers: [ConsulService],
})
export class AppModule {}
