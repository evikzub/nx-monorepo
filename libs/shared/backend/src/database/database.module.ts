import { Module, Global } from '@nestjs/common';
import { DatabaseConfig } from './database.config';
import { AppConfigService } from '../config/config.service';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [DatabaseConfig, AppConfigService, NestConfigService],
  exports: [DatabaseConfig],
})
export class DatabaseModule {}
