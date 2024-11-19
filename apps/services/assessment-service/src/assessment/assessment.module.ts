import { Module } from '@nestjs/common';
import { DatabaseModule } from '@microservices-app/shared/backend';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { AssessmentRepository } from './assessment.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [AssessmentController],
  providers: [AssessmentService, AssessmentRepository],
  exports: [AssessmentService],
})
export class AssessmentModule {}
