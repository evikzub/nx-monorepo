// 'use client'
// import { useState } from 'react'
// import { useRouter } from 'next/navigation'

'use client'

import { LoginForm } from '@entrepreneur/shared/ui'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/services/auth/service'
import { useAuthStore } from '@/store/auth/slice'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const handleLogin = async (email: string, password: string) => {
    const { user, token } = await AuthService.login(email, password)
    setAuth(user, token)
    router.push('/profile')
  }

  const handleForgotPassword = () => {
    router.push('/forgot-password')
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <LoginForm
        onSubmit={handleLogin}
        onForgotPassword={handleForgotPassword}
      />
    </main>
  )
}
