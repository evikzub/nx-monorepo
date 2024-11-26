import { Injectable } from '@nestjs/common';

import { CoreReportService } from '../core/report.service';
import { PdfRendererService } from '../core/renderer.service';

import { EPMiniProviderService } from './ep-mini-provider.service';

@Injectable()
export class EPMiniReportService extends CoreReportService {
  constructor(
    protected readonly pdfRenderer: PdfRendererService,
    protected readonly dataProvider: EPMiniProviderService,
  ) {
    super(pdfRenderer, dataProvider);
  }
} 