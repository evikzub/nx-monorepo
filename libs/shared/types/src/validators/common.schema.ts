import { z } from "zod";

export const emailSchema = z.string()
  .email({ message: 'Invalid email address' })
  .max(255, { message: 'Email must be less than 255 characters'});

export function nameSchema(fieldName: string) {
  return z.string()
    .min(3, { message: `${fieldName} must be at least 3 characters long` })
    .max(255, { message: `${fieldName} should be less than 255 characters` })
    .regex(/^[a-zA-Z]+$/, {message: `${fieldName} should only contain letters`});
}

export const baseUserSchema = z.object({
  email: emailSchema,
  firstName: nameSchema('First name'), //z.string().nullable().optional(),
  lastName: nameSchema('Last name'), //z.string().nullable().optional(),
});
