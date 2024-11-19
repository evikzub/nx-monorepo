import { z } from "zod";
import { baseUserSchema } from "./common.schema";
import { AssessmentDataSchema } from "./assessment-data.schema";
import { Assessment as dbAssessment } from "../database/schema";

export enum LanguageCode {
  EN = 'en',
  ES = 'es',
  DE = 'de'
}

export enum AssessmentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed'
}

export const assessmentSchema = baseUserSchema.extend({
  data: AssessmentDataSchema.optional(),
  languageCode: z.nativeEnum(LanguageCode).default(LanguageCode.EN),
  status: z.nativeEnum(AssessmentStatus).default(AssessmentStatus.PENDING),
});

export const assessmentResponseSchema = assessmentSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export function parseAssessmentData(data: dbAssessment): AssessmentDto {
  return assessmentSchema.parse(data);
}

export type AssessmentRegisterDto = z.infer<typeof baseUserSchema>;
export type AssessmentDto = z.infer<typeof assessmentSchema>;
export type AssessmentResponseDto = z.infer<typeof assessmentResponseSchema>;

export const registerAssessmentSchema = assessmentSchema.partial();