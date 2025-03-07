import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// Load .env file first, then override with .env.local if it exists
dotenv.config(); // This loads .env by default
dotenv.config({ path: '.env.local', override: true }); // Override with .env.local if it exists

function getDatabaseUrl() {
  // For Supabase, we need to use the direct database connection string
  // Format: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
  const host = process.env.POSTGRES_HOST; // Use the host directly from env
  
  // Check if all required environment variables are set
  if (!host || !process.env.POSTGRES_USER || !process.env.POSTGRES_PASSWORD || !process.env.POSTGRES_PORT || !process.env.POSTGRES_DATABASE) {
    throw new Error('Missing required database configuration. Please check your environment variables.');
  }
  
  // Construct the connection string
  const connectionString = `postgres://${process.env.POSTGRES_USER}:${encodeURIComponent(process.env.POSTGRES_PASSWORD)}@${host}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DATABASE}`;
  return connectionString;
}

const connectionString = getDatabaseUrl();

let client: ReturnType<typeof postgres>;
let db: PostgresJsDatabase<typeof schema>;

// Add error handling for the client creation
try {
  client = postgres(connectionString, {
    max: 10, // Connection pool size
    idle_timeout: 20, // Idle connection timeout in seconds
    ssl: {
      rejectUnauthorized: false // Allow self-signed certificates
    },
    connect_timeout: 30, // Increase connection timeout to 30 seconds
  });
  db = drizzle(client, { schema });
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  throw error;
}

export { client, db };