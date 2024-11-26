import fs from "fs";
import path from "path";

import { Injectable, Logger } from "@nestjs/common";
import { AssessmentDto } from "@microservices-app/shared/types";

import { AssessmentRepository } from "../assessment/assessment.repository";
import { MessageService } from "../message/message.service";

import { ReportConfigProps, ReportAssetProps } from "./core/types/report.config";
import { ReportFactoryService, ReportType } from "./factory/report-factory.service";

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private readonly assessmentRepository: AssessmentRepository,
    private readonly reportFactoryService: ReportFactoryService,
    private readonly messageService: MessageService,
  ) {}

  private async getAssessment(id: string): Promise<AssessmentDto> {
    this.logger.log(`Fetching assessment with id: ${id}`); // Log the action
    return this.assessmentRepository.findById(id);
  }

  private defineAssets(): ReportAssetProps {
    return {
      css: path.join(__dirname, 'assets', 'css'),
      logo: path.join(__dirname, 'assets', 'logos'),
      images: path.join(__dirname, 'assets', 'images'),
      templates: path.join(__dirname, 'assets', 'templates'),
      output: path.join(__dirname, 'assets', 'output'),
    };
  }

  private defineConfig(assessment: AssessmentDto, reportTemplate: string): ReportConfigProps {
    return {
      assessment,
      reportTemplate,
      assets: this.defineAssets(),
    };
  }

  private ensureDirectoriesExist(config: ReportConfigProps): void {
    const directories = [
      config.assets.css,
      config.assets.logo,
      config.assets.images,
      config.assets.templates,
      config.assets.output,
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        throw new Error(`Path [${dir}] does not exist. Make sure this path is correct and try again.`);
      }
    });
  }

  private getReportTemplate(type: ReportType): string {
    switch (type) {
      case ReportType.EPMini:
        return 'pfa-report-template.ejs';
      default:
        return undefined;
    }
  }

  async createReport(type: ReportType, id: string): Promise<string> {
    //  async createReportEPMini(id: string) {
    const assessment = await this.getAssessment(id);

    const reportTemplate = this.getReportTemplate(type);
    const config = await this.defineConfig(assessment, reportTemplate);

    this.ensureDirectoriesExist(config);
    
    const reportGenerator = this.reportFactoryService.getReportGenerator(type);
    await reportGenerator.generateReport(config);
    //await this.reportsPFAService.createReportPFA(config);

    await this.messageService.sendReport(id, assessment, path.join(config.assets.output, 'report.pdf'));
    return "Report created";
  }
}