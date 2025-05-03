import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

// 确保URL以postgresql://开头(Supabase要求)
const connectionString = process.env.POSTGRES_URL.replace(
  /^postgres:\/\//,
  'postgresql://'
);

export const client = postgres(connectionString);
export const db = drizzle(client, { schema });
