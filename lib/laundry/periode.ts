/**
 * Perhitungan rentang periode laporan.
 *
 * Modul ini sengaja netral — tanpa `'use client'` maupun `'server-only'` —
 * karena dipakai dua sisi: server component menghitung rentangnya untuk query,
 * komponen filter memakainya untuk label. Menaruhnya di berkas `'use client'`
 * membuat server gagal memanggilnya saat runtime, dan TypeScript tidak
 * menangkap kesalahan itu.
 */

export type Preset = 'hari-ini' | '7-hari' | 'bulan-ini' | 'custom';

export const LABEL_PRESET: Record<Preset, string> = {
  'hari-ini': 'Hari ini',
  '7-hari': '7 hari terakhir',
  'bulan-ini': 'Bulan ini',
  custom: 'Rentang bebas',
};

/**
 * Batas hari dihitung dalam WIB, bukan zona waktu server.
 *
 * Server bisa berjalan di UTC, sedangkan "hari ini" bagi pemilik laundry adalah
 * hari menurut jam dinding Jakarta. Tanpa offset eksplisit, laporan "hari ini"
 * bergeser 7 jam begitu aplikasi di-deploy ke luar Indonesia.
 */
const OFFSET_WIB_MS = 7 * 60 * 60 * 1000;

function awalHariWIB(d: Date): Date {
  const wib = new Date(d.getTime() + OFFSET_WIB_MS);
  wib.setUTCHours(0, 0, 0, 0);
  return new Date(wib.getTime() - OFFSET_WIB_MS);
}

function akhirHariWIB(d: Date): Date {
  const wib = new Date(d.getTime() + OFFSET_WIB_MS);
  wib.setUTCHours(23, 59, 59, 999);
  return new Date(wib.getTime() - OFFSET_WIB_MS);
}

export function rentangDariPreset(
  preset: Preset,
  dariStr?: string,
  sampaiStr?: string
): { dari: Date; sampai: Date } {
  const kini = new Date();

  if (preset === 'custom' && dariStr && sampaiStr) {
    return {
      dari: awalHariWIB(new Date(`${dariStr}T00:00:00Z`)),
      sampai: akhirHariWIB(new Date(`${sampaiStr}T00:00:00Z`)),
    };
  }

  if (preset === 'hari-ini') {
    return { dari: awalHariWIB(kini), sampai: akhirHariWIB(kini) };
  }

  if (preset === '7-hari') {
    const mulai = new Date(kini.getTime() - 6 * 24 * 60 * 60 * 1000);
    return { dari: awalHariWIB(mulai), sampai: akhirHariWIB(kini) };
  }

  // bulan-ini
  const wib = new Date(kini.getTime() + OFFSET_WIB_MS);
  const awalBulan = new Date(
    Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), 1) - OFFSET_WIB_MS
  );
  return { dari: awalBulan, sampai: akhirHariWIB(kini) };
}
