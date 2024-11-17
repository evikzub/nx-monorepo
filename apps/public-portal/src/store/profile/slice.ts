import { create } from 'zustand';
import { Profile, ProfileStep } from '@/types/profile';

interface ProfileState {
  profile: Profile | null;
  currentStep: ProfileStep;
  setProfile: (profile: Profile) => void;
  setCurrentStep: (step: ProfileStep) => void;
  updateProfile: (updates: Partial<Profile>) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  currentStep: 'personal',
  setProfile: (profile) => set({ profile }),
  setCurrentStep: (step) => set({ currentStep: step }),
  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    })),
})); 