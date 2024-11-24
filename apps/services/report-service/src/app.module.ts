import { Module } from '@nestjs/common';
import { AppConfigModule, ConsulService } from '@microservices-app/shared/backend';
import { ReportModule } from './report/report.module';

@Module({
  imports: [AppConfigModule.forRoot(), ReportModule],
  //providers: [ConsulService],
})
export class AppModule {}
