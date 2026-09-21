import { NextResponse } from 'next/server';
import { getKonteks } from '@/lib/laundry/queries';
import { getUndanganTertunda } from '@/lib/auth/undangan';

/**
 * Undangan yang belum diterima, untuk halaman Tim.
 *
 * Dibuat sebagai route handler (bukan di-render langsung) supaya mengikuti
 * pola yang sudah dipakai halaman itu untuk `/api/user` dan `/api/team`, dan
 * supaya daftarnya bisa disegarkan setelah kirim ulang atau batal.
 */
export async function GET() {
  const konteks = await getKonteks();
  if (!konteks) return NextResponse.json([], { status: 200 });

  return NextResponse.json(await getUndanganTertunda(konteks.teamId));
}
