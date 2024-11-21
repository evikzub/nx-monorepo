import { AssessmentResponseDto } from "@microservices-app/shared/types";
import { Injectable, Logger } from "@nestjs/common";
import { Score } from "./types/score";
import { ValuesProcessingService } from "./values/processing.service";
import { ValuesScoreService } from "./values/score.service";

@Injectable()
export class EvaluationMotivesService {
  private readonly logger = new Logger(EvaluationMotivesService.name);
  //private readonly quizData: QuestionsProps[] = Data;

  constructor(
    private readonly valuesProcessingService: ValuesProcessingService,
    private readonly valuesScoreService: ValuesScoreService
  ) {}

  processMotievsResults(assessmentEntry: AssessmentResponseDto) {
    try {
      this.logger.log(`Process motives results for assessment ${assessmentEntry.id}`)

      // Initialize the values with the category IDs and names  
      const values = this.valuesProcessingService.calculateValues(assessmentEntry.data);

      // sort values
      const sortedValues = this.sortValues(values);
      this.logger.log(`values after sorting: ${JSON.stringify(sortedValues)}`);

      // Update the values scores
      this.valuesScoreService.updateValuesScores(assessmentEntry.data, sortedValues, values);
    } catch (error) {
      this.logger.error(`Error processing motives for assessment ${assessmentEntry.id}: ${error}`);
      throw error;
    }
  }

  public sortValues(values: Score[]): Score[] {
    // copy and sort
    return values.slice().sort((a, b) => b.total - a.total);
  }
}
