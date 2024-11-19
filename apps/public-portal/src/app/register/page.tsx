'use client'

import { RegistrationForm } from '@entrepreneur/shared/ui'
import { useRouter } from 'next/navigation'
import { AssessmentRegisterDto } from '@entrepreneur/shared/types'
import { AssessmentService } from '@/services/assessment/service'
import { useAssessmentStore } from '@/store/assessment/slice'

export default function RegisterPage() {
  const router = useRouter()
  const { setAssessment } = useAssessmentStore()

  const handleRegister = async (data: AssessmentRegisterDto) => {
    const assessment = await AssessmentService.register(data)
    //console.log("assessment: ", assessment)
    if (assessment) {
      setAssessment(assessment, 'assessment.token')
      // Redirect to profile form
      router.push('/profile')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <RegistrationForm onSubmit={{ type: 'function', value: handleRegister }} />
    </main>
  )
} 