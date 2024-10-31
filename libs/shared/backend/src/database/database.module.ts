import { Module, Global } from '@nestjs/common';
import { DatabaseConfig } from './database.config';
import { ConfigService } from '../config/config.service';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [DatabaseConfig, ConfigService, NestConfigService],
  exports: [DatabaseConfig],
})
export class DatabaseModule {}
