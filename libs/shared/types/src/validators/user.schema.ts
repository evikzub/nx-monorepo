import { z } from 'zod';
import type { User, NewUser, UpdateUser } from '../database/schema';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().nullable(), // .optional(),
  lastName: z.string().nullable(), // .optional(),
});// satisfies z.ZodType<NewUser>;

export const updateUserSchema = createUserSchema.partial() satisfies z.ZodType<UpdateUser>;

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().nullable(), // .optional(),
  lastName: z.string().nullable(), // .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});// satisfies z.ZodType<Omit<User, 'password' | 'deletedAt'>>;

// Infer types from schemas
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UserResponseDto = z.infer<typeof userResponseSchema>;
