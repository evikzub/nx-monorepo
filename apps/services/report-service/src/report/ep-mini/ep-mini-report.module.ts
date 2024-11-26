import * as ejs from 'ejs';
import { Module } from '@nestjs/common';

import { ReportsContextModule } from '../context/context.module';
import { PdfRendererService } from '../core/renderer.service';

import { EPMiniReportService } from './ep-mini-report.service';
import { EPMiniProviderService } from './ep-mini-provider.service';

@Module({
  imports: [ReportsContextModule],
  providers: [
    EPMiniReportService,
    EPMiniProviderService,
    PdfRendererService,
    {
      provide: 'EJS',
      useValue: ejs,
    },
  ],
  exports: [EPMiniReportService],
})
export class EPMiniReportModule {}
