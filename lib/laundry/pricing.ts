/**
 * Aturan hitung laundry — implementasi PRD-FASE-1.md §4.
 *
 * Semua perhitungan uang ada di file ini saja. Kalau ada rumus yang perlu
 * berubah, ubah di sini — jangan menghitung ulang di komponen atau server
 * action, supaya nota, POS, dan laporan tidak pernah berbeda hasilnya.
 */

import { OrderStatus, PaymentStatus, ServiceType } from './enums';

/** Kolom numeric drizzle dikembalikan sebagai string; ini gerbang tunggalnya. */
export function toNum(v: number | string | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

export type AturanLayanan = {
  tipe: string;
  hargaDasar: number;
  minQty: number | string;
  durasiJam: number;
  expressMultiplier: number | string;
  expressDurasiJam: number;
};

/** Harga per satuan setelah faktor express. */
export function hitungHargaSatuan(layanan: AturanLayanan, isExpress: boolean): number {
  if (!isExpress) return layanan.hargaDasar;
  return Math.round(layanan.hargaDasar * toNum(layanan.expressMultiplier));
}

/**
 * Kuantitas yang benar-benar ditagih.
 *
 * Kiloan kena minimum charge: bawa 1,5 kg di outlet dengan minimum 3 kg tetap
 * dihitung 3 kg. Satuan tidak kena minimum — 1 bed cover ya 1 bed cover.
 */
export function hitungQtyEfektif(layanan: AturanLayanan, qty: number): number {
  if (layanan.tipe !== ServiceType.KILOAN) return qty;
  return Math.max(qty, toNum(layanan.minQty));
}

export function hitungSubtotalItem(
  layanan: AturanLayanan,
  qty: number,
  isExpress: boolean
): { hargaSatuan: number; qtyEfektif: number; subtotal: number } {
  const hargaSatuan = hitungHargaSatuan(layanan, isExpress);
  const qtyEfektif = hitungQtyEfektif(layanan, qty);
  return {
    hargaSatuan,
    qtyEfektif,
    subtotal: Math.round(hargaSatuan * qtyEfektif),
  };
}

/** Total nota. Diskon nominal Rupiah; total tidak pernah negatif. */
export function hitungTotal(subtotalItems: number[], diskon: number) {
  const subtotal = subtotalItems.reduce((a, b) => a + b, 0);
  const total = Math.max(0, subtotal - diskon);
  return { subtotal, total };
}

/**
 * Status bayar selalu diturunkan dari jumlah pembayaran yang tercatat,
 * tidak pernah diketik manual — supaya tidak bisa ada nota bertanda "Lunas"
 * yang uangnya tidak pernah masuk.
 */
export function turunkanStatusBayar(total: number, dibayar: number): PaymentStatus {
  if (dibayar >= total) return PaymentStatus.LUNAS;
  if (dibayar > 0) return PaymentStatus.DP;
  return PaymentStatus.BELUM_BAYAR;
}

export function hitungSisa(total: number, dibayar: number): number {
  return Math.max(0, total - dibayar);
}

/**
 * Estimasi selesai = waktu masuk + durasi item paling lama.
 * Satu item express tidak mempercepat item reguler di nota yang sama —
 * cucian baru bisa diserahkan kalau semuanya sudah jadi.
 */
export function hitungEstimasiSelesai(
  masuk: Date,
  items: { layanan: AturanLayanan; isExpress: boolean }[]
): Date {
  const jamTerlama = items.reduce((maks, item) => {
    const jam = item.isExpress
      ? item.layanan.expressDurasiJam
      : item.layanan.durasiJam;
    return Math.max(maks, jam);
  }, 0);
  return new Date(masuk.getTime() + jamTerlama * 60 * 60 * 1000);
}

/** Status berikutnya di alur produksi; `null` kalau sudah ujung atau batal. */
export function statusBerikutnya(sekarang: string): OrderStatus | null {
  const alur = [
    OrderStatus.BARU,
    OrderStatus.PROSES_CUCI,
    OrderStatus.PROSES_KERING,
    OrderStatus.PROSES_SETRIKA,
    OrderStatus.SIAP_AMBIL,
    OrderStatus.SELESAI,
  ];
  const i = alur.indexOf(sekarang as OrderStatus);
  if (i === -1 || i === alur.length - 1) return null;
  return alur[i + 1];
}
