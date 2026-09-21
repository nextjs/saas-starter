import { and, eq, like, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { orders } from '@/lib/db/schema';
import { kodeTanggalWIB } from '@/lib/format';

/**
 * Nomor nota: `MLG-260825-001` — kode outlet, tanggal WIB, urutan harian.
 *
 * Kasir menyebut nomor ini di telepon dan menulisnya di tag cucian, jadi
 * bentuknya harus pendek dan bisa dibaca, bukan UUID.
 *
 * Urutan diambil dari nomor terbesar yang sudah ada hari itu. Dua kasir yang
 * menyimpan bersamaan bisa mendapat angka yang sama, karena itu pemanggilnya
 * (`buatPesanan`) mengulang saat kena unique constraint `(teamId, nomorNota)`
 * — constraint itulah penjaga sebenarnya, bukan fungsi ini.
 */
export async function nomorNotaBerikutnya(
  teamId: number,
  kodeOutlet: string,
  tanggal: Date = new Date()
): Promise<string> {
  const prefix = `${kodeOutlet}-${kodeTanggalWIB(tanggal)}-`;

  const [row] = await db
    .select({
      // Ambil 3 digit terakhir sebagai angka, cari yang terbesar.
      maks: sql<number | null>`max(cast(right(${orders.nomorNota}, 3) as integer))`,
    })
    .from(orders)
    .where(and(eq(orders.teamId, teamId), like(orders.nomorNota, `${prefix}%`)));

  const berikutnya = (row?.maks ?? 0) + 1;
  return `${prefix}${String(berikutnya).padStart(3, '0')}`;
}
