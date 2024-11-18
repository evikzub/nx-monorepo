'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, RadioGroup, RadioGroupItem, Checkbox } from '@entrepreneur/shared/ui'
import quizData from '@/data/qa_data.json'
import type { QuizFormData, QuizAnswers } from '@/types/quiz'

const quizSchema = z.object({
  answers: z.record(
    z.string(),
    z.union([z.string(), z.array(z.string())])
  ).refine((data) => {
    return Object.keys(data).length === quizData.questions.length
  }, 'Please answer all questions')
})

interface QuizFormProps {
  onSubmit: (data: QuizFormData) => Promise<void>
  isLoading?: boolean
}

export function QuizForm({ onSubmit, isLoading }: QuizFormProps) {
  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      answers: {}
    }
  })

  return (
    <Card className="w-[600px]">
      <CardHeader>
        <CardTitle>Quick Quiz</CardTitle>
        <CardDescription>
          Help us understand your needs better
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {quizData.questions.map((question) => (
              <FormField
                key={question.id}
                control={form.control}
                name={`answers.${question.id}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{question.text}</FormLabel>
                    <FormControl>
                      {question.type === 'single' ? (
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value as string}
                        >
                          {question.options.map((option) => (
                            <div key={option.id} className="flex items-center space-x-2">
                              <RadioGroupItem value={option.id} id={option.id} />
                              <label htmlFor={option.id}>{option.text}</label>
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        <div className="space-y-2">
                          {question.options.map((option) => (
                            <div key={option.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={option.id}
                                checked={(field.value as string[] || []).includes(option.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value as string[] || []
                                  const updated = checked
                                    ? [...current, option.id]
                                    : current.filter(id => id !== option.id)
                                  field.onChange(updated)
                                }}
                              />
                              <label htmlFor={option.id}>{option.text}</label>
                            </div>
                          ))}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || form.formState.isSubmitting}
            >
              {isLoading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}