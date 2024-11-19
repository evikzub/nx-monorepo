import { apiClient } from '@/lib/api/client';
import { AssessmentRegisterDto, AssessmentResponseDto, ProfileProps, ValuesProps } from '@entrepreneur/shared/types';

export class AssessmentService {
  static async register(data: AssessmentRegisterDto): Promise<AssessmentResponseDto> {
    const { data: assessment } = await apiClient.post<AssessmentResponseDto>('/assessments', data);
    return assessment;
  }

  static async updateProfile(id: string, profile: ProfileProps): Promise<AssessmentResponseDto> {
    const { data } = await apiClient.patch<AssessmentResponseDto>(`assessments/${id}/profile`, profile);
    return data;
  }

  static async updateMotives(id: string, motives: ValuesProps): Promise<AssessmentResponseDto> {
    const { data } = await apiClient.patch<AssessmentResponseDto>(`assessments/${id}/motives`, motives);
    return data;
  }
} 