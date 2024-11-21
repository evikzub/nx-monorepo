import { AssessmentDataProps } from "@microservices-app/shared/types";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DataValidationService {
  //private readonly logger = new Logger(DataValidationService.name);

  validateMotivesData(assessmentData: AssessmentDataProps): void {
    if (!assessmentData.results?.motives?.values) {
      //this.logger.error('Values are not defined');
      throw new Error('Values are not defined');
    }
    if (Object.keys(assessmentData?.results?.motives?.values).length < 20) {
      //this.logger.error('Values length is less than 20');
      throw new Error('Values length is less than 20');
    }
  }
}