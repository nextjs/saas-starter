import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';

/**
 * Health check untuk EasyPanel / Docker.
 *
 * Sengaja ikut menyentuh database: container yang hidup tapi tidak bisa
 * menghubungi Postgres tetap tidak berguna, dan health check yang hanya
 * membalas "OK" akan menyembunyikan justru kegagalan yang paling sering.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ status: 'ok', db: 'ok' });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', db: 'unreachable', pesan: error?.message },
      { status: 503 }
    );
  }
}
