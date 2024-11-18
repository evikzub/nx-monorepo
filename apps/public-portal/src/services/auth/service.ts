import { apiClient } from '@/lib/api/client';
import { getErrorMessage } from '@/lib/utils/error-handling';
import { AuthResponse, OtpRequest, OtpVerification } from '@/types/auth';
import { RegisterDto } from '@entrepreneur/shared/types';

export class AuthService {
  static async register(data: RegisterDto): Promise<void> {
    try {
      await apiClient.post('/auth/register', data);
    } catch (error) {
      //console.log('Full error:', error);
      throw new Error(getErrorMessage(error));
    }
  }
  static async sendOtp(email: string): Promise<OtpRequest> {
    const { data } = await apiClient.post<OtpRequest>('/auth/otp/send', { email });
    return data;
  }

  static async verifyOtp(email: string, otp: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/otp/verify', {
      email,
      otp,
    });
    return data;
  }

  static async verifyMagicLink(token: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/magic-link/verify', {
      token,
    });
    return data;
  }
} 