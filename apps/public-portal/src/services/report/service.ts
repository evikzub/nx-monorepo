import { apiReportClient } from '@/lib/api/reportClient';

export class ReportService {
  static async createReportEPMini(id: string): Promise<void> {
    await apiReportClient.patch(`/reports/${id}/ep-mini`);
  }
}