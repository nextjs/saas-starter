import { redirect } from 'next/navigation';
import { getKonteks, getCustomers, getOutlets, getServices } from '@/lib/laundry/queries';
import { TeamRole } from '@/lib/db/schema';
import { PosClient } from './pos-client';

export default async function PosPage() {
  const konteks = await getKonteks();
  if (!konteks) redirect('/sign-in');

  const bolehPos = [TeamRole.OWNER, TeamRole.MANAJER, TeamRole.KASIR] as string[];
  if (!bolehPos.includes(konteks.role)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-lg border border-red-300 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
          <h1 className="text-lg font-semibold text-red-900 dark:text-red-100">
            Akses ditolak
          </h1>
          <p className="mt-1 text-sm text-red-800 dark:text-red-200">
            Role <strong>{konteks.role}</strong> tidak punya akses ke POS kasir.
          </p>
        </div>
      </main>
    );
  }

  const [daftarOutlet, daftarLayanan, daftarPelanggan] = await Promise.all([
    getOutlets(konteks.teamId),
    getServices(konteks.teamId),
    getCustomers(konteks.teamId),
  ]);

  // Kasir yang ditugaskan ke satu outlet tidak boleh transaksi atas nama outlet lain.
  const outletTersedia = konteks.outletId
    ? daftarOutlet.filter((o) => o.id === konteks.outletId)
    : daftarOutlet;

  if (outletTersedia.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950">
          <h1 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
            Belum ada outlet
          </h1>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
            Buat outlet dulu sebelum bisa menerima pesanan.
          </p>
        </div>
      </main>
    );
  }

  return (
    <PosClient
      outlets={outletTersedia}
      services={daftarLayanan.map((s) => ({
        id: s.id,
        nama: s.nama,
        tipe: s.tipe,
        satuan: s.satuan,
        hargaDasar: s.hargaDefault,
        minQty: s.minQty,
        durasiJam: s.durasiJam,
        expressMultiplier: s.expressMultiplier,
        expressDurasiJam: s.expressDurasiJam,
      }))}
      customers={daftarPelanggan.map((c) => ({
        id: c.id,
        nama: c.nama,
        telepon: c.telepon,
      }))}
    />
  );
}
