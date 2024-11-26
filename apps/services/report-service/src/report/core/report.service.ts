import { IReportDataProvider, IReportRenderer } from "./interfaces";

import { ReportConfigProps }  from "./types/report.config";
import { IReportGenerator } from "./interfaces";

export abstract class CoreReportService implements IReportGenerator {
  protected constructor(
    protected readonly renderer: IReportRenderer,
    protected readonly dataProvider: IReportDataProvider
  ) {}

  async generateReport(config: ReportConfigProps): Promise<string> {
    const reportData = await this.dataProvider.prepareReportData(config);
    const html = await this.renderer.renderToHtml(config.reportTemplate, reportData);
    await this.renderer.renderToPdf(html, config);
    return 'Report created';
  }
} 