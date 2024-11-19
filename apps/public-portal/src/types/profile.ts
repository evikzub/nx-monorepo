export type ProfileStep = 'personal' | 'motives'; // | 'quiz';

// export interface Profile {
//   id: string;
//   userId: string;
//   status: 'PENDING' | 'COMPLETED';
//   personalInfo: PersonalInfo;
//   preferences: UserPreferences;
//   quizResults: QuizResults;
//   createdAt: string;
//   updatedAt: string;
// }
export type ProfileData = PersonalInfoData & PreferencesData & {
  quizAnswers?: QuizData['answers'];
};

export interface PersonalInfoData {
  //firstName: string;
  //lastName: string;
  //dateOfBirth: string;
  phoneNumber: string;
  company?: string;
  position?: string;
  // Add other personal info fields as needed
}

export interface PreferencesData {
  // Add preference fields as needed
  interests: string[];
  goals: string[];
}

export interface QuizData {
  // Add quiz result fields as needed
  //answers: Record<string, string>;
  //score?: number;
  answers: {
    [key: string]: string;
  };
} 