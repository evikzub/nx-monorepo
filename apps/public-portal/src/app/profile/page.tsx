'use client'

import { ProfileForm } from '@/components/profile/profile-form'
import { AssessmentService } from '@/services/assessment/service'
import { useAssessmentStore } from '@/store/assessment/slice'
import { ProfileStep } from '@/types/profile'
import { ProfileProps } from '@entrepreneur/shared/types'
import { useRouter } from 'next/navigation'

export default function ProfileSetupPage() {
  const router = useRouter()
  const { assessment, token, setAssessment } = useAssessmentStore()

  const handleProfileSetup = async (step: ProfileStep, data: any) => { // We'll type this properly later
    if (step === 'personal') {
      //console.log("personal data: ", data)
      const updatedAssessment = await AssessmentService.updateProfile(assessment?.id || '', data as ProfileProps)
      setAssessment(updatedAssessment, token || '')
    }
    if (step === 'quiz') {
      router.push('/profile/success')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <ProfileForm onStepComplete={handleProfileSetup} initialStep="personal" />
    </main>
  )
} 