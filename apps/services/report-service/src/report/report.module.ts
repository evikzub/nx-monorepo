import { Module } from "@nestjs/common";
import * as ejs from 'ejs';

import { DatabaseModule, ProviderModule } from "@microservices-app/shared/backend";

import { AssessmentRepository } from "../assessment/assessment.repository";
import { ReportsPFAService } from "./pfa/reports-pfa.serice";
import { ReportsPFAValuesService } from "./pfa/report-pfa-values.service";
import { ReportService } from "./report.service";
import { ReportController } from "./report.controller";
import { MessageService } from "../message/message.service";

@Module({
  imports: [DatabaseModule, ProviderModule],
  providers: [
    ReportService, 
    AssessmentRepository, 
    ReportsPFAService,
    ReportsPFAValuesService,
    MessageService,
    {
      provide: 'EJS',
      useValue: ejs,
    },
  ],
  controllers: [ReportController],
  exports: [ReportService],
})
export class ReportModule {}