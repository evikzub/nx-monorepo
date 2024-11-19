'use client'

import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, RadioGroup, RadioGroupItem, Label } from '@entrepreneur/shared/ui'
import { useToast } from '@entrepreneur/shared/ui'
import { ProfileProps } from '@entrepreneur/shared/types'
import { ProfileSchema } from '@entrepreneur/shared/types'
import { useAssessmentStore } from '@/store/assessment/slice'

interface PersonalInfoFormProps {
  onSubmit: {
    type: 'function',
    value: (data: ProfileProps) => Promise<void>
  }
  isLoading?: boolean
}

type FieldDataType = { default: string | undefined, label: string, placeholder: string, type?: string }
type FieldData = Record<keyof ProfileProps, FieldDataType>

const fieldData: FieldData = {
  gender: { default: undefined, label: 'Gender', placeholder: 'Your gender', type: 'radio' },
  dateOfBirth: { default: undefined, label: 'Date of Birth', placeholder: 'Your date of birth', type: 'date' },
  country: { default: '', label: 'Country', placeholder: 'Your country+' },
  state: { default: '', label: 'State', placeholder: 'Your state' },
  city: { default: '', label: 'City', placeholder: 'Your city' },
  address: { default: '', label: 'Address', placeholder: 'Your address' },
  zipCode: { default: '', label: 'Zip Code', placeholder: 'Your zip code' },
  phone: { default: '', label: 'Phone Number *', placeholder: '+1 (555) 000-0000', type: 'tel' },
}

const defaultValues = Object.keys(fieldData).reduce((acc: Record<string, string | undefined>, key: string) => {
  const fieldKey = key as keyof FieldData;
  acc[fieldKey] = fieldData[fieldKey].default;
  return acc;
}, {});

export function PersonalInfoForm({ onSubmit: { value: onSubmit }, isLoading }: PersonalInfoFormProps) {
  const { toast } = useToast()
  const { assessment } = useAssessmentStore()

  const form = useForm<ProfileProps>({
      resolver: zodResolver(ProfileSchema),
      defaultValues: assessment?.data?.profile || defaultValues,
  })

  const handleSubmit = async (data: ProfileProps) => {
    try {
      //console.log("data in profile form: ", data)
      await onSubmit(data)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to update profile',
        duration: 5000,
      })
    }
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Tell us more about yourself
        </CardDescription>
      </CardHeader>
      <Form {...form} >
        <form onSubmit={form.handleSubmit(handleSubmit as SubmitHandler<ProfileProps>)}>
          <CardContent className="space-y-4">

            {Object.keys(fieldData).map((profileField) => {
              const fieldKey = profileField as keyof FieldData;
              const fieldType = fieldData[fieldKey].type;
              const fieldPlaceholder = fieldData[fieldKey].placeholder;

              return (
                <FormField 
                  control={form.control} 
                  key={fieldKey} 
                  name={fieldKey} 
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>{fieldData[fieldKey].label}</FormLabel>
                      <FormControl>
                        {fieldType === 'radio' ? (
                          <RadioGroup 
                            //{...field}
                            onValueChange={field.onChange} 
                            defaultValue={field.value as string}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="male" id="male" />
                              </FormControl>
                              <FormLabel htmlFor="male">Gender</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="female" id="female" />
                              </FormControl>
                              <FormLabel htmlFor="female">Female</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        ) : (
                          <Input {...field} type={fieldType} placeholder={fieldPlaceholder} value={field.value as string} />
                        )}
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                )}
                />
              )
            })}
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