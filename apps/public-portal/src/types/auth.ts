import { User as DbUser } from '@entrepreneur/shared/types';

// Re-export the base User type
export type User = DbUser;

// Add frontend-specific auth types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface OtpRequest {
  email: string;
  expiresAt: string;
}

export interface OtpVerification {
  email: string;
  otp: string;
} 