import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

// Only warn if not in build environment or if we really need it
if (!process.env.POSTGRES_URL && process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE) {
  console.warn('POSTGRES_URL environment variable is not set');
}

export const client = postgres(process.env.POSTGRES_URL || 'postgres://localhost:5432/placeholder');
export const db = drizzle(client, { schema });
