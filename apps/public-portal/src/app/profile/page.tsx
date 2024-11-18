'use client'

import { ProfileForm } from '@/components/profile/profile-form'
import { ProfileService } from '@/services/profile/service'
import { ProfileStep } from '@/types/profile'
import { useRouter } from 'next/navigation'

export default function ProfileSetupPage() {
  const router = useRouter()

  const handleProfileSetup = async (step: ProfileStep, data: any) => { // We'll type this properly later
    //try {
      // Handle profile setup
      //await ProfileService.updateProfile(data)
      // await ProfileService.setup(data)
      if (step === 'quiz') {
        router.push('/profile/success')
      }
    // } catch (error) {
    //   throw error
    // }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <ProfileForm onStepComplete={handleProfileSetup} initialStep="personal" />
    </main>
  )
} 