import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import pino, { Logger as PinoLogger } from 'pino';
import pinoElastic from 'pino-elasticsearch';
//import { PinoLoggerConfig, defaultPinoConfig } from './pino.config';
import { PinoLoggerConfig } from './pino.config';

@Injectable()
export class PinoLoggerService implements NestLoggerService {
  private logger: PinoLogger;

  constructor(config: Partial<PinoLoggerConfig>) {
    //const finalConfig = { ...defaultPinoConfig, ...config };
    const finalConfig = { ...config };
    
    // Create Elasticsearch transport
    const streamToElastic = pinoElastic({
      ...finalConfig.elasticsearch,
      esVersion: 8, // adjust based on your ES version
    });

    // Create development transport if needed
    const devTransport = finalConfig.development
      ? pino.transport({
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        })
      : undefined;

    // Initialize logger
    this.logger = pino({
      level: finalConfig.level,
      base: {
        service: finalConfig.serviceName,
        env: config.development,
      },
    }, pino.multistream([
      { stream: streamToElastic },
      ...(devTransport ? [{ stream: devTransport }] : []),
    ]));

    this.logger.info('PinoLoggerService initialized');
    //this.logger.info({ config: finalConfig });
  }

  log(message: string, ...args: any[]) {
    const { context, data } = this.parseArgs(args);
    this.logger.info({ context, data }, message);
  }

  error(message: string, ...args: any[]) {
    const { context, data, trace } = this.parseArgs(args);
    this.logger.error({ context, data, trace }, message);
  }

  warn(message: string, ...args: any[]) {
    const { context, data } = this.parseArgs(args);
    this.logger.warn({ context, data }, message);
  }

  debug(message: string, ...args: any[]) {
    const { context, data } = this.parseArgs(args);
    this.logger.debug({ context, data }, message);
  }

  private parseArgs(args: any[]) {
    const parsed: any = {};
    
    args.forEach(arg => {
      if (typeof arg === 'string') {
        parsed.context = arg;
      } else if (arg instanceof Error) {
        parsed.trace = arg.stack;
      } else if (typeof arg === 'object') {
        parsed.data = arg;
      }
    });

    return parsed;
  }
} 