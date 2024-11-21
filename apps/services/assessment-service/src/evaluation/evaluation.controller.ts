import { Controller, Param, ParseUUIDPipe, Patch } from "@nestjs/common";
import { EvaluationService } from "./evaluation.service";

@Controller('evaluations')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Patch(':id/evaluate')
  async evaluateResults(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.evaluationService.evaluateResults(id);
  }
}
  