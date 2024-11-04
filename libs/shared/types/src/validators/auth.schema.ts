import { z } from 'zod';
import type { NewUser } from '../database/schema';

export enum UserRole {
  PUBLIC = 'public',
  CONSULTANT = 'consultant',
  ADMIN = 'admin'
}

// Base user schemas
const baseUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
});

const rolesSchema = z.array(z.nativeEnum(UserRole)).default([UserRole.PUBLIC]);

// Auth-specific schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1)
});

const passwordSchema = z.string().min(8).describe('Password must be at least 8 characters long');

export const registerSchema = baseUserSchema.extend({
  password: passwordSchema,
  roles: rolesSchema.optional()
});

// User management schemas
export const createUserSchema = registerSchema;
export const updateUserSchema = baseUserSchema
  .extend({ password: passwordSchema.optional() })
  .partial();

export const userResponseSchema = baseUserSchema.extend({
  id: z.string().uuid(),
  roles: rolesSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const updateUserRolesSchema = z.object({
  roles: rolesSchema,
});

// DTOs
export type RegisterDto = Pick<NewUser, 'email' | 'password' | 'firstName' | 'lastName'> & {
  roles?: UserRole[];
};

export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UserResponseDto = z.infer<typeof userResponseSchema>;
export type UpdateUserRolesDto = z.infer<typeof updateUserRolesSchema>;

// Auth-specific interfaces
export interface JwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
  firstName?: string;
  lastName?: string;
  iat?: number;
  exp?: number;
  type?: 'access' | 'refresh';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<UserResponseDto, 'createdAt' | 'updatedAt'>;
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS'
} 