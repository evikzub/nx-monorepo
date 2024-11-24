import { Module } from '@nestjs/common';
import { AssessmentModule } from './assessment/assessment.module';
import { AppConfigModule } from '@microservices-app/shared/backend';
import { EvaluationModule } from './evaluation/evaluation.module';

@Module({
  imports: [AppConfigModule.forRoot(), AssessmentModule, EvaluationModule],
  //providers: [ConsulService],
})
export class AppModule {}
