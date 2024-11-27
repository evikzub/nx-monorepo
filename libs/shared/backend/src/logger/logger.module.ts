import { DynamicModule, Global, Module } from '@nestjs/common';
import { PinoLoggerService } from './pino-logger.service';
import { createPinoConfig } from './pino.config';
import { AppConfigService } from '../config/config.service';


export interface LoggerModuleAsyncOptions {
  //imports?: any[];
  useFactory: (configService: AppConfigService) => Promise<string> | string;
  //inject?: any[];
}

@Global()
@Module({})
export class LoggerModule {
  static forRoot(serviceName: string): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: PinoLoggerService,
          useFactory: (configService: AppConfigService) => {
            const config = createPinoConfig(
              configService.envConfig,
              serviceName
            );
            return new PinoLoggerService(config);
          },
          inject: [AppConfigService],
        },
      ],
      exports: [PinoLoggerService],
    };
  }

  static forRootAsync(options: LoggerModuleAsyncOptions): DynamicModule {
    return {
      module: LoggerModule,
      //imports: options.imports || [],
      providers: [
        {
          provide: PinoLoggerService,
          useFactory: async (configService: AppConfigService) => {
            const serviceName = await options.useFactory(configService);
            const config = createPinoConfig(
              configService.envConfig,
              serviceName
            );
            return new PinoLoggerService(config);
          },
          //inject: [AppConfigService, ...(options.inject || [])],
          inject: [AppConfigService],
        },
      ],
      exports: [PinoLoggerService],
    };
  }
} 