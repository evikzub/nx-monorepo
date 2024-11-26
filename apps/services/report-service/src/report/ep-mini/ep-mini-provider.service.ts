import * as path from 'path';
import { Injectable } from '@nestjs/common';

import { IReportDataProvider } from '../core/interfaces';
import { ReportConfigProps } from '../core/types/report.config';
import { pfaCommonData } from '../../assets/context';
import { ReportEPMiniProps } from './types/pfa.schema';
import { ReportsValuesService } from '../context/values/report-values.service';

@Injectable()
export class EPMiniProviderService implements IReportDataProvider {

  constructor(
    private readonly reportsValuesService: ReportsValuesService,
  ) {}

  private getReportTitle(): string {
    return 'ENTREPRENEUR PROFILE';
  }

  async prepareReportData(config: ReportConfigProps): Promise<ReportEPMiniProps> {
    return {
      css_file: path.join(config.assets.css, 'pdf.css'),
      logo_file: 'logos/entrepreneurprofile_logo.jpg',
      imagePath: 'images',
      userName: config.assessment.firstName,
      fullName: `${config.assessment.firstName} ${config.assessment.lastName}`,
      reportTitle: this.getReportTitle(),
      reportDate: new Date().toDateString(),
      commonContext: pfaCommonData,
      clientProps: {
        buyerMotiveTop1: config.assessment.data?.results?.motives?.top?.[1],
      },
      valuesProps: this.reportsValuesService.generateValuesReport(config),
    };
  }
} 