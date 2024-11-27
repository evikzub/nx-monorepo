import { LogLevel } from './logging.config';
import { EnvironmentConfig } from '@microservices-app/shared/types';

export interface PinoLoggerConfig {
  elasticsearch: {
    node: string;
    index: string;
    // auth: {
    //   username: string;
    //   password: string;
    // };
    flushBytes?: number;
    sync?: boolean;
  };
  environment?: string;
  development?: boolean;
  level?: LogLevel;
  serviceName: string;
}

export function createPinoConfig(
  envConfig: EnvironmentConfig,
  serviceName: string
): PinoLoggerConfig {
  return {
    elasticsearch: {
      node: envConfig.elastic.url || 'http://localhost:9200',
      index: `${serviceName}-logs-${envConfig.nodeEnv}`,
      // auth: {
      //   username: envConfig.elastic.username || '',
      //   password: envConfig.elastic.password || '',
      // },
      flushBytes: 1000,
      sync: envConfig.nodeEnv === 'test',
    },
    environment: envConfig.nodeEnv,
    development: envConfig.nodeEnv === 'development',
    level: envConfig.nodeEnv === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
    serviceName
  };
}

// export const defaultPinoConfig: Partial<PinoLoggerConfig> = {
//   elasticsearch: {
//     node: 'http://localhost:9200',
//     index: 'logs',
//     auth: {
//       username: 'user',
//       password: 'pwd',
//     },
//     flushBytes: 1000,
//     sync: false
//   },
//   development: process.env['NODE_ENV'] === 'development',
//   level: LogLevel.INFO
// }; 