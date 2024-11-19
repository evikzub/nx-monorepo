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
