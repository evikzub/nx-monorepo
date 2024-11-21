import { Controller, Param, ParseUUIDPipe, Patch } from "@nestjs/common";
import { ReportService } from "./report.service";

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Patch(':id/ep-mini')
  async createReportEPMini(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.reportService.createReportEPMini(id);
  }
}