'use client'

import { RegistrationForm } from '@entrepreneur/shared/ui'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/services/auth/service'
import { RegisterDto } from '@entrepreneur/shared/types'

export default function RegisterPage() {
  const router = useRouter()

  const handleRegister = async (data: RegisterDto) => {
    await AuthService.register(data)
    // Redirect to profile form
    router.push('/profile')
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <RegistrationForm onSubmit={handleRegister} />
    </main>
  )
} 