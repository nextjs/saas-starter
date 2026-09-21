import 'server-only';

import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  customers,
  notificationSettings,
  notifications,
  orderItems,
  orders,
  outlets,
  payments,
} from '@/lib/db/schema';
import {
  JenisNotifikasi,
  StatusNotifikasi,
  TEMPLATE_PESANAN_MASUK_BAWAAN,
  TEMPLATE_SIAP_AMBIL_BAWAAN,
} from '@/lib/laundry/enums';
import { kirimWa, normalkanNomor, providerAktif } from './provider';
import { renderTemplate, variabelDari } from './template';

/**
 * Ambil pengaturan notifikasi tenant; buat baris bawaan kalau belum ada.
 *
 * Dibuat malas (lazy) seperti ini supaya tenant lama yang terdaftar sebelum
 * Fase 2 tidak perlu migrasi data — barisnya lahir saat pertama dibutuhkan.
 */
export async function getPengaturanNotifikasi(teamId: number) {
  const [ada] = await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.teamId, teamId))
    .limit(1);

  if (ada) return ada;

  const [baru] = await db
    .insert(notificationSettings)
    .values({
      teamId,
      templateSiapAmbil: TEMPLATE_SIAP_AMBIL_BAWAAN,
      templatePesananMasuk: TEMPLATE_PESANAN_MASUK_BAWAAN,
    })
    .onConflictDoNothing()
    .returning();

  if (baru) return baru;

  // Kalah balapan dengan request lain yang menyisipkan duluan — ambil ulang.
  const [hasil] = await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.teamId, teamId))
    .limit(1);
  return hasil;
}

/** Kumpulkan semua data yang dibutuhkan template untuk satu pesanan. */
async function dataPesanan(teamId: number, orderId: number) {
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.teamId, teamId)))
    .limit(1);
  if (!order) return null;

  const [[outlet], [pelanggan], items, bayar] = await Promise.all([
    db.select().from(outlets).where(eq(outlets.id, order.outletId)).limit(1),
    db.select().from(customers).where(eq(customers.id, order.customerId)).limit(1),
    db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
    db.select({ jumlah: payments.jumlah }).from(payments).where(eq(payments.orderId, order.id)),
  ]);

  return {
    order,
    outlet,
    pelanggan,
    items,
    dibayar: bayar.reduce((a, p) => a + p.jumlah, 0),
  };
}

export type HasilNotifikasi = {
  status: StatusNotifikasi;
  pesan?: string;
  galat?: string;
  dilewati?: string;
};

/**
 * Kirim notifikasi untuk satu pesanan dan catat hasilnya.
 *
 * Selalu mengembalikan hasil, tidak pernah melempar: pemanggil utamanya adalah
 * perubahan status pesanan, dan cucian tetap harus jadi "siap diambil" walaupun
 * WhatsApp sedang mati (PRD-FASE-2.md §4).
 */
export async function kirimNotifikasiPesanan(
  teamId: number,
  orderId: number,
  jenis: JenisNotifikasi,
  opsi: { abaikanSakelar?: boolean } = {}
): Promise<HasilNotifikasi> {
  try {
    const pengaturan = await getPengaturanNotifikasi(teamId);

    // Tombol kirim manual boleh menembus sakelar; pengiriman otomatis tidak.
    if (!opsi.abaikanSakelar) {
      const aktif =
        jenis === JenisNotifikasi.SIAP_AMBIL
          ? pengaturan.aktifSiapAmbil
          : pengaturan.aktifPesananMasuk;
      if (!aktif) return { status: StatusNotifikasi.SIMULASI, dilewati: 'Notifikasi dimatikan' };
    }

    const data = await dataPesanan(teamId, orderId);
    if (!data) return { status: StatusNotifikasi.GAGAL, galat: 'Pesanan tidak ditemukan' };
    if (!data.pelanggan?.telepon) {
      return { status: StatusNotifikasi.GAGAL, galat: 'Pelanggan tidak punya nomor HP' };
    }

    const template =
      jenis === JenisNotifikasi.SIAP_AMBIL
        ? pengaturan.templateSiapAmbil
        : pengaturan.templatePesananMasuk;

    const pesan = renderTemplate(template, variabelDari(data));
    const hasil = await kirimWa(data.pelanggan.telepon, pesan);

    const status = hasil.simulasi
      ? StatusNotifikasi.SIMULASI
      : hasil.terkirim
        ? StatusNotifikasi.TERKIRIM
        : StatusNotifikasi.GAGAL;

    await db.insert(notifications).values({
      teamId,
      orderId,
      jenis,
      // Yang dicatat adalah nomor yang benar-benar dipakai mengirim,
      // bukan apa yang diketik kasir — supaya log bisa dipakai menelusuri.
      tujuan: normalkanNomor(data.pelanggan.telepon),
      pesan,
      status,
      provider: providerAktif(),
      referensi: hasil.referensi || null,
      galat: hasil.galat || null,
    });

    return { status, pesan, galat: hasil.galat };
  } catch (error: any) {
    console.error('Gagal memproses notifikasi:', error);
    return { status: StatusNotifikasi.GAGAL, galat: error?.message ?? 'Kesalahan tak terduga' };
  }
}
