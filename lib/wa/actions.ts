'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { notificationSettings, notifications } from '@/lib/db/schema';
import {
  JenisNotifikasi,
  StatusNotifikasi,
  TeamRole,
} from '@/lib/laundry/enums';
import { getKonteks } from '@/lib/laundry/queries';
import { getPengaturanNotifikasi, kirimNotifikasiPesanan } from './notifikasi';
import { kirimWa, normalkanNomor, providerAktif } from './provider';
import { CONTOH_VARIABEL, renderTemplate } from './template';

export type HasilAksi = { error?: string; success?: string };

const BOLEH_ATUR = [TeamRole.OWNER, TeamRole.MANAJER] as string[];
const BOLEH_KIRIM = [
  TeamRole.OWNER,
  TeamRole.MANAJER,
  TeamRole.KASIR,
  TeamRole.PRODUKSI,
] as string[];

const pengaturanSchema = z.object({
  aktifSiapAmbil: z.boolean(),
  aktifPesananMasuk: z.boolean(),
  templateSiapAmbil: z.string().min(10, 'Template terlalu pendek').max(2000),
  templatePesananMasuk: z.string().min(10, 'Template terlalu pendek').max(2000),
});

export async function simpanPengaturanNotifikasi(
  input: z.infer<typeof pengaturanSchema>
): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (!BOLEH_ATUR.includes(konteks.role)) {
    return { error: 'Hanya Owner dan Manajer yang boleh mengubah pengaturan notifikasi.' };
  }

  const parsed = pengaturanSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  // Pastikan barisnya ada sebelum di-update (tenant lama belum tentu punya).
  await getPengaturanNotifikasi(konteks.teamId);

  await db
    .update(notificationSettings)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(notificationSettings.teamId, konteks.teamId));

  revalidatePath('/dashboard/notifikasi');
  return { success: 'Pengaturan disimpan.' };
}

/**
 * Kirim ulang notifikasi untuk satu pesanan — dipakai saat pengiriman otomatis
 * gagal, atau pelanggan minta dikirim lagi. Menembus sakelar aktif/mati karena
 * ini tindakan sadar dari operator, bukan otomatis.
 */
export async function kirimUlangNotifikasi(
  orderId: number,
  jenis: JenisNotifikasi
): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (!BOLEH_KIRIM.includes(konteks.role)) {
    return { error: 'Anda tidak punya akses mengirim notifikasi.' };
  }

  const hasil = await kirimNotifikasiPesanan(konteks.teamId, orderId, jenis, {
    abaikanSakelar: true,
  });

  revalidatePath(`/dashboard/pesanan/${orderId}`);
  revalidatePath('/dashboard/notifikasi');

  if (hasil.status === StatusNotifikasi.GAGAL) {
    return { error: `Gagal mengirim: ${hasil.galat ?? 'penyebab tidak diketahui'}` };
  }
  if (hasil.status === StatusNotifikasi.SIMULASI) {
    return {
      success:
        'Pesan dicatat dalam mode simulasi — belum ada kredensial WhatsApp yang dipasang.',
    };
  }
  return { success: 'WhatsApp terkirim ke pelanggan.' };
}

const tesSchema = z.object({
  nomor: z.string().min(8, 'Nomor terlalu pendek').max(30),
  template: z.string().min(1),
});

/** Kirim pratinjau template ke nomor sendiri, memakai data contoh. */
export async function tesKirimNotifikasi(
  input: z.infer<typeof tesSchema>
): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (!BOLEH_ATUR.includes(konteks.role)) {
    return { error: 'Hanya Owner dan Manajer yang boleh mengetes notifikasi.' };
  }

  const parsed = tesSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const pesan = renderTemplate(parsed.data.template, CONTOH_VARIABEL);
  const hasil = await kirimWa(parsed.data.nomor, pesan);

  const status = hasil.simulasi
    ? StatusNotifikasi.SIMULASI
    : hasil.terkirim
      ? StatusNotifikasi.TERKIRIM
      : StatusNotifikasi.GAGAL;

  await db.insert(notifications).values({
    teamId: konteks.teamId,
    orderId: null,
    jenis: JenisNotifikasi.TES,
    tujuan: normalkanNomor(parsed.data.nomor),
    pesan,
    status,
    provider: providerAktif(),
    referensi: hasil.referensi || null,
    galat: hasil.galat || null,
  });

  revalidatePath('/dashboard/notifikasi');

  if (status === StatusNotifikasi.GAGAL) {
    return { error: `Gagal mengirim: ${hasil.galat ?? 'penyebab tidak diketahui'}` };
  }
  if (status === StatusNotifikasi.SIMULASI) {
    return {
      success:
        'Mode simulasi: pesan dirender dan dicatat di log, tapi tidak dikirim. Pasang WA_PROVIDER dan WA_TOKEN untuk mengirim sungguhan.',
    };
  }
  return { success: 'Tes terkirim.' };
}
