import { Module } from '@nestjs/common';
import { AssessmentModule } from './assessment/assessment.module';
import { AppConfigModule, ConsulService } from '@microservices-app/shared/backend';

@Module({
  imports: [AppConfigModule.forRoot(), AssessmentModule],
  providers: [ConsulService],
})
export class AppModule {}
