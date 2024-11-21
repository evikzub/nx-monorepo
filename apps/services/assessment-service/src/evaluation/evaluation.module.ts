import { Module } from "@nestjs/common";
import { EvaluationService } from "./evaluation.service";
import { EvaluationController } from "./evaluation.controller";
import { AssessmentModule } from "../assessment/assessment.module";
import { EvaluationMotivesService } from "./motives/evaluation-motives.service";
import { ValuesProcessingService } from "./motives/values/processing.service";
import { ValuesScoreService } from "./motives/values/score.service";
import { DataValidationService } from "./motives/values/validation.service";

@Module({
  imports: [AssessmentModule],
  controllers: [EvaluationController],
  providers: [
    EvaluationService,
    EvaluationMotivesService,
    ValuesProcessingService,
    ValuesScoreService,
    DataValidationService,
  ],
})
export class EvaluationModule {}
