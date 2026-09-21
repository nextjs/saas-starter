import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

/**
 * Client Postgres yang di-cache di `globalThis`.
 *
 * Tanpa cache ini, setiap hot-reload di mode dev membuat client baru sementara
 * yang lama tetap memegang koneksinya. Setelah beberapa puluh kali menyimpan
 * berkas, Postgres menolak dengan "sorry, too many clients already" — dan
 * karena satu server Postgres biasanya dipakai beberapa proyek sekaligus,
 * yang ikut mati bukan cuma aplikasi ini.
 *
 * Di produksi `globalThis` bersih setiap proses, jadi perilakunya sama saja.
 */
const globalUntukDb = globalThis as unknown as {
  __postgresClient?: ReturnType<typeof postgres>;
};

export const client =
  globalUntukDb.__postgresClient ??
  postgres(process.env.POSTGRES_URL, {
    // Cukup untuk satu instance aplikasi, dan menyisakan ruang bagi proyek
    // lain yang berbagi server Postgres yang sama.
    max: 10,
    // Lepaskan koneksi yang menganggur supaya tidak menumpuk saat sepi.
    idle_timeout: 20,
  });

if (process.env.NODE_ENV !== 'production') {
  globalUntukDb.__postgresClient = client;
}

export const db = drizzle(client, { schema });
