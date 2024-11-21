import { Injectable } from '@nestjs/common';

import { AssessmentDataProps, HOVProps, TopProps, TotalsProps } from '@microservices-app/shared/types';
import { qaData } from "@microservices-app/shared/types";
import { Score } from '../types/score';
import { DataValidationService } from './validation.service';

@Injectable()
export class ValuesScoreService {
  private readonly HOV_START_INDEX = 13;
  private readonly HOV_END_INDEX = 18;

  //private readonly logger = new Logger(ValuesScoreService.name);

  constructor(private readonly validationService: DataValidationService) {}

  updateValuesScores(
    assessmentData: AssessmentDataProps,
    topCategories: Score[],
    scores: Score[]
  ) {
    this.validationService.validateMotivesData(assessmentData);

    assessmentData.results.motives.hov = this.getClientHOV(assessmentData);
    assessmentData.results.motives.totals = this.getAssessmentTotals(scores);
    assessmentData.results.motives.top = this.getAssessmentTop(topCategories);
  }

  private getClientHOV(
    assessmentData: AssessmentDataProps
  ): HOVProps[] {
    const clientValues = assessmentData.results.motives.values;
    const clientHOV = [];

    for (let i = this.HOV_START_INDEX; i <= this.HOV_END_INDEX; i++) {
      // Use constants
      const question = qaData.find((item) => item.id == i);
      if (!question) {
        throw new Error(`No question found for ${i}`);
      }
      const answer = question.answers.find(
        (item) => item.id == clientValues[i]?.answers[0], // Optional chaining
      );
      if (!answer) {
        throw new Error(`No answer found for ${i}`);
      }
      const howItem: HOVProps = {
        id: i,
        answer: answer.name,
        categoryId: answer.categoryId,
      };
      clientHOV.push(howItem);
    }
    return clientHOV;
  }

  private getAssessmentTotals(scores: Score[]): TotalsProps {
    return {
      1: scores[0].total,
      2: scores[1].total,
      3: scores[2].total,
      4: scores[3].total,
    };
  }

  private getAssessmentTop(topCategories: Score[]): TopProps {
    return {
      1: topCategories[0].categoryID,
      2: topCategories[1].categoryID,
    };
  }
}
