import { redirect } from 'next/navigation';
import { getKonteks } from '@/lib/laundry/queries';
import { getLangganan, getPemakaian, getSemuaPaket } from '@/lib/billing/langganan';
import { getInvoices } from '@/lib/billing/invoice';
import { gatewayAktif } from '@/lib/billing/provider';
import { TeamRole } from '@/lib/db/schema';
import { AksesDitolak } from '@/components/akses-ditolak';
import { LanggananClient } from './langganan-client';

export default async function LanggananPage() {
  const konteks = await getKonteks();
  if (!konteks) redirect('/sign-in');

  const boleh = [TeamRole.OWNER, TeamRole.MANAJER] as string[];
  if (!boleh.includes(konteks.role)) {
    return <AksesDitolak role={konteks.role} keterangan="melihat langganan" />;
  }

  const [{ langganan, paket }, pakai, semuaPaket, daftarInvoice] = await Promise.all([
    getLangganan(konteks.teamId),
    getPemakaian(konteks.teamId),
    getSemuaPaket(),
    getInvoices(konteks.teamId),
  ]);

  return (
    <LanggananClient
      bisaUbah={konteks.role === TeamRole.OWNER}
      gateway={gatewayAktif()}
      langganan={{
        status: langganan.status,
        siklus: langganan.siklus,
        berakhirPada: langganan.berakhirPada?.toISOString() ?? null,
      }}
      paketAktif={paket}
      semuaPaket={semuaPaket}
      pemakaian={pakai}
      invoices={daftarInvoice.map((i) => ({
        ...i,
        createdAt: i.createdAt.toISOString(),
        dibayarPada: i.dibayarPada?.toISOString() ?? null,
      }))}
    />
  );
}
