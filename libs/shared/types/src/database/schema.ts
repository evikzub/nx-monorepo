import { pgTable, uuid, varchar, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { UserRole } from '../validators/auth.schema';
import { AssessmentStatus, LanguageCode } from '../validators/assessment.schema';

// Create enum for roles in the database
// Convert enum values to array of strings
export const userRoleEnum = pgEnum('user_role', [
  UserRole.PUBLIC,
  UserRole.CONSULTANT,
  UserRole.ADMIN
] as const);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }), //notNull()
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  // Add roles array using PostgreSQL array type
  roles: userRoleEnum('roles').array().notNull().default([UserRole.PUBLIC]),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Export the inferred types
export type User = typeof users.$inferSelect;
export type NewUser = Omit<typeof users.$inferSelect, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type UpdateUser = Partial<Omit<NewUser, 'roles'>>;  // Prevent direct role updates

// Assessments
export const assessmentStatusEnum = pgEnum('assessment_status', [
  AssessmentStatus.PENDING,
  AssessmentStatus.COMPLETED
] as const);

export const languageCodeEnum = pgEnum('language_code', [
  LanguageCode.EN,
  LanguageCode.ES,
  LanguageCode.DE
] as const);

export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  data: jsonb('data'),
  languageCode: languageCodeEnum('language_code').notNull().default(LanguageCode.EN),
  status: assessmentStatusEnum('status').notNull().default(AssessmentStatus.PENDING),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Export the inferred types
export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = Omit<typeof assessments.$inferSelect, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type UpdateAssessment = Partial<Omit<NewAssessment, 'email' | 'firstName' | 'lastName'>>;  // Prevent direct email updates (?!)
