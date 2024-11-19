import { apiClient } from '@/lib/api/client';
import { AssessmentDto, AssessmentRegisterDto, AssessmentResponseDto, ProfileProps } from '@entrepreneur/shared/types';

export class AssessmentService {
  static async register(data: AssessmentRegisterDto): Promise<AssessmentResponseDto> {
    const { data: assessment } = await apiClient.post<AssessmentResponseDto>('/assessments', data);
    return assessment;
  }

  static async updateProfile(id: string, profile: ProfileProps): Promise<AssessmentResponseDto> {
    const { data } = await apiClient.patch<AssessmentResponseDto>(`assessments/${id}/profile`, profile);
    return data;
  }
} 