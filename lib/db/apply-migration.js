import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function applyMigration() {
  let sql;
  try {
    // Get migration file from command line argument
    const migrationFile = process.argv[2];
    
    if (!migrationFile) {
      console.error('No migration file provided. Usage: node apply-migration.js <path-to-migration-file>');
      process.exit(1);
    }
    
    // Read the migration SQL from the file
    const migrationSql = fs.readFileSync(migrationFile, 'utf8');
    
    // Get the name of the migration file for logging
    const migrationName = path.basename(migrationFile);
    
    console.log(`Applying migration from ${migrationName}...`);
    
    // Connect to the database
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error('POSTGRES_URL not set');
    }
    
    sql = postgres(connectionString);
    
    // Execute the migration SQL
    console.log(`Executing SQL from ${migrationName}...`);
    await sql.unsafe(migrationSql);
    
    console.log('Migration successfully applied!');
  } catch (error) {
    console.error('Error applying migration:', error);
  } finally {
    if (sql) {
      await sql.end();
      console.log('Database connection closed');
    }
  }
}

applyMigration(); 