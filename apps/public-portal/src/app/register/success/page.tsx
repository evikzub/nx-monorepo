import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@entrepreneur/shared/ui'
import Link from 'next/link'

export default function RegisterSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Registration Successful!</CardTitle>
          <CardDescription>
            Your account has been created successfully.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center">
            <Link 
              href="/login"
              className="text-primary hover:underline"
            >
              Click here to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
} 