import { ENV_KEYS, environmentSchema } from '@microservices-app/shared/types';
import { ConfigFactory } from '@nestjs/config';

export const loadConfiguration: ConfigFactory = () => {
  const config = {
    nodeEnv: process.env[ENV_KEYS.NODE_ENV] || 'development',
    database: {
      url: process.env[ENV_KEYS.DATABASE_URL],
      schemaName: process.env[ENV_KEYS.NODE_ENV] === 'test' 
        ? process.env[ENV_KEYS.TEST_DATABASE_SCHEMA] 
        : process.env[ENV_KEYS.DATABASE_SCHEMA] || 'public',  // Default to 'public' schema
      poolMin: process.env[ENV_KEYS.DATABASE_POOL_MIN],
      poolMax: process.env[ENV_KEYS.DATABASE_POOL_MAX],
    },
    consul: {
      host: process.env[ENV_KEYS.CONSUL_HOST],
      port: process.env[ENV_KEYS.CONSUL_PORT],
    },
    apiGateway: {
      id: process.env[ENV_KEYS.API_GATEWAY_ID],
      name: process.env[ENV_KEYS.API_GATEWAY_NAME],
      port: process.env[ENV_KEYS.API_GATEWAY_PORT],
      host: process.env[ENV_KEYS.API_GATEWAY_HOST],
      timeout: process.env[ENV_KEYS.SERVICE_TIMEOUT],
    },
    userService: {
      id: process.env[ENV_KEYS.USER_SERVICE_ID],
      name: process.env[ENV_KEYS.USER_SERVICE_NAME],
      port: process.env[ENV_KEYS.USER_SERVICE_PORT],
      host: process.env[ENV_KEYS.USER_SERVICE_HOST],
      timeout: process.env[ENV_KEYS.SERVICE_TIMEOUT],
    },
  };

  const result = environmentSchema.safeParse(config);

  if (!result.success) {
    console.error('❌ Invalid environment configuration');
    console.error(result.error.format());
    throw new Error('Invalid environment configuration');
  }

  return result.data;
};
