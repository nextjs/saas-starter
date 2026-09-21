import { redirect } from 'next/navigation';
import { getKonteks, getSemuaOutlets } from '@/lib/laundry/queries';
import { TeamRole } from '@/lib/db/schema';
import { AksesDitolak } from '@/components/akses-ditolak';
import { OutletClient } from './outlet-client';

export default async function OutletPage() {
  const konteks = await getKonteks();
  if (!konteks) redirect('/sign-in');

  // Owner boleh mengubah; Manajer hanya boleh melihat (PRD §5).
  const bolehLihat = [TeamRole.OWNER, TeamRole.MANAJER] as string[];
  if (!bolehLihat.includes(konteks.role)) {
    return <AksesDitolak role={konteks.role} keterangan="melihat data outlet" />;
  }

  const daftar = await getSemuaOutlets(konteks.teamId);

  return (
    <OutletClient
      bisaUbah={konteks.role === TeamRole.OWNER}
      outlets={daftar.map((o) => ({ ...o, jumlahPesanan: Number(o.jumlahPesanan) }))}
    />
  );
}
