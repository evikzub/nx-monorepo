'use client';

import { useState } from 'react';
import { ProfileStep } from '@/types/profile';
//import { OtpVerificationForm } from '../auth/otp-verification-form';
import { PersonalInfoForm } from './personal-info-form';
import { MotivesForm } from './motives-form';
import { ProfileProps } from '@entrepreneur/shared/types';
import { ValuesProps } from '@entrepreneur/shared/types';

const steps: ProfileStep[] = ['personal', 'motives'];

interface ProfileFormProps {
  //email: string;
  onStepComplete: {
    type: 'function',
    value: (step: ProfileStep, data: ProfileProps | ValuesProps) => Promise<void>
  }
  initialStep?: ProfileStep;
}

export function ProfileForm({ onStepComplete: { value: onStepComplete }, initialStep = 'personal' }: ProfileFormProps) {
  const [currentStep, setCurrentStep] = useState<ProfileStep>(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ProfileProps | ValuesProps) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await onStepComplete(currentStep, data);
      
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

  // const handleResendOtp = async (email: string) => {
  //   try {
  //     setIsLoading(true);
  //     setError(null);
  //     //await onStepComplete('otp', { email, resend: true });
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to resend code');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded">
          {error}
        </div>
      )}
      
      {/* {currentStep === 'otp' && (
        <OtpVerificationForm 
          email='email'
          onVerify={handleSubmit}
          onResend={handleResendOtp}
          isLoading={isLoading}
        />
      )} */}
      
      {currentStep === 'personal' && (
        // <PersonalInfoForm onSubmit={handleSubmit} isLoading={isLoading} />
        <PersonalInfoForm   
          onSubmit={{
            type: 'function',
            value: handleSubmit
          }} 
          isLoading={isLoading} 
        />
      )}
      
      {/* {currentStep === 'preferences' && (
        <PreferencesForm onSubmit={handleSubmit} isLoading={isLoading} />
      )} */}
      
      {currentStep === 'motives' && (
        <MotivesForm onSubmit={handleSubmit} isLoading={isLoading} />
      )}
    </div>
  );
} 