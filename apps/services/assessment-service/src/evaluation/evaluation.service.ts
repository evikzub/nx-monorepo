import { Injectable, Logger } from "@nestjs/common";

import { AssessmentService } from "../assessment/assessment.service";
import { EvaluationMotivesService } from "./motives/evaluation-motives.service";

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);

  constructor(
    private readonly assessmentService: AssessmentService,
    private readonly evaluationMotivesService: EvaluationMotivesService,
  ) {}

  async evaluateResults(id: string) {
    const assessment = await this.assessmentService.findAssessment(id);
    //this.logger.log(`Evaluating assessment ${assessment.id}`);

    this.evaluationMotivesService.processMotievsResults(assessment);

    return await this.assessmentService.update(id, assessment)
  }
} 