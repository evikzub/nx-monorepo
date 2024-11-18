export type QuestionType = 'single' | 'multiple';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  text: string;
  options: QuizOption[];
}

export interface QuizData {
  questions: QuizQuestion[];
}

export interface QuizAnswers {
  [questionId: string]: string | string[]; // single answer is string, multiple is string[]
}

export interface QuizFormData {
  answers: QuizAnswers;
} 