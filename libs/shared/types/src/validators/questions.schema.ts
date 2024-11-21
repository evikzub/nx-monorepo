import { z as zod } from "zod";

export type AnswerItemProps = zod.infer<typeof answerItemSchema>;

export const answerItemSchema = zod.object({
  id: zod.number(),
  name: zod.string(),
  categoryId: zod.number(),
});

export type QuestionsProps = zod.infer<typeof questionsSchema>;

export const questionsSchema = zod.object({
  id: zod.number(),
  title: zod.string(),
  group: zod.number(),
  answers: zod.array(answerItemSchema),
});

export type QATableProps = zod.infer<typeof qaTableSchema>;

export const qaTableSchema = zod.object({
  QuestionID: zod.string(),
  CategoryID: zod.string(),
  CategoryID2: zod.string(),
  AnswerID: zod.string(),
  LanguageCode: zod.string(),
});

