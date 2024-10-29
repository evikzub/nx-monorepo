import { Module, Global } from '@nestjs/common';
import { DatabaseConfig } from './database.config';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [DatabaseConfig, ConfigService],
  exports: [DatabaseConfig],
})
export class DatabaseModule {}
