import { redirect } from 'next/navigation';
import { getKonteks, getSemuaServices } from '@/lib/laundry/queries';
import { TeamRole } from '@/lib/db/schema';
import { AksesDitolak } from '@/components/akses-ditolak';
import { LayananClient } from './layanan-client';

export default async function LayananPage() {
  const konteks = await getKonteks();
  if (!konteks) redirect('/sign-in');

  const boleh = [TeamRole.OWNER, TeamRole.MANAJER] as string[];
  if (!boleh.includes(konteks.role)) {
    return (
      <AksesDitolak role={konteks.role} keterangan="mengelola layanan dan harga" />
    );
  }

  const daftar = await getSemuaServices(konteks.teamId);

  return (
    <LayananClient
      layanan={daftar.map((s) => ({
        id: s.id,
        nama: s.nama,
        tipe: s.tipe,
        satuan: s.satuan,
        hargaDefault: s.hargaDefault,
        minQty: s.minQty,
        durasiJam: s.durasiJam,
        expressMultiplier: s.expressMultiplier,
        expressDurasiJam: s.expressDurasiJam,
        aktif: s.aktif,
      }))}
    />
  );
}
