import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseConfig } from '@microservices-app/shared/backend';
import { eq, and, isNull } from 'drizzle-orm';
import { assessments } from '@microservices-app/shared/types';
import { 
  Assessment, 
} from '@microservices-app/shared/types';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class AssessmentRepository implements OnModuleInit {
  private db!: NodePgDatabase;

  constructor(private readonly dbConfig: DatabaseConfig) {}

  async onModuleInit() {
    this.db = await this.dbConfig.createConnection();
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
} 