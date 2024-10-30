import { z } from 'zod';

const serviceConfigSchema = z.object({
  port: z.coerce.number().positive(),
  host: z.string().min(1),
  timeout: z.coerce.number().positive(),
});

const databaseConfigSchema = z.object({
  url: z.string().url(),
  schemaName: z.string().default('public').describe('The name of the schema to use for the database'),
  poolMin: z.coerce.number().min(0),
  poolMax: z.coerce.number().positive(),
});

export const environmentSchema = z.object({
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
  database: databaseConfigSchema,
  apiGateway: serviceConfigSchema,
  userService: serviceConfigSchema,
});

// Type inference from the schema
export type EnvironmentConfig = z.infer<typeof environmentSchema>;
export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;
export type ServiceConfig = z.infer<typeof serviceConfigSchema>;
