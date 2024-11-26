import { Module } from '@nestjs/common';
import {
  DatabaseModule,
  ProviderModule,
} from '@microservices-app/shared/backend';

import { AssessmentRepository } from '../assessment/assessment.repository';
import { MessageService } from '../message/message.service';

import { ReportFactoryModule } from './factory/report-factory.module';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [DatabaseModule, ProviderModule, ReportFactoryModule],
  providers: [ReportService, AssessmentRepository, MessageService],
  controllers: [ReportController],
  exports: [ReportService],
})
export class ReportModule {}
