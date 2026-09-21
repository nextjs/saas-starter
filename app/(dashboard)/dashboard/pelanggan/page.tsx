import { redirect } from 'next/navigation';
import { getKonteks, getPelangganDenganStatistik } from '@/lib/laundry/queries';
import { TeamRole } from '@/lib/db/schema';
import { AksesDitolak } from '@/components/akses-ditolak';
import { PelangganClient } from './pelanggan-client';

export default async function PelangganPage() {
  const konteks = await getKonteks();
  if (!konteks) redirect('/sign-in');

  const boleh = [TeamRole.OWNER, TeamRole.MANAJER, TeamRole.KASIR] as string[];
  if (!boleh.includes(konteks.role)) {
    return <AksesDitolak role={konteks.role} keterangan="mengelola data pelanggan" />;
  }

  const daftar = await getPelangganDenganStatistik(konteks.teamId);

  return (
    <PelangganClient
      pelanggan={daftar.map((p) => ({
        ...p,
        jumlahPesanan: Number(p.jumlahPesanan),
        totalBelanja: Number(p.totalBelanja),
      }))}
    />
  );
}
