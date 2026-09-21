import { redirect } from 'next/navigation';
import { getKonteks, getOutlets } from '@/lib/laundry/queries';
import { getAntrian } from '@/lib/laundry/queries-fase2';
import { TeamRole } from '@/lib/db/schema';
import { AksesDitolak } from '@/components/akses-ditolak';
import { AntrianClient } from './antrian-client';

export default async function AntrianPage({
  searchParams,
}: {
  searchParams: Promise<{ outlet?: string }>;
}) {
  const konteks = await getKonteks();
  if (!konteks) redirect('/sign-in');

  const boleh = [
    TeamRole.OWNER,
    TeamRole.MANAJER,
    TeamRole.KASIR,
    TeamRole.PRODUKSI,
  ] as string[];
  if (!boleh.includes(konteks.role)) {
    return <AksesDitolak role={konteks.role} keterangan="melihat papan antrian" />;
  }

  const { outlet } = await searchParams;

  // Anggota yang ditugaskan ke satu outlet tidak bisa melihat outlet lain,
  // apa pun yang dia isikan di query string.
  const filterOutlet = konteks.outletId ?? (outlet ? Number(outlet) : undefined);

  const [daftar, daftarOutlet] = await Promise.all([
    getAntrian(konteks.teamId, filterOutlet),
    getOutlets(konteks.teamId),
  ]);

  return (
    <AntrianClient
      antrian={daftar.map((o) => ({
        ...o,
        tanggalMasuk: o.tanggalMasuk.toISOString(),
        estimasiSelesai: o.estimasiSelesai.toISOString(),
      }))}
      outlets={daftarOutlet.map((o) => ({ id: o.id, nama: o.nama }))}
      outletTerpilih={filterOutlet ? String(filterOutlet) : null}
      outletTerkunci={konteks.outletId !== null}
    />
  );
}
