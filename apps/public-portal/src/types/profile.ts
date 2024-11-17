export type ProfileStep = 'personal' | 'preferences' | 'quiz';

export interface Profile {
  id: string;
  userId: string;
  status: 'PENDING' | 'COMPLETED';
  personalInfo: PersonalInfo;
  preferences: UserPreferences;
  quizResults: QuizResults;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  // Add other personal info fields as needed
}

export interface UserPreferences {
  // Add preference fields as needed
  interests: string[];
  goals: string[];
}

export interface QuizResults {
  // Add quiz result fields as needed
  answers: Record<string, string>;
  score?: number;
} 