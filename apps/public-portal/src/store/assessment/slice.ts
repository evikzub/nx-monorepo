import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AssessmentResponseDto } from '@entrepreneur/shared/types';

interface AssessmentState {
  assessment: AssessmentResponseDto | null;
  token: string | null;
  isAuthenticated: boolean;
  setAssessment: (assessment: AssessmentResponseDto, token: string) => void;
  logout: () => void;
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set) => ({
      assessment: null,
      token: null,
      isAuthenticated: false,
      setAssessment: (assessment, token) =>
        set({ assessment, token, isAuthenticated: true }),
      logout: () =>
        set({ assessment: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'assessment-storage',
    }
  )
); 