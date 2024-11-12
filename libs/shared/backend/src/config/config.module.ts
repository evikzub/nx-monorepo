import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { loadConfiguration } from './config.loader';
import { AppConfigService } from './config.service';

@Module({})
export class AppConfigModule {
  static forRoot(): DynamicModule {
    return {
      module: AppConfigModule,
      imports: [
        NestConfigModule.forRoot({
          load: [loadConfiguration],
          cache: true,
          isGlobal: true,
          expandVariables: true,
        }),
      ],
      providers: [AppConfigService],
      exports: [AppConfigService],
      global: true,
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: AppConfigModule,
      providers: [AppConfigService],
      exports: [AppConfigService],
    };
  }
}
