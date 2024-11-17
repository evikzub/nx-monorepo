import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { UserRole } from '../validators/auth.schema';

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
