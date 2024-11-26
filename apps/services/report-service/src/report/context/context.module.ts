import { Module } from '@nestjs/common';

import { ReportsValuesService } from './values/report-values.service';

@Module({
  providers: [ReportsValuesService],
  exports: [ReportsValuesService],
})
export class ReportsContextModule {}