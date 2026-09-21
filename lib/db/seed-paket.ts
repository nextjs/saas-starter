/**
 * Seed paket langganan. Aman dijalankan berkali-kali — memakai upsert
 * berdasarkan `kode`, jadi harga bisa diperbarui tanpa membuat baris ganda.
 *
 * Kolom batas bernilai `null` berarti tak terbatas.
 */

import { db } from './drizzle';
import { plans } from './schema';
import { KODE_PAKET } from '@/lib/laundry/enums';

const DAFTAR = [
  {
    kode: KODE_PAKET.GRATIS,
    nama: 'Gratis',
    hargaBulanan: 0,
    hargaTahunan: 0,
    maxOutlet: 1,
    maxPengguna: 2,
    maxPesananPerBulan: 50,
    urutan: 1,
  },
  {
    kode: KODE_PAKET.PRO,
    nama: 'Pro',
    hargaBulanan: 99_000,
    // Siklus tahunan dibayar 10 bulan — dua bulan gratis.
    hargaTahunan: 990_000,
    maxOutlet: 3,
    maxPengguna: 10,
    maxPesananPerBulan: 1000,
    urutan: 2,
  },
  {
    kode: KODE_PAKET.BISNIS,
    nama: 'Bisnis',
    hargaBulanan: 249_000,
    hargaTahunan: 2_490_000,
    maxOutlet: null,
    maxPengguna: null,
    maxPesananPerBulan: null,
    urutan: 3,
  },
];

async function seedPaket() {
  for (const p of DAFTAR) {
    await db
      .insert(plans)
      .values(p)
      .onConflictDoUpdate({ target: plans.kode, set: p });
  }
  console.log(`${DAFTAR.length} paket disiapkan.`);
}

seedPaket()
  .catch((error) => {
    console.error('Seed paket gagal:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed paket selesai.');
    process.exit(0);
  });
