import { z } from 'zod';

const serviceConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
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

const consulConfigSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().positive(),
});

export const jwtSchema = z.object({
  secret: z.string().min(1),
  expiresIn: z.string().default('1h'),
});

export const environmentSchema = z.object({
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
  database: databaseConfigSchema,
  consul: consulConfigSchema,
  apiGateway: serviceConfigSchema,
  userService: serviceConfigSchema,
  jwt: jwtSchema,
});

// Type inference from the schema
export type EnvironmentConfig = z.infer<typeof environmentSchema>;
export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;
export type ServiceConfig = z.infer<typeof serviceConfigSchema>;
export type JwtConfig = z.infer<typeof jwtSchema>;
