import { Module } from '@nestjs/common';

import { EPMiniReportModule } from '../ep-mini/ep-mini-report.module';

import { ReportFactoryService } from './report-factory.service';

@Module({
  imports: [EPMiniReportModule],
  providers: [ReportFactoryService],
  exports: [ReportFactoryService],
})
export class ReportFactoryModule {}
