import { and, eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { invoices, plans, TeamRole } from '@/lib/db/schema';
import { getKonteks } from '@/lib/laundry/queries';
import { gatewayAktif } from '@/lib/billing/provider';
import { AksesDitolak } from '@/components/akses-ditolak';
import { SimulasiClient } from './simulasi-client';

/**
 * Pengganti halaman pembayaran gateway saat berjalan dalam mode simulasi.
 * Hanya bisa dibuka kalau gateway sungguhan memang tidak aktif.
 */
export default async function SimulasiBayarPage({
  params,
}: {
  params: Promise<{ nomor: string }>;
}) {
  const konteks = await getKonteks();
  if (!konteks) redirect('/sign-in');
  if (konteks.role !== TeamRole.OWNER) {
    return <AksesDitolak role={konteks.role} keterangan="membayar langganan" />;
  }
  if (gatewayAktif() !== 'simulasi') notFound();

  const { nomor } = await params;

  const [baris] = await db
    .select({ invoice: invoices, paket: plans })
    .from(invoices)
    .innerJoin(plans, eq(invoices.planId, plans.id))
    .where(
      and(
        eq(invoices.nomorInvoice, decodeURIComponent(nomor)),
        eq(invoices.teamId, konteks.teamId)
      )
    )
    .limit(1);

  if (!baris) notFound();

  return (
    <SimulasiClient
      nomorInvoice={baris.invoice.nomorInvoice}
      jumlah={baris.invoice.jumlah}
      status={baris.invoice.status}
      siklus={baris.invoice.siklus}
      namaPaket={baris.paket.nama}
    />
  );
}
