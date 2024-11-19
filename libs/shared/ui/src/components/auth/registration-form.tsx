'use client'

import { AssessmentRegisterDto, assessmentSchema, type RegisterDto } from '@entrepreneur/shared/types'
import { zodResolver } from '@hookform/resolvers/zod';
//import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
//import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { useToast } from '../ui/use-toast'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'

interface RegistrationFormProps {
  //onSubmit: (data: RegisterDto) => Promise<void>
  onSubmit: {
    type: 'function',
    value: (data: AssessmentRegisterDto) => Promise<void>
  }
  loading?: boolean
}

export function RegistrationForm({ onSubmit: { value: onSubmit }, loading }: RegistrationFormProps) {
  const { toast } = useToast()
  const form = useForm<AssessmentRegisterDto>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  })

  const handleSubmit = async (data: RegisterDto) => {
    try {
      await onSubmit(data)
    } catch (error) {
      //console.error(error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Registration failed',
        duration: 5000,
      })
    }
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Create Profile</CardTitle>
        <CardDescription>
          Enter your details to get started
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit as SubmitHandler<AssessmentRegisterDto>)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="name@example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || form.formState.isSubmitting}
            >
              {loading ? 'Submitting...' : 'START NOW >'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}