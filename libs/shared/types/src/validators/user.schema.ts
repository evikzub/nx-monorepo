// import { z } from 'zod';
// //import type { User, NewUser, UpdateUser } from '../database/schema';
// import { UserRole } from '../lib/auth/auth.types';


// // Create a roles array validator
// const rolesSchema = z.array(z.nativeEnum(UserRole)).default([UserRole.PUBLIC]);

// export const createUserSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(8),
//   firstName: z.string().nullable(),
//   lastName: z.string().nullable(),
//   roles: rolesSchema.optional(), // Only allowed in admin creation
// });

// // export const updateUserSchema = createUserSchema.partial() satisfies z.ZodType<UpdateUser>;
// export const updateUserSchema = createUserSchema
//   .omit({ roles: true }) // Remove roles from regular updates
//   .partial();

// export const userResponseSchema = z.object({
//   id: z.string().uuid(),
//   email: z.string().email(),
//   firstName: z.string().nullable(),
//   lastName: z.string().nullable(),
//   roles: rolesSchema,
//   createdAt: z.date(),
//   updatedAt: z.date(),
// }); // satisfies z.ZodType<Omit<User, 'password' | 'deletedAt'>>;

// // Admin-only schemas for role management
// export const updateUserRolesSchema = z.object({
//   roles: rolesSchema,
// });

// // Infer types from schemas
// export type CreateUserDto = z.infer<typeof createUserSchema>;
// export type UpdateUserDto = z.infer<typeof updateUserSchema>;
// export type UserResponseDto = z.infer<typeof userResponseSchema>;
// export type UpdateUserRolesDto = z.infer<typeof updateUserRolesSchema>;
