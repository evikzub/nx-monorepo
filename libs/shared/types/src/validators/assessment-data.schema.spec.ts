import { z } from 'zod';

import {
  AssessmentDataProps,
  AssessmentDataSchema,
  AssessmentValuesSchema,
  ValuesProps,
} from './assessment-data.schema';

describe('AssessmentResultsSchema', () => {
  describe('AssessmentValuesSchema', () => {
    it('should validate a valid values object', () => {
      const validValues: ValuesProps = {
        '1': { answers: [1, 2, 3, 4] },
        '10': { answers: [4, 3, 2, 1] },
        '205': { answers: [2, 2, 2, 2] },
      };
      expect(() =>
        AssessmentValuesSchema.parse({ values: validValues }),
      ).not.toThrow();
    });

    it('should reject values with invalid keys', () => {
      const invalidValues: ValuesProps = {
        '0': { answers: [1, 2, 3, 4] },
        '21': { answers: [1, 2, 3, 4] },
        abc: { answers: [1, 2, 3, 4] },
      };
      expect(() =>
        AssessmentValuesSchema.parse({ values: invalidValues }),
      ).toThrow(z.ZodError);
    });

    it('should reject values with invalid answer arrays', () => {
      const invalidValues = {
        '1': { answers: [1, 2, 3] },
        '2': { answers: [1, 2, 3, 4, 5] },
        '3': { answers: ['a', 'b', 'c', 'd'] },
      };
      expect(() =>
        AssessmentValuesSchema.parse({ values: invalidValues }),
      ).toThrow(z.ZodError);
    });

    it('should allow valid keys 205, 209, and 210', () => {
      const validValues: ValuesProps = {
        '205': { answers: [1, 2, 3, 4] },
        '209': { answers: [4, 3, 2, 1] },
        '210': { answers: [2, 2, 2, 2] },
      };
      expect(() =>
        AssessmentValuesSchema.parse({ values: validValues }),
      ).not.toThrow();
    });
  });

  describe('AssessmentResultsSchema', () => {
    it('should validate a complete valid results object', () => {
      const validResults: AssessmentDataProps = {
        results: {
          motives: {
            values: {
              '1': { answers: [1, 2, 3, 4] },
              '2': { answers: [4, 3, 2, 1] },
            },
            totals: { 1: 10, 2: 20 },
            top: { 1: 2, 2: 1 },
            hov: [
              { id: 1, answer: 'Value1', categoryId: 1 },
              { id: 2, answer: 'Value2', categoryId: 2 },
            ],
          },
        },
      };
      expect(() => AssessmentDataSchema.parse(validResults)).not.toThrow();
    });

    it('should validate results with only required fields', () => {
      const minimalResults: AssessmentDataProps = {
        results: {
          motives: {
            values: { '1': { answers: [1, 2, 3, 4] } },
          },
        },
      };
      expect(() => AssessmentDataSchema.parse(minimalResults)).not.toThrow();
    });

    it('should reject results with invalid values', () => {
      const invalidResults: AssessmentDataProps = {
        results: {
          motives: {
            values: { '0': { answers: [1, 2, 3, 4] } },
          },
        },
      };
      expect(() => AssessmentDataSchema.parse(invalidResults)).toThrow(
        z.ZodError,
      );
    });

    it('should validate results with optional totals', () => {
      const resultsWithTotals: AssessmentDataProps = {
        results: {
          motives: {
            values: { 1: { answers: [1, 2, 3, 4] } },
            totals: { 1: 10, 2: 20 },
          },
        },
      };
      expect(() =>
        AssessmentDataSchema.parse(resultsWithTotals),
      ).not.toThrow();
    });

    it('should validate results with optional top', () => {
      const resultsWithTop: AssessmentDataProps = {
        results: {
          motives: {
            values: { 1: { answers: [1, 2, 3, 4] } },
            top: { 1: 1, 2: 2 },
          },
        },
      };
      expect(() => AssessmentDataSchema.parse(resultsWithTop)).not.toThrow();
    });

    it('should validate results with optional hov', () => {
      const resultsWithHov: AssessmentDataProps = {
        results: {
          motives: {
            values: { '1': { answers: [1, 2, 3, 4] } },
            hov: [
              { id: 1, answer: 'Value1', categoryId: 1 },
              { id: 2, answer: 'Value2', categoryId: 2 },
            ],
          },
        },
      };
      expect(() => AssessmentDataSchema.parse(resultsWithHov)).not.toThrow();
    });

    it('should reject results with invalid totals', () => {
      const resultsWithInvalidTotals = {
        results: {
          motives: {
            values: { '1': { answers: [1, 2, 3, 4] } },
            totals: { total1: 'invalid' },
          },
        },
      };
      expect(() =>
        AssessmentDataSchema.parse(resultsWithInvalidTotals),
      ).toThrow(z.ZodError);
    });

    it('should reject results with invalid top', () => {
      const resultsWithInvalidTop = {
        results: {
          motives: {
            values: { '1': { answers: [1, 2, 3, 4] } },
            top: { top1: 123 },
          },
        },
      };
      expect(() =>
        AssessmentDataSchema.parse(resultsWithInvalidTop),
      ).toThrow(z.ZodError);
    });

    it('should reject results with invalid hov', () => {
      const resultsWithInvalidHov = {
        results: {
          motives: {
            values: { '1': { answers: [1, 2, 3, 4] } },
            hov: [123, 456],
          },
        },
      };
      expect(() =>
        AssessmentDataSchema.parse(resultsWithInvalidHov),
      ).toThrow(z.ZodError);
    });
  });
});
