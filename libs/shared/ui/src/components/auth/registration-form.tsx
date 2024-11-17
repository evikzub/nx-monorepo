'use client'

import { registerSchema, type RegisterDto } from '@entrepreneur/shared/types'
import { zodResolver } from '@hookform/resolvers/zod';
//import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
//import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { useToast } from '../ui/use-toast'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'

interface RegistrationFormProps {
  onSubmit: (data: RegisterDto) => Promise<void>
  loading?: boolean
}

export function RegistrationForm({ onSubmit, loading }: RegistrationFormProps) {
  const { toast } = useToast()
  const form = useForm<RegisterDto>({
    resolver: zodResolver(registerSchema),
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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Registration failed',
      })
    }
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Enter your details to create a new account
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
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
                  <FormLabel>Last Name</FormLabel>
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
                  <FormLabel>Email</FormLabel>
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
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}