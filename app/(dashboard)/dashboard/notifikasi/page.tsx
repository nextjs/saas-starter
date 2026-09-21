import { redirect } from 'next/navigation';
import { getKonteks } from '@/lib/laundry/queries';
import { getNotifikasi } from '@/lib/laundry/queries-fase2';
import { getPengaturanNotifikasi } from '@/lib/wa/notifikasi';
import { providerAktif } from '@/lib/wa/provider';
import { TeamRole } from '@/lib/db/schema';
import { AksesDitolak } from '@/components/akses-ditolak';
import { NotifikasiClient } from './notifikasi-client';

export default async function NotifikasiPage() {
  const konteks = await getKonteks();
  if (!konteks) redirect('/sign-in');

  const boleh = [TeamRole.OWNER, TeamRole.MANAJER] as string[];
  if (!boleh.includes(konteks.role)) {
    return (
      <AksesDitolak role={konteks.role} keterangan="mengatur notifikasi WhatsApp" />
    );
  }

  const [pengaturan, log] = await Promise.all([
    getPengaturanNotifikasi(konteks.teamId),
    getNotifikasi(konteks.teamId),
  ]);

  return (
    <NotifikasiClient
      provider={providerAktif()}
      pengaturan={{
        aktifSiapAmbil: pengaturan.aktifSiapAmbil,
        aktifPesananMasuk: pengaturan.aktifPesananMasuk,
        templateSiapAmbil: pengaturan.templateSiapAmbil,
        templatePesananMasuk: pengaturan.templatePesananMasuk,
      }}
      log={log.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() }))}
    />
  );
}
