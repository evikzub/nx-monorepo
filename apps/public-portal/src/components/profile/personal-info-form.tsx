'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@entrepreneur/shared/ui'
import { useToast } from '@entrepreneur/shared/ui'
import { type PersonalInfoData } from '@/types/profile'

const personalInfoSchema = z.object({
  // pattern(/^\+\d{1}\s\(\d{3}\)\s\d{3}-\d{4}$/, 'Invalid phone number format')
  phoneNumber: z.string().min(1, 'Phone number is required'),
  company: z.string().optional(),
  position: z.string().optional(),
})

interface PersonalInfoFormProps {
  onSubmit: (data: PersonalInfoData) => Promise<void>
  isLoading?: boolean
}

export function PersonalInfoForm({ onSubmit, isLoading }: PersonalInfoFormProps) {
  //const { toast } = useToast()
  const form = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      phoneNumber: '',
      company: '',
      position: '',
    },
  })

  // const handleSubmit = async (data: PersonalInfoData) => {
  //   try {
  //     await onSubmit(data)
  //     toast({
  //       title: "Success",
  //       description: "Profile updated successfully!",
  //       duration: 5000,
  //     })
  //   } catch (error) {
  //     toast({
  //       variant: 'destructive',
  //       title: 'Error',
  //       description: error instanceof Error 
  //         ? error.message 
  //         : 'Failed to update profile',
  //       duration: 5000,
  //     })
  //   }
  // }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Tell us more about yourself
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="+1 (555) 000-0000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your company name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your job title" />
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
              disabled={isLoading || form.formState.isSubmitting}
            >
              {isLoading ? 'Saving...' : 'Continue'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}