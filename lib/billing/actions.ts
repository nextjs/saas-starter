'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { invoices } from '@/lib/db/schema';
import {
  SiklusTagihan,
  StatusInvoice,
  TeamRole,
} from '@/lib/laundry/enums';
import { getKonteks } from '@/lib/laundry/queries';
import { buatInvoiceLangganan, lunasiInvoice } from './invoice';
import { gatewayAktif } from './provider';

export type HasilAksi = {
  error?: string;
  success?: string;
  urlBayar?: string;
  simulasi?: boolean;
};

const skema = z.object({
  planId: z.number().int().positive(),
  siklus: z.nativeEnum(SiklusTagihan),
});

/** Hanya Owner yang boleh membelanjakan uang tenant. */
export async function mulaiUpgrade(
  input: z.infer<typeof skema>
): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (konteks.role !== TeamRole.OWNER) {
    return { error: 'Hanya Owner yang boleh mengubah langganan.' };
  }

  const parsed = skema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const hasil = await buatInvoiceLangganan(
    konteks.teamId,
    parsed.data.planId,
    parsed.data.siklus,
    konteks.user.email
  );

  if (hasil.error) return { error: hasil.error };

  revalidatePath('/dashboard/langganan');
  return {
    success: `Tagihan ${hasil.nomorInvoice} dibuat.`,
    urlBayar: hasil.urlBayar,
    simulasi: hasil.simulasi,
  };
}

/**
 * Pelunasan mode simulasi.
 *
 * Sengaja menolak jalan kalau gateway sungguhan sedang aktif — kalau tidak,
 * ini menjadi tombol "naikkan paket gratis" di produksi.
 */
export async function lunasiSimulasi(nomorInvoice: string): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (konteks.role !== TeamRole.OWNER) {
    return { error: 'Hanya Owner yang boleh mengubah langganan.' };
  }
  if (gatewayAktif() !== 'simulasi') {
    return {
      error:
        'Gateway pembayaran sungguhan sedang aktif — pelunasan simulasi dinonaktifkan.',
    };
  }

  // Pastikan invoice ini milik tenant yang sedang masuk.
  const [inv] = await db
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.nomorInvoice, nomorInvoice),
        eq(invoices.teamId, konteks.teamId)
      )
    )
    .limit(1);

  if (!inv) return { error: 'Tagihan tidak ditemukan.' };
  if (inv.status === StatusInvoice.DIBAYAR) {
    return { success: 'Tagihan ini memang sudah lunas.' };
  }

  const hasil = await lunasiInvoice(nomorInvoice, 'simulasi');
  if (!hasil.ok) return { error: hasil.alasan ?? 'Gagal melunasi.' };

  revalidatePath('/dashboard/langganan');
  revalidatePath('/dashboard');
  return { success: 'Pembayaran simulasi berhasil — paket sudah aktif.' };
}

export async function batalkanInvoice(nomorInvoice: string): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (konteks.role !== TeamRole.OWNER) {
    return { error: 'Hanya Owner yang boleh mengubah langganan.' };
  }

  const hasil = await db
    .update(invoices)
    .set({ status: StatusInvoice.BATAL })
    .where(
      and(
        eq(invoices.nomorInvoice, nomorInvoice),
        eq(invoices.teamId, konteks.teamId),
        eq(invoices.status, StatusInvoice.MENUNGGU)
      )
    )
    .returning({ id: invoices.id });

  if (hasil.length === 0) {
    return { error: 'Tagihan tidak ditemukan atau sudah tidak bisa dibatalkan.' };
  }

  revalidatePath('/dashboard/langganan');
  return { success: 'Tagihan dibatalkan.' };
}
