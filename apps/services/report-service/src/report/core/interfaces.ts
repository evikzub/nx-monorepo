import { ReportConfigProps } from "./types/report.config";

export interface IReportGenerator {
  generateReport(config: ReportConfigProps): Promise<string>;
}

export interface IReportDataProvider {
  prepareReportData(config: ReportConfigProps): Promise<any>;
} 

export interface IReportRenderer {
  renderToHtml(templateName: string, params: any): Promise<string>;
  renderToPdf(html: string, config: ReportConfigProps): Promise<void>;
}
