import { Module } from "@nestjs/common";
import * as ejs from 'ejs';

import { DatabaseModule } from "@microservices-app/shared/backend";

import { AssessmentRepository } from "../assessment/assessment.repository";
import { ReportsPFAService } from "./pfa/reports-pfa.serice";
import { ReportsPFAValuesService } from "./pfa/report-pfa-values.service";
import { ReportService } from "./report.service";
import { ReportController } from "./report.controller";

@Module({
  imports: [DatabaseModule],
  providers: [
    ReportService, 
    AssessmentRepository, 
    ReportsPFAService,
    ReportsPFAValuesService,
    {
      provide: 'EJS',
      useValue: ejs,
    },
  ],
  controllers: [ReportController],
  exports: [ReportService],
})
export class ReportModule {}