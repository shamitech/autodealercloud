#!/usr/bin/env ts-node
/**
 * Database initialization script
 * Run migrations for all services
 *
 * Usage:
 *   npm run init:db
 *   npm run init:db -- --status  (show migration status)
 */

import path from 'path';
import { DatabaseMigration } from '../services/core-cms/src/database/migration';

const args = process.argv.slice(2);
const showStatus = args.includes('--status');

const migrations = [
  {
    name: 'Core CMS',
    connectionString: process.env.CORE_CMS_DB_URL || 'postgresql://user:password@localhost:5432/autodealercloud',
    migrationsPath: path.join(__dirname, '../services/core-cms/migrations'),
  },
  {
    name: 'Account Portal',
    connectionString: process.env.ACCOUNT_PORTAL_DB_URL || 'postgresql://user:password@localhost:5433/autodealercloud_account',
    migrationsPath: path.join(__dirname, '../services/account-portal/migrations'),
  },
  {
    name: 'Admin Portal',
    connectionString: process.env.ADMIN_PORTAL_DB_URL || 'postgresql://user:password@localhost:5434/autodealercloud_admin',
    migrationsPath: path.join(__dirname, '../services/admin-portal/migrations'),
  },
];

async function main() {
  try {
    for (const config of migrations) {
      const migration = new DatabaseMigration(
        config.connectionString,
        config.migrationsPath,
        config.name
      );

      if (showStatus) {
        await migration.getStatus();
      } else {
        await migration.runMigrations();
      }
    }

    console.log('\n✅ All database operations completed!');
  } catch (error) {
    console.error('\n❌ Error during database initialization:', error);
    process.exit(1);
  }
}

main();
