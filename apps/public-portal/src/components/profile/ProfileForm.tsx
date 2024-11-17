'use client';

import { useState } from 'react';
import { useProfileStore } from '@/store/profile/slice';
import { ProfileService } from '@/services/profile/service';
import { ProfileStep } from '@/types/profile';
import { PersonalInfoForm } from './PersonalInfoForm';
import { PreferencesForm } from './PreferencesForm';
import { QuizForm } from './QuizForm';

const steps: ProfileStep[] = ['personal', 'preferences', 'quiz'];

export function ProfileForm() {
  const { profile, currentStep, setCurrentStep, updateProfile } = useProfileStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedProfile = await ProfileService.updateProfile({
        ...profile,
        ...data,
      });
      
      updateProfile(updatedProfile);
      
      if (currentStep !== steps[steps.length - 1]) {
        const nextStep = steps[steps.indexOf(currentStep) + 1];
        setCurrentStep(nextStep);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded">
          {error}
        </div>
      )}
      
      {currentStep === 'personal' && (
        <PersonalInfoForm onSubmit={handleSubmit} isLoading={isLoading} />
      )}
      
      {currentStep === 'preferences' && (
        <PreferencesForm onSubmit={handleSubmit} isLoading={isLoading} />
      )}
      
      {currentStep === 'quiz' && (
        <QuizForm onSubmit={handleSubmit} isLoading={isLoading} />
      )}
    </div>
  );
} 