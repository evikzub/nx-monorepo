import { Test, TestingModule } from '@nestjs/testing';

import { AssessmentDataProps } from '@microservices-app/shared/types';
import { assessmentTestData } from '../../../data/assessment-data-test';

import { ValuesProcessingService } from './processing.service';
import { ValuesScoreService } from './score.service';
import { DataValidationService } from './validation.service';

describe('ValuesProcessingService', () => {
  let service: ValuesProcessingService;

  const mockAssessment: AssessmentDataProps = {
    results: {
      motives: {
        values: {
          ...assessmentTestData.results.motives.values,
        },
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValuesProcessingService,
        ValuesScoreService,
        DataValidationService,
      ],
    }).compile();

    service = module.get<ValuesProcessingService>(ValuesProcessingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateValues', () => {
    it('should validate assessment data and process questions', () => {
      const values = service.calculateValues(mockAssessment) //, values, qaData);

      expect(values).toEqual(expect.any(Array)); // MAX_QUESTIONS
      expect(values.length).toBe(4);

      expect(values[0].categoryID).toBe(1);
      expect(values[1].categoryID).toBe(2);
      expect(values[2].categoryID).toBe(3);
      expect(values[3].categoryID).toBe(4);

      expect(values[0].name).toBe('Belonger');
      expect(values[1].name).toBe('Achiever');
      expect(values[2].name).toBe('Emulator');
      expect(values[3].name).toBe('Societal');

      expect(values[0].total).toBe(19);
      expect(values[1].total).toBe(98);
      expect(values[2].total).toBe(49);
      expect(values[3].total).toBe(34);
    });

    it('should throw an error ', () => {
      const assessmentData: AssessmentDataProps = {
        results: {},
      };

      expect(() =>
        service.calculateValues(assessmentData),
      ).toThrow('Values are not defined');
    });

    it('should throw an error if assessment has less than 20 questions', () => {
      const assessmentData: AssessmentDataProps = {
        results: {
          motives: {
            values: { 1: { answers: [] } },
          },
        },
      };

      expect(() =>
        service.calculateValues(assessmentData),
      ).toThrow('Values length is less than 20');
    });

    it('should throw an error if question not in the range of 1-20 ', () => {
      const assessmentData: AssessmentDataProps = {
        results: {
          motives: {
            values: {
              31: { answers: [] },
              2: { answers: [1, 2] },
              3: { answers: [] },
              4: { answers: [] },
              5: { answers: [] },
              6: { answers: [] },
              7: { answers: [] },
              8: { answers: [] },
              9: { answers: [] },
              10: { answers: [] },
              11: { answers: [] },
              12: { answers: [] },
              13: { answers: [] },
              14: { answers: [] },
              15: { answers: [] },
              16: { answers: [] },
              17: { answers: [] },
              18: { answers: [] },
              19: { answers: [] },
              20: { answers: [] },
            }
          },
        },
      };

      expect(() =>
        service.calculateValues(assessmentData),
      ).toThrow('No answers found for question ID: 1');
    });
  });
});
