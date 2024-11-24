import fs from "fs";
import path from "path";

import { Injectable, Logger } from "@nestjs/common";

import { AssessmentDto } from "@microservices-app/shared/types";

import { AssessmentRepository } from "../assessment/assessment.repository";
import { ConfigProps } from "./types/config.schema";
import { ReportsPFAService } from "./pfa/reports-pfa.serice";
import { MessageService } from "../message/message.service";

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private readonly assessmentRepository: AssessmentRepository,
    private readonly reportsPFAService: ReportsPFAService,
    private readonly messageService: MessageService,
  ) {}

  async getAssessment(id: string): Promise<AssessmentDto> {
    this.logger.log(`Fetching assessment with id: ${id}`); // Log the action
    return this.assessmentRepository.findById(id);
  }

  async defineConfig(assessment: AssessmentDto): Promise<ConfigProps> {
    const config: ConfigProps = {
      assessment,
      //rptLogoPath: path.join(__dirname, '..', '..', 'src', 'assets', 'logos'),
      rptCSSPath: path.join(__dirname, 'assets', 'css'),
      rptLogoPath: path.join(__dirname, 'assets', 'logos'),
      rptImagePath: path.join(__dirname, 'assets', 'images'),
      rptJsonPath: path.join(__dirname, 'assets', 'context'),
      rptTemplatePath: path.join(__dirname, 'assets', 'templates'),
      rptOutputPath: path.join(__dirname, 'assets', 'output'),
    };

    // if (!fs.existsSync(config.rptCSSPath)) {
    //   throw new Error(`Output path ${config.rptOutputPath} does not exist`);
    // }
    // if (!fs.existsSync(config.rptLogoPath)) {
    //   throw new Error(`Output path ${config.rptOutputPath} does not exist`);
    // }

    return config;
  }

  async createReportEPMini(id: string) {
    const assessment = await this.getAssessment(id);
    const config = await this.defineConfig(assessment);
    await this.reportsPFAService.createReportPFA(config);

    await this.messageService.sendReport(id, assessment, path.join(config.rptOutputPath, 'report.pdf'));
    return "Report created";
  }
}