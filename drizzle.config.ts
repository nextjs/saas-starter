import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load .env file first, then override with .env.local if it exists
dotenv.config(); // This loads .env by default
dotenv.config({ path: '.env.local', override: true }); // Override with .env.local if it exists

function getDatabaseConfig() {
  // For Supabase, we need to use the direct database connection
  const host = process.env.POSTGRES_HOST; // Use the host directly from env
  
  if (!host || !process.env.POSTGRES_USER || !process.env.POSTGRES_PASSWORD || !process.env.POSTGRES_DATABASE) {
    throw new Error('Missing required database configuration. Please check your environment variables.');
  }

  return {
    host,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    ssl: {
      rejectUnauthorized: false // Allow self-signed certificates
    }
  };
}

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: getDatabaseConfig(),
  verbose: true,
  breakpoints: true,
} satisfies Config;