'use client'

import { useAssessmentStore } from '@/store/assessment/slice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@entrepreneur/shared/ui'
import { BarChartIcon, MessageSquareIcon, SearchIcon, UserIcon, LightbulbIcon, DollarSignIcon } from 'lucide-react'

export default function RegisterSuccessPage() {
  const { assessment } = useAssessmentStore();

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Card className="mx-auto max-w-6xl">
        <CardHeader>
          <CardTitle className="mb-2 text-4xl font-bold">FINISHED!</CardTitle>
          <CardDescription className="text-2xl text-gray-600">
            Congratulations,
            <br />
            you have completed your
            <br />
            Entrepreneur Profile!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-3 gap-4 md:mb-0">
            <UserIcon className="h-12 w-12 text-blue-900" />
            <BarChartIcon className="h-12 w-12 text-blue-900" />
            <MessageSquareIcon className="h-12 w-12 text-blue-900" />
            <SearchIcon className="h-12 w-12 text-blue-900" />
            <LightbulbIcon className="h-12 w-12 text-blue-900" />
            <DollarSignIcon className="h-12 w-12 text-blue-900" />
          </div>

          <div className="text-center md:ml-8 md:text-left">
            <h2 className="mb-2 text-3xl font-bold text-gray-800">
              Thanks {assessment?.firstName}!
            </h2>
            <div className="space-y-2 text-gray-600">
              <p>Thank you for taking the time to complete this profile.</p>
              <p>Your results have been recorded and emailed to your consultant</p>
            </div>
          </div>        
        </CardContent>
      </Card>
    </main>
  )
} 