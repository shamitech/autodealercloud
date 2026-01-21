import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export class DatabaseMigration {
  private pool: Pool;
  private migrationsPath: string;
  private database: string;

  constructor(connectionString: string, migrationsPath: string, database: string) {
    this.pool = new Pool({ connectionString });
    this.migrationsPath = migrationsPath;
    this.database = database;
  }

  private async initMigrationTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `;
    await this.pool.query(query);
  }

  private async getExecutedMigrations(): Promise<string[]> {
    const result = await this.pool.query(
      'SELECT migration_name FROM migrations ORDER BY id'
    );
    return result.rows.map((row) => row.migration_name);
  }

  private async getPendingMigrations(): Promise<string[]> {
    const executedMigrations = await this.getExecutedMigrations();
    const allMigrations = this.getMigrationFiles();

    return allMigrations.filter(
      (migration) => !executedMigrations.includes(migration)
    );
  }

  private getMigrationFiles(): string[] {
    if (!fs.existsSync(this.migrationsPath)) {
      return [];
    }

    return fs
      .readdirSync(this.migrationsPath)
      .filter((file) => file.endsWith('.sql'))
      .sort();
  }

  private async executeMigration(migrationName: string): Promise<void> {
    const migrationPath = path.join(this.migrationsPath, migrationName);
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    await this.pool.query(sql);

    await this.pool.query('INSERT INTO migrations (migration_name) VALUES ($1)', [
      migrationName,
    ]);

    console.log(`✓ Executed migration: ${migrationName}`);
  }

  async runMigrations(): Promise<void> {
    try {
      console.log(`\n🔄 Running migrations for ${this.database} database...`);

      await this.initMigrationTable();

      const pendingMigrations = await this.getPendingMigrations();

      if (pendingMigrations.length === 0) {
        console.log('✓ Database is up to date. No pending migrations.');
        return;
      }

      console.log(`Found ${pendingMigrations.length} pending migration(s)\n`);

      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }

      console.log(`\n✅ All migrations completed successfully!\n`);
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    } finally {
      await this.pool.end();
    }
  }

  async getStatus(): Promise<void> {
    try {
      await this.initMigrationTable();
      const executed = await this.getExecutedMigrations();
      const pending = await this.getPendingMigrations();

      console.log(`\n📊 Migration Status for ${this.database} database:`);
      console.log(`Executed: ${executed.length}`);
      console.log(`Pending: ${pending.length}`);

      if (executed.length > 0) {
        console.log('\nExecuted migrations:');
        executed.forEach((m) => console.log(`  ✓ ${m}`));
      }

      if (pending.length > 0) {
        console.log('\nPending migrations:');
        pending.forEach((m) => console.log(`  ⏳ ${m}`));
      }
    } catch (error) {
      console.error('Error getting migration status:', error);
      throw error;
    } finally {
      await this.pool.end();
    }
  }
}
