'use client'

import { RegistrationForm } from '@entrepreneur/shared/ui'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/services/auth/service'

export default function RegisterPage() {
  const router = useRouter()

  const handleRegister = async (data: {
    firstName: string
    lastName: string
    email: string
  }) => {
    try {
      await AuthService.register(data)
      // Redirect to success page or login
      router.push('/register/success')
    } catch (error) {
      // Error handling is done in the form component
      throw error
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <RegistrationForm onSubmit={handleRegister} />
    </main>
  )
} 