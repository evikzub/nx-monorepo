import { assessmentResponseSchema } from '@microservices-app/shared/types';
import { z } from 'zod';

export type ConfigProps = z.infer<typeof ConfigSchema>;
export const ConfigSchema = z.object({
  assessment: assessmentResponseSchema,
  rptCSSPath: z.string(),
  rptLogoPath: z.string(),
  rptImagePath: z.string(),
  rptJsonPath: z.string(),
  rptTemplatePath: z.string(),
  rptOutputPath: z.string(),
});
