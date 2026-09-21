/**
 * Seed data laundry Fase 1.
 *
 * Dipisah dari `seed.ts` bawaan starter karena seed itu ikut membuat produk
 * Stripe, yang gagal tanpa kredensial Stripe asli. Seed ini murni domain
 * laundry dan bisa dijalankan berkali-kali (aman diulang).
 */

import { eq } from 'drizzle-orm';
import { db } from './drizzle';
import { customers, outlets, services, teams, ServiceType } from './schema';

async function seedLaundry() {
  const [team] = await db.select().from(teams).limit(1);
  if (!team) {
    console.error('Belum ada team. Jalankan `pnpm db:seed` dulu.');
    process.exit(1);
  }

  const outletAda = await db
    .select()
    .from(outlets)
    .where(eq(outlets.teamId, team.id))
    .limit(1);

  if (outletAda.length > 0) {
    console.log('Data laundry sudah ada, seed dilewati.');
    return;
  }

  await db.insert(outlets).values([
    {
      teamId: team.id,
      nama: 'LaundryKu Pusat',
      kodeNota: 'PST',
      alamat: 'Jl. Raya Merdeka No. 12, Malang',
      telepon: '081234567890',
    },
    {
      teamId: team.id,
      nama: 'LaundryKu Cabang Sawojajar',
      kodeNota: 'SWJ',
      alamat: 'Jl. Danau Toba No. 45, Malang',
      telepon: '081234567891',
    },
  ]);
  console.log('2 outlet dibuat.');

  await db.insert(services).values([
    {
      teamId: team.id,
      nama: 'Cuci Kering Lipat',
      tipe: ServiceType.KILOAN,
      satuan: 'kg',
      hargaDefault: 7000,
      minQty: '3',
      durasiJam: 72,
      expressMultiplier: '1.5',
      expressDurasiJam: 24,
    },
    {
      teamId: team.id,
      nama: 'Cuci Kering Setrika',
      tipe: ServiceType.KILOAN,
      satuan: 'kg',
      hargaDefault: 9000,
      minQty: '3',
      durasiJam: 72,
      expressMultiplier: '1.5',
      expressDurasiJam: 24,
    },
    {
      teamId: team.id,
      nama: 'Setrika Saja',
      tipe: ServiceType.KILOAN,
      satuan: 'kg',
      hargaDefault: 5000,
      minQty: '2',
      durasiJam: 48,
      expressMultiplier: '1.5',
      expressDurasiJam: 12,
    },
    {
      teamId: team.id,
      nama: 'Bed Cover',
      tipe: ServiceType.SATUAN,
      satuan: 'pcs',
      hargaDefault: 35000,
      minQty: '1',
      durasiJam: 96,
      expressMultiplier: '1.5',
      expressDurasiJam: 48,
    },
    {
      teamId: team.id,
      nama: 'Selimut / Bed Sheet',
      tipe: ServiceType.SATUAN,
      satuan: 'pcs',
      hargaDefault: 25000,
      minQty: '1',
      durasiJam: 96,
      expressMultiplier: '1.5',
      expressDurasiJam: 48,
    },
    {
      teamId: team.id,
      nama: 'Jas / Blazer',
      tipe: ServiceType.SATUAN,
      satuan: 'pcs',
      hargaDefault: 30000,
      minQty: '1',
      durasiJam: 120,
      expressMultiplier: '2',
      expressDurasiJam: 48,
    },
    {
      teamId: team.id,
      nama: 'Sepatu',
      tipe: ServiceType.SATUAN,
      satuan: 'pcs',
      hargaDefault: 40000,
      minQty: '1',
      durasiJam: 96,
      expressMultiplier: '1.5',
      expressDurasiJam: 48,
    },
    {
      teamId: team.id,
      nama: 'Boneka Besar',
      tipe: ServiceType.SATUAN,
      satuan: 'pcs',
      hargaDefault: 30000,
      minQty: '1',
      durasiJam: 96,
      expressMultiplier: '1.5',
      expressDurasiJam: 48,
    },
  ]);
  console.log('8 layanan dibuat.');

  await db.insert(customers).values([
    {
      teamId: team.id,
      nama: 'Budi Santoso',
      telepon: '081298765432',
      alamat: 'Jl. Kawi No. 8, Malang',
    },
    {
      teamId: team.id,
      nama: 'Siti Rahayu',
      telepon: '085712345678',
      alamat: 'Perum Griya Shanta Blok C-14, Malang',
    },
    {
      teamId: team.id,
      nama: 'Andi Wijaya',
      telepon: '087811223344',
      alamat: 'Jl. Soekarno Hatta No. 21, Malang',
    },
  ]);
  console.log('3 pelanggan dibuat.');
}

seedLaundry()
  .catch((error) => {
    console.error('Seed laundry gagal:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed laundry selesai.');
    process.exit(0);
  });
