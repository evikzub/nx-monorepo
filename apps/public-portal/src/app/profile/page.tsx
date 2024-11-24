'use client'

import { ProfileForm } from '@/components/profile/profile-form'
import { AssessmentService } from '@/services/assessment/service'
import { ReportService } from '@/services/report/service'
import { useAssessmentStore } from '@/store/assessment/slice'
import { ProfileStep } from '@/types/profile'
import { ProfileProps, ValuesProps } from '@entrepreneur/shared/types'
import { useRouter } from 'next/navigation'

export default function ProfileSetupPage() {
  const router = useRouter()
  const { assessment, token, setAssessment } = useAssessmentStore()

  const handleProfileSetup = async (step: ProfileStep, data: ProfileProps | ValuesProps): Promise<void> => { // We'll type this properly later
    if (step === 'personal') {
      //console.log("personal data: ", data)
      const updatedAssessment = await AssessmentService.updateProfile(assessment?.id || '', data as ProfileProps)
      setAssessment(updatedAssessment, token || '')
    }
    if (step === 'motives') {
      if (!assessment || !assessment?.id) {
        throw new Error('Assessment is not defined')
      }

      // Update motives
      await AssessmentService.updateMotives(assessment.id, data as ValuesProps)
      
      // Create report
      await ReportService.createReportEPMini(assessment.id)

      // Redirect to success page
      router.push('/profile/success')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      {/* <ProfileForm onStepComplete={handleProfileSetup} initialStep="personal" /> */}
      <ProfileForm onStepComplete={{
        type: 'function', 
        value: async (step, data) => {
          handleProfileSetup(step, data)
        }
      }} initialStep="personal" />
    </main>
  )
} 