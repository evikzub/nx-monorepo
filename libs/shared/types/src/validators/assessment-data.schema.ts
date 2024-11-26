import { z } from 'zod';

export type HOVProps = z.infer<typeof HOVSchema>;
export const HOVSchema = z.object({
  id: z.number(),
  answer: z.string(),
  categoryId: z.number(),
});

// Answers
export type AnswersProps = z.infer<typeof AnswersSchema>;
export const AnswersSchema = z.object({
  answers: z.array(z.number()).min(4).max(4), // Ensures exactly 4 numbers
});

// Values
export type ValuesProps = z.infer<typeof ValuesSchema>;
export const ValuesSchema = z.record(z.string(), AnswersSchema).refine(
  (val) => {
    // Check if all keys are in the range 1 to 20
    const keys = Object.keys(val).map(Number); // Convert keys to numbers
    return keys.every(
      (key) => (key >= 1 && key <= 20) || [205, 209, 210].includes(key),
    );
  },
  {
    message: 'All keys must be within the range of 1 to 20 or 205, 209, 210.',
  },
);

// Totals
export type TotalsProps = z.infer<typeof TotalsSchema>;
export const TotalsSchema = z.record(z.string(), z.number()).refine(
  (val) => {
    // Check if all keys are in the range 1 to 4
    const keys = Object.keys(val).map(Number); // Convert keys to numbers
    return keys.every((key) => key >= 1 && key <= 4);
  },
  {
    message: 'All keys must be within the range of 1 to 4.',
  },
);

// Top
export type TopProps = z.infer<typeof TopSchema>;
export const TopSchema = z.record(z.string(), z.number()).refine(
  (val) => {
    // Check if all keys are in the range 1 to 4
    const keys = Object.keys(val).map(Number); // Convert keys to numbers
    return keys.every((key) => [1, 2].includes(key));
  },
  {
    message: 'All keys must be 1 or 2.',
  },
);

// Assessment Values
export type AssessmentValuesProps = z.infer<typeof AssessmentValuesSchema>;
export const AssessmentValuesSchema = z.object({
  values: ValuesSchema.optional(),
  totals: TotalsSchema.optional(), //z.record(z.string(), z.number()).optional(),
  top: TopSchema.optional(),
  hov: HOVSchema.array().optional(),
});

// Assessment Set
export type AssessmentSetProps = z.infer<typeof AssessmentSetSchema>;
export const AssessmentSetSchema = z.object({
  motives: AssessmentValuesSchema,
  //workStyle: z.string(),
});

// Profile
export type ProfileProps = z.infer<typeof ProfileSchema>;
export const ProfileSchema = z.object({
  gender: z.enum(['male', 'female']).optional(),
  dateOfBirth: z.string().date().optional().refine((date) => {
    return !date || (date && new Date(date) <= new Date())
  }, {
    message: "Date of birth must be in the past",
  }),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string()
    .regex(/^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/, {
      message: "Invalid phone number",
    }).optional(),
});

//export const profileFields = Object.keys(ProfileSchema.shape) as Array<keyof ProfileProps>;

const progressValues = ['personal_info', 'motives'] as const;
export const ProgressSchema = z.enum(progressValues).default(progressValues[0]);

// Assessment Data
export type AssessmentDataProps = z.infer<typeof AssessmentDataSchema>;
export const AssessmentDataSchema = z.object({
  progress: ProgressSchema.optional(),
  profile: ProfileSchema.optional(),
  results: AssessmentSetSchema.optional(),
});
