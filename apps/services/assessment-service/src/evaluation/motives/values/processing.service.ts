import { Injectable } from '@nestjs/common';

import { AssessmentDataProps, QuestionsProps } from '@microservices-app/shared/types';
import { qaData } from '@microservices-app/shared/types';
import { Score } from '../types/score';
import { DataValidationService } from './validation.service';

@Injectable()
export class ValuesProcessingService {
  private readonly MAX_QUESTIONS = 20;
  private readonly SCORING_VALUES = [6, 3, 1, 0];

  private readonly VALUES_NAMES = [
    'Belonger',
    'Achiever',
    'Emulator',
    'Societal',
  ];

  private readonly VALUES_CATEGORY_IDS = [1, 2, 3, 4];
  
  //private readonly logger = new Logger(ValuesProcessingService.name);

  constructor(private readonly validationService: DataValidationService) {}

  public calculateValues(
    assessmentData: AssessmentDataProps,
    //qaData: QuestionsProps[]
  ): Score[] {
    // validate assessment data
    this.validationService.validateMotivesData(assessmentData);

    // initialize values
    const values = this.initializeValues();

    for (let i = 1; i <= this.MAX_QUESTIONS; i++) {
      this.processQuestion(i, assessmentData, values, qaData);
    }

    return values;
  }

  private initializeValues(): Score[] {
    return this.VALUES_CATEGORY_IDS.map((categoryId, index) => ({
      categoryID: categoryId,
      name: this.VALUES_NAMES[index],
      total: 0,
    }));
  }

  private processQuestion(
    questionId: number,
    assessmentData: AssessmentDataProps,
    values: Score[],
    qaData: QuestionsProps[],
  ): void {
    const answerOrder =
      assessmentData.results.motives.values[questionId]?.answers; // Optional chaining
    if (!answerOrder) {
      throw new Error(`No answers found for question ID: ${questionId}`);
    }

    const question = qaData.find((item) => item.id === questionId);

    if (!question) {
      throw new Error(`No question found for ID: ${questionId}`);
    }

    this.updateScores(answerOrder, question, values);
  }

  private updateScores(
    answerOrder: number[] | undefined,
    question: QuestionsProps,
    values: Score[],
  ): void {
    answerOrder?.forEach((answerId: number, index: number) => {
      const answer = question.answers.find((item) => item.id === answerId);
      if (answer) {
        const categoryIndex = values.findIndex(
          (v) => v.categoryID === answer.categoryId,
        );
        if (categoryIndex !== -1) {
          values[categoryIndex].total += this.SCORING_VALUES[index];
        }
      }
    });
  }
}
