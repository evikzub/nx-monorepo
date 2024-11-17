import { apiClient } from '@/lib/api/client';
import { AuthResponse, OtpRequest, OtpVerification } from '@/types/auth';
import { RegisterDto } from '@entrepreneur/shared/types';

export class AuthService {
  static async register(data: RegisterDto): Promise<void> {
    console.log('register', data);
    console.log('GW', process.env.NEXT_PUBLIC_API_GATEWAY_URL);
    console.log('apiClient', apiClient);
    const response = await apiClient.post('/auth/register', {
      ...data,
      //type: 'public', // Specify user type
    });
    console.log('response', response);
    //return response.data;
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