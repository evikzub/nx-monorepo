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

// export const emailServiceSchema = z.object({
//   provider: z.enum(['SENDGRID', 'MAILGUN', 'SMTP']),
//   apiKey: z.string(),
//   from: z.string().email(),
//   templateDir: z.string(),
// })

export const emailServiceSchema = z.object({
  host: z.string(),
  port: z.number(),
  secure: z.boolean(),
  user: z.string(),
  password: z.string(),
  templateDir: z.string(),
})

export const rabbitmqConfigSchema = z.object({
  url: z.string(),
  queues: z.object({
    notifications: z.string(),
    deadLetter: z.string(),
  }),
  exchanges: z.object({
    notifications: z.string(),
    deadLetter: z.string(),
  }),
  queueOptions: z.object({
    messageTtl: z.number().optional().default(86400000), // 24 hours
    deadLetterTtl: z.number().optional().default(604800000), // 7 days
  }).optional(),
})

export const environmentSchema = z.object({
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
  database: databaseConfigSchema,
  consul: consulConfigSchema,
  apiGateway: serviceConfigSchema,
  userService: serviceConfigSchema,
  jwt: jwtSchema,
  rabbitmq: rabbitmqConfigSchema,
  emailService: emailServiceSchema,
  notificationService: serviceConfigSchema,
});


// Type inference from the schema
export type EnvironmentConfig = z.infer<typeof environmentSchema>;
export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;
export type ServiceConfig = z.infer<typeof serviceConfigSchema>;
export type RabbitMQConfig = z.infer<typeof rabbitmqConfigSchema>;
export type EmailServiceConfig = z.infer<typeof emailServiceSchema>;
export type NotificationServiceConfig = z.infer<typeof serviceConfigSchema>;
