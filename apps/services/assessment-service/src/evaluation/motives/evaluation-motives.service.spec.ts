import { LanguageCode } from '@microservices-app/shared/types';
import { Test, TestingModule } from '@nestjs/testing';
import { assessmentTestData } from '../../data/assessment-data-test';

import { EvaluationMotivesService } from './evaluation-motives.service';
import { AssessmentResponseDto } from '@microservices-app/shared/types';
import { ValuesProcessingService } from './values/processing.service';
import { ValuesScoreService } from './values/score.service';
import { DataValidationService } from './values/validation.service';

describe('ProcessResultsValues', () => {
  let service: EvaluationMotivesService;

  const assessmentId = 'f06b2f54-a4e2-44db-a701-28966774eeed'; // 'some-uuid';  
  const mockAssessment: AssessmentResponseDto = {
    id: assessmentId,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    languageCode: LanguageCode.EN,
    data: {
      results: {
        motives: {
          values: {
            ...assessmentTestData.results.motives.values,
          },
        },
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationMotivesService,
        ValuesProcessingService,
        ValuesScoreService,
        DataValidationService,
      ],
    }).compile();

    service = module.get<EvaluationMotivesService>(EvaluationMotivesService);
  });

  // 1. Initialization Tests
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 2. processResultsValues Method Tests
  describe('processResultsValues', () => {
    it('should process results values correctly', () => {
      const mockUpdatedAssessmentData: AssessmentResponseDto = {
        ...mockAssessment,
        data: {
          results: {
            motives: {
              values: {
                ...assessmentTestData.results.motives.values,
              },
              totals: { '1': 19, '2': 98, '3': 49, '4': 34 },
              top: { '1': 2, '2': 3 },
              hov: [
                { id: 13, answer: 'Achievement', categoryId: 2 },
                { id: 14, answer: 'Respect', categoryId: 2 },
                { id: 15, answer: 'Success', categoryId: 3 },
                { id: 16, answer: 'Control', categoryId: 2 },
                { id: 17, answer: 'Growth', categoryId: 2 },
                { id: 18, answer: 'Results', categoryId: 2 },
              ],
            },
          },
        },
      };

      service.processMotievsResults(mockAssessment);

      expect(mockAssessment).toEqual(mockUpdatedAssessmentData);
    });

    it('should throw an error if AssessmentData is not defined', () => {
      const assessmentData = { ...mockAssessment, data: {} };

      expect(() => service.processMotievsResults(assessmentData)).toThrow(
        'Values are not defined',
      );
    });
  });

  // sortValues Method Tests
  describe('sortValues', () => {
    it('should return sorted values in descending order', () => {
      const values = [
        { categoryID: 1, name: 'Belonger', total: 2 },
        { categoryID: 2, name: 'Achiever', total: 5 },
        { categoryID: 3, name: 'Emulator', total: 3 },
        { categoryID: 4, name: 'Societal', total: 1 },
      ];
      const sortedValues = service.sortValues(values);
      expect(sortedValues).toEqual([
        { categoryID: 2, name: 'Achiever', total: 5 },
        { categoryID: 3, name: 'Emulator', total: 3 },
        { categoryID: 1, name: 'Belonger', total: 2 },
        { categoryID: 4, name: 'Societal', total: 1 },
      ]);
    });
  });
});
