import { Module } from '@nestjs/common';
import { AssessmentModule } from './assessment/assessment.module';
import {
  AppConfigModule,
  AppConfigService,
  LoggerModule,
} from '@microservices-app/shared/backend';
import { EvaluationModule } from './evaluation/evaluation.module';

@Module({
  imports: [
    AppConfigModule.forRoot(),
    // LoggerModule.forRoot('assessment-service'),
    LoggerModule.forRootAsync({
      useFactory: (configService: AppConfigService) => 
        configService.envConfig.assessmentService.name,
    }),
    AssessmentModule,
    EvaluationModule,
  ],
  //providers: [ConsulService],
})
export class AppModule {}
