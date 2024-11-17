import { apiClient } from '@/lib/api/client';
import { Profile } from '@/types/profile';

export class ProfileService {
  static async getProfile(): Promise<Profile> {
    const { data } = await apiClient.get<Profile>('/profile');
    return data;
  }

  static async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    const { data } = await apiClient.patch<Profile>('/profile', profile);
    return data;
  }
} 