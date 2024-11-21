import { Test, TestingModule } from '@nestjs/testing';

import { AssessmentDataProps } from '@microservices-app/shared/types';
import { assessmentTestData } from '../../../data/assessment-data-test';

import { Score } from '../types/score';
import { ValuesScoreService } from './score.service';
import { DataValidationService } from './validation.service';

describe('ValuesScoreService', () => {
  let service: ValuesScoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValuesScoreService,
        DataValidationService,
      ],
    }).compile();

    service = module.get<ValuesScoreService>(ValuesScoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateValuesScores', () => {
    it('should update assessmentEntry with totals, top categories, and HOV', () => {
      const assessmentData: AssessmentDataProps = {
        results: {
          motives: {
            values: {
              ...assessmentTestData.results.motives.values,
            },
          },
        },
      };
      const topCategories: Score[] = [
        { categoryID: 1, name: 'cat1', total: 10 },
        { categoryID: 2, name: 'cat2', total: 20 },
      ];
      const scores: Score[] = [
        { categoryID: 1, name: 'cat1', total: 5 },
        { categoryID: 2, name: 'cat2', total: 15 },
        { categoryID: 3, name: 'cat3', total: 25 },
        { categoryID: 4, name: 'cat4', total: 35 },
      ];
      //const qaData: questionsProps[] = [];

      service.updateValuesScores(
        assessmentData,
        topCategories,
        scores,
      );

      expect(assessmentData.results.motives.totals).toEqual({
        1: 5,
        2: 15,
        3: 25,
        4: 35,
      });
      expect(assessmentData.results.motives.top).toEqual({
        1: 1,
        2: 2,
      });
      expect(assessmentData.results.motives.hov).toBeDefined();
      expect(assessmentData.results.motives.hov).toEqual([
        { id: 13, answer: 'Achievement', categoryId: 2 },
        { id: 14, answer: 'Respect', categoryId: 2 },
        { id: 15, answer: 'Success', categoryId: 3 },
        { id: 16, answer: 'Control', categoryId: 2 },
        { id: 17, answer: 'Growth', categoryId: 2 },
        { id: 18, answer: 'Results', categoryId: 2 },
      ]);
    });
  });

  describe('validate Data', () => {
    it('should throw an error if no values are defined', () => {
      const assessmentData: AssessmentDataProps = {
        results: {},
      };
      const topCategories: Score[] = [];
      const scores: Score[] = [];

      expect(() =>
        service.updateValuesScores(
          assessmentData,
          topCategories,
          scores,
        ),
      ).toThrow('Values are not defined');
    });

    it('should throw an error if values length is less than 20', () => {
      const assessmentData: AssessmentDataProps = {
        results: { motives: { values: {} } },
      };
      const topCategories: Score[] = [];
      const scores: Score[] = [];

      expect(() =>
        service.updateValuesScores(
          assessmentData,
          topCategories,
          scores,
        ),
      ).toThrow('Values length is less than 20');
    });
  });
});
