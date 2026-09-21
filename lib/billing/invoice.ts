import 'server-only';

import { and, desc, eq, like, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { invoices, plans, subscriptions } from '@/lib/db/schema';
import {
  SiklusTagihan,
  StatusInvoice,
  StatusLangganan,
} from '@/lib/laundry/enums';
import { kodeTanggalWIB } from '@/lib/format';
import { buatInvoiceGateway, gatewayAktif } from './provider';

/** `INV-260825-001` — sama gaya dengan nomor nota supaya mudah disebut. */
async function nomorInvoiceBerikutnya(teamId: number): Promise<string> {
  const prefix = `INV-${kodeTanggalWIB()}-`;
  const [row] = await db
    .select({
      maks: sql<number | null>`max(cast(right(${invoices.nomorInvoice}, 3) as integer))`,
    })
    .from(invoices)
    .where(and(eq(invoices.teamId, teamId), like(invoices.nomorInvoice, `${prefix}%`)));

  return `${prefix}${String((row?.maks ?? 0) + 1).padStart(3, '0')}`;
}

export function hargaPaket(
  paket: { hargaBulanan: number; hargaTahunan: number },
  siklus: SiklusTagihan
): number {
  return siklus === SiklusTagihan.TAHUNAN ? paket.hargaTahunan : paket.hargaBulanan;
}

export async function getInvoices(teamId: number, limit = 20) {
  return db
    .select({
      id: invoices.id,
      nomorInvoice: invoices.nomorInvoice,
      jumlah: invoices.jumlah,
      siklus: invoices.siklus,
      status: invoices.status,
      urlBayar: invoices.urlBayar,
      provider: invoices.provider,
      dibayarPada: invoices.dibayarPada,
      createdAt: invoices.createdAt,
      namaPaket: plans.nama,
    })
    .from(invoices)
    .innerJoin(plans, eq(invoices.planId, plans.id))
    .where(eq(invoices.teamId, teamId))
    .orderBy(desc(invoices.createdAt))
    .limit(limit);
}

export type HasilBuatInvoice = {
  error?: string;
  nomorInvoice?: string;
  urlBayar?: string;
  simulasi?: boolean;
};

export async function buatInvoiceLangganan(
  teamId: number,
  planId: number,
  siklus: SiklusTagihan,
  emailPembeli: string
): Promise<HasilBuatInvoice> {
  const [paket] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
  if (!paket || !paket.aktif) return { error: 'Paket tidak ditemukan.' };

  const jumlah = hargaPaket(paket, siklus);
  if (jumlah <= 0) {
    return { error: 'Paket ini gratis — tidak perlu tagihan.' };
  }

  const nomorInvoice = await nomorInvoiceBerikutnya(teamId);
  const gateway = gatewayAktif();

  const hasil = await buatInvoiceGateway({
    nomorInvoice,
    jumlah,
    namaPaket: paket.nama,
    emailPembeli,
  });

  if (!hasil.berhasil) {
    return { error: hasil.galat ?? 'Gagal membuat tagihan.' };
  }

  await db.insert(invoices).values({
    teamId,
    planId,
    nomorInvoice,
    siklus,
    jumlah,
    status: StatusInvoice.MENUNGGU,
    provider: gateway,
    providerRef: hasil.referensi ?? null,
    urlBayar: hasil.urlBayar ?? null,
    kedaluwarsaPada: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  return { nomorInvoice, urlBayar: hasil.urlBayar, simulasi: hasil.simulasi };
}

/**
 * Tandai invoice lunas dan terapkan paketnya.
 *
 * **Idempoten.** Gateway mengirim ulang webhook kalau tidak mendapat balasan
 * 200, jadi fungsi ini harus aman dipanggil berkali-kali untuk invoice yang
 * sama — invoice yang sudah `DIBAYAR` langsung dikembalikan tanpa memperpanjang
 * masa aktif lagi.
 */
export async function lunasiInvoice(
  nomorInvoice: string,
  referensi?: string
): Promise<{ ok: boolean; alasan?: string }> {
  const [inv] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.nomorInvoice, nomorInvoice))
    .limit(1);

  if (!inv) return { ok: false, alasan: 'Invoice tidak ditemukan' };
  if (inv.status === StatusInvoice.DIBAYAR) return { ok: true, alasan: 'Sudah dibayar' };
  if (inv.status === StatusInvoice.BATAL) {
    return { ok: false, alasan: 'Invoice sudah dibatalkan' };
  }

  const sekarang = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(invoices)
      .set({
        status: StatusInvoice.DIBAYAR,
        dibayarPada: sekarang,
        providerRef: referensi ?? inv.providerRef,
      })
      .where(eq(invoices.id, inv.id));

    const [langganan] = await tx
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.teamId, inv.teamId))
      .limit(1);

    // Perpanjangan dihitung dari sisa masa aktif yang masih berlaku, bukan dari
    // hari ini — supaya membayar lebih awal tidak menghanguskan sisa hari.
    // Kecuali kalau pindah paket: masa aktif paket lama tidak dibawa.
    const paketSama = langganan?.planId === inv.planId;
    const sisaMasihBerlaku =
      paketSama &&
      langganan?.berakhirPada &&
      langganan.berakhirPada.getTime() > sekarang.getTime();

    const mulaiHitung = sisaMasihBerlaku ? langganan!.berakhirPada! : sekarang;
    const berakhir = new Date(mulaiHitung);
    if (inv.siklus === SiklusTagihan.TAHUNAN) {
      berakhir.setFullYear(berakhir.getFullYear() + 1);
    } else {
      berakhir.setMonth(berakhir.getMonth() + 1);
    }

    if (langganan) {
      await tx
        .update(subscriptions)
        .set({
          planId: inv.planId,
          status: StatusLangganan.AKTIF,
          siklus: inv.siklus,
          berakhirPada: berakhir,
          updatedAt: sekarang,
        })
        .where(eq(subscriptions.teamId, inv.teamId));
    } else {
      await tx.insert(subscriptions).values({
        teamId: inv.teamId,
        planId: inv.planId,
        status: StatusLangganan.AKTIF,
        siklus: inv.siklus,
        berakhirPada: berakhir,
      });
    }
  });

  return { ok: true };
}
