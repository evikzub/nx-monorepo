import { Module } from '@nestjs/common';
import { ConsulService } from './consul.service';
import { AppConfigModule } from '@microservices-app/shared/backend';

@Module({
  imports: [AppConfigModule.forFeature()],
  providers: [ConsulService],
  exports: [ConsulService],
})
export class ConsulModule {}
