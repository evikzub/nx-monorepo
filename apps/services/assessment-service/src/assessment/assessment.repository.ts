import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseConfig } from '@microservices-app/shared/backend';
import { eq, and, isNull } from 'drizzle-orm';
import { assessments } from '@microservices-app/shared/types';
import { 
  Assessment, 
  AssessmentStatus, 
  NewAssessment, 
  UpdateAssessment 
} from '@microservices-app/shared/types';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class AssessmentRepository implements OnModuleInit {
  private db!: NodePgDatabase;

  constructor(private readonly dbConfig: DatabaseConfig) {}

  async onModuleInit() {
    this.db = await this.dbConfig.createConnection();
  }

  async create(data: NewAssessment): Promise<Assessment> {
    const [assessment] = await this.db.insert(assessments)
      .values(data)
      .returning();
    return assessment;
  }

  async findById(id: string): Promise<Assessment | null> {
    const [assessment] = await this.db.select()
      .from(assessments)
      .where(
        and(
          eq(assessments.id, id),
          isNull(assessments.deletedAt)
        )
      );
    return assessment || null;
  }

  async findByEmail(email: string): Promise<Assessment[]> {
    return this.db.select()
      .from(assessments)
      .where(
        and(
          eq(assessments.email, email),
          isNull(assessments.deletedAt)
        )
      )
      .orderBy(assessments.createdAt);
  }

  async update(id: string, data: UpdateAssessment): Promise<Assessment> {
    const [assessment] = await this.db.update(assessments)
      .set({
        ...data,
        updatedAt: new Date()
      } as Assessment)
      .where(
        and(
          eq(assessments.id, id),
          isNull(assessments.deletedAt)
        )
      )
      .returning();
    return assessment;
  }

  async softDelete(id: string): Promise<void> {
    await this.db.update(assessments)
      .set({ 
        deletedAt: new Date(),
        updatedAt: new Date()
      } as Assessment)
      .where(eq(assessments.id, id));
  }

  async updateStatus(id: string, status: AssessmentStatus): Promise<Assessment> {
    const [assessment] = await this.db.update(assessments)
      .set({ 
        status,
        updatedAt: new Date()
      } as Assessment)
      .where(eq(assessments.id, id))
      .returning();
    return assessment;
  }

  async findIncompleteByEmail(email: string): Promise<Assessment | null> {
    const [assessment] = await this.db.select()
      .from(assessments)
      .where(
        and(
          eq(assessments.email, email),
          isNull(assessments.deletedAt),
          eq(assessments.status, AssessmentStatus.PENDING)
        )
      )
      .orderBy(assessments.createdAt);
    return assessment || null;
  }
} 