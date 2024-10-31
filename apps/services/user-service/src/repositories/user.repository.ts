import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseConfig } from '@microservices-app/shared/backend';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, isNull, and } from 'drizzle-orm';
import { 
  User, 
  NewUser,
  users 
} from '@microservices-app/shared/types';
import { NotFoundError } from '@microservices-app/shared/types';

@Injectable()
export class UserRepository implements OnModuleInit {
  private db!: NodePgDatabase;

  constructor(private readonly dbConfig: DatabaseConfig) {}

  async onModuleInit() {
    this.db = await this.dbConfig.createConnection();
  }

  async findById(id: string): Promise<User | null> {
    const results = await this.db
      .select()
      .from(users)
      .where(and(
        eq(users.id, id),
        isNull(users.deletedAt)
      ))
      .limit(1);
    
    return results[0] || null;
  }

  async findByEmail(email: string, includeDeleted = false): Promise<User | null> {
    const results = await this.db
      .select()
      .from(users)
      .where(and(
        eq(users.email, email),
        !includeDeleted ? isNull(users.deletedAt) : undefined
      ))
      .limit(1);
    
    return results[0] || null;
  }

  async findAll(): Promise<User[]> {
    return this.db
      .select()
      .from(users)
      .where(isNull(users.deletedAt));
  }

  async create(data: NewUser): Promise<User> {
    const results = await this.db
      .insert(users)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as NewUser)
      .returning();
    
    return results[0];
  }

  async update(id: string, data: Partial<NewUser>): Promise<User> {
    const results = await this.db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      } as User)
      .where(and(
        eq(users.id, id),
        isNull(users.deletedAt)
      ))
      .returning();

    const result = results[0];
    if (!result) {
      throw new NotFoundError(`User with id ${id} not found`);
    }

    return result;
  }

  async softDelete(id: string): Promise<void> {
    const results = await this.db
      .update(users)
      .set({
        updatedAt: new Date(),
        deletedAt: new Date(),
      } as Partial<User>) // Type assertion needed for system fields
      .where(and(
        eq(users.id, id),
        isNull(users.deletedAt)
      ))
      .returning();

    if (!results[0]) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
  }

  async hardDelete(id: string): Promise<void> {
    const results = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!results[0]) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
  }
}
