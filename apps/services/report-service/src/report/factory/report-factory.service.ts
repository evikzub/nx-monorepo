import { Injectable } from '@nestjs/common';
import { EPMiniReportService } from '../ep-mini/ep-mini-report.service';

export enum ReportType {
  EPMini = 'EPMini',    // Mini Entrepreneur Profile
  //EP = 'EP',            // Entrepreneur Profile
  // Add other types as needed
}

@Injectable()
export class ReportFactoryService {
  constructor(
    private readonly reportsEPMiniService: EPMiniReportService,
  ) {}

  getReportGenerator(type: ReportType) {
    switch (type) {
      case ReportType.EPMini:
        return this.reportsEPMiniService;
      default:
        throw new Error(`Report type ${type} not supported`);
    }
  }
} 