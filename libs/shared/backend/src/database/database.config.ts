import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { DefaultLogger } from 'drizzle-orm/logger';
import { DrizzleLogger } from '../logger/logging.drizzle';

@Injectable()
export class DatabaseConfig {
  private readonly logger = new Logger(DatabaseConfig.name);

  constructor(private configService: AppConfigService) {}

  async createConnection(): Promise<NodePgDatabase> {
    const config = this.configService.envConfig;
    const dbConfig = config.database;
    
    const pool = new Pool({
      connectionString: dbConfig.url,
      min: dbConfig.poolMin,
      max: dbConfig.poolMax,
    });

    // Set the search_path for the connection
    await pool.query(`SET search_path TO "${dbConfig.schemaName}"`);

    // Initialize Drizzle with custom logger
    const db = drizzle(pool, {
      logger: new DefaultLogger({ writer: new DrizzleLogger() }),
    });

    // Verify database connection
    try {
      await pool.query('SELECT 1');
      this.logger.log('Database connection established');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }

    return db;
  }

  // Helper method to ensure schema exists
  async ensureSchema() {
    const dbConfig = this.configService.envConfig.database;
    const pool = new Pool({ connectionString: dbConfig.url });

    try {
      await pool.query(`
        CREATE SCHEMA IF NOT EXISTS "${dbConfig.schemaName}";
      `);
      this.logger.log(`Schema "${dbConfig.schemaName}" ensured`);
    } catch (error) {
      this.logger.error('Error ensuring schema:', error);
      throw error;
    } finally {
      await pool.end();
    }
  }

  async dbMigrate(db: NodePgDatabase) {
    //const db = await this.createConnection();
    const config = this.configService.envConfig;
    // Run migrations in development/test environments
    if (config.nodeEnv !== 'production') {
      try {
        await migrate(db, { 
          migrationsFolder: 'drizzle',
          migrationsSchema: config?.database.schemaName, // Specify schema for migrations table
        });
        console.log('✅ Migrations applied successfully');
      } catch (error) {
        console.error('❌ Error applying migrations:', error);
        throw error;
      }
    }
  }
}
